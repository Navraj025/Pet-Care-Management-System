from datetime import datetime, date, timedelta
import random
from app.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Customer, Staff, Pet, Service,
    Appointment, AppointmentStatus, AppointmentService, MedicalRecord, Vaccination,
    VaccinationStatus, Availability, Payment, PaymentStatus, PaymentMethod,
    Invoice, Notification, Review, AuditLog, SystemSetting
)
from app.auth.security import get_password_hash

def seed_database(drop_existing: bool = True):
    print("[INFO] Initializing Database Seeding...")
    if drop_existing:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. System Settings
        settings_data = [
            ("clinic_name", "Smart Pet Care & Veterinary Center"),
            ("clinic_email", "contact@smartpetcare.com"),
            ("clinic_phone", "+91 98765 43210"),
            ("clinic_address", "124 Healthcare Boulevard, Suite 400, Tech City, MH"),
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
            phone="+91 98765 00000",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()

        # Staff (3 Veterinarians & Groomers)
        staff_data = [
            ("dr.smith@petcare.com", "Dr. Robert Smith, DVM", "+91 98765 00001", "Senior Veterinarian & Surgeon", "Specializes in canine internal medicine and orthopedic surgeries."),
            ("dr.emily@petcare.com", "Dr. Emily Watson", "+91 98765 00002", "Feline & Exotic Pet Specialist", "Focuses on feline wellness, nutrition, and small mammal care."),
            ("groomer.alex@petcare.com", "Alex Rivera", "+91 98765 00003", "Master Pet Stylist & Groomer", "Certified professional groomer with 8+ years of styling experience.")
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

        # 3. Services (Prices in INR ₹)
        services_raw = [
            ("General Health Checkup", "Veterinary", "Comprehensive physical examination, vitals check, and general health report.", 30, 4250.0),
            ("Veterinary Consultation", "Veterinary", "In-depth clinical assessment for sick or injured pets with treatment plan.", 45, 6800.0),
            ("Rabies Vaccination", "Vaccination", "Standard anti-rabies immunizing vaccine for dogs and cats.", 15, 3400.0),
            ("DHPP Core Vaccine", "Vaccination", "5-in-1 combination vaccine covering Distemper, Hepatitis, Parainfluenza, Parvovirus.", 15, 5100.0),
            ("Dental Cleaning & Scaling", "Dental", "Ultrasonic dental scaling, polishing, and oral hygiene treatment.", 60, 12750.0),
            ("Full Grooming Package", "Grooming", "Breed-specific haircut, bath, blow dry, nail clipping, and ear cleaning.", 60, 8500.0),
            ("Bath & De-Shedding Dry", "Grooming", "Hypoallergenic shampoo bath, de-shedding brush out, and coat blow dry.", 45, 5100.0),
            ("Nail Trimming & Paw Care", "Grooming", "Precision claw trimming, filing, and paw pad soothing balm treatment.", 20, 2550.0)
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
            # Pick 1 or 2 services for multi-service demonstration
            selected_srvs = random.sample(service_list, k=2 if i % 3 == 0 else 1)
            primary_srv = selected_srvs[0]
            tot_duration = sum(s.duration_minutes for s in selected_srvs)
            tot_subtotal = sum(s.price for s in selected_srvs)

            sh = 10 + (i % 6)
            start_time_str = f"{sh:02d}:00"
            end_min = tot_duration
            eh = sh + (end_min // 60)
            em = end_min % 60
            end_time_str = f"{eh:02d}:{em:02d}"

            appt = Appointment(
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=primary_srv.id,
                appointment_date=past_date,
                start_time=start_time_str,
                end_time=end_time_str,
                status=AppointmentStatus.COMPLETED,
                notes="Routine follow-up completed successfully."
            )
            db.add(appt)
            db.commit()

            # Add AppointmentService records
            for srv in selected_srvs:
                appt_srv = AppointmentService(
                    appointment_id=appt.id,
                    service_id=srv.id,
                    price_at_booking=srv.price,
                    duration_minutes=srv.duration_minutes
                )
                db.add(appt_srv)
            db.commit()

            # Payment
            tax = round(tot_subtotal * 0.05, 2)
            tot = round(tot_subtotal + tax, 2)
            payment = Payment(
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
            if any(s.category in ["Veterinary", "Dental"] for s in selected_srvs):
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
                    service_id=primary_srv.id,
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
            selected_srvs = [service_list[i % len(service_list)], service_list[(i + 2) % len(service_list)]] if i % 2 == 1 else [service_list[i % len(service_list)]]
            primary_srv = selected_srvs[0]
            tot_duration = sum(s.duration_minutes for s in selected_srvs)
            tot_subtotal = sum(s.price for s in selected_srvs)

            sh = 10 + i
            start_time_str = f"{sh:02d}:00"
            eh = sh + (tot_duration // 60)
            em = tot_duration % 60
            end_time_str = f"{eh:02d}:{em:02d}"

            appt = Appointment(
                customer_id=pet.customer_id,
                pet_id=pet.id,
                staff_id=staff.id,
                service_id=primary_srv.id,
                appointment_date=future_date,
                start_time=start_time_str,
                end_time=end_time_str,
                status=AppointmentStatus.CONFIRMED if i % 2 == 0 else AppointmentStatus.PENDING,
                notes="Standard appointment booking."
            )
            db.add(appt)
            db.commit()

            # Add AppointmentService records
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
