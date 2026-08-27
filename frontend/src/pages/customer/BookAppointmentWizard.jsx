import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Dog, Stethoscope, User, CheckCircle2, ChevronRight,
  ChevronLeft, AlertCircle, CreditCard, Sparkles, Check, X
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MockPaymentModal from '../../components/MockPaymentModal';
import PetAvatar from '../../components/PetAvatar';
import { formatCurrency } from '../../utils/formatters';

const BookAppointmentWizard = () => {
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Selections
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
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
        if (srvRes.data.length > 0) setSelectedServiceIds([srvRes.data[0].id]);
        if (staffRes.data.length > 0) setSelectedStaff(staffRes.data[0]);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    initData();
  }, []);

  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const subtotalPrice = selectedServicesList.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.duration_minutes, 0);

  const toggleService = (srvId) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(srvId)) {
        return prev.filter((id) => id !== srvId);
      } else {
        return [...prev, srvId];
      }
    });
  };

  // Fetch dynamic available slots whenever staff, selected services or date changes
  useEffect(() => {
    if (selectedStaff && selectedServiceIds.length > 0 && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await API.get(
            `/availability/slots?staff_id=${selectedStaff.id}&service_ids=${selectedServiceIds.join(',')}&target_date=${selectedDate}`
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
    } else {
      setAvailableSlots([]);
    }
  }, [selectedStaff, selectedServiceIds, selectedDate]);

  const handleCreateAppointment = async () => {
    if (!selectedPet || selectedServiceIds.length === 0 || !selectedStaff || !selectedSlot) {
      showError("Please complete all booking selections (select at least one service)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        pet_id: selectedPet.id,
        service_ids: selectedServiceIds,
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Book Appointment Wizard</h2>
            <p className="text-xs text-slate-400 dark:text-slate-400">Step {step} of 5</p>
          </div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Multi-Service Availability Engine
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {['1. Select Pet', '2. Services', '3. Specialist', '4. Date & Time', '5. Confirm'].map((label, idx) => {
            const stepNum = idx + 1;
            return (
              <div key={label} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    step >= stepNum ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                ></div>
                <span className={`text-[10px] font-bold block text-center truncate ${step >= stepNum ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Pet */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Step 1: Choose Your Pet</h3>

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
                      ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <PetAvatar pet={pet} size="sm" className="rounded-xl" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{pet.name}</h4>
                      <p className="text-xs text-slate-400">{pet.breed || pet.species} • {pet.gender}</p>
                    </div>
                  </div>
                  {selectedPet?.id === pet.id && <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPet}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1 shadow-md"
            >
              <span>Next: Select Services</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Multi Services */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Step 2: Select Services</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose one or more care services for your pet</p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {selectedServiceIds.length} Selected
            </span>
          </div>

          {/* Selected Services Summary Bar */}
          {selectedServiceIds.length > 0 && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                  Selected Services ({selectedServiceIds.length}):
                </span>
                <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300">
                  Total Duration: {totalDuration} mins | Subtotal: {formatCurrency(subtotalPrice)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedServicesList.map((srv) => (
                  <span
                    key={srv.id}
                    className="inline-flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 shadow-xs"
                  >
                    <span>✓ {srv.name} ({formatCurrency(srv.price)})</span>
                    <button
                      type="button"
                      onClick={() => toggleService(srv.id)}
                      className="hover:text-rose-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services Grid with Multi Selection Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              return (
                <div
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase bg-teal-100 dark:bg-teal-900/60 px-2.5 py-0.5 rounded">
                        {srv.category}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {formatCurrency(srv.price)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{srv.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{srv.description}</p>
                  <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 pt-1">⏱ Duration: {srv.duration_minutes} mins</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (selectedServiceIds.length === 0) {
                  showError("Please select at least one service before proceeding.");
                  return;
                }
                setStep(3);
              }}
              disabled={selectedServiceIds.length === 0}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1 shadow-md"
            >
              <span>Next: Choose Specialist</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Specialist */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Step 3: Choose Veterinarian or Stylist</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffList.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStaff(st)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 text-center ${
                  selectedStaff?.id === st.id
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xl mx-auto">
                  {st.user?.full_name?.charAt(0) || 'D'}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st.user?.full_name}</h4>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">{st.specialization}</p>
                <p className="text-[11px] text-slate-400">Shift: {st.start_time} - {st.end_time}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedStaff}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1 shadow-md"
            >
              <span>Next: Pick Date & Slot</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick Date & Time Slot */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Step 4: Select Date & Time Slot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Slots calculated for total combined duration ({totalDuration} mins)</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300 block">{formatCurrency(subtotalPrice)}</span>
              <span className="text-[10px] text-slate-400">{selectedServiceIds.length} services selected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Staff Schedule: {selectedStaff?.working_days}
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Available Time Slots</label>

              {loadingSlots ? (
                <p className="text-xs text-slate-500 py-4">Calculating available continuous slots for {totalDuration} mins...</p>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs">
                  No open slots on {selectedDate} for this specialist for the required combined duration ({totalDuration} mins). Please select another date.
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
                          ? 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-500 bg-white dark:bg-slate-800'
                          : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 cursor-not-allowed line-through'
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Appointment Notes for Vet (Optional)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Pet has allergy, requested specific shampoo..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1"
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
                  <span>Confirm & Book ({formatCurrency(subtotalPrice)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation Page */}
      {step === 5 && createdAppointment && (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 transition-colors">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Appointment Scheduled!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your multi-service appointment booking is registered in the system.</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Pet:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.pet?.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Services:</span>
              <div className="text-right">
                {createdAppointment.appointment_services && createdAppointment.appointment_services.length > 0 ? (
                  createdAppointment.appointment_services.map((as) => (
                    <div key={as.id} className="font-bold text-slate-800 dark:text-slate-200">
                      {as.service?.name || 'Service'} ({formatCurrency(as.price_at_booking)})
                    </div>
                  ))
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.service?.name}</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specialist:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.staff?.user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">{createdAppointment.appointment_date} at {createdAppointment.start_time} - {createdAppointment.end_time}</span>
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
              className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl"
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
