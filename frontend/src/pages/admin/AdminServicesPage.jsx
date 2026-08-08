import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Edit, Trash2, Search } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Veterinary');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(65.0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchServices = async () => {
    try {
      const res = await API.get('/services?active_only=false');
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Veterinary');
    setDescription('');
    setDuration(30);
    setPrice(65.0);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description || '');
    setDuration(srv.duration_minutes);
    setPrice(srv.price);
    setIsActive(srv.is_active);
    setShowModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingService) {
        await API.put(`/services/${editingService.id}`, {
          name,
          category,
          description,
          duration_minutes: parseInt(duration),
          price: parseFloat(price),
          is_active: isActive
        });
        showSuccess(`Service '${name}' updated successfully!`);
      } else {
        await API.post('/services', {
          name,
          category,
          description,
          duration_minutes: parseInt(duration),
          price: parseFloat(price),
          is_active: isActive
        });
        showSuccess(`Service '${name}' created!`);
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      showError("Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Clinic Service Catalog</h2>
          <p className="text-xs text-slate-500">Configure medical, vaccination, dental, and grooming packages and pricing</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading services catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                    {srv.category}
                  </span>
                  <span className="font-extrabold text-slate-900 text-base">${srv.price.toFixed(2)}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{srv.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{srv.duration_minutes} mins</span>
                <button
                  onClick={() => openEditModal(srv)}
                  className="font-bold text-teal-600 hover:text-teal-800 flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingService ? "Edit Service" : "Create New Service"}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Health Checkup"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Veterinary">Veterinary</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Dental">Dental</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of clinical or grooming service..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="srvActive" className="text-xs font-semibold text-slate-800">
                  Active for Customer Online Booking
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
