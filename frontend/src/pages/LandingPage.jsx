import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, ShieldCheck, Heart, Stethoscope, Sparkles, CheckCircle2,
  Clock, ArrowRight, UserCheck, Star, Award, PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>COMMERCIAL SaaS PET HEALTHCARE PLATFORM</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Complete Pet Care, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Simplified.</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                End-to-end appointment scheduling, electronic medical records, smart veterinarian availability engines, vaccination reminders, and printable invoices for modern pet clinics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                {user ? (
                  <button
                    onClick={() => navigate(getDashboardPath(user.role))}
                    className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book an Appointment</span>
                    </Link>
                    <Link
                      to="/services"
                      className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Explore Services</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800 text-center lg:text-left">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-white">99.8%</h3>
                  <p className="text-xs text-slate-400">On-Time Appointments</p>
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-white">15,000+</h3>
                  <p className="text-xs text-slate-400">Pets Managed</p>
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-white">4.9/5 ★</h3>
                  <p className="text-xs text-slate-400">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Feature Hero Card */}
            <div className="relative">
              <div className="bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center font-bold text-lg">
                      🐾
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Golden Retriever: Max</h4>
                      <p className="text-xs text-slate-400">Microchip: #9851410001</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                    Active Patient
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">Next Vaccination</span>
                    <span className="text-teal-300 font-bold">Rabies Booster</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">Assigned Doctor</span>
                    <span className="text-white font-bold">Dr. Robert Smith</span>
                  </div>
                </div>

                <div className="p-4 bg-teal-900/30 border border-teal-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Upcoming Consultation</p>
                      <p className="text-[11px] text-teal-200">Tomorrow at 10:00 AM</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-400">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Comprehensive Care Services</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">Designed for Every Pet Need</h3>
          <p className="text-slate-600 text-sm">From routine wellness checkups to specialized surgery and aesthetic grooming.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-teal-500/50 transition-all hover:shadow-xl group">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 mb-2">Veterinary Consultations</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Comprehensive clinical diagnoses, internal medicine, surgery, and tailored prescription treatment plans.
            </p>
            <Link to="/services" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-teal-500/50 transition-all hover:shadow-xl group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 mb-2">Core Vaccinations</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Immunization programs for Rabies, DHPP, FeLV, and FVRCP with automated due-date reminder tracking.
            </p>
            <Link to="/services" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-teal-500/50 transition-all hover:shadow-xl group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 mb-2">Full Grooming & Spa</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Breed-specific styling, de-shedding baths, ear cleansing, and claw trimming by certified stylists.
            </p>
            <Link to="/services" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1">
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Seamless Booking Flow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">How It Works in 4 Easy Steps</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">1</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Register Pet Profile</h4>
              <p className="text-xs text-slate-500">Add pet species, breed, medical background, and emergency notes.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">2</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Select Service & Vet</h4>
              <p className="text-xs text-slate-500">Browse categories and choose your preferred veterinarian or stylist.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">3</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Pick Real-Time Slot</h4>
              <p className="text-xs text-slate-500">Our Smart Engine dynamically calculates non-conflicting time slots.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">4</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Confirm & Invoice</h4>
              <p className="text-xs text-slate-500">Complete mock online payment and download your official invoice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-10 lg:p-14 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <h3 className="text-2xl lg:text-3xl font-extrabold">Ready to Experience Modern Pet Care Management?</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Register now to manage your pet's complete medical history, book instant appointments, and receive automated vaccination reminders.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all shrink-0 text-sm"
          >
            Create Free Owner Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
