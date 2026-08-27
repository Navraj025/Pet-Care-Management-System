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
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Pet Patients Directory</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Search and view clinical records for all registered patients</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition-colors">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patient by name or microchip ID..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading pet directory...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                <PetAvatar pet={pet} className="shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">{pet.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{pet.breed || pet.species} • {pet.gender}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Microchip Tag:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{pet.microchip_id || 'None'}</span>
                </div>
                {pet.allergies && (
                  <div className="text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
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
