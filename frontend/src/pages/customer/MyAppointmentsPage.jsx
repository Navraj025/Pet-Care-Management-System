import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Dog, XCircle, CreditCard, PlusCircle } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import MockPaymentModal from '../../components/MockPaymentModal';

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApptForPay, setSelectedApptForPay] = useState(null);
  const { showSuccess, showError } = useToast();

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    const reason = window.prompt("Reason for cancellation:");
    if (reason === null) return;

    try {
      await API.put(`/appointments/${apptId}/status`, {
        status: 'CANCELLED',
        cancellation_reason: reason || 'Cancelled by customer'
      });
      showSuccess("Appointment cancelled successfully");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.detail || "Cancellation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">My Appointments</h2>
          <p className="text-xs text-slate-500">View upcoming bookings, cancel, or proceed with payment</p>
        </div>

        <Link
          to="/customer/book-appointment"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Booking</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Appointments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any appointments scheduled yet.
          </p>
          <Link
            to="/customer/book-appointment"
            className="inline-block text-xs font-bold bg-teal-600 text-white px-4 py-2 rounded-xl"
          >
            Book First Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={appt.status} />
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded">
                    {appt.service?.category}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">{appt.service?.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Dog className="w-4 h-4 text-teal-600" />
                    <span>Pet: <strong className="text-slate-800">{appt.pet?.name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Date: <strong className="text-slate-800">{appt.appointment_date}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Time: <strong className="text-slate-800">{appt.start_time} - {appt.end_time}</strong></span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Doctor/Specialist: {appt.staff?.user?.full_name}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancelAppointment(appt.id)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedApptForPay(appt)}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay / Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApptForPay && (
        <MockPaymentModal
          appointment={selectedApptForPay}
          onSuccess={() => {
            setSelectedApptForPay(null);
            fetchAppointments();
          }}
          onClose={() => setSelectedApptForPay(null)}
        />
      )}
    </div>
  );
};

export default MyAppointmentsPage;
