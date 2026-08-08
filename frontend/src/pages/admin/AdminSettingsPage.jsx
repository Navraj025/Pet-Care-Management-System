import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    clinic_name: 'Smart Pet Care & Veterinary Center',
    clinic_email: 'contact@smartpetcare.com',
    clinic_phone: '+1 (800) 555-PETS',
    clinic_address: '124 Healthcare Boulevard, Suite 400, Tech City',
    tax_rate_percent: '5.0',
    cancellation_policy_hours: '2'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (Object.keys(res.data).length > 0) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.put('/settings', settings);
      showSuccess("System settings updated successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to update system settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading system settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">System Configuration Settings</h2>
        <p className="text-xs text-slate-500">Global business rules, clinic profile details, tax percentages, and policies</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Center Name</label>
              <input
                type="text"
                value={settings.clinic_name}
                onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.clinic_email}
                onChange={(e) => setSettings({ ...settings, clinic_email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Line</label>
              <input
                type="text"
                value={settings.clinic_phone}
                onChange={(e) => setSettings({ ...settings, clinic_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.tax_rate_percent}
                onChange={(e) => setSettings({ ...settings, tax_rate_percent: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facility Address</label>
            <input
              type="text"
              value={settings.clinic_address}
              onChange={(e) => setSettings({ ...settings, clinic_address: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save System Settings"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
