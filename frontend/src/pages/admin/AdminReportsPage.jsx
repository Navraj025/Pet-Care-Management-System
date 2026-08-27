import React, { useState, useEffect } from 'react';
import { BarChart3, Printer, Calendar, TrendingUp, IndianRupee } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import API from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const AdminReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get('/reports/summary');
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load reports summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Generating reports dataset...</div>;
  }

  const kpis = summary?.kpis || {};
  const revTrends = summary?.revenue_trends || [];
  const statusDist = summary?.appointment_statuses || [];
  const popularServices = summary?.popular_services || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Executive Reports & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Revenue performance in INR (₹), service demand, and appointment cancellation metrics</p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Monthly Revenue</p>
          <h3 className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400 mt-1">{formatCurrency(kpis.monthly_revenue)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-xs text-slate-400 font-semibold uppercase">Today's Revenue</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(kpis.today_revenue)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-xs text-slate-400 font-semibold uppercase">Pending Receivable</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(kpis.pending_payments)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-xs text-slate-400 font-semibold uppercase">Cancellation Rate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{kpis.cancelled_appointments} Cancelled</h3>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Revenue Trend Analysis (INR ₹)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revTrends}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip formatter={(val) => [formatCurrency(val), 'Revenue']} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Performance Matrix */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Service Performance & Revenue Contribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Service Category</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Bookings</th>
                <th className="p-4 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {popularServices.map((srv, idx) => (
                <tr key={idx}>
                  <td className="p-4 font-bold text-teal-700 dark:text-teal-400">{srv.category}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{srv.service_name}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{srv.bookings_count}</td>
                  <td className="p-4 text-right font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(srv.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
