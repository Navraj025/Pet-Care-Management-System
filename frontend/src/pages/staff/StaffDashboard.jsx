import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Dog, FileText, Syringe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, petsRes, vacsRes] = await Promise.all([
          API.get('/appointments'),
          API.get('/pets'),
          API.get('/vaccinations')
        ]);
        setAppointments(apptsRes.data);
        setPets(petsRes.data);
        setVaccinations(vacsRes.data);
      } catch (err) {
        console.error("Staff dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.appointment_date === todayStr);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-bold text-teal-400 uppercase tracking-widest block">STAFF / VETERINARIAN PORTAL</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user?.full_name} 🩺</h2>
          <p className="text-xs text-slate-300">You have {todayAppts.length} assigned appointment(s) scheduled for today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Today's Schedule</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{todayAppts.length}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Total Assigned</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{appointments.length}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Patients Handled</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{pets.length}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <Dog className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Vaccines Administered</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{vaccinations.length}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
            <Syringe className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Appointments List for Today */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">Today's Patient Schedule</h3>
          <Link to="/staff/appointments" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            View All Appointments
          </Link>
        </div>

        {todayAppts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div key={appt.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{appt.pet?.name} ({appt.pet?.species})</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Service: {appt.service?.name} • Time: {appt.start_time} - {appt.end_time}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400">Owner: {appt.customer?.user?.full_name} ({appt.customer?.user?.phone})</p>
                </div>

                <Link
                  to="/staff/medical-records"
                  className="w-full sm:w-auto text-center bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shrink-0"
                >
                  Add Clinical Record
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
