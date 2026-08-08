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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">STAFF / VETERINARIAN PORTAL</span>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.full_name} 🩺</h2>
          <p className="text-xs text-slate-300">You have {todayAppts.length} assigned appointment(s) scheduled for today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Today's Schedule</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{todayAppts.length}</h3>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Assigned</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{appointments.length}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Patients Handled</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{pets.length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Vaccines Administered</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{vaccinations.length}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Syringe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Appointments List for Today */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900">Today's Patient Schedule</h3>
          <Link to="/staff/appointments" className="text-xs font-bold text-teal-600 hover:underline">
            View All Appointments
          </Link>
        </div>

        {todayAppts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div key={appt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{appt.pet?.name} ({appt.pet?.species})</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-slate-500">Service: {appt.service?.name} • Time: {appt.start_time} - {appt.end_time}</p>
                  <p className="text-[11px] text-slate-400">Owner: {appt.customer?.user?.full_name} ({appt.customer?.user?.phone})</p>
                </div>

                <Link
                  to="/staff/medical-records"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
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
