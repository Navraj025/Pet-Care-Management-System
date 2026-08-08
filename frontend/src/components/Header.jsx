import React, { useState, useEffect } from 'react';
import { Bell, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">Welcome back, {user?.full_name}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Bell */}
        <Link
          to={user?.role === 'CUSTOMER' ? '/customer/notifications' : '#'}
          className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Role Pill */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shadow-inner">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block leading-tight">{user?.full_name}</span>
            <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider block">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
