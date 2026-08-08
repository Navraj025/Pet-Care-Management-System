import React, { useState, useEffect } from 'react';
import { Search, Clock, DollarSign, Stethoscope, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['ALL', ...new Set(services.map((s) => s.category))];

  const filtered = services.filter((s) => {
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Our Service Catalog</h1>
        <h2 className="text-4xl font-extrabold text-slate-900">Veterinary & Grooming Services</h2>
        <p className="text-slate-600 text-sm">
          Browse specialized medical consultations, immunizations, dental care, and aesthetic grooming.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading service catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          No services matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-extrabold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                    {service.category}
                  </span>
                  <span className="text-xl font-black text-slate-900">${service.price.toFixed(2)}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{service.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{service.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{service.duration_minutes} mins duration</span>
                </div>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
