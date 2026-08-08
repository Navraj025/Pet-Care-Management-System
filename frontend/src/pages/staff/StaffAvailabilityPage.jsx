import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StaffAvailabilityPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState('Mon,Tue,Wed,Thu,Fri,Sat');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Custom Leave Date form
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('Sick Leave');

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/staff/me');
        setProfile(res.data);
        setWorkingDays(res.data.working_days);
        setStartTime(res.data.start_time);
        setEndTime(res.data.end_time);
        setBreakStart(res.data.break_start);
        setBreakEnd(res.data.break_end);
        setIsAvailable(res.data.is_available);
      } catch (err) {
        console.error("Failed to load staff profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveHours = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    try {
      await API.put(`/staff/${profile.id}`, {
        working_days: workingDays,
        start_time: startTime,
        end_time: endTime,
        break_start: breakStart,
        break_end: breakEnd,
        is_available: isAvailable
      });
      showSuccess("Working hours & availability updated successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to update working hours");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkLeaveDate = async (e) => {
    e.preventDefault();
    if (!profile || !leaveDate) return;

    try {
      await API.post('/availability', {
        staff_id: profile.id,
        date: leaveDate,
        is_available: false,
        reason: leaveReason
      });
      showSuccess(`Marked unavailable on ${leaveDate} (${leaveReason})`);
      setLeaveDate('');
    } catch (err) {
      console.error(err);
      showError("Failed to set leave date");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading availability settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Shift Availability Management</h2>
        <p className="text-xs text-slate-500">Configure your shift hours, break periods, and custom leave days for slot generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Working Hours Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Regular Shift Hours</span>
          </h3>

          <form onSubmit={handleSaveHours} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Working Days (Comma separated)</label>
              <input
                type="text"
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
                placeholder="Mon,Tue,Wed,Thu,Fri,Sat"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Start</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift End</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="18:00"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Break Start</label>
                <input
                  type="text"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  placeholder="13:00"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Break End</label>
                <input
                  type="text"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  placeholder="14:00"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isAvailable" className="font-semibold text-slate-800">
                Currently Available for Booking
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
            >
              {submitting ? "Saving..." : "Save Shift Schedule"}
            </button>
          </form>
        </div>

        {/* Custom Leave Dates Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Mark Custom Leave / Day Off</span>
          </h3>
          <p className="text-xs text-slate-500">
            Block specific dates from the online booking system for vacation or personal leave.
          </p>

          <form onSubmit={handleMarkLeaveDate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave Date</label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Absence</label>
              <input
                type="text"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Sick leave / Annual vacation / Training"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
            >
              Block Date from Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffAvailabilityPage;
