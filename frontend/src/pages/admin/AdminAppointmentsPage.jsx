import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get('/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(
    (a) => statusFilter === 'ALL' || a.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Master Appointments Directory</h2>
        <p className="text-xs text-slate-500">Monitor all scheduled appointments, statuses, and assigned doctors</p>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading appointments...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pet</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-mono font-bold text-slate-400">#{a.id}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {a.appointment_date} <br />
                      <span className="text-[11px] font-normal text-teal-700">{a.start_time} - {a.end_time}</span>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{a.customer?.user?.full_name}</td>
                    <td className="p-4 text-slate-800 font-semibold">{a.pet?.name}</td>
                    <td className="p-4 font-semibold text-teal-800">{a.service?.name}</td>
                    <td className="p-4 text-slate-600">{a.staff?.user?.full_name}</td>
                    <td className="p-4"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
