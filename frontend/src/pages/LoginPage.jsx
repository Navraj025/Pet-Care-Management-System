import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogIn, Key, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, getDashboardPath } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e, customEmail, customPass) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      showError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email: loginEmail, password: loginPass });
      login(res.data);
      showSuccess(`Welcome back, ${res.data.full_name}!`);
      navigate(getDashboardPath(res.data.role));
    } catch (err) {
      console.error("Login failed:", err);
      showError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(null, demoEmail, demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in to access your dashboard & records</p>
        </div>

        {/* Quick Demo Buttons for B.Tech Viva Presentation */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block text-center">
            🚀 Quick Demo Login Credentials
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@petcare.com', 'password123')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors truncate"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('dr.smith@petcare.com', 'password123')}
              className="py-1.5 px-2 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold rounded-lg transition-colors truncate"
            >
              Staff Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('customer@petcare.com', 'password123')}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors truncate"
            >
              Customer Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-teal-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login to Portal</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an owner account?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
