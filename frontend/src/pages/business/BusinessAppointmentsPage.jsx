import React, { useState, useEffect } from 'react';
import { Calendar, Filter, CheckCircle2, Clock, XCircle, User, Dog, Stethoscope } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status_filter = statusFilter;
      const res = await API.get('/business-owner/appointments', { params });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching business appointments:", err);
      showToast("Failed to load appointments.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await API.put(`/business-owner/appointments/${appointmentId}/status`, null, {
        params: { status_val: newStatus }
      });
      showToast(`Appointment status updated to ${newStatus}`, "success");
      fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      showToast("Failed to update status.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Business Appointments</h1>
          <p className="text-xs text-slate-500">Manage bookings submitted to your business</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Appointments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no bookings recorded for your business matching this status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                    appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                    appt.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' :
                    appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {appt.status}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    📅 {appt.date} at {appt.start_time} - {appt.end_time}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Customer</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{appt.customer_name}</span>
                    {appt.customer_phone && <span className="text-slate-500 block text-[11px]">{appt.customer_phone}</span>}
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pet Patient</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{appt.pet_name}</span>
                    {appt.pet_breed && <span className="text-slate-500 block text-[11px]">{appt.pet_breed}</span>}
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Services & Staff</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {appt.services.map(s => s.name).join(', ') || 'Service'}
                    </span>
                    <span className="text-teal-600 dark:text-teal-400 block text-[11px]">Staff: {appt.staff_name}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total INR</span>
                  <span className="font-extrabold text-lg text-teal-600 dark:text-teal-400">
                    ₹{appt.total_amount_inr?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {appt.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Confirm
                    </button>
                  )}

                  {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Complete
                    </button>
                  )}

                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                      className="bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessAppointmentsPage;
