from datetime import datetime, date, timedelta
import random
from app.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Customer, Staff, Pet, Service,
    Appointment, AppointmentStatus, MedicalRecord, Vaccination,
    VaccinationStatus, Availability, Payment, PaymentStatus, PaymentMethod,
    Invoice, Notification, Review, AuditLog, SystemSetting
)
from app.auth.security import get_password_hash

def seed_database():
    print("[INFO] Initializing Database Seeding...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. System Settings
        settings_data = [
            ("clinic_name", "Smart Pet Care & Veterinary Center"),
            ("clinic_email", "contact@smartpetcare.com"),
            ("clinic_phone", "+1 (800) 555-PETS"),
            ("clinic_address", "124 Healthcare Boulevard, Suite 400, Tech City"),
            ("tax_rate_percent", "5.0"),
            ("cancellation_policy_hours", "2")
        ]
        for key, val in settings_data:
            db.add(SystemSetting(key=key, value=val))
        db.commit()

        # 2. Users & Profiles
        password_hash = get_password_hash("password123")

        # Admin
        admin_user = User(
            email="admin@petcare.com",
            password_hash=password_hash,
            full_name="Dr. Arthur Pendelton (Admin)",
            phone="+1 555-0100",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()

        # Staff (3 Veterinarians & Groomers)
        staff_data = [
            ("dr.smith@petcare.com", "Dr. Robert Smith, DVM", "+1 555-0101", "Senior Veterinarian & Surgeon", "Specializes in canine internal medicine and orthopedic surgeries."),
            ("dr.emily@petcare.com", "Dr. Emily Watson", "+1 555-0102", "Feline & Exotic Pet Specialist", "Focuses on feline wellness, nutrition, and small mammal care."),
            ("groomer.alex@petcare.com", "Alex Rivera", "+1 555-0103", "Master Pet Stylist & Groomer", "Certified professional groomer with 8+ years of styling experience.")
        ]
        staff_list = []
        for email, name, phone, spec, bio in staff_data:
            user = User(email=email, password_hash=password_hash, full_name=name, phone=phone, role=UserRole.STAFF, is_active=True)
            db.add(user)
            db.commit()
            
            st = Staff(
                user_id=user.id,
                specialization=spec,
                bio=bio,
                working_days="Mon,Tue,Wed,Thu,Fri,Sat",
                start_time="09:00",
                end_time="18:00",
                break_start="13:00",
                break_end="14:00",
                is_available=True
            )
            db.add(st)
            db.commit()
            staff_list.append(st)

        # Customers (10 Owners)
        customer_raw = [
            ("customer@petcare.com", "Main Demo Owner", "+1 555-0200", "742 Evergreen Terrace, Springfield", "Emergency: +1 555-9999"),
            ("john.doe@gmail.com", "John Doe", "+1 555-0201", "123 Elm Street, Cityville", "Wife: +1 555-8888"),
            ("sarah.m@gmail.com", "Sarah Miller", "+1 555-0202", "456 Oak Avenue, Metropolis", "Brother: +1 555-7777"),
            ("david.k@gmail.com", "David Kim", "+1 555-0203", "789 Pine Road, Gotham", "Self: +1 555-0203"),
            ("lisa.chen@yahoo.com", "Lisa Chen", "+1 555-0204", "321 Maple Lane, Star City", "Sister: +1 555-6666"),
            ("michael.b@outlook.com", "Michael Brown", "+1 555-0205", "654 Birch Boulevard, Central City", "Emergency: +1 555-5555"),
            ("emma.wilson@hotmail.com", "Emma Wilson", "+1 555-0206", "987 Cedar Drive, Coast City", "Mother: +1 555-4444"),
            ("james.taylor@gmail.com", "James Taylor", "+1 555-0207", "147 Spruce Street, Bludhaven", "Friend: +1 555-3333"),
            ("olivia.davis@yahoo.com", "Olivia Davis", "+1 555-0208", "258 Willow Way, Keystone", "Husband: +1 555-2222"),
            ("daniel.white@gmail.com", "Daniel White", "+1 555-0209", "369 Ash Court, Smallville", "Father: +1 555-1111")
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

        # 3. Services
        services_raw = [
            ("General Health Checkup", "Veterinary", "Comprehensive physical examination, vitals check, and general health report.", 30, 65.0),
            ("Veterinary Consultation", "Veterinary", "In-depth clinical assessment for sick or injured pets with treatment plan.", 45, 95.0),
            ("Rabies Vaccination", "Vaccination", "Standard anti-rabies immunizing vaccine for dogs and cats.", 15, 35.0),
            ("DHPP Core Vaccine", "Vaccination", "5-in-1 combination vaccine covering Distemper, Hepatitis, Parainfluenza, Parvovirus.", 15, 45.0),
            ("Dental Cleaning & Scaling", "Dental", "Ultrasonic dental scaling, polishing, and oral hygiene treatment.", 60, 150.0),
            ("Full Grooming Package", "Grooming", "Breed-specific haircut, bath, blow dry, nail clipping, and ear cleaning.", 60, 80.0),
            ("Bath & De-Shedding Dry", "Grooming", "Hypoallergenic shampoo bath, de-shedding brush out, and coat blow dry.", 45, 55.0),
            ("Nail Trimming & Paw Care", "Grooming", "Precision claw trimming, filing, and paw pad soothing balm treatment.", 20, 25.0)
        ]
        service_list = []
        for name, cat, desc, dur, price in services_raw:
            srv = Service(name=name, category=cat, description=desc, duration_minutes=dur, price=price, is_active=True)
            db.add(srv)
            db.commit()
            service_list.append(srv)

        # 4. Pets (16 Pets)
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

        # 5. Appointments, Payments, Invoices, Reviews (Past & Future)
        today = date.today()
        
        # Historical Appointments
        for i in range(12):
            past_date = today - timedelta(days=random.randint(2, 40))
            pet = random.choice(pet_list)
            staff = random.choice(staff_list)
            srv = random.choice(service_list)

            appt = Appointment(
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=srv.id,
                appointment_date=past_date,
                start_time="10:00",
                end_time="10:30",
                status=AppointmentStatus.COMPLETED,
                notes="Routine follow-up completed successfully."
            )
            db.add(appt)
            db.commit()

            # Payment
            tax = round(srv.price * 0.05, 2)
            tot = round(srv.price + tax, 2)
            payment = Payment(
                appointment_id=appt.id,
                amount=srv.price,
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

            # Invoice
            inv = Invoice(
                appointment_id=appt.id,
                payment_id=payment.id,
                invoice_number=f"INV-2026-{1000+i}",
                issue_date=past_date,
                due_date=past_date,
                total_amount=tot
            )
            db.add(inv)
            db.commit()

            # Medical Record for consultation/health check
            if srv.category in ["Veterinary", "Dental"]:
                med = MedicalRecord(
                    pet_id=pet.id,
                    staff_id=staff.id,
                    appointment_id=appt.id,
                    date=past_date,
                    symptoms="Mild lethargy and appetite decrease reported by owner.",
                    diagnosis="Mild dental tartar buildup and minor gum irritation.",
                    treatment="Administered oral cleansing spray and prescribed antibiotics.",
                    prescription="Amoxicillin 100mg - 1 tablet twice daily for 5 days.",
                    weight=pet.weight,
                    temperature=38.6,
                    follow_up_date=past_date + timedelta(days=14),
                    notes="Owner advised to maintain regular brushing."
                )
                db.add(med)
                db.commit()

            # Review
            if i % 2 == 0:
                rev = Review(
                    appointment_id=appt.id,
                    customer_id=pet.customer_id,
                    service_id=srv.id,
                    rating=random.choice([4, 5]),
                    comment=f"Excellent service by {staff.user.full_name}! {pet.name} was treated with care."
                )
                db.add(rev)
                db.commit()

        # Upcoming Appointments
        for i in range(5):
            future_date = today + timedelta(days=random.randint(1, 10))
            pet = pet_list[i]
            staff = staff_list[i % len(staff_list)]
            srv = service_list[i % len(service_list)]

            appt = Appointment(
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=srv.id,
                appointment_date=future_date,
                start_time=f"{10 + i}:00",
                end_time=f"{10 + i}:30",
                status=AppointmentStatus.CONFIRMED if i % 2 == 0 else AppointmentStatus.PENDING,
                notes="Standard appointment booking."
            )
            db.add(appt)
            db.commit()

            tax = round(srv.price * 0.05, 2)
            tot = round(srv.price + tax, 2)
            payment = Payment(
                appointment_id=appt.id,
                amount=srv.price,
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

        # 6. Vaccinations (Completed, Upcoming, Overdue)
        vac_records = [
            (pet_list[0].id, staff_list[0].id, "Rabies Immunization", today - timedelta(days=180), today + timedelta(days=185), "BAT-2025-01", VaccinationStatus.COMPLETED),
            (pet_list[0].id, staff_list[0].id, "DHPP 5-in-1 Vaccine", today - timedelta(days=370), today - timedelta(days=5), "BAT-2024-99", VaccinationStatus.OVERDUE),
            (pet_list[1].id, staff_list[1].id, "Feline Leukemia (FeLV)", today - timedelta(days=90), today + timedelta(days=275), "BAT-FELV-44", VaccinationStatus.COMPLETED),
            (pet_list[2].id, staff_list[0].id, "Canine Parvovirus Booster", today - timedelta(days=350), today + timedelta(days=15), "BAT-PARVO-88", VaccinationStatus.UPCOMING),
            (pet_list[3].id, staff_list[1].id, "FVRCP Core Vaccine", today - timedelta(days=400), today - timedelta(days=35), "BAT-FVR-12", VaccinationStatus.OVERDUE)
        ]
        for pid, stid, vname, dadm, ndue, batch, vstat in vac_records:
            vac = Vaccination(
                pet_id=pid,
                staff_id=stid,
                vaccine_name=vname,
                date_administered=dadm,
                next_due_date=ndue,
                batch_number=batch,
                status=vstat,
                notes="Administered subcutaneously."
            )
            db.add(vac)
        db.commit()

        # 7. Notifications & Audit Logs
        notif1 = Notification(
            user_id=customers_list[0].user_id,
            title="Vaccination Due Alert",
            message=f"DHPP 5-in-1 Vaccine for {pet_list[0].name} is overdue. Please schedule a visit soon.",
            type="VACCINATION",
            link="/customer/vaccinations"
        )
        notif2 = Notification(
            user_id=customers_list[0].user_id,
            title="Appointment Reminder",
            message=f"You have an upcoming appointment for {pet_list[0].name} scheduled for tomorrow.",
            type="APPOINTMENT",
            link="/customer/appointments"
        )
        db.add(notif1)
        db.add(notif2)

        audit = AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_INIT",
            entity_type="SYSTEM",
            entity_id=1,
            details="System database successfully seeded with initial commercial B.Tech project demo dataset."
        )
        db.add(audit)
        db.commit()

        print("[SUCCESS] Database seeding complete!")
        print("\n--- DEMO LOGIN CREDENTIALS ---")
        print("ADMIN:    admin@petcare.com     / password123")
        print("VET/STAFF: dr.smith@petcare.com  / password123")
        print("CUSTOMER: customer@petcare.com  / password123")

    except Exception as e:
        print(f"[ERROR] Seeding Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
