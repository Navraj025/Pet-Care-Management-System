import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Camera
} from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PetAvatar from '../../components/PetAvatar';
import { useToast } from '../../context/ToastContext';

const PetDetailPage = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const [petRes, medRes, vacRes, apptRes] = await Promise.all([
          API.get(`/pets/${id}`),
          API.get(`/medical-records?pet_id=${id}`),
          API.get(`/vaccinations?pet_id=${id}`),
          API.get(`/appointments?pet_id=${id}`)
        ]);
        setPet(petRes.data);
        setMedicalRecords(medRes.data);
        setVaccinations(vacRes.data);
        setAppointments(apptRes.data);
      } catch (err) {
        console.error("Error loading pet details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPetData();
  }, [id]);

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post(`/pets/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPet(res.data);
      showSuccess('Pet photo updated');
    } catch (err) {
      console.error('Failed to upload pet photo:', err);
      showError(err.response?.data?.detail || 'Failed to upload pet photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading pet healthcare records...</div>;
  }

  if (!pet) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">Pet profile not found.</p>
        <Link to="/customer/pets" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mt-2 block">
          Return to My Pets
        </Link>
      </div>
    );
  }

  const tabs = ['Overview', 'Medical History', 'Vaccinations', 'Appointments', 'Prescriptions', 'Follow-ups'];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/customer/pets" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Pets</span>
      </Link>

      {/* Pet Header Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6 transition-colors">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="relative shrink-0">
            <PetAvatar pet={pet} size="lg" />
            <label className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 truncate">{pet.name}</h2>
              <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] sm:text-xs font-bold rounded-full uppercase shrink-0">
                {pet.species}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              Breed: <span className="font-semibold text-slate-700 dark:text-slate-300">{pet.breed || 'Unknown'}</span> • Gender: <span className="font-semibold text-slate-700 dark:text-slate-300">{pet.gender}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Current Weight</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Microchip Tag</span>
            <span className="font-mono text-xs text-slate-900 dark:text-slate-100 font-bold">{pet.microchip_id || 'Not Microchipped'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1.5 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === tab
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-800 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">General Information</h4>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.date_of_birth || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Coat Color:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.color || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.created_at?.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Health Notes & Alerts</h4>
              <div className="space-y-3">
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block text-xs mb-1">Known Allergies</span>
                  <p className="text-rose-700 dark:text-rose-200">{pet.allergies || 'No documented food or drug allergies.'}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block text-xs mb-1">Pre-existing Conditions</span>
                  <p className="text-amber-700 dark:text-amber-200">{pet.existing_conditions || 'No chronic health conditions recorded.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Medical History' && (
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Chronological Medical Timeline</h4>
            {medicalRecords.length === 0 ? (
              <p className="text-xs text-slate-400">No medical consultation records found.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {medicalRecords.map((rec) => (
                  <div key={rec.id} className="relative pl-7 sm:pl-8 space-y-2">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-teal-600 rounded-full border-2 border-white dark:border-slate-900"></div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <span className="font-bold text-teal-700 dark:text-teal-300 text-sm">{rec.date}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Doctor: {rec.staff?.user?.full_name || 'Staff Vet'}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 block">Diagnosis:</strong>
                          <p className="text-slate-600 dark:text-slate-400">{rec.diagnosis}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 block">Treatment:</strong>
                          <p className="text-slate-600 dark:text-slate-400">{rec.treatment}</p>
                        </div>
                      </div>
                      {rec.prescription && (
                        <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-900 dark:text-teal-200">
                          <strong className="block">Prescription:</strong>
                          <span>{rec.prescription}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Vaccinations' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Immunization Records</h4>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Vaccine Name</th>
                    <th className="p-3">Administered</th>
                    <th className="p-3">Next Due Date</th>
                    <th className="p-3">Batch #</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vaccinations.map((vac) => (
                    <tr key={vac.id}>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{vac.vaccine_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{vac.date_administered}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">{vac.next_due_date || 'N/A'}</td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{vac.batch_number || 'N/A'}</td>
                      <td className="p-3"><StatusBadge status={vac.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Appointments' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Appointment Bookings</h4>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{appt.service?.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">{appt.appointment_date} at {appt.start_time} with {appt.staff?.user?.full_name}</span>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Prescriptions' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Active Medications</h4>
            {medicalRecords.filter((m) => m.prescription).map((m) => (
              <div key={m.id} className="p-4 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-1">
                <span className="font-bold text-teal-900 dark:text-teal-200 block">{m.prescription}</span>
                <span className="text-slate-500 dark:text-slate-400">Prescribed on {m.date} by {m.staff?.user?.full_name}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Follow-ups' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Follow-up Schedule</h4>
            {medicalRecords.filter((m) => m.follow_up_date).map((m) => (
              <div key={m.id} className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-sm block">Follow-up Consultation Due</span>
                  <span className="text-amber-700 dark:text-amber-300">Diagnosis: {m.diagnosis}</span>
                </div>
                <span className="font-bold text-amber-900 dark:text-amber-200 px-3 py-1 bg-amber-100 dark:bg-amber-900/60 rounded-xl">{m.follow_up_date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetDetailPage;
