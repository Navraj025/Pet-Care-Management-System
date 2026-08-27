import React, { useState, useEffect } from 'react';
import { Syringe, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const VaccinationsPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        const res = await API.get('/vaccinations');
        setVaccinations(res.data);
      } catch (err) {
        console.error("Failed to load vaccinations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVaccinations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Vaccination Records</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Immunization history, due-date tracking, and overdue alerts</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading vaccination history...</div>
      ) : vaccinations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
          <Syringe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Vaccinations Recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Immunization entries administered by veterinarians will be listed here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">Pet Patient</th>
                  <th className="p-4">Vaccine Name</th>
                  <th className="p-4">Date Administered</th>
                  <th className="p-4">Next Due Date</th>
                  <th className="p-4">Batch #</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vaccinations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{vac.pet?.name || 'Pet'}</td>
                    <td className="p-4 font-semibold text-teal-800 dark:text-teal-300">{vac.vaccine_name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{vac.date_administered}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{vac.next_due_date || 'N/A'}</td>
                    <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{vac.batch_number || 'N/A'}</td>
                    <td className="p-4">
                      <StatusBadge status={vac.status} />
                    </td>
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

export default VaccinationsPage;
