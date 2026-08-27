import React, { useState, useEffect, useRef } from 'react';
import { Bell, User as UserIcon, Settings, LogOut, ChevronDown, Heart, Sun, Moon, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const Header = ({ title = "Dashboard", onToggleSidebar }) => {
  const { user, logout, getProfilePath } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get('/notifications/unread-count');
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnread();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;
  const profilePath = getProfilePath(role);

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {/* Mobile Hamburger Menu Toggle for Sidebar */}
        <button
          onClick={onToggleSidebar}
          aria-label="Open Sidebar Menu"
          className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Brand Logo in Mobile */}
        <Link
          to="/"
          className="flex items-center space-x-2 md:hidden group shrink-0"
          title="Return to Home Page"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        </Link>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight truncate">{title}</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 truncate hidden xs:block">Welcome back, {user?.full_name}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light/Dark Theme"
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center justify-center"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications Bell */}
        <Link
          to={role === 'CUSTOMER' ? '/customer/notifications' : '#'}
          className="relative p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Dropdown Area */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-teal-500 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">{user?.full_name}</span>
              <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                {user?.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in-50 slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded-md border border-teal-200 dark:border-teal-800 uppercase">
                  {user?.role} Account
                </span>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to={profilePath}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-teal-600" />
                  <span>My Profile & Avatar</span>
                </Link>

                {role === 'ADMIN' ? (
                  <Link
                    to="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-teal-600" />
                    <span>System Settings</span>
                  </Link>
                ) : (
                  <Link
                    to={profilePath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-teal-600" />
                    <span>Account Settings</span>
                  </Link>
                )}

                {role === 'CUSTOMER' && (
                  <Link
                    to="/customer/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                  >
                    <Bell className="w-4 h-4 text-teal-600" />
                    <span>Notification Center</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
