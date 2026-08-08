import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Dog, FileText, Syringe, Calendar, Pill, Clock, AlertTriangle, ArrowLeft, ShieldCheck
} from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const PetDetailPage = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

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

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading pet healthcare records...</div>;
  }

  if (!pet) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-600">Pet profile not found.</p>
        <Link to="/customer/pets" className="text-xs font-bold text-teal-600 hover:underline mt-2 block">
          Return to My Pets
        </Link>
      </div>
    );
  }

  const tabs = ['Overview', 'Medical History', 'Vaccinations', 'Appointments', 'Prescriptions', 'Follow-ups'];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/customer/pets" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Pets</span>
      </Link>

      {/* Pet Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-3xl bg-teal-100 text-teal-900 flex items-center justify-center text-4xl shadow-inner font-bold">
            {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐰'}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-slate-900">{pet.name}</h2>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-full uppercase">
                {pet.species}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Breed: <span className="font-semibold text-slate-700">{pet.breed || 'Unknown'}</span> • Gender: <span className="font-semibold text-slate-700">{pet.gender}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Current Weight</span>
            <span className="font-bold text-slate-900 text-sm">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
          </div>
          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Microchip Tag</span>
            <span className="font-mono text-xs text-slate-900 font-bold">{pet.microchip_id || 'Not Microchipped'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">General Information</h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-semibold text-slate-800">{pet.date_of_birth || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400">Coat Color:</span>
                  <span className="font-semibold text-slate-800">{pet.color || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="font-semibold text-slate-800">{pet.created_at?.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Health Notes & Alerts</h4>
              <div className="space-y-3">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                  <span className="font-bold text-rose-800 block text-xs mb-1">Known Allergies</span>
                  <p className="text-rose-700">{pet.allergies || 'No documented food or drug allergies.'}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <span className="font-bold text-amber-800 block text-xs mb-1">Pre-existing Conditions</span>
                  <p className="text-amber-700">{pet.existing_conditions || 'No chronic health conditions recorded.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Medical History' && (
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 text-base">Chronological Medical Timeline</h4>
            {medicalRecords.length === 0 ? (
              <p className="text-xs text-slate-400">No medical consultation records found.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {medicalRecords.map((rec) => (
                  <div key={rec.id} className="relative pl-8 space-y-2">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-teal-600 rounded-full border-2 border-white"></div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-teal-700 text-sm">{rec.date}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">Doctor: {rec.staff?.user?.full_name || 'Staff Vet'}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        <div>
                          <strong className="text-slate-700 block">Diagnosis:</strong>
                          <p className="text-slate-600">{rec.diagnosis}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700 block">Treatment:</strong>
                          <p className="text-slate-600">{rec.treatment}</p>
                        </div>
                      </div>
                      {rec.prescription && (
                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
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
            <h4 className="font-bold text-slate-900 text-base">Immunization Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Vaccine Name</th>
                    <th className="p-3">Administered</th>
                    <th className="p-3">Next Due Date</th>
                    <th className="p-3">Batch #</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vaccinations.map((vac) => (
                    <tr key={vac.id}>
                      <td className="p-3 font-bold text-slate-800">{vac.vaccine_name}</td>
                      <td className="p-3 text-slate-600">{vac.date_administered}</td>
                      <td className="p-3 text-slate-600 font-semibold">{vac.next_due_date || 'N/A'}</td>
                      <td className="p-3 font-mono text-slate-500">{vac.batch_number || 'N/A'}</td>
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
            <h4 className="font-bold text-slate-900 text-base">Appointment Bookings</h4>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{appt.service?.name}</span>
                    <span className="text-slate-500">{appt.appointment_date} at {appt.start_time} with {appt.staff?.user?.full_name}</span>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Prescriptions' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-base">Active Medications</h4>
            {medicalRecords.filter((m) => m.prescription).map((m) => (
              <div key={m.id} className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-1">
                <span className="font-bold text-teal-900 block">{m.prescription}</span>
                <span className="text-slate-500">Prescribed on {m.date} by {m.staff?.user?.full_name}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Follow-ups' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-base">Follow-up Schedule</h4>
            {medicalRecords.filter((m) => m.follow_up_date).map((m) => (
              <div key={m.id} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-900 text-sm block">Follow-up Consultation Due</span>
                  <span className="text-amber-700">Diagnosis: {m.diagnosis}</span>
                </div>
                <span className="font-bold text-amber-900 px-3 py-1 bg-amber-100 rounded-xl">{m.follow_up_date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetDetailPage;
