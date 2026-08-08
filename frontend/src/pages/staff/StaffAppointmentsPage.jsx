import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Dog, CheckCircle, Edit, Search } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

const StaffAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load staff appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setUpdating(true);
    try {
      await API.put(`/appointments/${selectedAppt.id}/status`, {
        status: newStatus,
        cancellation_reason: newStatus === 'CANCELLED' ? cancellationReason : null
      });
      showSuccess(`Appointment #${selectedAppt.id} status updated to ${newStatus}`);
      setSelectedAppt(null);
      fetchAppointments();
    } catch (err) {
      console.error("Status update error:", err);
      showError(err.response?.data?.detail || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Assigned Appointments</h2>
        <p className="text-xs text-slate-500">Manage patient appointments, check-ins, and consultation progress</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading assigned appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Assigned Appointments</h3>
          <p className="text-xs text-slate-500">You currently have no patient appointments assigned.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Patient / Species</th>
                  <th className="p-4">Owner Contact</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      {appt.appointment_date} <br />
                      <span className="text-[11px] text-teal-700 font-normal">{appt.start_time} - {appt.end_time}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {appt.pet?.name} <span className="text-[11px] font-normal text-slate-500">({appt.pet?.species})</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {appt.customer?.user?.full_name} <br />
                      <span className="text-[11px] text-slate-400">{appt.customer?.user?.phone}</span>
                    </td>
                    <td className="p-4 font-semibold text-teal-800">{appt.service?.name}</td>
                    <td className="p-4"><StatusBadge status={appt.status} /></td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAppt(appt);
                          setNewStatus(appt.status);
                        }}
                        className="px-3 py-1.5 font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Change Status</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Update Appointment Status</h3>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800">{selectedAppt.pet?.name}</strong> • Service: {selectedAppt.service?.name}
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CHECKED_IN">CHECKED_IN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="NO_SHOW">NO_SHOW</option>
                </select>
              </div>

              {newStatus === 'CANCELLED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason</label>
                  <input
                    type="text"
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Patient absent / rescheduled..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  {updating ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointmentsPage;
