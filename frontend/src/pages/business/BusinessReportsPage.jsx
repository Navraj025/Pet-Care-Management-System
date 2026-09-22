import React, { useState, useEffect } from 'react';
import { BarChart3, IndianRupee, Calendar, TrendingUp, Users, Award } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/business-owner/dashboard-stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching report stats:", err);
      showToast("Failed to load reports.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Business Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Business Reports & Revenue Analytics</h1>
        <p className="text-xs text-slate-500">Business performance metrics, revenue growth, and booking distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">₹{stats?.total_revenue_inr.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs text-slate-500">Accrued across all completed appointments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Appointments</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.total_appointments}</span>
          </div>
          <p className="text-xs text-slate-500">{stats?.confirmed_appointments} Confirmed / Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Satisfaction Score</span>
            <span className="text-3xl font-extrabold text-amber-500">⭐ {stats?.avg_rating}</span>
          </div>
          <p className="text-xs text-slate-500">Derived from {stats?.review_count} customer reviews</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
        <TrendingUp className="w-12 h-12 text-teal-500 mx-auto" />
        <h3 className="text-lg font-bold">Analytics Engine Active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your business metrics are tracked live. All bookings, service utilization, and financial metrics update in real-time.
        </p>
      </div>
    </div>
  );
};

export default BusinessReportsPage;
