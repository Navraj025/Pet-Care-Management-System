import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notifId) => {
    try {
      await API.put(`/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      showSuccess("All notifications marked as read");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Notification Center</h2>
          <p className="text-xs text-slate-500">In-app alerts for appointment reminders, vaccination dues, and payment updates</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center space-x-1"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Notifications</h3>
          <p className="text-xs text-slate-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between ${
                n.is_read ? 'bg-white border-slate-200 text-slate-600' : 'bg-teal-50/50 border-teal-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-slate-300' : 'bg-teal-500'}`}></span>
                  <h4 className="font-bold text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{n.created_at?.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-slate-600 pl-4">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors text-xs font-bold flex items-center space-x-1"
                  title="Mark Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
