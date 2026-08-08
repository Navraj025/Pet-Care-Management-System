import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.demo_reset_token) {
        setDemoToken(res.data.demo_reset_token);
      }
      showSuccess("Password reset instructions generated.");
    } catch (err) {
      console.error(err);
      showError("Failed to initiate password reset.");
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500">Enter your registered email address</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-600">
              Reset link generated for <span className="font-bold">{email}</span>.
            </p>
            {demoToken && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 space-y-1">
                <p className="font-bold">Demo Reset Token:</p>
                <code className="bg-white px-2 py-1 rounded text-[11px] border border-teal-300 font-mono block select-all">
                  {demoToken}
                </code>
              </div>
            )}
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
            >
              {loading ? "Generating Token..." : "Send Password Reset Link"}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
                Cancel & Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
