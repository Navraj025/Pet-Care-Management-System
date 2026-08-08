import React, { useState, useEffect } from 'react';
import { FileText, Stethoscope, Pill, Calendar, Activity } from 'lucide-react';
import API from '../../services/api';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get('/medical-records');
        setRecords(res.data);
      } catch (err) {
        console.error("Failed to load medical records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Medical History Timeline</h2>
        <p className="text-xs text-slate-500">Electronic health records, clinical diagnoses, and prescriptions for all your pets</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading medical history...</div>
      ) : records.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Medical Records Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your pet completes a clinical consultation, electronic diagnostic records will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-teal-200">
          {records.map((rec) => (
            <div key={rec.id} className="relative pl-10 space-y-2">
              <div className="absolute left-2 top-2 w-4 h-4 bg-teal-600 rounded-full border-4 border-white shadow-sm"></div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      CONSULTATION RECORD
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">
                      Pet: {rec.pet?.name || 'Pet'}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    <span className="font-bold text-slate-800 block">{rec.date}</span>
                    <span>Vet: {rec.staff?.user?.full_name || 'Staff Veterinarian'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">Symptoms & Assessment</span>
                    <p className="text-slate-600 leading-relaxed">{rec.symptoms || 'None reported'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">Clinical Diagnosis</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">{rec.diagnosis}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">Treatment Provided</span>
                  <p className="text-slate-600 leading-relaxed">{rec.treatment}</p>
                </div>

                {rec.prescription && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                      <Pill className="w-4 h-4 text-teal-700" />
                      <span>Prescribed Medication</span>
                    </div>
                    <p className="text-teal-800 font-semibold">{rec.prescription}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
