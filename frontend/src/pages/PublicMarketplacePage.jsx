import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Building2, Clock, Stethoscope, ChevronRight,
  Filter, CheckCircle2, ShieldAlert, Sparkles, ArrowUpDown
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const PublicMarketplacePage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const businessTypes = ["All", "Pet Care Center", "Veterinary Clinic", "Grooming Center", "Pet Shop", "Other"];

  useEffect(() => {
    fetchBusinesses();
  }, [selectedType, minRating]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'All') params.business_type = selectedType;
      if (minRating > 0) params.min_rating = minRating;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCity.trim()) params.city = selectedCity.trim();

      const res = await API.get('/public/businesses', { params });
      setBusinesses(res.data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      showToast("Failed to load marketplace businesses.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBusinesses();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Marketplace Header */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Pet Care Provider Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Discover & Compare Top Verified <span className="text-teal-400">Pet Businesses</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Find approved veterinary clinics, pet styling spas, grooming hubs, and pet shops near you. Compare services, INR prices, real ratings, and book appointments instantly.
          </p>

          {/* Quick Action Navigation Bar */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/compare-services')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-lg shadow-teal-500/30 transition-all flex items-center space-x-2 text-sm"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Compare Prices by Service</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Filter Control Panel */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* City Filter Input */}
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="City (e.g. Mumbai, Pune)"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Business Type Select */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {businessTypes.map((type) => (
                  <option key={type} value={type}>{type === 'All' ? 'All Business Types' : type}</option>
                ))}
              </select>
            </div>

            {/* Submit Filter Button */}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>

          {/* Rating Pills */}
          <div className="flex items-center space-x-2 text-xs overflow-x-auto pt-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Rating:</span>
            {[0, 4.0, 4.5, 4.8].map((rating) => (
              <button
                type="button"
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                  minRating === rating
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {rating === 0 ? 'All Ratings' : `⭐ ${rating}+ Stars`}
              </button>
            ))}
          </div>
        </form>

        {/* Business Grid Listing */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading marketplace businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold">No Businesses Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any approved businesses matching your search criteria. Try adjusting your city or filtering parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Cover Image Header */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={b.cover_image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&auto=format&fit=crop&q=80'}
                    alt={b.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* Logo Avatar Badge */}
                  <div className="absolute left-4 bottom-3 flex items-center space-x-3">
                    <img
                      src={b.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80'}
                      alt={b.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-900 shadow-md bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider inline-block">
                        {b.business_type}
                      </span>
                      <span className="flex items-center space-x-1 text-xs text-amber-300 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{b.rating}</span>
                        <span className="text-slate-300 font-normal">({b.review_count})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {b.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="truncate">{b.address ? `${b.address}, ` : ''}{b.city} - {b.pincode}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Hours: {b.opening_time} - {b.closing_time} ({b.working_days})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{b.service_count} Active Services Available</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link
                      to={`/businesses/${b.slug}`}
                      className="w-full bg-slate-900 hover:bg-teal-600 text-white dark:bg-slate-800 dark:hover:bg-teal-600 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 text-xs"
                    >
                      <span>View Business & Book</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicMarketplacePage;
