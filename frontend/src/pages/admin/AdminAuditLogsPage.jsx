import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, User } from 'lucide-react';
import API from '../../services/api';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get('/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">System Audit Logs</h2>
        <p className="text-xs text-slate-500">Immutable chronological log of all system administrative actions and user events</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading audit trajectory...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-4 text-slate-500">{log.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                    <td className="p-4 font-bold text-slate-900 font-sans">{log.user_name}</td>
                    <td className="p-4 font-bold text-teal-700">{log.action}</td>
                    <td className="p-4 text-slate-600">{log.entity_type} #{log.entity_id || 'N/A'}</td>
                    <td className="p-4 font-sans text-slate-700">{log.details}</td>
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

export default AdminAuditLogsPage;
