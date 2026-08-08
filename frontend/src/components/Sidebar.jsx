import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Dog, Stethoscope, Calendar,
  Clock, CreditCard, BarChart3, ShieldAlert, Settings, Syringe,
  FileText, Bell, Star, LogOut, PlusCircle, Heart, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, getProfilePath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/staff', label: 'Staff & Vets', icon: UserCheck },
    { to: '/admin/pets', label: 'Pet Directory', icon: Dog },
    { to: '/admin/services', label: 'Clinic Services', icon: Stethoscope },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/availability', label: 'Staff Shift Schedules', icon: Clock },
    { to: '/admin/payments', label: 'Payments & Invoices', icon: CreditCard },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
    { to: '/admin/profile', label: 'My Profile', icon: UserIcon },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/appointments', label: 'Assigned Appointments', icon: Calendar },
    { to: '/staff/pets', label: 'Pet Patients', icon: Dog },
    { to: '/staff/medical-records', label: 'Medical History', icon: FileText },
    { to: '/staff/vaccinations', label: 'Vaccination Tracker', icon: Syringe },
    { to: '/staff/availability', label: 'My Availability', icon: Clock },
    { to: '/staff/profile', label: 'My Profile', icon: UserIcon },
  ];

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/pets', label: 'My Pets', icon: Dog },
    { to: '/customer/book-appointment', label: 'Book Appointment', icon: PlusCircle },
    { to: '/customer/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/customer/medical-records', label: 'Medical Records', icon: FileText },
    { to: '/customer/vaccinations', label: 'Vaccination Records', icon: Syringe },
    { to: '/customer/payments', label: 'Payments & Invoices', icon: CreditCard },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/reviews', label: 'Feedback & Reviews', icon: Star },
    { to: '/customer/profile', label: 'My Profile', icon: UserIcon },
  ];

  const navLinks = role === 'ADMIN' ? adminLinks : role === 'STAFF' ? staffLinks : customerLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shadow-xl shrink-0">
      {/* Brand Header - Clickable logo & name redirect to Home */}
      <div>
        <Link
          to="/"
          className="p-6 flex items-center space-x-3 border-b border-slate-800 hover:bg-slate-800/40 transition-colors group block"
          title="Return to Home Page"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white tracking-tight leading-none">SmartPetCare</h2>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mt-1">
                {role} PORTAL
              </span>
            </div>
          </div>
        </Link>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Profile Shortcut & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl">
          <Link to={getProfilePath(role)} className="flex items-center space-x-2.5 overflow-hidden hover:opacity-80 transition-opacity">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-teal-400 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
