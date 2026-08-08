import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Stethoscope, Clock } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [specialization, setSpecialization] = useState('Senior Veterinarian & Surgeon');
  const [bio, setBio] = useState('');
  const [workingDays, setWorkingDays] = useState('Mon,Tue,Wed,Thu,Fri,Sat');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await API.get('/staff');
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post('/staff', {
        user_data: {
          full_name: fullName,
          email,
          phone,
          password
        },
        specialization,
        bio,
        working_days: workingDays,
        start_time: startTime,
        end_time: endTime,
        is_available: true
      });
      showSuccess(`Staff member '${fullName}' registered successfully!`);
      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setBio('');
      fetchStaff();
    } catch (err) {
      console.error("Failed to create staff:", err);
      showError(err.response?.data?.detail || "Failed to create staff member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Staff & Veterinarian Management</h2>
          <p className="text-xs text-slate-500">Manage licensed veterinarians, groomers, specializations, and working schedules</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff / Vet</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading staff members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((st) => (
            <div key={st.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold">
                  {st.user?.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{st.user?.full_name}</h3>
                  <p className="text-xs font-semibold text-teal-700">{st.specialization}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-800">{st.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-800">{st.user?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shift Hours:</span>
                  <span className="font-bold text-teal-800">{st.start_time} - {st.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Working Days:</span>
                  <span className="font-medium text-slate-800">{st.working_days}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Register Staff Member</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.jenkins@petcare.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Veterinary Surgeon / Feline Specialist / Groomer"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Start</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift End</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="18:00"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Registering..." : "Save Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffPage;
