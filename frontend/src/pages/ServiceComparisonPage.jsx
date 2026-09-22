import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Tag, Clock, ArrowUpDown, Filter, Sparkles,
  CheckCircle2, XCircle, ChevronRight, Award, Compass, ShieldCheck, Check
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const ServiceComparisonPage = () => {
  const [selectedServices, setSelectedServices] = useState(['Grooming']);
  const [cityInput, setCityInput] = useState('Mumbai');
  const [pincodeInput, setPincodeInput] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [businessType, setBusinessType] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState('');

  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const availableServiceOptions = [
    { id: 'Grooming', label: 'Grooming', icon: '✂️' },
    { id: 'Bath & De-Shedding', label: 'Bath & De-Shedding', icon: '🛁' },
    { id: 'Dental Cleaning', label: 'Dental Cleaning', icon: '🦷' },
    { id: 'Vaccination', label: 'Vaccination', icon: '💉' },
    { id: 'Nail Trimming', label: 'Nail Trimming', icon: '🐾' },
    { id: 'Veterinary Consultation', label: 'Veterinary Consultation', icon: '🩺' },
    { id: 'Pet Spa', label: 'Pet Spa & Therapy', icon: '✨' },
    { id: 'General Health Checkup', label: 'Health Checkup', icon: '📋' },
  ];

  useEffect(() => {
    fetchComparisonData();
  }, [selectedServices, sortBy, businessType, minRating]);

  const fetchComparisonData = async () => {
    if (selectedServices.length === 0) {
      setComparisonResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        sort_by: sortBy,
      };

      if (cityInput.trim()) params.city = cityInput.trim();
      if (pincodeInput.trim()) params.pincode = pincodeInput.trim();
      if (businessType !== 'All') params.business_type = businessType;
      if (minRating > 0) params.min_rating = minRating;
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      // Add each service to query params
      const queryString = selectedServices.map(s => `services=${encodeURIComponent(s)}`).join('&');
      const paramString = new URLSearchParams(params).toString();
      const fullUrl = `/public/compare-services?${queryString}&${paramString}`;

      const res = await API.get(fullUrl);
      setComparisonResults(res.data);
    } catch (err) {
      console.error("Comparison fetch error:", err);
      showToast("Failed to fetch price comparison.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceSelection = (serviceName) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        if (prev.length === 1) {
          showToast("Select at least one service to compare.", "warning");
          return prev;
        }
        return prev.filter(s => s !== serviceName);
      } else {
        return [...prev, serviceName];
      }
    });
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsLoading(false);
        showToast("Location updated using GPS!", "success");
        fetchComparisonData();
      },
      (error) => {
        setGpsLoading(false);
        showToast("Could not fetch GPS location. Please enter city manually.", "error");
      }
    );
  };

  const handleBookNow = (card) => {
    if (!card.is_fully_available) {
      showToast("This business does not offer all selected services.", "warning");
      return;
    }
    const serviceIds = card.offered_services.map(s => s.id).join(',');
    navigate(`/customer/book-appointment?business_id=${card.id}&service_ids=${serviceIds}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Tag className="w-4 h-4 text-teal-400" />
            <span>Service-First Price & Availability Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Compare <span className="text-teal-400">Pet Care Prices & Slots</span> Side-by-Side
          </h1>
          <p className="max-w-2xl mx-auto text-sm text-slate-300">
            Select the exact services your pet needs. Compare verified businesses in your area by price in INR ₹, customer ratings, distance, and next available booking slot.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* STEP 1: Select Required Services */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base sm:text-lg flex items-center space-x-2">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>What service(s) does your pet need?</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {selectedServices.length} Selected
            </span>
          </div>

          {/* Service Selector Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {availableServiceOptions.map((srv) => {
              const isSelected = selectedServices.includes(srv.id);
              return (
                <button
                  key={srv.id}
                  onClick={() => toggleServiceSelection(srv.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-slate-800/80 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-sm ring-2 ring-teal-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl shrink-0">{srv.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs truncate block">{srv.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Location & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Input */}
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="City (e.g. Mumbai, Pune)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onBlur={fetchComparisonData}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Pincode Input */}
            <div>
              <input
                type="text"
                placeholder="Pincode (optional)"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                onBlur={fetchComparisonData}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* GPS Location Button */}
            <button
              onClick={handleGPSLocation}
              disabled={gpsLoading}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all border border-slate-200 dark:border-slate-700"
            >
              <Compass className={`w-4 h-4 text-teal-500 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{userLocation ? 'GPS Location Set' : 'Use Current Location'}</span>
            </button>

            {/* Sort Control */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="recommended">Sort by: Recommended</option>
                <option value="price_asc">Sort by: Lowest Price (INR)</option>
                <option value="price_desc">Sort by: Highest Price (INR)</option>
                <option value="rating_desc">Sort by: Highest Rating</option>
                <option value="distance_asc">Sort by: Nearest Distance</option>
                <option value="earliest_avail">Sort by: Earliest Available</option>
                <option value="duration_asc">Sort by: Shortest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* STEP 3: Comparison Cards Display */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Comparing prices across verified businesses...</p>
          </div>
        ) : comparisonResults.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <Search className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold">No Businesses Offer All Selected Services</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try deselecting one of the services or broadening your city search to find matching providers.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>Showing <strong>{comparisonResults.length}</strong> businesses offering comparison for <strong>{selectedServices.join(', ')}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonResults.map((card) => (
                <div
                  key={card.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm relative ${
                    card.is_best_overall
                      ? 'border-2 border-teal-500 shadow-teal-500/10 ring-2 ring-teal-500/20'
                      : card.is_fully_available
                      ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      : 'border-rose-200 dark:border-rose-900/40 bg-slate-50/50 opacity-90'
                  }`}
                >
                  {/* Top Badges Bar */}
                  <div className="p-4 pb-0 flex flex-wrap gap-1.5 z-10">
                    {card.is_best_overall && (
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Best Overall</span>
                      </span>
                    )}

                    {card.is_best_price && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Tag className="w-3 h-3" />
                        <span>Best Price</span>
                      </span>
                    )}

                    {card.is_best_rated && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Best Rated</span>
                      </span>
                    )}

                    {card.is_nearest && (
                      <span className="px-2.5 py-1 rounded-full bg-sky-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <MapPin className="w-3 h-3" />
                        <span>Nearest</span>
                      </span>
                    )}

                    {card.is_earliest_available && (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Clock className="w-3 h-3" />
                        <span>Earliest Available</span>
                      </span>
                    )}
                  </div>

                  {/* Card Main Header */}
                  <div className="p-5 pt-3 space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={card.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80'}
                        alt={card.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-white"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                          {card.business_type}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {card.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{card.rating}</span>
                            <span className="text-slate-400 font-normal">({card.review_count})</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{card.distance_km} km</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Available Slot Badge */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Next Slot:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{card.next_available_slot}</span>
                      </span>
                    </div>

                    {/* Breakdown of Selected Services & INR Prices */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Service Price Breakdown:
                      </span>
                      {card.offered_services.map((srv) => (
                        <div key={srv.id} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 dark:text-slate-300 truncate pr-2">✓ {srv.name}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0">₹{srv.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}

                      {card.missing_services.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-rose-500">
                          <span className="truncate pr-2">✗ {m}</span>
                          <span className="font-bold shrink-0">Not offered</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Price & Action */}
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Price</span>
                      {card.is_fully_available ? (
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                            {card.formatted_total_price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                          Not available
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookNow(card)}
                      disabled={!card.is_fully_available}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 ${
                        card.is_fully_available
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                          : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>{card.is_fully_available ? 'Book Now' : 'Incomplete'}</span>
                      {card.is_fully_available && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceComparisonPage;
