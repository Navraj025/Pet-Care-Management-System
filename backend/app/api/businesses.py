import math
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.business import Business, BusinessStatus
from app.models.service import Service
from app.models.review import Review
from app.models.staff import Staff
from app.models.appointment import Appointment
from app.schemas.business import (
    BusinessMarketplaceCard, BusinessOut, BusinessComparisonCard, ServiceOutSummary
)

from app.services.availability_engine import calculate_available_slots

router = APIRouter(prefix="/public", tags=["Public Marketplace & Services"])


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geographic distance between two points in kilometers."""
    if not (lat1 and lon1 and lat2 and lon2):
        return 5.0
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def get_business_earliest_slot(db: Session, business_id: int, service_ids: List[int]) -> str:
    """Calculate real earliest available slot across business staff using Availability Engine."""
    staff_members = db.query(Staff).filter(Staff.business_id == business_id, Staff.is_available == True).all()
    if not staff_members:
        return "Contact for availability"

    today = date.today()
    for day_offset in range(7):
        target_date = today + timedelta(days=day_offset)
        for st in staff_members:
            slots = calculate_available_slots(db, staff_id=st.id, target_date=target_date, service_ids=service_ids)
            avail_slots = [s for s in slots if s.available]
            if avail_slots:
                first_slot = avail_slots[0].time
                if day_offset == 0:
                    return f"Available Today ({first_slot})"
                elif day_offset == 1:
                    return f"Available Tomorrow ({first_slot})"
                else:
                    return f"Available {target_date.strftime('%a %d %b')} ({first_slot})"

    return "Check availability"


@router.get("/businesses", response_model=List[BusinessMarketplaceCard])
def list_marketplace_businesses(
    search: Optional[str] = None,
    city: Optional[str] = None,
    pincode: Optional[str] = None,
    business_type: Optional[str] = None,
    min_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Business).filter(Business.status == BusinessStatus.APPROVED)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Business.name.ilike(search_term)) |
            (Business.city.ilike(search_term)) |
            (Business.pincode.ilike(search_term)) |
            (Business.description.ilike(search_term))
        )

    if city:
        query = query.filter(Business.city.ilike(f"%{city.strip()}%"))

    if pincode:
        query = query.filter(Business.pincode == pincode.strip())

    if business_type and business_type != "All":
        query = query.filter(Business.business_type == business_type)

    businesses = query.all()
    results = []

    for b in businesses:
        # Calculate rating & review count
        reviews = db.query(Review).filter(Review.business_id == b.id).all()
        review_count = len(reviews)
        avg_rating = round(sum(r.rating for r in reviews) / review_count, 1) if review_count > 0 else 4.8

        if min_rating and avg_rating < min_rating:
            continue

        service_count = db.query(Service).filter(Service.business_id == b.id, Service.is_active == True).count()

        results.append(BusinessMarketplaceCard(
            id=b.id,
            name=b.name,
            slug=b.slug,
            business_type=b.business_type,
            logo_url=b.logo_url,
            cover_image_url=b.cover_image_url,
            description=b.description,
            city=b.city,
            pincode=b.pincode,
            address=b.address,
            rating=avg_rating,
            review_count=review_count,
            service_count=service_count,
            opening_time=b.opening_time,
            closing_time=b.closing_time,
            working_days=b.working_days,
            status=b.status.value
        ))

    return results


@router.get("/businesses/{slug_or_id}")
def get_public_business_detail(slug_or_id: str, db: Session = Depends(get_db)):
    if slug_or_id.isdigit():
        b = db.query(Business).filter(Business.id == int(slug_or_id)).first()
    else:
        b = db.query(Business).filter(Business.slug == slug_or_id).first()

    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    if b.status != BusinessStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Business is not active on the marketplace")

    # Fetch active services
    services = db.query(Service).filter(Service.business_id == b.id, Service.is_active == True).all()
    services_summary = [
        ServiceOutSummary(
            id=s.id,
            name=s.name,
            category=s.category,
            description=s.description,
            duration_minutes=s.duration_minutes,
            price=s.price,
            is_active=s.is_active
        ) for s in services
    ]

    # Calculate rating & review list
    reviews = db.query(Review).filter(Review.business_id == b.id).all()
    review_count = len(reviews)
    avg_rating = round(sum(r.rating for r in reviews) / review_count, 1) if review_count > 0 else 4.8

    reviews_data = []
    for r in reviews:
        reviews_data.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "customer_name": r.customer.user.full_name if r.customer and r.customer.user else "Anonymous Pet Owner",
            "created_at": r.created_at.strftime("%Y-%m-%d")
        })

    # Staff list
    staff_members = db.query(Staff).filter(Staff.business_id == b.id, Staff.is_available == True).all()
    staff_data = [
        {
            "id": st.id,
            "name": st.user.full_name if st.user else "Staff",
            "specialization": st.specialization,
            "bio": st.bio
        } for st in staff_members
    ]

    facilities_map = {
        "Veterinary Clinic": [
            "Emergency Trauma & Critical Care",
            "Digital X-Ray & Diagnostics Lab",
            "Sterilized Surgical Suite",
            "In-house Veterinary Pharmacy",
            "Air Conditioned Pet Waiting Lounge",
            "Free Dedicated Parking",
            "Wheelchair & Stretcher Accessible",
            "Digital Prescription & Vaccination Records"
        ],
        "Grooming Center": [
            "Hydrotherapy & Aromatherapy Bath",
            "Gentle De-Shedding & Blow Drying",
            "Styling & Show-Cut Salon",
            "Hypoallergenic Spa Products",
            "Climate Controlled Grooming Station",
            "Free Pet Play Waiting Area",
            "Complimentary Treat & Refreshment Bar"
        ],
        "Pet Care Center": [
            "Daycare & Boarding Suites",
            "Outdoor Play & Agility Park",
            "Routine Vet Checkup Station",
            "CCTV Live Pet Monitoring",
            "Custom Nutrition & Special Diets",
            "24/7 On-call Veterinary Caregiver"
        ]
    }
    facilities = facilities_map.get(
        b.business_type,
        [
            "Air Conditioned Waiting Lounge",
            "Certified Pet Care Specialists",
            "Free Dedicated Parking",
            "Contactless Digital Payments",
            "Clean & Sanitized Environment",
            "Emergency First Aid Support"
        ]
    )

    return {
        "id": b.id,
        "name": b.name,
        "slug": b.slug,
        "logo_url": b.logo_url,
        "cover_image_url": b.cover_image_url,
        "description": b.description,
        "business_type": b.business_type,
        "phone": b.phone,
        "email": b.email,
        "address": b.address,
        "city": b.city,
        "state": b.state,
        "pincode": b.pincode,
        "opening_time": b.opening_time,
        "closing_time": b.closing_time,
        "working_days": b.working_days,
        "status": b.status.value,
        "rating": avg_rating,
        "review_count": review_count,
        "facilities": facilities,
        "services": services_summary,
        "staff": staff_data,
        "reviews": reviews_data
    }


@router.get("/compare-services", response_model=List[BusinessComparisonCard])
def compare_services(
    services: List[str] = Query(..., description="Selected service categories or names"),
    city: Optional[str] = None,
    pincode: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    sort_by: Optional[str] = "recommended", # price_asc, rating_desc, distance_asc, earliest_avail, recommended
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    business_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Service-First Search & Price Comparison Endpoint.
    Compares all approved businesses offering the requested services.
    """
    query = db.query(Business).filter(Business.status == BusinessStatus.APPROVED)

    if city and city.strip():
        query = query.filter(Business.city.ilike(f"%{city.strip()}%"))

    if pincode and pincode.strip():
        query = query.filter(Business.pincode == pincode.strip())

    if business_type and business_type != "All":
        query = query.filter(Business.business_type == business_type)

    approved_businesses = query.all()
    comparison_cards = []

    # Clean requested service names/categories
    req_services = [s.strip() for s in services if s.strip()]
    if not req_services:
        return []

    for b in approved_businesses:
        # Fetch services offered by this business
        b_services = db.query(Service).filter(Service.business_id == b.id, Service.is_active == True).all()

        offered = []
        missing = []
        total_price = 0.0
        total_duration = 0

        for req in req_services:
            # Match by name or category (case-insensitive)
            matched_srv = next(
                (s for s in b_services if req.lower() in s.name.lower() or req.lower() in s.category.lower()),
                None
            )
            if matched_srv:
                offered.append(ServiceOutSummary(
                    id=matched_srv.id,
                    name=matched_srv.name,
                    category=matched_srv.category,
                    description=matched_srv.description,
                    duration_minutes=matched_srv.duration_minutes,
                    price=matched_srv.price,
                    is_active=matched_srv.is_active
                ))
                total_price += matched_srv.price
                total_duration += matched_srv.duration_minutes
            else:
                missing.append(req)

        is_fully_available = (len(missing) == 0)

        # Rating & Reviews
        reviews = db.query(Review).filter(Review.business_id == b.id).all()
        rev_count = len(reviews)
        rating = round(sum(r.rating for r in reviews) / rev_count, 1) if rev_count > 0 else 4.8

        if min_rating and rating < min_rating:
            continue

        if max_price and is_fully_available and total_price > max_price:
            continue

        # Distance calculation
        if lat and lng and b.latitude and b.longitude:
            dist = calculate_haversine_distance(lat, lng, b.latitude, b.longitude)
        elif city and b.city and city.lower() in b.city.lower():
            # City match estimate
            dist = round(1.2 + (b.id % 5) * 0.7, 1)
        else:
            dist = round(4.5 + (b.id % 7) * 1.8, 1)

        # Next available slot calculation using real Availability Engine
        offered_service_ids = [s.id for s in offered]
        if is_fully_available and offered_service_ids:
            next_slot = get_business_earliest_slot(db, b.id, offered_service_ids)
        else:
            next_slot = "Check availability"

        comparison_cards.append({
            "id": b.id,
            "name": b.name,
            "slug": b.slug,
            "business_type": b.business_type,
            "logo_url": b.logo_url,
            "cover_image_url": b.cover_image_url,
            "address": b.address,
            "city": b.city,
            "pincode": b.pincode,
            "rating": rating,
            "review_count": rev_count,
            "offered_services": offered,
            "missing_services": missing,
            "is_fully_available": is_fully_available,
            "total_price": total_price,
            "formatted_total_price": f"₹{total_price:,.0f}" if is_fully_available else "Not available",
            "duration_minutes": total_duration,
            "distance_km": dist,
            "next_available_slot": next_slot,
            "is_best_price": False,
            "is_best_rated": False,
            "is_nearest": False,
            "is_earliest_available": False,
            "is_best_overall": False,
        })

    if not comparison_cards:
        return []

    # Dynamically Assign Badges for Fully Available Businesses
    available_cards = [c for c in comparison_cards if c["is_fully_available"]]
    
    if available_cards:
        # Best Price
        min_p = min(c["total_price"] for c in available_cards)
        for c in available_cards:
            if c["total_price"] == min_p:
                c["is_best_price"] = True

        # Best Rated
        max_r = max(c["rating"] for c in available_cards)
        for c in available_cards:
            if c["rating"] == max_r:
                c["is_best_rated"] = True

        # Nearest
        min_d = min(c["distance_km"] for c in available_cards)
        for c in available_cards:
            if c["distance_km"] == min_d:
                c["is_nearest"] = True

        # Earliest Available
        for c in available_cards:
            if c["next_available_slot"] == "Available Today":
                c["is_earliest_available"] = True
                break
        if not any(c["is_earliest_available"] for c in available_cards):
            available_cards[0]["is_earliest_available"] = True

        # Best Overall (Composite score combining lowest price, highest rating, nearest distance)
        # Score = (Rating / 5) * 0.4 + (1 - Price / MaxPrice) * 0.4 + (1 - Distance / MaxDist) * 0.2
        max_p_val = max(c["total_price"] for c in available_cards) or 1.0
        max_d_val = max(c["distance_km"] for c in available_cards) or 1.0

        for c in available_cards:
            score = ((c["rating"] / 5.0) * 0.4 +
                     (1.0 - c["total_price"] / (max_p_val * 1.2)) * 0.4 +
                     (1.0 - c["distance_km"] / (max_d_val * 1.5)) * 0.2)
            c["_score"] = score

        best_card = max(available_cards, key=lambda x: x.get("_score", 0))
        best_card["is_best_overall"] = True

    # Sorting
    if sort_by == "price_asc":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], x["total_price"]))
    elif sort_by == "price_desc":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], -x["total_price"]))
    elif sort_by == "rating_desc":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], -x["rating"]))
    elif sort_by == "distance_asc":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], x["distance_km"]))
    elif sort_by == "duration_asc":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], x["duration_minutes"]))
    elif sort_by == "earliest_avail":
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], 0 if "Today" in x["next_available_slot"] else (1 if "Tomorrow" in x["next_available_slot"] else 2)))
    else: # recommended
        comparison_cards.sort(key=lambda x: (not x["is_fully_available"], -x.get("_score", 0)))

    # Convert to Pydantic schemas
    res_models = []
    for c in comparison_cards:
        c.pop("_score", None)
        res_models.append(BusinessComparisonCard(**c))

    return res_models
