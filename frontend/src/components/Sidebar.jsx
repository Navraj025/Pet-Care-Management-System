import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Dog, Stethoscope, Calendar,
  Clock, CreditCard, BarChart3, ShieldAlert, Settings, Syringe,
  FileText, Bell, Star, LogOut, PlusCircle, Heart, User as UserIcon, X, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen = false, setMobileOpen = () => {} }) => {
  const { user, logout, getProfilePath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/businesses', label: 'Business Management', icon: Building2 },
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

  const businessOwnerLinks = [
    { to: '/business-owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/business-owner/profile', label: 'Business Profile', icon: Building2 },
    { to: '/business-owner/services', label: 'Services & Pricing', icon: Stethoscope },
    { to: '/business-owner/staff', label: 'Staff & Team', icon: UserCheck },
    { to: '/business-owner/availability', label: 'Shift Schedules', icon: Clock },
    { to: '/business-owner/appointments', label: 'Appointments', icon: Calendar },
    { to: '/business-owner/customers', label: 'Customer Directory', icon: Users },
    { to: '/business-owner/pets', label: 'Pets Directory', icon: Dog },
    { to: '/business-owner/reviews', label: 'Customer Reviews', icon: Star },
    { to: '/business-owner/payments', label: 'Payments & Invoices', icon: CreditCard },
    { to: '/business-owner/reports', label: 'Revenue Analytics', icon: BarChart3 },
    { to: '/business-owner/settings', label: 'Settings', icon: Settings },
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

  const navLinks = role === 'ADMIN' ? adminLinks : role === 'BUSINESS_OWNER' ? businessOwnerLinks : role === 'STAFF' ? staffLinks : customerLinks;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      {/* Brand Header - Clickable logo & name redirect to Home */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center space-x-3 group"
            title="Return to Home Page"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white tracking-tight leading-none">SmartPetCare</h2>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mt-1">
                {role} PORTAL
              </span>
            </div>
          </Link>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar Menu"
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Profile Shortcut & Logout */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl">
          <Link
            to={getProfilePath(role)}
            onClick={() => setMobileOpen(false)}
            className="flex items-center space-x-2.5 overflow-hidden hover:opacity-80 transition-opacity min-w-0"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-teal-400 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 min-h-screen flex-col border-r border-slate-800 shadow-xl shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
