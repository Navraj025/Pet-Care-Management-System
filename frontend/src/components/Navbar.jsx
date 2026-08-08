import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Calendar, Shield, UserCheck, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Heart className="w-6 h-6 fill-current text-teal-100" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                SmartPet<span className="text-teal-600">Care</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                SaaS Healthcare
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <Link to="/services" className="hover:text-teal-600 transition-colors">
              Services
            </Link>
            <Link to="/about" className="hover:text-teal-600 transition-colors">
              About Clinic
            </Link>
            <Link to="/contact" className="hover:text-teal-600 transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={() => navigate(getDashboardPath(user.role))}
                className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-teal-600 font-semibold text-sm px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-teal-600" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Owner</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
