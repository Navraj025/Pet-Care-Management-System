import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, Dog, Stethoscope, User, CheckCircle2, ChevronRight,
  ChevronLeft, AlertCircle, CreditCard, Sparkles, Check, X, Search,
  MapPin, Star, Filter, ArrowUpDown, Eye, Building2, Phone, Mail,
  Award, Compass, ShieldCheck, Info, CheckCircle
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MockPaymentModal from '../../components/MockPaymentModal';
import PetAvatar from '../../components/PetAvatar';
import { formatCurrency } from '../../utils/formatters';

const BookAppointmentWizard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramBusinessId = queryParams.get('business_id');
  const paramServiceId = queryParams.get('service_id');
  const paramServiceIds = queryParams.get('service_ids');

  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  
  // Step 2: Unique Service Selection
  const [uniqueServices, setUniqueServices] = useState([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [loadingUniqueServices, setLoadingUniqueServices] = useState(false);

  // Step 3: Business/Clinic Comparison & Selection
  const [comparisonClinics, setComparisonClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [clinicSortBy, setClinicSortBy] = useState('recommended');
  const [clinicSearch, setClinicSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedClinicServices, setSelectedClinicServices] = useState([]);

  // Business Profile Modal
  const [profileModalBusiness, setProfileModalBusiness] = useState(null);
  const [profileModalData, setProfileModalData] = useState(null);
  const [loadingProfileModal, setLoadingProfileModal] = useState(false);

  // Step 4: Specialist & Date/Time
  const [clinicStaffList, setClinicStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 5: Submission & Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  // 1. Initial Load: Pets & Unique Services
  useEffect(() => {
    const initData = async () => {
      try {
        const petsRes = await API.get('/pets');
        setPets(petsRes.data);
        if (petsRes.data.length > 0) {
          setSelectedPet(petsRes.data[0]);
        }
      } catch (err) {
        console.error("Error loading pets:", err);
      }
    };
    initData();
  }, []);

  // Fetch unique service types
  useEffect(() => {
    const fetchUniqueServices = async () => {
      setLoadingUniqueServices(true);
      try {
        let url = '/services/unique';
        const params = [];
        if (selectedServiceCategory !== 'All') {
          params.push(`category=${encodeURIComponent(selectedServiceCategory)}`);
        }
        if (serviceSearch.trim()) {
          params.push(`search=${encodeURIComponent(serviceSearch.trim())}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        const res = await API.get(url);
        setUniqueServices(res.data);

        // If arriving via deep link with service_id / service_ids and business_id
        if (paramBusinessId && (paramServiceId || paramServiceIds)) {
          handleDeepLinkPreselection(paramBusinessId, paramServiceId || paramServiceIds, res.data);
        }
      } catch (err) {
        console.error("Error fetching unique services:", err);
      } finally {
        setLoadingUniqueServices(false);
      }
    };
    fetchUniqueServices();
  }, [selectedServiceCategory, serviceSearch]);

  // Handle Deep Link Preselection if user arrives from marketplace with business_id & service_id
  const handleDeepLinkPreselection = async (bizId, srvIdsStr, uniqueList) => {
    try {
      const bizRes = await API.get(`/public/businesses/${bizId}`);
      const biz = bizRes.data;
      const targetIds = srvIdsStr.split(',').map(n => parseInt(n.trim())).filter(Boolean);
      const matchedServices = (biz.services || []).filter(s => targetIds.includes(s.id));
      
      if (matchedServices.length > 0) {
        setSelectedClinic(biz);
        setSelectedClinicServices(matchedServices);
        
        // Find matching unique service type
        const firstMatch = matchedServices[0];
        const uniqueMatch = (uniqueList || []).find(u => u.name.toLowerCase() === firstMatch.name.toLowerCase());
        if (uniqueMatch) {
          setSelectedServiceType(uniqueMatch);
        } else {
          setSelectedServiceType({
            name: firstMatch.name,
            category: firstMatch.category,
            description: firstMatch.description,
            min_price: firstMatch.price,
            max_price: firstMatch.price,
            default_duration: firstMatch.duration_minutes,
            business_count: 1
          });
        }
      }
    } catch (err) {
      console.error("Deep link preselection failed:", err);
    }
  };

  // Step 3: Fetch Clinics offering the chosen service type
  useEffect(() => {
    if (selectedServiceType) {
      const fetchClinicsForService = async () => {
        setLoadingClinics(true);
        try {
          const params = new URLSearchParams({
            services: selectedServiceType.name,
            sort_by: clinicSortBy
          });
          const res = await API.get(`/public/compare-services?${params.toString()}`);
          setComparisonClinics(res.data);

          // If a clinic was already selected, keep it synced
          if (selectedClinic) {
            const updated = res.data.find(c => c.id === selectedClinic.id);
            if (updated) {
              setSelectedClinic(updated);
              setSelectedClinicServices(updated.offered_services || []);
            }
          }
        } catch (err) {
          console.error("Error comparing clinics:", err);
        } finally {
          setLoadingClinics(false);
        }
      };
      fetchClinicsForService();
    }
  }, [selectedServiceType, clinicSortBy]);

  // Step 4: Fetch staff for the chosen clinic
  useEffect(() => {
    if (selectedClinic) {
      const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
          const res = await API.get(`/staff?business_id=${selectedClinic.id}&available_only=true`);
          setClinicStaffList(res.data);
          if (res.data.length > 0) {
            setSelectedStaff(res.data[0]);
          } else {
            setSelectedStaff(null);
          }
        } catch (err) {
          console.error("Error fetching clinic staff:", err);
        } finally {
          setLoadingStaff(false);
        }
      };
      fetchStaff();
    }
  }, [selectedClinic]);

  // Step 4: Fetch Availability Engine slots
  useEffect(() => {
    if (selectedStaff && selectedClinicServices.length > 0 && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const srvIds = selectedClinicServices.map(s => s.id).join(',');
          const res = await API.get(
            `/availability/slots?staff_id=${selectedStaff.id}&service_ids=${srvIds}&target_date=${selectedDate}`
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
  }, [selectedStaff, selectedClinicServices, selectedDate]);

  // Open Business Profile Modal
  const handleOpenProfileModal = async (clinic) => {
    setProfileModalBusiness(clinic);
    setLoadingProfileModal(true);
    try {
      const res = await API.get(`/public/businesses/${clinic.id}`);
      setProfileModalData(res.data);
    } catch (err) {
      console.error("Failed to load business profile modal:", err);
    } finally {
      setLoadingProfileModal(false);
    }
  };

  const handleCloseProfileModal = () => {
    setProfileModalBusiness(null);
    setProfileModalData(null);
  };

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setSelectedClinicServices(clinic.offered_services || []);
    if (profileModalBusiness) {
      handleCloseProfileModal();
    }
    showSuccess(`Selected ${clinic.name}`);
    setStep(4);
  };

  // Submit Appointment
  const handleCreateAppointment = async () => {
    if (!selectedPet || !selectedClinic || selectedClinicServices.length === 0 || !selectedStaff || !selectedSlot) {
      showError("Please complete all booking selections.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        pet_id: selectedPet.id,
        service_ids: selectedClinicServices.map(s => s.id),
        staff_id: selectedStaff.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.time,
        notes,
        business_id: selectedClinic.id
      });
      setCreatedAppointment(res.data);
      showSuccess("Appointment booked successfully!");
      setStep(5);
    } catch (err) {
      console.error("Booking error:", err);
      showError(err.response?.data?.detail || "Booking failed. Slot may be unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  const clinicPrice = selectedClinicServices.reduce((acc, s) => acc + (s.price || 0), 0);
  const clinicDuration = selectedClinicServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  // Filter clinics by search term in Step 3
  const filteredClinics = comparisonClinics.filter((c) => {
    if (!clinicSearch.trim()) return true;
    const term = clinicSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  const categoriesList = ['All', 'Veterinary', 'Grooming', 'Vaccination', 'Dental', 'Pet Spa'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Wizard Step Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>Service-First Appointment Booking</span>
            </h2>
            <p className="text-xs text-slate-400">Step {step} of 5 — Select Pet & Service, Compare Clinics, and Schedule</p>
          </div>
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Service-First Engine</span>
          </span>
        </div>

        {/* Progress Steps */}
        <div className="flex overflow-x-auto gap-2 pt-2 pb-1 scrollbar-none sm:grid sm:grid-cols-5">
          {[
            { num: 1, label: '1. Select Pet' },
            { num: 2, label: '2. Select Service' },
            { num: 3, label: '3. Choose Clinic' },
            { num: 4, label: '4. Date & Time' },
            { num: 5, label: '5. Confirmation' }
          ].map((item) => (
            <div
              key={item.num}
              onClick={() => {
                // Allow navigating back to completed steps
                if (item.num < step) setStep(item.num);
              }}
              className={`space-y-1 min-w-[100px] sm:min-w-0 shrink-0 ${
                item.num < step ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all ${
                  step >= item.num ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              ></div>
              <span
                className={`text-[11px] font-bold block text-center truncate ${
                  step >= item.num ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SELECT PET */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Step 1: Choose Your Pet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select which pet needs care or veterinary consultation</p>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-700">
              <Dog className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No registered pets found</p>
              <p>Please register your dog, cat, or other pet to book an appointment.</p>
              <button
                onClick={() => navigate('/customer/pets')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs"
              >
                Register Pet Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pets.map((pet) => {
                const isSelected = selectedPet?.id === pet.id;
                return (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <PetAvatar pet={pet} size="md" className="rounded-2xl shrink-0 shadow-xs" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">{pet.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                          {pet.species} • {pet.breed || 'Breed N/A'}
                        </p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider mt-0.5">
                          {pet.gender} {pet.age ? `• ${pet.age} yrs` : ''}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                if (!selectedPet) {
                  showError("Please select a pet to proceed.");
                  return;
                }
                setStep(2);
              }}
              disabled={!selectedPet}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <span>Next: Select Service</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT SERVICE (UNIQUE SERVICE CATALOG) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Step 2: Choose Service Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select the care service for {selectedPet?.name}. Each service type is shown once with standard price ranges across all certified clinics.
              </p>
            </div>
            {selectedServiceType && (
              <span className="text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-100 dark:bg-teal-900/60 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-700 w-fit">
                Selected: {selectedServiceType.name}
              </span>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search unique services (e.g. Dental Cleaning, Vaccination, Grooming)..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedServiceCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Unique Services Grid */}
          {loadingUniqueServices ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Loading verified service types...</p>
            </div>
          ) : uniqueServices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6">
              <Stethoscope className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No services match your search or filter</p>
              <button
                onClick={() => {
                  setServiceSearch('');
                  setSelectedServiceCategory('All');
                }}
                className="text-teal-600 underline font-bold mt-2"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueServices.map((srv) => {
                const isSelected = selectedServiceType?.name.toLowerCase() === srv.name.toLowerCase();
                return (
                  <div
                    key={srv.name}
                    onClick={() => setSelectedServiceType(srv)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                          {srv.category}
                        </span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{srv.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{srv.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Pricing</span>
                        <span className="font-extrabold text-teal-700 dark:text-teal-300">
                          {srv.min_price === srv.max_price
                            ? formatCurrency(srv.min_price)
                            : `Starts from ${formatCurrency(srv.min_price)}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>~{srv.default_duration}m</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Offered at {srv.business_count} certified {srv.business_count === 1 ? 'clinic' : 'clinics'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!selectedServiceType) {
                  showError("Please select a service type to compare clinics.");
                  return;
                }
                setStep(3);
              }}
              disabled={!selectedServiceType}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-2 shadow-md transition-all"
            >
              <span>Next: Compare & Choose Clinic</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: SELECT BUSINESS / CLINIC (SIDE-BY-SIDE COMPARISON) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                Step 3: Choose Clinic for {selectedServiceType?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare verified clinics offering this service side-by-side by clinic price, doctor rating, distance, and real-time slot availability.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-500">Service:</span>
              <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                {selectedServiceType?.name}
              </span>
            </div>
          </div>

          {/* Search and Sorting Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter by clinic name or city..."
                value={clinicSearch}
                onChange={(e) => setClinicSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="font-semibold">Sort by:</span>
              </span>
              <select
                value={clinicSortBy}
                onChange={(e) => setClinicSortBy(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="recommended">Recommended (Best Match)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="distance_asc">Nearest Distance</option>
                <option value="earliest_avail">Earliest Available</option>
                <option value="duration_asc">Shortest Duration</option>
              </select>
            </div>
          </div>

          {/* Clinics Comparison Cards */}
          {loadingClinics ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Analyzing clinics and fetching real availability slots...</p>
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6">
              <Building2 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No clinics found offering {selectedServiceType?.name}</p>
              <button
                onClick={() => setClinicSearch('')}
                className="text-teal-600 underline font-bold mt-2"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClinics.map((clinic) => {
                const isSelected = selectedClinic?.id === clinic.id;
                return (
                  <div
                    key={clinic.id}
                    className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/30'
                    }`}
                  >
                    {/* Clinic Info Left */}
                    <div className="flex items-start space-x-4 min-w-0 flex-1">
                      <img
                        src={clinic.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80'}
                        alt={clinic.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0 shadow-xs"
                      />
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {clinic.business_type}
                          </span>
                          {/* Badges */}
                          {clinic.is_best_overall && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-teal-600" />
                              <span>Best Match</span>
                            </span>
                          )}
                          {clinic.is_best_price && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              Lowest Price
                            </span>
                          )}
                          {clinic.is_best_rated && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Top Rated
                            </span>
                          )}
                          {clinic.is_nearest && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              Nearest
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">{clinic.name}</h4>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{clinic.rating}</span>
                            <span className="text-slate-400 font-normal">({clinic.review_count})</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{clinic.city || 'City N/A'} ({clinic.distance_km} km)</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1 text-teal-600 dark:text-teal-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{clinic.next_available_slot || 'Check availability'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price, Duration & Action Buttons Right */}
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 gap-3 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Clinic Price</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(clinic.total_price)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ⏱ {clinic.duration_minutes} mins
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProfileModal(clinic)}
                          className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center space-x-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectClinic(clinic)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>Select Clinic</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!selectedClinic) {
                  showError("Please select a clinic to proceed.");
                  return;
                }
                setStep(4);
              }}
              disabled={!selectedClinic}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-2 shadow-md transition-all"
            >
              <span>Next: Pick Date & Time</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BUSINESS PROFILE MODAL */}
      {/* ========================================================================= */}
      {profileModalBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header Cover */}
            <div className="relative h-40 w-full bg-slate-900 shrink-0">
              <img
                src={profileModalData?.cover_image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80'}
                alt={profileModalBusiness.name}
                className="w-full h-full object-cover opacity-85"
              />
              <button
                onClick={handleCloseProfileModal}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-6 flex items-end space-x-3.5">
                <img
                  src={profileModalData?.logo_url || profileModalBusiness.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&auto=format&fit=crop&q=80'}
                  alt={profileModalBusiness.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 bg-white shadow-lg"
                />
                <div className="text-white drop-shadow-md">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                    {profileModalData?.business_type || profileModalBusiness.business_type}
                  </span>
                  <h3 className="text-lg font-extrabold">{profileModalData?.name || profileModalBusiness.name}</h3>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
              {loadingProfileModal ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Loading clinic profile & facilities...</p>
                </div>
              ) : (
                <>
                  {/* Rating & Contact Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Rating</span>
                      <span className="font-extrabold text-amber-500 flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{profileModalData?.rating}</span>
                        <span className="text-slate-400 font-normal">({profileModalData?.review_count})</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Location</span>
                      <span className="font-bold truncate block">{profileModalData?.city}, {profileModalData?.pincode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Working Hours</span>
                      <span className="font-bold">{profileModalData?.opening_time} - {profileModalData?.closing_time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Working Days</span>
                      <span className="font-bold truncate block">{profileModalData?.working_days}</span>
                    </div>
                  </div>

                  {/* Facilities & Amenities */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Facilities & Amenities</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(profileModalData?.facilities || [
                        "Air Conditioned Waiting Lounge",
                        "Certified Specialists",
                        "Free Dedicated Parking",
                        "Contactless Digital Payments",
                        "Clean & Sanitized Environment",
                        "Emergency First Aid Support"
                      ]).map((fac, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-200 shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          <span>{fac}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* About Description */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">About Clinic</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {profileModalData?.description || "A premier pet care facility dedicated to delivering exceptional medical and wellness services for companion animals."}
                    </p>
                  </div>

                  {/* Clinic Services & Pricing Table */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Services & Pricing</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {profileModalData?.services?.map((srv) => {
                        const isTargetService = selectedServiceType?.name.toLowerCase() === srv.name.toLowerCase();
                        return (
                          <div
                            key={srv.id}
                            className={`p-2.5 rounded-xl text-xs flex justify-between items-center ${
                              isTargetService
                                ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 font-bold text-teal-900 dark:text-teal-200'
                                : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isTargetService && <span className="text-teal-600 font-extrabold">★</span>}
                              <span>{srv.name}</span>
                              <span className="text-[10px] text-slate-400">({srv.duration_minutes}m)</span>
                            </div>
                            <span className="font-extrabold">{formatCurrency(srv.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Staff Members */}
                  {profileModalData?.staff && profileModalData.staff.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Clinic Specialists</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {profileModalData.staff.map((st) => (
                          <div
                            key={st.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center space-x-2.5"
                          >
                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {st.name?.charAt(0) || 'D'}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">{st.name}</h5>
                              <p className="text-[10px] text-teal-600 dark:text-teal-400 truncate">{st.specialization}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Customer Reviews */}
                  {profileModalData?.reviews && profileModalData.reviews.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Recent Customer Reviews</h4>
                      <div className="space-y-2">
                        {profileModalData.reviews.slice(0, 3).map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{rev.customer_name}</span>
                              <span className="flex items-center space-x-0.5 text-amber-500 font-bold text-[11px]">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{rev.rating}</span>
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Selected Service Fee</span>
                <span className="text-base font-extrabold text-teal-700 dark:text-teal-300">
                  {formatCurrency(profileModalBusiness.total_price)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCloseProfileModal}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectClinic(profileModalBusiness)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Choose This Clinic</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: DATE & TIME (WITH SELECTED CLINIC & SPECIALIST) */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          {/* Top Summary Banner: Selected Clinic & Service */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <img
                src={selectedClinic?.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&auto=format&fit=crop&q=80'}
                alt={selectedClinic?.name}
                className="w-12 h-12 rounded-xl object-cover border border-teal-300 dark:border-teal-700 bg-white shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-200 uppercase tracking-wider bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded">
                    Selected Clinic
                  </span>
                  <span className="text-xs text-slate-500">• {selectedClinic?.city}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">{selectedClinic?.name}</h4>
                <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">
                  Service: {selectedServiceType?.name} ({formatCurrency(clinicPrice)} • {clinicDuration} mins)
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setStep(3)}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 underline self-start sm:self-center"
            >
              Change Clinic
            </button>
          </div>

          {/* Specialist Picker Scoped to Selected Clinic */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>Choose Specialist / Veterinarian at {selectedClinic?.name}</span>
              </h4>
              <span className="text-xs text-slate-400">{clinicStaffList.length} Available Specialists</span>
            </div>

            {loadingStaff ? (
              <p className="text-xs text-slate-400 py-3">Loading clinic specialists...</p>
            ) : clinicStaffList.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                No specialists are currently scheduled for online appointments at this clinic. Please contact the clinic directly.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clinicStaffList.map((st) => {
                  const isSelected = selectedStaff?.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStaff(st)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center space-x-3 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {st.user?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{st.user?.full_name}</h5>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate">{st.specialization}</p>
                        <p className="text-[10px] text-slate-400">Shift: {st.start_time} - {st.end_time}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-teal-600 stroke-[3] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date Picker & Time Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Clinic Working Days: {selectedClinic?.working_days || 'Mon-Sat'}
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Available Continuous Time Slots ({clinicDuration} mins)
                </label>
                {selectedSlot && (
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                    Selected: {selectedSlot.time}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <p className="text-xs text-slate-500 py-4">Calculating available continuous slots via Availability Engine...</p>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs">
                  No open slots found on {selectedDate} for this specialist. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Appointment Notes for Clinic / Doctor (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Pet has allergy, requested specific shampoo, recent cough symptoms..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!selectedStaff) {
                  showError("Please select a specialist.");
                  return;
                }
                if (!selectedSlot) {
                  showError("Please pick an available time slot.");
                  return;
                }
                setStep(5);
              }}
              disabled={!selectedStaff || !selectedSlot}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-2 shadow-md transition-all"
            >
              <span>Next: Review & Confirm</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: REVIEW & CONFIRM BOOKING / SUCCESS STATE */}
      {/* ========================================================================= */}
      {step === 5 && !createdAppointment && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Step 5: Review & Confirm Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please double check all booking details before final confirmation.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinic / Hospital</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{selectedClinic?.name}</span>
                <p className="text-slate-500">{selectedClinic?.address}, {selectedClinic?.city}</p>
                <p className="text-slate-500">{selectedClinic?.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient / Pet</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{selectedPet?.name}</span>
                <p className="text-slate-500">{selectedPet?.species} • {selectedPet?.breed} ({selectedPet?.gender})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Service & Specialist</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{selectedServiceType?.name}</span>
                <p className="text-teal-700 dark:text-teal-400 font-semibold">Specialist: {selectedStaff?.user?.full_name} ({selectedStaff?.specialization})</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Date & Time</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                  {selectedDate} at {selectedSlot?.time}
                </span>
                <p className="text-slate-500">Duration: {clinicDuration} mins</p>
              </div>
            </div>

            {notes && (
              <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Appointment Notes</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{notes}</p>
              </div>
            )}

            {/* Total Payment Amount */}
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Total Payable Amount</span>
              <span className="font-extrabold text-2xl text-teal-600 dark:text-teal-400">{formatCurrency(clinicPrice)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCreateAppointment}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl flex items-center space-x-2 shadow-lg transition-all"
            >
              {submitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Book Appointment ({formatCurrency(clinicPrice)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: SUCCESS STATE */}
      {/* ========================================================================= */}
      {step === 5 && createdAppointment && (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 transition-colors">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Appointment Scheduled!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your appointment at {selectedClinic?.name} has been successfully registered.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Booking Reference:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">#{createdAppointment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clinic:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedClinic?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pet:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.pet?.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Service:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                {selectedServiceType?.name} ({formatCurrency(clinicPrice)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specialist:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{createdAppointment.staff?.user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">
                {createdAppointment.appointment_date} at {createdAppointment.start_time} - {createdAppointment.end_time}
              </span>
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
              View My Appointments
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
