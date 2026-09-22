import React, { useState, useEffect } from 'react';
import {
  Building2, Search, Filter, CheckCircle2, XCircle, AlertOctagon, RefreshCw,
  Eye, User, Phone, Mail, MapPin, Star, Calendar, Stethoscope
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminBusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter, typeFilter]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status_filter = statusFilter;
      if (typeFilter !== 'All') params.type_filter = typeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await API.get('/admin/businesses', { params });
      setBusinesses(res.data);
    } catch (err) {
      console.error("Error fetching admin businesses:", err);
      showToast("Failed to load platform businesses.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (businessId, action) => {
    try {
      let endpoint = `/admin/businesses/${businessId}/${action}`;
      if (action === 'status') {
        // status change fallback
      }
      await API.post(endpoint);
      showToast(`Business ${action} operation successful!`, "success");
      fetchBusinesses();
      if (selectedBusiness && selectedBusiness.id === businessId) {
        setSelectedBusiness(null);
      }
    } catch (err) {
      console.error(`Error performing ${action} on business:`, err);
      showToast(`Failed to ${action} business.`, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Platform Business Management</h1>
          <p className="text-xs text-slate-500">Approve, inspect, suspend, or reactivate businesses registered on the marketplace</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-xs rounded-full">
            {businesses.length} Businesses Registered
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, city, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Statuses (Pending, Approved, Suspended)</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved & Live</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Business Types</option>
            <option value="Pet Care Center">Pet Care Center</option>
            <option value="Veterinary Clinic">Veterinary Clinic</option>
            <option value="Grooming Center">Grooming Center</option>
            <option value="Pet Shop">Pet Shop</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Businesses Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading platform businesses...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Businesses Found</h3>
          <p className="text-xs text-slate-500">No registered businesses match your search filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Business</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={b.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80'}
                          alt={b.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 bg-white"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{b.name}</span>
                          <span className="text-[10px] text-slate-400">Rating ⭐ {b.stats.avg_rating} ({b.stats.review_count} reviews)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{b.owner.full_name}</span>
                      <span className="text-[10px] text-slate-400 block">{b.owner.email}</span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold block">{b.city}</span>
                      <span className="text-[10px] text-slate-400">{b.pincode}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {b.business_type}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase ${
                        b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                        b.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedBusiness(b)}
                          title="Inspect Business Details"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(b.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(b.id, 'reject')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === 'APPROVED' && (
                          <button
                            onClick={() => handleAction(b.id, 'suspend')}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                          >
                            Suspend
                          </button>
                        )}

                        {b.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleAction(b.id, 'reactivate')}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Business Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <img
                src={selectedBusiness.logo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80'}
                alt={selectedBusiness.name}
                className="w-12 h-12 rounded-xl object-cover border shrink-0 bg-white"
              />
              <div>
                <h3 className="font-extrabold text-lg">{selectedBusiness.name}</h3>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{selectedBusiness.business_type} • {selectedBusiness.city}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Owner Name</span>
                  <span className="font-bold">{selectedBusiness.owner.full_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Owner Email</span>
                  <span className="font-bold">{selectedBusiness.owner.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Address</span>
                <p className="text-slate-700 dark:text-slate-200">{selectedBusiness.address}, {selectedBusiness.city} - {selectedBusiness.pincode}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400 block">{selectedBusiness.stats.services_count}</span>
                  <span className="text-[10px] text-slate-500">Services</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400 block">{selectedBusiness.stats.staff_count}</span>
                  <span className="text-[10px] text-slate-500">Staff</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400 block">{selectedBusiness.stats.appointments_count}</span>
                  <span className="text-[10px] text-slate-500">Bookings</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessesPage;
