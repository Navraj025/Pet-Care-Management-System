from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.pet import Pet
from app.models.vaccination import Vaccination
from app.models.medical_record import MedicalRecord
from app.models.appointment import Appointment
from app.schemas.ai import AiQueryResponse


def generate_pet_ai_response(
    db: Session,
    user: User,
    prompt: str,
    pet_id: Optional[int] = None
) -> AiQueryResponse:
    prompt_lower = prompt.lower()
    
    # Customer context pet lookup
    pet_context_str = ""
    suggested = ["Book an Appointment", "Check Vaccinations", "View Medical Records"]
    
    if user.customer_profile:
        customer_pets = user.customer_profile.pets
        if customer_pets:
            pet_names = [p.name for p in customer_pets]
            pet_context_str = f"You have {len(customer_pets)} registered pet(s): {', '.join(pet_names)}."

    # Custom Query Intent Matching
    if "vaccin" in prompt_lower:
        if pet_id:
            vacs = db.query(Vaccination).filter(Vaccination.pet_id == pet_id).all()
            if vacs:
                details = [f"- {v.vaccine_name} (Administered: {v.date_administered}, Next Due: {v.next_due_date or 'N/A'})" for v in vacs]
                resp = f"Here is the vaccination history for your pet:\n\n" + "\n".join(details)
            else:
                resp = "No vaccination records found for this pet yet. It's important to keep vaccinations up to date!"
        else:
            resp = f"{pet_context_str}\n\nVaccinations protect pets against serious illness like Rabies, Distemper, and Parvovirus. We recommend core vaccinations annually. Check your pet profile tab for upcoming due dates!"
        return AiQueryResponse(response=resp, suggested_actions=["View Vaccinations", "Book Vaccination Service"])

    elif "appoint" in prompt_lower or "book" in prompt_lower:
        if user.customer_profile:
            appts = db.query(Appointment).filter(Appointment.customer_id == user.customer_profile.id).order_by(Appointment.appointment_date.desc()).limit(3).all()
            if appts:
                app_list = [f"- {a.appointment_date} at {a.start_time} for service '{a.service.name}' ({a.status.value})" for a in appts]
                resp = f"Here are your recent appointment bookings:\n" + "\n".join(app_list) + "\n\nWould you like to book a new appointment?"
            else:
                resp = "You have no active appointments. You can book an appointment online with any of our specialized veterinarians!"
        else:
            resp = "You can view available slots and book appointments in real time through our online booking system!"
        return AiQueryResponse(response=resp, suggested_actions=["Book Appointment", "View My Appointments"])

    elif "medical" in prompt_lower or "health" in prompt_lower or "diagnos" in prompt_lower:
        if pet_id:
            meds = db.query(MedicalRecord).filter(MedicalRecord.pet_id == pet_id).order_by(MedicalRecord.date.desc()).all()
            if meds:
                details = [f"- {m.date}: Diagnosis: {m.diagnosis} | Treatment: {m.treatment}" for m in meds]
                resp = f"Here are the latest medical consultation records:\n\n" + "\n".join(details)
            else:
                resp = "No past medical records recorded for this pet."
        else:
            resp = f"{pet_context_str}\n\nOur veterinary clinic keeps complete electronic health records including symptoms, diagnoses, prescriptions, and follow-up schedules for all your pets."
        return AiQueryResponse(response=resp, suggested_actions=["View Medical Records"])

    elif "food" in prompt_lower or "diet" in prompt_lower or "feed" in prompt_lower:
        resp = "For a balanced pet diet:\n1. Provide age-appropriate, high-quality food.\n2. Ensure fresh water is always available.\n3. Avoid toxic foods like chocolate, onions, grapes, and xylitol.\n4. Consult our vets for specialized dietary plans if your pet has allergies!"
        return AiQueryResponse(response=resp, suggested_actions=["Book Consultation"])

    elif "hours" in prompt_lower or "timing" in prompt_lower or "policy" in prompt_lower or "contact" in prompt_lower:
        resp = "Our Smart Pet Care Center is open Monday through Saturday from 09:00 AM to 06:00 PM. Emergency support is available on request. You can reschedule or cancel appointments up to 2 hours prior to start time."
        return AiQueryResponse(response=resp, suggested_actions=["Explore Services", "Contact Clinic"])

    else:
        resp = f"Hello {user.full_name}! I am your Smart Pet Care Assistant. {pet_context_str}\n\nI can help you check appointment schedules, look up vaccination due dates, retrieve medical records, or answer general pet care FAQs."
        return AiQueryResponse(response=resp, suggested_actions=suggested)
