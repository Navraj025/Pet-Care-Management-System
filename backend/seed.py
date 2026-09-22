from datetime import datetime, date, timedelta
import random
from app.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Business, BusinessStatus, Customer, Staff, Pet, Service,
    Appointment, AppointmentStatus, AppointmentService, MedicalRecord, Vaccination,
    VaccinationStatus, Availability, Payment, PaymentStatus, PaymentMethod,
    Invoice, Notification, Review, AuditLog, SystemSetting
)
from app.auth.security import get_password_hash


def seed_database(drop_existing: bool = True):
    print("[INFO] Initializing Multi-Business Marketplace Database Seeding...")
    if drop_existing:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. System Settings
        settings_data = [
            ("platform_name", "Smart Pet Care Marketplace"),
            ("support_email", "contact@petcaremarketplace.com"),
            ("support_phone", "+91 98765 43210"),
            ("platform_address", "Tech Innovation Hub, Suite 500, Mumbai, MH"),
            ("tax_rate_percent", "5.0"),
            ("cancellation_policy_hours", "2")
        ]
        for key, val in settings_data:
            db.add(SystemSetting(key=key, value=val))
        db.commit()

        # Shared password hash for demo accounts
        password_hash = get_password_hash("password123")

        # 2. Platform Admin
        admin_user = User(
            email="admin@petcare.com",
            password_hash=password_hash,
            full_name="Dr. Arthur Pendelton (Platform Admin)",
            phone="+91 98765 00000",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()

        # 3. Business Owners & Businesses
        businesses_seed_data = [
            {
                "owner_email": "owner.happypaws@petcare.com",
                "owner_name": "Rajesh Sharma (Owner)",
                "business_name": "Happy Paws Pet Care Center",
                "slug": "happy-paws-pet-care-center",
                "business_type": "Pet Care Center",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "address": "12 Bandra Reclamation, Hill Road, Mumbai",
                "phone": "+91 98200 11111",
                "email": "contact@happypaws.in",
                "lat": 18.9388,
                "lng": 72.8353,
                "opening_time": "08:30",
                "closing_time": "20:00",
                "working_days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
                "description": "Mumbai's premier full-service pet wellness, styling salon, and clinical consultation hub equipped with modern diagnostic tools and gentle care specialists.",
                "logo_url": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&auto=format&fit=crop&q=80",
                "services": [
                    ("General Health Checkup", "Veterinary", "Full physical checkup, weight & vitals tracking, and nutritional advice.", 30, 1500.0),
                    ("Full Grooming Package", "Grooming", "Styling haircut, bath, blow dry, nail clip, ear cleaning, and coat conditioning.", 60, 1800.0),
                    ("Dental Cleaning & Scaling", "Dental", "Ultrasonic scaling, tartar removal, and oral antiseptic rinse.", 45, 2200.0),
                    ("Bath & De-Shedding Dry", "Grooming", "Deep cleansing shampoo, undercoat removal, and blow dry.", 45, 1200.0),
                    ("Nail Trimming & Paw Care", "Grooming", "Claw trimming, filing, and paw pad balm massage.", 20, 400.0)
                ],
                "staff_data": [
                    ("dr.smith@petcare.com", "Dr. Robert Smith, DVM", "+91 98765 00001", "Senior Veterinarian & Surgeon", "Specializes in canine internal medicine and orthopedic care.")
                ]
            },
            {
                "owner_email": "owner.petcareplus@petcare.com",
                "owner_name": "Priya Verma (Owner)",
                "business_name": "PetCare Plus Clinic & Surgery",
                "slug": "petcare-plus-clinic-surgery",
                "business_type": "Veterinary Clinic",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400050",
                "address": "45 Linking Road, Khar West, Mumbai",
                "phone": "+91 98200 22222",
                "email": "info@petcareplus.com",
                "lat": 19.0596,
                "lng": 72.8295,
                "opening_time": "09:00",
                "closing_time": "19:00",
                "working_days": "Mon,Tue,Wed,Thu,Fri,Sat",
                "description": "Advanced veterinary medical clinic offering emergency surgery, preventative vaccinations, specialized feline medicine, and oral healthcare.",
                "logo_url": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&auto=format&fit=crop&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1000&auto=format&fit=crop&q=80",
                "services": [
                    ("General Health Checkup", "Veterinary", "Comprehensive checkup and vitals assessment.", 30, 1800.0),
                    ("Veterinary Consultation", "Veterinary", "Clinical examination for illness, injury, or prescription management.", 45, 2500.0),
                    ("Rabies Vaccination", "Vaccination", "Anti-rabies immunization with government certified record.", 15, 800.0),
                    ("DHPP Core Vaccine", "Vaccination", "5-in-1 combination vaccine for dogs (Distemper, Parvo, Hepatitis, Parainfluenza).", 15, 1400.0),
                    ("Dental Cleaning & Scaling", "Dental", "Veterinary dental cleaning and scaling under mild sedation.", 60, 2500.0)
                ],
                "staff_data": [
                    ("dr.emily@petcare.com", "Dr. Emily Watson", "+91 98765 00002", "Feline & Exotic Pet Specialist", "Focuses on feline wellness, diagnostics, and exotic pet care.")
                ]
            },
            {
                "owner_email": "owner.pawsome@petcare.com",
                "owner_name": "Vikram Malhotra (Owner)",
                "business_name": "Pawsome Grooming & Spa",
                "slug": "pawsome-grooming-spa",
                "business_type": "Grooming Center",
                "city": "Pune",
                "state": "Maharashtra",
                "pincode": "411001",
                "address": "88 FC Road, Deccan Gymkhana, Pune",
                "phone": "+91 98200 33333",
                "email": "hello@pawsomegrooming.in",
                "lat": 18.5204,
                "lng": 73.8567,
                "opening_time": "10:00",
                "closing_time": "19:30",
                "working_days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
                "description": "Boutique pet styling spa offering aromatherapy baths, show-dog cuts, de-shedding treatments, and soothing paw spa therapies.",
                "logo_url": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300&auto=format&fit=crop&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=1000&auto=format&fit=crop&q=80",
                "services": [
                    ("Full Grooming Package", "Grooming", "Luxury haircut, aromatic bath, ear cleaning, and styling.", 60, 1400.0),
                    ("Bath & De-Shedding Dry", "Grooming", "Hypoallergenic shampoo bath, de-shedding brush, blow dry.", 45, 950.0),
                    ("Nail Trimming & Paw Care", "Grooming", "Precision claw filing and organic paw butter therapy.", 20, 350.0),
                    ("Pet Spa & Coat Treatment", "Pet Spa", "Essential oil bath spa and coat repair treatment.", 45, 1600.0)
                ],
                "staff_data": [
                    ("groomer.alex@petcare.com", "Alex Rivera", "+91 98765 00003", "Master Pet Stylist & Groomer", "Certified groomer with 8+ years of experience.")
                ]
            },
            {
                "owner_email": "owner.vetlife@petcare.com",
                "owner_name": "Ananya Roy (Owner)",
                "business_name": "VetLife Medical Center",
                "slug": "vetlife-medical-center",
                "business_type": "Veterinary Clinic",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560001",
                "address": "104 MG Road, Indiranagar, Bengaluru",
                "phone": "+91 98200 44444",
                "email": "contact@vetlife.in",
                "lat": 12.9716,
                "lng": 77.5946,
                "opening_time": "08:00",
                "closing_time": "21:00",
                "working_days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
                "description": "Multi-specialty 24/7 veterinary healthcare hospital specializing in canine cardiology, orthopedics, ultrasound diagnostics, and routine healthcare.",
                "logo_url": "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?w=300&auto=format&fit=crop&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1000&auto=format&fit=crop&q=80",
                "services": [
                    ("General Health Checkup", "Veterinary", "Routine health screening, temperature & weight evaluation.", 30, 1600.0),
                    ("Veterinary Consultation", "Veterinary", "Senior doctor consultation for acute or chronic conditions.", 45, 2200.0),
                    ("Rabies Vaccination", "Vaccination", "Standard anti-rabies vaccine with digital health passport entry.", 15, 750.0),
                    ("DHPP Core Vaccine", "Vaccination", "Comprehensive 5-in-1 immunizing vaccination.", 15, 1300.0),
                    ("Dental Cleaning & Scaling", "Dental", "Ultrasonic dental cleaning and polishing.", 60, 2100.0)
                ],
                "staff_data": [
                    ("dr.ananya@petcare.com", "Dr. Ananya Roy, DVM", "+91 98765 00004", "Chief Veterinary Officer", "12+ years experience in veterinary surgery and internal medicine.")
                ]
            }
        ]

        created_businesses = []
        created_services_map = {} # b_id -> list of services
        all_staff_list = []

        for bdata in businesses_seed_data:
            # Create Owner User
            owner_user = User(
                email=bdata["owner_email"],
                password_hash=password_hash,
                full_name=bdata["owner_name"],
                phone=bdata["phone"],
                role=UserRole.BUSINESS_OWNER,
                is_active=True
            )
            db.add(owner_user)
            db.commit()

            # Create Approved Business
            biz = Business(
                owner_id=owner_user.id,
                name=bdata["business_name"],
                slug=bdata["slug"],
                business_type=bdata["business_type"],
                logo_url=bdata["logo_url"],
                cover_image_url=bdata["cover_image_url"],
                description=bdata["description"],
                phone=bdata["phone"],
                email=bdata["email"],
                address=bdata["address"],
                city=bdata["city"],
                state=bdata["state"],
                pincode=bdata["pincode"],
                latitude=bdata["lat"],
                longitude=bdata["lng"],
                opening_time=bdata["opening_time"],
                closing_time=bdata["closing_time"],
                working_days=bdata["working_days"],
                status=BusinessStatus.APPROVED
            )
            db.add(biz)
            db.commit()
            created_businesses.append(biz)

            # Create Services for this Business
            b_services = []
            for sname, scat, sdesc, sdur, sprice in bdata["services"]:
                srv = Service(
                    business_id=biz.id,
                    name=sname,
                    category=scat,
                    description=sdesc,
                    duration_minutes=sdur,
                    price=sprice,
                    is_active=True
                )
                db.add(srv)
                db.commit()
                b_services.append(srv)
            created_services_map[biz.id] = b_services

            # Create Staff for this Business
            for st_email, st_name, st_phone, st_spec, st_bio in bdata["staff_data"]:
                st_user = User(
                    email=st_email,
                    password_hash=password_hash,
                    full_name=st_name,
                    phone=st_phone,
                    role=UserRole.STAFF,
                    is_active=True
                )
                db.add(st_user)
                db.commit()

                st = Staff(
                    user_id=st_user.id,
                    business_id=biz.id,
                    specialization=st_spec,
                    bio=st_bio,
                    working_days="Mon,Tue,Wed,Thu,Fri,Sat",
                    start_time="09:00",
                    end_time="18:00",
                    break_start="13:00",
                    break_end="14:00",
                    is_available=True
                )
                db.add(st)
                db.commit()
                all_staff_list.append(st)

        # 4. Customers (10 Owners)
        customer_raw = [
            ("customer@petcare.com", "Main Demo Owner", "+91 98765 00010", "742 Evergreen Terrace, Mumbai", "Emergency: +91 98765 99999"),
            ("john.doe@gmail.com", "John Doe", "+91 98765 00011", "123 Elm Street, Bengaluru", "Wife: +91 98765 88888"),
            ("sarah.m@gmail.com", "Sarah Miller", "+91 98765 00012", "456 Oak Avenue, Delhi", "Brother: +91 98765 77777"),
            ("david.k@gmail.com", "David Kim", "+91 98765 00013", "789 Pine Road, Pune", "Self: +91 98765 00013"),
            ("lisa.chen@yahoo.com", "Lisa Chen", "+91 98765 00014", "321 Maple Lane, Hyderabad", "Sister: +91 98765 66666"),
            ("michael.b@outlook.com", "Michael Brown", "+91 98765 00015", "654 Birch Boulevard, Chennai", "Emergency: +91 98765 55555"),
            ("emma.wilson@hotmail.com", "Emma Wilson", "+91 98765 00016", "987 Cedar Drive, Kolkata", "Mother: +91 98765 44444"),
            ("james.taylor@gmail.com", "James Taylor", "+91 98765 00017", "147 Spruce Street, Ahmedabad", "Friend: +91 98765 33333"),
            ("olivia.davis@yahoo.com", "Olivia Davis", "+91 98765 00018", "258 Willow Way, Jaipur", "Husband: +91 98765 22222"),
            ("daniel.white@gmail.com", "Daniel White", "+91 98765 00019", "369 Ash Court, Chandigarh", "Father: +91 98765 11111")
        ]
        customers_list = []
        for email, name, phone, addr, emerg in customer_raw:
            user = User(email=email, password_hash=password_hash, full_name=name, phone=phone, role=UserRole.CUSTOMER, is_active=True)
            db.add(user)
            db.commit()

            cust = Customer(user_id=user.id, address=addr, emergency_contact=emerg, notes="Regular client")
            db.add(cust)
            db.commit()
            customers_list.append(cust)

        # 5. Pets (16 Pets)
        pets_raw = [
            (customers_list[0].id, "Max", "Dog", "Golden Retriever", "Male", date(2021, 4, 12), 31.5, "Golden", "9851410001", "Chicken protein allergy", "Mild seasonal dermatitis"),
            (customers_list[0].id, "Bella", "Cat", "Siamese", "Female", date(2022, 8, 20), 4.2, "Cream & Chocolate", "9851410002", "None", "Sensitive stomach"),
            (customers_list[1].id, "Charlie", "Dog", "Labrador", "Male", date(2020, 1, 15), 29.0, "Black", "9851410003", "Penicillin", "None"),
            (customers_list[1].id, "Luna", "Cat", "Persian", "Female", date(2023, 2, 10), 3.8, "White", "9851410004", "Dust mites", "Eye drainage issues"),
            (customers_list[2].id, "Rocky", "Dog", "German Shepherd", "Male", date(2019, 11, 5), 34.0, "Black & Tan", "9851410005", "None", "Hip dysplasia history"),
            (customers_list[2].id, "Milo", "Cat", "Maine Coon", "Male", date(2021, 6, 18), 7.5, "Tabby", "9851410006", "None", "None"),
            (customers_list[3].id, "Coco", "Dog", "Poodle", "Female", date(2022, 3, 30), 8.0, "Apricot", "9851410007", "None", "Grooming anxiety"),
            (customers_list[4].id, "Oliver", "Cat", "British Shorthair", "Male", date(2020, 9, 25), 5.1, "Blue Grey", "9851410008", "None", "None"),
            (customers_list[5].id, "Teddy", "Dog", "French Bulldog", "Male", date(2022, 12, 1), 12.2, "Fawn", "9851410009", "Beef", "Brachycephalic breathing syndrome"),
            (customers_list[6].id, "Daisy", "Dog", "Beagle", "Female", date(2021, 7, 14), 11.0, "Tricolor", "9851410010", "None", "None"),
            (customers_list[7].id, "Simba", "Cat", "Ragdoll", "Male", date(2023, 5, 2), 4.5, "Seal Point", "9851410011", "None", "None"),
            (customers_list[8].id, "Bailey", "Dog", "Cocker Spaniel", "Female", date(2020, 10, 8), 13.8, "Buff", "9851410012", "Fleas", "Ear infection prone"),
            (customers_list[9].id, "Buster", "Dog", "Boxer", "Male", date(2018, 5, 19), 32.0, "Brindle", "9851410013", "None", "Arthritis in right paw"),
            (customers_list[3].id, "Nala", "Cat", "Sphynx", "Female", date(2022, 11, 11), 3.2, "Pink/Grey", "9851410014", "None", "Requires weekly skin bathing"),
            (customers_list[4].id, "Zoe", "Rabbit", "Holland Lop", "Female", date(2023, 1, 4), 1.9, "Brown", "9851410015", "None", "None"),
            (customers_list[5].id, "Buddy", "Dog", "Shih Tzu", "Male", date(2021, 9, 9), 6.5, "White & Gold", "9851410016", "None", "Dry eye syndrome")
        ]
        pet_list = []
        for cid, name, spc, brd, gnd, dob, wgt, col, micro, alg, cond in pets_raw:
            pet = Pet(
                customer_id=cid,
                name=name,
                species=spc,
                breed=brd,
                gender=gnd,
                date_of_birth=dob,
                weight=wgt,
                color=col,
                microchip_id=micro,
                allergies=alg,
                existing_conditions=cond
            )
            db.add(pet)
            db.commit()
            pet_list.append(pet)

        # 6. Appointments, Payments, Invoices, Reviews linked to Businesses
        today = date.today()
        
        for i in range(16):
            biz = created_businesses[i % len(created_businesses)]
            b_services = created_services_map[biz.id]
            b_staff = db.query(Staff).filter(Staff.business_id == biz.id).all()
            staff = b_staff[0] if b_staff else all_staff_list[0]
            pet = pet_list[i % len(pet_list)]

            past_date = today - timedelta(days=random.randint(2, 40))
            selected_srvs = random.sample(b_services, k=2 if i % 3 == 0 and len(b_services) >= 2 else 1)
            primary_srv = selected_srvs[0]
            tot_duration = sum(s.duration_minutes for s in selected_srvs)
            tot_subtotal = sum(s.price for s in selected_srvs)

            sh = 10 + (i % 6)
            start_time_str = f"{sh:02d}:00"
            eh = sh + (tot_duration // 60)
            em = tot_duration % 60
            end_time_str = f"{eh:02d}:{em:02d}"

            appt = Appointment(
                business_id=biz.id,
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=primary_srv.id,
                appointment_date=past_date,
                start_time=start_time_str,
                end_time=end_time_str,
                status=AppointmentStatus.COMPLETED,
                notes="Service completed with full satisfaction."
            )
            db.add(appt)
            db.commit()

            for srv in selected_srvs:
                appt_srv = AppointmentService(
                    appointment_id=appt.id,
                    service_id=srv.id,
                    price_at_booking=srv.price,
                    duration_minutes=srv.duration_minutes
                )
                db.add(appt_srv)
            db.commit()

            tax = round(tot_subtotal * 0.05, 2)
            tot = round(tot_subtotal + tax, 2)
            payment = Payment(
                business_id=biz.id,
                appointment_id=appt.id,
                amount=tot_subtotal,
                tax=tax,
                discount=0.0,
                final_amount=tot,
                status=PaymentStatus.PAID,
                payment_method=random.choice([PaymentMethod.CREDIT_CARD, PaymentMethod.UPI, PaymentMethod.ONLINE_MOCK]),
                transaction_id=f"TXN-2026-{1000+i}",
                payment_date=datetime.combine(past_date, datetime.min.time())
            )
            db.add(payment)
            db.commit()

            inv = Invoice(
                business_id=biz.id,
                appointment_id=appt.id,
                payment_id=payment.id,
                invoice_number=f"INV-2026-{1000+i}",
                issue_date=past_date,
                due_date=past_date,
                total_amount=tot
            )
            db.add(inv)
            db.commit()

            # Reviews
            rev = Review(
                business_id=biz.id,
                appointment_id=appt.id,
                customer_id=pet.customer_id,
                service_id=primary_srv.id,
                rating=random.choice([4, 5]),
                comment=f"Awesome experience at {biz.name}! {pet.name} was treated with care and affection."
            )
            db.add(rev)
            db.commit()

        # Upcoming Appointments
        for i in range(6):
            biz = created_businesses[i % len(created_businesses)]
            b_services = created_services_map[biz.id]
            b_staff = db.query(Staff).filter(Staff.business_id == biz.id).all()
            staff = b_staff[0] if b_staff else all_staff_list[0]
            pet = pet_list[i % len(pet_list)]
            future_date = today + timedelta(days=random.randint(1, 10))

            selected_srvs = [b_services[0]]
            primary_srv = selected_srvs[0]
            tot_duration = primary_srv.duration_minutes
            tot_subtotal = primary_srv.price

            sh = 11 + i
            start_time_str = f"{sh:02d}:00"
            eh = sh + (tot_duration // 60)
            em = tot_duration % 60
            end_time_str = f"{eh:02d}:{em:02d}"

            appt = Appointment(
                business_id=biz.id,
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=primary_srv.id,
                appointment_date=future_date,
                start_time=start_time_str,
                end_time=end_time_str,
                status=AppointmentStatus.CONFIRMED if i % 2 == 0 else AppointmentStatus.PENDING,
                notes="Upcoming appointment booking."
            )
            db.add(appt)
            db.commit()

            for srv in selected_srvs:
                appt_srv = AppointmentService(
                    appointment_id=appt.id,
                    service_id=srv.id,
                    price_at_booking=srv.price,
                    duration_minutes=srv.duration_minutes
                )
                db.add(appt_srv)
            db.commit()

            tax = round(tot_subtotal * 0.05, 2)
            tot = round(tot_subtotal + tax, 2)
            payment = Payment(
                business_id=biz.id,
                appointment_id=appt.id,
                amount=tot_subtotal,
                tax=tax,
                discount=0.0,
                final_amount=tot,
                status=PaymentStatus.PAID if i % 2 == 0 else PaymentStatus.PENDING,
                payment_method=PaymentMethod.ONLINE_MOCK,
                transaction_id=f"TXN-UPCOMING-{2000+i}" if i % 2 == 0 else None,
                payment_date=datetime.utcnow() if i % 2 == 0 else None
            )
            db.add(payment)
            db.commit()

        # 7. Vaccinations & Notifications
        vac = Vaccination(
            pet_id=pet_list[0].id,
            staff_id=all_staff_list[0].id,
            vaccine_name="Rabies Immunization",
            date_administered=today - timedelta(days=180),
            next_due_date=today + timedelta(days=185),
            batch_number="BAT-2025-01",
            status=VaccinationStatus.COMPLETED,
            notes="Administered subcutaneously."
        )
        db.add(vac)
        db.commit()

        audit = AuditLog(
            user_id=admin_user.id,
            action="MARKETPLACE_INIT",
            entity_type="SYSTEM",
            entity_id=1,
            details="System successfully seeded with multi-business pet care marketplace demo dataset."
        )
        db.add(audit)
        db.commit()

        print("[SUCCESS] Multi-Business Pet Care Marketplace Seeding Complete!")
        print("\n--- DEMO LOGIN CREDENTIALS ---")
        print("ADMIN:          admin@petcare.com           / password123")
        print("BUSINESS OWNER: owner.happypaws@petcare.com / password123")
        print("BUSINESS OWNER: owner.petcareplus@petcare.com / password123")
        print("VET/STAFF:      dr.smith@petcare.com        / password123")
        print("CUSTOMER:       customer@petcare.com        / password123")

    except Exception as e:
        print(f"[ERROR] Seeding Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
