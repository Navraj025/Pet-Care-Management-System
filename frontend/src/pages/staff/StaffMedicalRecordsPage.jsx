import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle2, Pill } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StaffMedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showSuccess, showError } = useToast();

  // Form fields
  const [petId, setPetId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [recordsRes, petsRes] = await Promise.all([
        API.get('/medical-records'),
        API.get('/pets')
      ]);
      setRecords(recordsRes.data);
      setPets(petsRes.data);
      if (petsRes.data.length > 0) setPetId(petsRes.data[0].id);
    } catch (err) {
      console.error("Failed to load medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!petId || !diagnosis || !treatment) {
      showError("Please fill required fields (Pet, Diagnosis, Treatment)");
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/medical-records', {
        pet_id: parseInt(petId),
        symptoms,
        diagnosis,
        treatment,
        prescription,
        weight: weight ? parseFloat(weight) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        follow_up_date: followUpDate || null,
        notes
      });
      showSuccess("Medical record saved successfully!");
      setShowAddModal(false);
      // Reset
      setSymptoms('');
      setDiagnosis('');
      setTreatment('');
      setPrescription('');
      setWeight('');
      setTemperature('');
      setFollowUpDate('');
      setNotes('');
      fetchData();
    } catch (err) {
      console.error("Error creating record:", err);
      showError(err.response?.data?.detail || "Failed to create medical record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Clinical Consultation Records</h2>
          <p className="text-xs text-slate-500">Record diagnostic assessments, treatments, prescriptions, and follow-ups</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Consultation Record</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading medical records...</div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Patient: {rec.pet?.name}</h3>
                  <p className="text-slate-400">Owner: {rec.pet?.customer?.user?.full_name}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-teal-700 text-sm block">{rec.date}</span>
                  <span className="text-slate-400">Doctor: {rec.staff?.user?.full_name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <strong className="text-slate-700 block mb-1">Diagnosis:</strong>
                  <p className="text-slate-900 font-semibold">{rec.diagnosis}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <strong className="text-slate-700 block mb-1">Treatment:</strong>
                  <p className="text-slate-800">{rec.treatment}</p>
                </div>
              </div>

              {rec.prescription && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
                  <strong className="block">Prescription:</strong>
                  <span>{rec.prescription}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">New Clinical Record Entry</h3>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.breed || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms Reported</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Lethargy, skin itching, coughing..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Skin allergy / Bacterial ear infection"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Administered *</label>
                <textarea
                  rows="2"
                  required
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Cleaned affected area, administered anti-inflammatory..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription Details</label>
                <input
                  type="text"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Amoxicillin 100mg - 1 tablet twice daily for 5 days"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="31.5"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="38.5"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMedicalRecordsPage;
