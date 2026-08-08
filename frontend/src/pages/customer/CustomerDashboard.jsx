import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dog, Calendar, Syringe, PlusCircle, CreditCard, Bell, ChevronRight,
  ShieldAlert, CheckCircle2, Clock, Sparkles
} from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, apptsRes, vacsRes] = await Promise.all([
          API.get('/pets'),
          API.get('/appointments'),
          API.get('/vaccinations')
        ]);
        setPets(petsRes.data);
        setAppointments(apptsRes.data);
        setVaccinations(vacsRes.data);
      } catch (err) {
        console.error("Error loading customer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingAppt = appointments.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const overdueVacs = vaccinations.filter((v) => v.status === 'OVERDUE');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CUSTOMER DASHBOARD</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.full_name}! 👋</h2>
          <p className="text-xs text-teal-100 max-w-xl">
            You currently have <span className="font-bold text-white">{pets.length} registered pet(s)</span>. Keep track of upcoming appointments and health immunizations.
          </p>
        </div>
        <Link
          to="/customer/book-appointment"
          className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all text-xs flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Overdue Vaccination Alert Banner */}
      {overdueVacs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-rose-900 text-xs font-semibold">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Attention: You have {overdueVacs.length} overdue vaccination booster(s) required!</span>
          </div>
          <Link to="/customer/vaccinations" className="text-rose-700 underline font-bold">
            View Vaccinations
          </Link>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registered Pets</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{pets.length}</h3>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{appointments.length}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vaccine Records</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{vaccinations.length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Syringe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overdue Alerts</p>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{overdueVacs.length}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Row: Pets Showcase & Upcoming Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Pets Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">My Pets Profile</h3>
            <Link to="/customer/pets" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
              <span>View All ({pets.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.slice(0, 4).map((pet) => (
              <div key={pet.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                      {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐰'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{pet.name}</h4>
                      <p className="text-xs text-slate-400">{pet.breed || pet.species} • {pet.gender}</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-semibold text-slate-800">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Microchip ID:</span>
                    <span className="font-mono text-[11px] text-slate-700">{pet.microchip_id || 'Not Registered'}</span>
                  </div>
                </div>

                <Link
                  to={`/customer/pets/${pet.id}`}
                  className="block text-center text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 py-2 rounded-xl border border-teal-200 transition-colors"
                >
                  Open Medical File
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Appointment */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Next Upcoming Appointment</h3>

          {upcomingAppt ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  {upcomingAppt.service?.category}
                </span>
                <StatusBadge status={upcomingAppt.status} />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{upcomingAppt.service?.name}</h4>
                <p className="text-xs text-slate-500">For {upcomingAppt.pet?.name} ({upcomingAppt.pet?.species})</p>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>{upcomingAppt.appointment_date}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{upcomingAppt.start_time} - {upcomingAppt.end_time}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Dog className="w-4 h-4 text-teal-600" />
                  <span>Doctor: {upcomingAppt.staff?.user?.full_name}</span>
                </div>
              </div>

              <Link
                to="/customer/appointments"
                className="block text-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl transition-colors"
              >
                Manage Booking
              </Link>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No active upcoming appointments.</p>
              <Link
                to="/customer/book-appointment"
                className="inline-block text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
