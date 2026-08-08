import React from 'react';
import { Award, ShieldCheck, Heart, Users, Stethoscope, CheckCircle2, Code, Mail, Phone } from 'lucide-react';
import { developerInfo } from '../config/developer';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-xs font-bold text-teal-600 uppercase tracking-widest">About Our Center & Platform</h1>
        <h2 className="text-4xl font-extrabold text-slate-900">Dedicated to Extraordinary Pet Healthcare</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Smart Pet Care Center is a state-of-the-art veterinary clinic and pet wellness platform designed to bridge pet owners, licensed veterinarians, and grooming stylists through seamless digital healthcare management.
        </p>
      </div>

      {/* Core Values Grid */}
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

      {/* Professional Project Credits Section */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-bold">
              <Code className="w-3.5 h-3.5" />
              <span>PROJECT CREDITS & SPECIFICATION</span>
            </div>
            <h3 className="text-2xl font-extrabold">{developerInfo.projectName}</h3>
            <p className="text-xs text-slate-300">Final Year Software Engineering Project Architecture</p>
          </div>

          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">Lead Developer</span>
            <strong className="text-white text-sm">{developerInfo.name}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold uppercase tracking-wider block text-[10px]">Software Engineer</span>
            <p className="text-white font-bold">{developerInfo.name}</p>
            <p className="text-slate-400 text-[11px]">Full-Stack System Architect</p>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold uppercase tracking-wider block text-[10px]">Direct Contact</span>
            <p className="text-white">
              <a href={developerInfo.telUrl} className="hover:text-teal-300 transition-colors font-semibold">
                {developerInfo.formattedPhone}
              </a>
            </p>
            <p className="text-slate-400 text-[11px]">
              <a href={developerInfo.mailtoUrl} className="hover:text-teal-300 transition-colors">
                {developerInfo.email}
              </a>
            </p>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold uppercase tracking-wider block text-[10px]">Development Location</span>
            <p className="text-slate-200 leading-relaxed text-[11px]">
              Khanna, Punjab, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
