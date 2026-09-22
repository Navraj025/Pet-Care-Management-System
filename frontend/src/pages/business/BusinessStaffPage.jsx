import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Mail, Phone, Calendar } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await API.get('/business-owner/staff');
      setStaff(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      showToast("Failed to load staff list.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Staff & Practitioner Team</h1>
        <p className="text-xs text-slate-500">View practitioners, veterinarians, and groomers registered under your business</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading staff list...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Staff Members Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no staff profiles associated with your business.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((st) => (
            <div key={st.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                  {st.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{st.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{st.specialization}</p>
                </div>
              </div>

              {st.bio && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{st.bio}</p>}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Shift: {st.start_time} - {st.end_time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Days: {st.working_days}</span>
                </div>
                {st.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="truncate">{st.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessStaffPage;
