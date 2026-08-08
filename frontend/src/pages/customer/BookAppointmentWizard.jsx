import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Dog, Stethoscope, User, CheckCircle2, ChevronRight,
  ChevronLeft, AlertCircle, CreditCard, Sparkles
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MockPaymentModal from '../../components/MockPaymentModal';

const BookAppointmentWizard = () => {
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Selections
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
      try {
        const [petsRes, srvRes, staffRes] = await Promise.all([
          API.get('/pets'),
          API.get('/services'),
          API.get('/staff?available_only=true')
        ]);
        setPets(petsRes.data);
        setServices(srvRes.data);
        setStaffList(staffRes.data);
        if (petsRes.data.length > 0) setSelectedPet(petsRes.data[0]);
        if (srvRes.data.length > 0) setSelectedService(srvRes.data[0]);
        if (staffRes.data.length > 0) setSelectedStaff(staffRes.data[0]);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    initData();
  }, []);

  // Fetch dynamic available slots whenever staff, service or date changes
  useEffect(() => {
    if (selectedStaff && selectedService && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await API.get(
            `/availability/slots?staff_id=${selectedStaff.id}&service_id=${selectedService.id}&target_date=${selectedDate}`
          );
          setAvailableSlots(res.data);
          setSelectedSlot(null);
        } catch (err) {
          console.error("Slot fetch failed:", err);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedStaff, selectedService, selectedDate]);

  const handleCreateAppointment = async () => {
    if (!selectedPet || !selectedService || !selectedStaff || !selectedSlot) {
      showError("Please complete all booking selections");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        pet_id: selectedPet.id,
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.time,
        notes
      });
      setCreatedAppointment(res.data);
      showSuccess("Appointment booked successfully!");
      setStep(5); // Confirmation Step
    } catch (err) {
      console.error("Booking error:", err);
      showError(err.response?.data?.detail || "Booking failed. Slot may be unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Book Appointment Wizard</h2>
            <p className="text-xs text-slate-400">Step {step} of 5</p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Smart Availability Engine
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {['1. Select Pet', '2. Service', '3. Specialist', '4. Date & Time', '5. Confirm'].map((label, idx) => {
            const stepNum = idx + 1;
            return (
              <div key={label} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    step >= stepNum ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                ></div>
                <span className={`text-[10px] font-bold block text-center truncate ${step >= stepNum ? 'text-teal-700' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Pet */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Step 1: Choose Your Pet</h3>

          {pets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-2">
              <p>You have no registered pets yet.</p>
              <button
                onClick={() => navigate('/customer/pets')}
                className="font-bold text-teal-600 underline"
              >
                Register a Pet First
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedPet?.id === pet.id
                      ? 'border-teal-600 bg-teal-50/60 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold">
                      {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐰'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{pet.name}</h4>
                      <p className="text-xs text-slate-400">{pet.breed || pet.species} • {pet.gender}</p>
                    </div>
                  </div>
                  {selectedPet?.id === pet.id && <CheckCircle2 className="w-6 h-6 text-teal-600" />}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPet}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1"
            >
              <span>Next: Select Service</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Service */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Step 2: Choose Service</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  selectedService?.id === srv.id
                    ? 'border-teal-600 bg-teal-50/60 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100 px-2.5 py-0.5 rounded">
                    {srv.category}
                  </span>
                  <span className="font-extrabold text-slate-900 text-base">${srv.price.toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
                <p className="text-[11px] font-semibold text-teal-600 pt-1">⏱ Duration: {srv.duration_minutes} mins</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedService}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1"
            >
              <span>Next: Choose Specialist</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Specialist */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Step 3: Choose Veterinarian or Stylist</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffList.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStaff(st)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 text-center ${
                  selectedStaff?.id === st.id
                    ? 'border-teal-600 bg-teal-50/60 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl mx-auto">
                  {st.user?.full_name?.charAt(0) || 'D'}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{st.user?.full_name}</h4>
                <p className="text-xs font-semibold text-teal-700">{st.specialization}</p>
                <p className="text-[11px] text-slate-400">Shift: {st.start_time} - {st.end_time}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedStaff}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1"
            >
              <span>Next: Pick Date & Slot</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick Date & Time Slot */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Step 4: Select Date & Available Time Slot</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Staff Schedule: {selectedStaff?.working_days}
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Available Time Slots</label>

              {loadingSlots ? (
                <p className="text-xs text-slate-500 py-4">Calculating available slots...</p>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                  No open slots on {selectedDate} for this specialist. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSlot?.time === slot.time
                          ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                          : slot.available
                          ? 'border-slate-200 text-slate-800 hover:border-teal-500 bg-white'
                          : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Notes for Vet (Optional)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Pet has allergy, requested specific shampoo..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCreateAppointment}
              disabled={!selectedSlot || submitting}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
            >
              {submitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Book</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation Page */}
      {step === 5 && createdAppointment && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900">Appointment Scheduled!</h3>
            <p className="text-xs text-slate-500">Your appointment booking is registered in the system.</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Pet:</span>
              <span className="font-bold text-slate-800">{createdAppointment.pet?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service:</span>
              <span className="font-bold text-slate-800">{createdAppointment.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specialist:</span>
              <span className="font-bold text-slate-800">{createdAppointment.staff?.user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-bold text-teal-700">{createdAppointment.appointment_date} at {createdAppointment.start_time}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Online Now</span>
            </button>
            <button
              onClick={() => navigate('/customer/appointments')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl"
            >
              Go to Appointments List
            </button>
          </div>
        </div>
      )}

      {/* Mock Payment Gateway Modal Trigger */}
      {showPaymentModal && createdAppointment && (
        <MockPaymentModal
          appointment={createdAppointment}
          onSuccess={() => {
            setShowPaymentModal(false);
            navigate('/customer/payments');
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default BookAppointmentWizard;
