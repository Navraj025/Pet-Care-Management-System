import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, ShieldCheck, Camera, Trash2,
  Save, CheckCircle2, AlertCircle, Sparkles, Stethoscope, FileText
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Customer Specific Fields
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [customerId, setCustomerId] = useState(null);

  // Staff Specific Fields
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [workingDays, setWorkingDays] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [staffId, setStaffId] = useState(null);

  // Account Metadata
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        const userData = res.data;

        setFullName(userData.full_name || '');
        setPhone(userData.phone || '');
        setAvatarUrl(userData.avatar_url || '');
        setAvatarPreview(userData.avatar_url || '');
        setCreatedAt(userData.created_at || new Date().toISOString());

        if (userData.role === 'CUSTOMER' && userData.customer_profile) {
          setAddress(userData.customer_profile.address || '');
          setEmergencyContact(userData.customer_profile.emergency_contact || '');
          setCustomerId(userData.customer_profile.id);
        } else if (userData.role === 'STAFF' && userData.staff_profile) {
          setSpecialization(userData.staff_profile.specialization || '');
          setBio(userData.staff_profile.bio || '');
          setWorkingDays(userData.staff_profile.working_days || '');
          setStartTime(userData.staff_profile.start_time || '');
          setEndTime(userData.staff_profile.end_time || '');
          setStaffId(userData.staff_profile.id);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, []);

  // Handle Image Upload & Validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showError("Please upload a valid image (JPEG, PNG, WEBP)");
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError("Image size must be less than 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setAvatarPreview(base64Data);
      setAvatarUrl(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showError("Full name is required");
      return;
    }

    setSaving(true);
    try {
      // 1. Update Core User Info
      const userRes = await API.put(`/users/${user.id}`, {
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
      });

      // 2. Update Role Specific Details
      if (user.role === 'CUSTOMER' && customerId) {
        await API.put(`/customers/${customerId}`, {
          address,
          emergency_contact: emergencyContact
        });
      } else if (user.role === 'STAFF' && staffId) {
        await API.put(`/staff/${staffId}`, {
          specialization,
          bio,
          working_days: workingDays,
          start_time: startTime,
          end_time: endTime
        });
      }

      // 3. Update Auth Context State
      updateUserProfile({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
      });

      showSuccess("Profile & avatar updated successfully!");
    } catch (err) {
      console.error("Save profile error:", err);
      showError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading profile information...</div>;
  }

  const role = user?.role;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">
            {role} PROFILE & ACCOUNT
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">User Account Settings</h2>
          <p className="text-xs text-slate-300">Manage your profile picture, contact details, and account credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Profile Header & Avatar Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar Preview & Controls */}
          <div className="relative group flex flex-col items-center">
            <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-teal-500 shadow-md relative flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-teal-700">
                  {fullName?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            {/* Hidden Input File */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex items-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl border border-teal-200 transition-colors flex items-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                  title="Remove Picture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Identity Info Summary */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h3 className="text-2xl font-extrabold text-slate-900">{fullName}</h3>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400">
              Account Created: {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Personal & Contact Information Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-teal-600" />
            <span>Personal & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98559 00577"
                  className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Customer Role Specific Fields */}
            {role === 'CUSTOMER' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Line</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="124 Healthcare Boulevard, Suite 400..."
                      className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </>
            )}

            {/* Staff Role Specific Fields */}
            {role === 'STAFF' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Veterinary Surgeon / Feline Specialist"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Professional Bio</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Licensed veterinary specialist with over 8 years of clinical experience..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  ></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Details & Role Permissions (Read-Only) */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-xs space-y-3">
          <h4 className="font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Account Role & System Permissions</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
            <div>
              <span className="text-slate-400 block">Assigned Role:</span>
              <strong className="text-slate-800 uppercase">{role}</strong>
              <p className="text-[11px] text-slate-400">System roles can only be updated by Clinic Administrators.</p>
            </div>
            <div>
              <span className="text-slate-400 block">Account Status:</span>
              <span className="text-emerald-700 font-bold">Active & Verified</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
