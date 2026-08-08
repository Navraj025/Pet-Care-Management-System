import React from 'react';
import { Award, ShieldCheck, Heart, Users, Stethoscope, CheckCircle2 } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-xs font-bold text-teal-600 uppercase tracking-widest">About Our Center</h1>
        <h2 className="text-4xl font-extrabold text-slate-900">Dedicated to Extraordinary Pet Healthcare</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Smart Pet Care Center is a state-of-the-art veterinary clinic and pet wellness platform designed to bridge pet owners, licensed veterinarians, and grooming stylists through seamless digital healthcare management.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Compassionate Care</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every patient is treated like family with gentle handling, stress-free environments, and individualized treatment protocols.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Clinical Precision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our medical staff utilizes electronic diagnostic health records, vaccination schedule algorithms, and automated prescription systems.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Full Transparency</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pet owners enjoy instant online access to complete medical histories, vaccination statuses, itemized invoices, and doctor notes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
