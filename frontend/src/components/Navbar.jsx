import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ArrowRight, LogIn, UserPlus, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, getDashboardPath } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-teal-100" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                SmartPet<span className="text-teal-600 dark:text-teal-400">Care</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider block">
                SaaS Healthcare
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link
              to="/"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/businesses"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/businesses') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/compare-services"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/compare-services') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Compare Prices
            </Link>
            <Link
              to="/services"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/services') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/about') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              About Clinic
            </Link>
            <Link
              to="/contact"
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                isActive('/contact') ? 'text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Actions & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
              className="p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center justify-center"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <button
                  onClick={() => navigate(getDashboardPath(user.role))}
                  className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Navigation Menu"
              className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              to="/"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/businesses"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/businesses') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/compare-services"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/compare-services') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Compare Prices
            </Link>
            <Link
              to="/services"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/services') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/about') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              About Clinic
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isActive('/contact') ? 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Contact Us
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2.5">
            {user ? (
              <button
                onClick={() => {
                  closeMenu();
                  navigate(getDashboardPath(user.role));
                }}
                className="w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-teal-600" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="bg-teal-600 text-white font-bold text-sm py-2.5 px-3 rounded-xl shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
