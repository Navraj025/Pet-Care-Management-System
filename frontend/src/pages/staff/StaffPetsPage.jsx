import React, { useState, useEffect } from 'react';
import { Dog, Search, FileText, ChevronRight } from 'lucide-react';
import API from '../../services/api';
import PetAvatar from '../../components/PetAvatar';

const StaffPetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await API.get('/pets');
        setPets(res.data);
      } catch (err) {
        console.error("Failed to load pets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.microchip_id && p.microchip_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Pet Patients Directory</h2>
        <p className="text-xs text-slate-500">Search and view clinical records for all registered patients</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patient by name or microchip ID..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading pet directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <PetAvatar pet={pet} />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{pet.name}</h3>
                  <p className="text-xs text-slate-400">{pet.breed || pet.species} • {pet.gender}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-semibold text-slate-800">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Microchip Tag:</span>
                  <span className="font-mono text-slate-800">{pet.microchip_id || 'None'}</span>
                </div>
                {pet.allergies && (
                  <div className="text-rose-600 font-semibold pt-1 border-t border-slate-200">
                    Allergies: {pet.allergies}
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

export default StaffPetsPage;
