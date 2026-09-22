import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Dog, XCircle, CreditCard, PlusCircle, Check } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import MockPaymentModal from '../../components/MockPaymentModal';
import { formatCurrency } from '../../utils/formatters';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">My Appointments</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View upcoming bookings, cancel, or proceed with payment</p>
        </div>

        <Link
          to="/customer/book-appointment"
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Booking</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Appointments Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
          {appointments.map((appt) => {
            const servicesList = (appt.appointment_services && appt.appointment_services.length > 0)
              ? appt.appointment_services
              : appt.service
              ? [{ id: appt.service.id, service: appt.service, price_at_booking: appt.service.price }]
              : [];
            const isMultiService = servicesList.length > 1;
            const primaryService = servicesList[0]?.service || appt.service;
            const subtotalPrice = servicesList.reduce((sum, item) => sum + (item.price_at_booking || item.service?.price || 0), 0);

            return (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 transition-colors"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={appt.status} />
                    <span className="text-[11px] sm:text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {isMultiService ? `${servicesList.length} Services Booked` : (primaryService?.category || 'Care')}
                    </span>
                  </div>

                  {/* Service Title Breakdown */}
                  <div>
                    {isMultiService ? (
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          Multi-Service Booking ({formatCurrency(subtotalPrice)})
                        </h3>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {servicesList.map((item) => (
                            <span key={item.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                              ✓ {item.service?.name || 'Service'} ({formatCurrency(item.price_at_booking || item.service?.price)})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                        {primaryService?.name || 'Veterinary Service'} ({formatCurrency(subtotalPrice)})
                      </h3>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Dog className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Pet: <strong className="text-slate-800 dark:text-slate-200">{appt.pet?.name}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Date: <strong className="text-slate-800 dark:text-slate-200">{appt.appointment_date}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Time: <strong className="text-slate-800 dark:text-slate-200">{appt.start_time} - {appt.end_time}</strong></span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Doctor/Specialist: {appt.staff?.user?.full_name}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCancelAppointment(appt.id)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors flex items-center space-x-1 shrink-0"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedApptForPay(appt)}
                    className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay / Invoice</span>
                  </button>
                </div>
              </div>
            );
          })}
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
