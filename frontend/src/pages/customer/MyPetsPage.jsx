import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dog, Plus, Search, ChevronRight, Trash2, ImagePlus } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PetAvatar from '../../components/PetAvatar';

const MyPetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showSuccess, showError } = useToast();

  // New Pet Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchPets();
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post('/pets', {
        name,
        species,
        breed: breed || null,
        gender,
        date_of_birth: dob || null,
        weight: weight ? parseFloat(weight) : null,
        microchip_id: microchip || null,
        allergies: allergies || null,
        existing_conditions: conditions || null
      });

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        await API.post(`/pets/${res.data.id}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      showSuccess(`Pet '${name}' registered successfully!`);
      setShowAddModal(false);
      // Reset form
      setName('');
      setBreed('');
      setWeight('');
      setMicrochip('');
      setAllergies('');
      setConditions('');
      setAvatarFile(null);
      fetchPets();
    } catch (err) {
      console.error("Failed to add pet:", err);
      showError(err.response?.data?.detail || "Failed to register pet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to remove pet profile '${petName}'?`)) return;
    try {
      await API.delete(`/pets/${petId}`);
      showSuccess(`Removed pet '${petName}'`);
      fetchPets();
    } catch (err) {
      console.error(err);
      showError("Failed to remove pet profile");
    }
  };

  const filteredPets = pets.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.breed && p.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">My Registered Pets</h2>
          <p className="text-xs text-slate-500">Manage pet details, health allergies, and medical records</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition-colors">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by pet name or breed..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* Pet Cards List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading pet profiles...</div>
      ) : filteredPets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
          <Dog className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Pets Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You haven't registered any pets yet. Click below to create your pet's official health profile.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl"
          >
            Register First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 min-w-0">
                  <PetAvatar pet={pet} />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{pet.name}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {pet.breed || pet.species} • {pet.gender}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePet(pet.id, pet.name)}
                  className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg transition-colors shrink-0"
                  title="Remove Pet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.date_of_birth || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weight:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pet.weight ? `${pet.weight} kg` : 'Unspecified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Microchip ID:</span>
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[140px] text-right">{pet.microchip_id || 'None'}</span>
                </div>
                {pet.allergies && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Allergies:</span>
                    <span className="truncate max-w-[140px] text-right">{pet.allergies}</span>
                  </div>
                )}
              </div>

              <Link
                to={`/customer/pets/${pet.id}`}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1"
              >
                <span>View Full Medical History</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Pet Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 transition-colors my-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Register New Pet</h3>
            <form onSubmit={handleAddPet} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Max"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Species *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Dog">Dog 🐶</option>
                    <option value="Cat">Cat 🐱</option>
                    <option value="Bird">Bird 🦜</option>
                    <option value="Rabbit">Rabbit 🐰</option>
                    <option value="Other">Other 🐾</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Breed</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Golden Retriever"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Neutered Male">Neutered Male</option>
                    <option value="Spayed Female">Spayed Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="12.5"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Microchip ID</label>
                  <input
                    type="text"
                    value={microchip}
                    onChange={(e) => setMicrochip(e.target.value)}
                    placeholder="98514..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Chicken protein, Penicillin, etc."
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pre-existing Health Conditions</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Sensitive stomach, arthritis..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pet Profile Photo</label>
                <label className="flex items-center justify-center gap-2 w-full px-3 py-3 text-xs font-bold text-teal-700 dark:text-teal-300 border border-dashed border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 rounded-xl cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  <span className="truncate">{avatarFile ? avatarFile.name : 'Upload JPG, PNG, or WEBP'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : "Save Pet Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPetsPage;
