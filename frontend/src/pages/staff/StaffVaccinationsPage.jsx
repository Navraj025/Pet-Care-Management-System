import React, { useState, useEffect } from 'react';
import { Syringe, Plus, Search } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

const StaffVaccinationsPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const [petId, setPetId] = useState('');
  const [vaccineName, setVaccineName] = useState('Rabies Immunization');
  const [dateAdministered, setDateAdministered] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [vacRes, petsRes] = await Promise.all([
        API.get('/vaccinations'),
        API.get('/pets')
      ]);
      setVaccinations(vacRes.data);
      setPets(petsRes.data);
      if (petsRes.data.length > 0) setPetId(petsRes.data[0].id);
    } catch (err) {
      console.error("Failed to load vaccinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdministerVaccine = async (e) => {
    e.preventDefault();
    if (!petId || !vaccineName) return;

    setSubmitting(true);
    try {
      await API.post('/vaccinations', {
        pet_id: parseInt(petId),
        vaccine_name: vaccineName,
        date_administered: dateAdministered,
        next_due_date: nextDueDate || null,
        batch_number: batchNumber || null,
        status: 'COMPLETED',
        notes
      });
      showSuccess(`Vaccine '${vaccineName}' recorded successfully!`);
      setShowAddModal(false);
      setBatchNumber('');
      setNextDueDate('');
      setNotes('');
      fetchData();
    } catch (err) {
      console.error("Vaccine record error:", err);
      showError(err.response?.data?.detail || "Failed to record vaccination");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Vaccination Management</h2>
          <p className="text-xs text-slate-500">Record vaccine immunizations, batch numbers, and booster due dates</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vaccination</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading vaccinations...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Vaccine Administered</th>
                  <th className="p-4">Date Given</th>
                  <th className="p-4">Next Due Date</th>
                  <th className="p-4">Batch #</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vaccinations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{vac.pet?.name || 'Patient'}</td>
                    <td className="p-4 font-semibold text-teal-800">{vac.vaccine_name}</td>
                    <td className="p-4 text-slate-600">{vac.date_administered}</td>
                    <td className="p-4 font-bold text-slate-800">{vac.next_due_date || 'N/A'}</td>
                    <td className="p-4 font-mono text-slate-500">{vac.batch_number || 'N/A'}</td>
                    <td className="p-4"><StatusBadge status={vac.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Vaccine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Administer Vaccination</h3>
            <form onSubmit={handleAdministerVaccine} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="Rabies / DHPP 5-in-1 / FeLV"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Administered</label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Serial Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="BAT-2026-99"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
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
                  {submitting ? "Recording..." : "Record Vaccination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffVaccinationsPage;
