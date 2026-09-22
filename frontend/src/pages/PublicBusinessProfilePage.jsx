import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, Star, Calendar, CheckCircle2,
  Stethoscope, UserCheck, MessageSquare, ArrowLeft, ShieldCheck, PlusCircle
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const PublicBusinessProfilePage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessDetail();
  }, [slug]);

  const fetchBusinessDetail = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/public/businesses/${slug}`);
      setBusiness(res.data);
    } catch (err) {
      console.error("Error fetching business details:", err);
      showToast("Business profile not found.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (serviceId) => {
    navigate(`/customer/book-appointment?business_id=${business.id}&service_id=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Business Profile...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">Business Not Found</h2>
        <p className="text-slate-500 max-w-md">The requested business profile is unavailable or inactive on the marketplace.</p>
        <Link to="/businesses" className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        <img
          src={business.cover_image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&auto=format&fit=crop&q=80'}
          alt={business.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/businesses"
            className="bg-slate-900/80 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-xl backdrop-blur-md border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Hero Business Header overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end space-x-4">
            <img
              src={business.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80'}
              alt={business.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 bg-white shadow-xl shrink-0"
            />
            <div className="space-y-1 text-white">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
                  {business.business_type}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Business</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {business.name}
              </h1>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <span className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{business.rating}</span>
                  <span className="text-slate-300 font-normal">({business.review_count} reviews)</span>
                </span>
                <span>•</span>
                <span>{business.city}, {business.pincode}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleBookService(business.services[0]?.id)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2 text-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Services & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Description */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-lg">About {business.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {business.description}
            </p>
          </div>

          {/* Available Services List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-lg">Services & INR Pricing</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{business.services.length} Offered</span>
            </div>

            <div className="space-y-4">
              {business.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase">
                        {srv.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{srv.duration_minutes} mins</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{srv.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{srv.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="font-extrabold text-xl text-teal-600 dark:text-teal-400">
                        ₹{srv.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Inc. taxes</span>
                    </div>
                    <button
                      onClick={() => handleBookService(srv.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1"
                    >
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg">Verified Customer Reviews</h3>
            </div>

            {business.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No reviews yet for this business.</p>
            ) : (
              <div className="space-y-4">
                {business.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-200">{rev.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{rev.created_at}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Business Info Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Business Information
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 block">Address</span>
                  <span className="text-slate-700 dark:text-slate-200">{business.address}, {business.city}, {business.state} - {business.pincode}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 block">Operating Hours</span>
                  <span className="text-slate-700 dark:text-slate-200">{business.opening_time} - {business.closing_time}</span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 block mt-0.5">Days: {business.working_days}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 block">Phone</span>
                  <span className="text-slate-700 dark:text-slate-200">{business.phone || 'Not specified'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 block">Email</span>
                  <span className="text-slate-700 dark:text-slate-200">{business.email || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Staff Card */}
          {business.staff && business.staff.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserCheck className="w-4 h-4 text-teal-500" />
                <h3 className="font-bold text-base">Practitioners & Specialists</h3>
              </div>

              <div className="space-y-3">
                {business.staff.map((st) => (
                  <div key={st.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{st.name}</p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{st.specialization}</p>
                    {st.bio && <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{st.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBusinessProfilePage;
