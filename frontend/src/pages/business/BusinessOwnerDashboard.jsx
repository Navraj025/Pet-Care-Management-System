import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, IndianRupee, Stethoscope, Star, Users, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, Building2, TrendingUp, Dog
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/business-owner/dashboard-stats');
      setData(res.data);
    } catch (err) {
      console.error("Error fetching business dashboard stats:", err);
      showToast("Failed to load business stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Business Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { business, stats, recent_appointments } = data;

  return (
    <div className="space-y-8">
      {/* Business Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              {business.business_type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              business.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              Status: {business.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {business.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Manage your service listings, staff schedules, customer bookings, and revenue analytics for your pet business.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/businesses/${business.slug}`}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all"
          >
            View Public Marketplace Profile
          </Link>
          <Link
            to="/business-owner/services"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            Manage Services
          </Link>
        </div>
      </div>

      {/* Warning Banner if pending admin approval */}
      {business.status === 'PENDING' && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Business Registration Pending Admin Approval</p>
            <p className="font-normal mt-0.5">Your business application is currently under review by Platform Admin. Once approved, your business and services will immediately become visible to customers on the public marketplace.</p>
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.total_appointments}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="text-amber-500 font-semibold">{stats.pending_appointments} Pending</span>
            <span>•</span>
            <span className="text-emerald-500 font-semibold">{stats.confirmed_appointments} Confirmed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue (INR)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            ₹{stats.total_revenue_inr.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500">Real-time payment earnings</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Services</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.services_count}</p>
          <p className="text-xs text-slate-500">{stats.staff_count} Staff members assigned</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customer Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">⭐ {stats.avg_rating}</p>
          <p className="text-xs text-slate-500">Based on {stats.review_count} verified reviews</p>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Recent Customer Bookings</h3>
          <Link
            to="/business-owner/appointments"
            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center space-x-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_appointments.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No recent bookings recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Pet</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent_appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{appt.customer_name}</td>
                    <td className="py-3 font-medium text-slate-600 dark:text-slate-300">{appt.pet_name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{appt.service_name}</td>
                    <td className="py-3 text-slate-500">{appt.date} at {appt.time}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase ${
                        appt.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                        appt.status === 'CONFIRMED' ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;
