import React, { useState, useEffect } from 'react';
import { Users, Search, Dog } from 'lucide-react';
import API from '../../services/api';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get('/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Customer Management</h2>
        <p className="text-xs text-slate-500">Manage registered pet owners, contact information, and emergency contacts</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer name or email..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading customer accounts...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Residential Address</th>
                  <th className="p-4">Emergency Contact</th>
                  <th className="p-4">Pets Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.user?.full_name}</td>
                    <td className="p-4 text-slate-600">{c.user?.email}</td>
                    <td className="p-4 text-slate-700 font-semibold">{c.user?.phone || 'N/A'}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{c.address || 'N/A'}</td>
                    <td className="p-4 text-rose-600 font-semibold">{c.emergency_contact || 'N/A'}</td>
                    <td className="p-4 font-bold text-teal-700">{c.pets?.length || 0} pet(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
