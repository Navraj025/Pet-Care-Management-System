import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Dog, Calendar, DollarSign, CreditCard, ShieldAlert, TrendingUp,
  BarChart2, ArrowUpRight, CheckCircle2, Clock, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get('/reports/summary');
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load admin report summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading admin dashboard analytics...</div>;
  }

  const kpis = summary?.kpis || {};
  const revTrends = summary?.revenue_trends || [];
  const statusDist = summary?.appointment_statuses || [];
  const popularServices = summary?.popular_services || [];

  const COLORS = ['#0d9488', '#0284c7', '#eab308', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR SaaS CONTROL PANEL</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">System Operations Dashboard</h2>
          <p className="text-xs text-slate-300">Live monitoring of revenue metrics, appointments, and client analytics.</p>
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Customers</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{kpis.total_customers}</h3>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Registered Pets</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{kpis.total_pets}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Today's Appointments</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{kpis.today_appointments}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Monthly Revenue</p>
            <h3 className="text-3xl font-black text-teal-700 mt-1">${kpis.monthly_revenue?.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Revenue Analytics</h3>
              <p className="text-xs text-slate-400">Daily gross revenue over recent period</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
              <span>Detailed Report</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revTrends}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Status Distribution</h3>
          <p className="text-xs text-slate-400">Breakdown by appointment status</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2">
            {statusDist.map((item, idx) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-600 font-medium">{item.status}</span>
                </span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-slate-900">Popular Services Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Bookings Count</th>
                <th className="p-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularServices.map((srv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">{srv.service_name}</td>
                  <td className="p-3 text-slate-500">{srv.category}</td>
                  <td className="p-3 font-bold text-teal-700">{srv.bookings_count} bookings</td>
                  <td className="p-3 text-right font-extrabold text-slate-900">${srv.total_revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
