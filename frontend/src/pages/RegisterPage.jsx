import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, UserPlus, Mail, Key, User, Phone, MapPin } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDashboardPath } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        full_name: fullName,
        email,
        phone,
        address,
        password
      });
      login(res.data);
      showSuccess("Account registered successfully! Welcome to Smart Pet Care.");
      navigate(getDashboardPath(res.data.role));
    } catch (err) {
      console.error("Registration error:", err);
      showError(err.response?.data?.detail || "Registration failed. Please check form details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Owner Account</h2>
          <p className="text-xs text-slate-500">Register to manage your pets and book appointments</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Miller"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full pl-9 pr-2 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-2 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Evergreen Terrace"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
