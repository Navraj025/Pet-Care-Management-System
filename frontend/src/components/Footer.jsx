import React from 'react';
import { Heart, Mail, Phone, MapPin, ShieldCheck, Code } from 'lucide-react';
import { developerInfo } from '../config/developer';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">SmartPetCare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete, end-to-end cloud platform for veterinary centers, pet clinics, and professional grooming hubs.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>B.Tech Final Year Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/services" className="hover:text-teal-400 transition-colors">Our Services</a></li>
              <li><a href="/about" className="hover:text-teal-400 transition-colors">About Center</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Portal Login</a></li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Clinic Hours</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex justify-between"><span>Mon - Fri:</span> <span className="text-white font-medium">09:00 AM - 06:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span className="text-white font-medium">09:00 AM - 04:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span className="text-teal-400 font-medium">Emergency On-Call</span></li>
            </ul>
          </div>

          {/* Developer / Contact Details */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Developer & Contact</h4>
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-white flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-teal-400" />
                <span>Developed by {developerInfo.name}</span>
              </p>
              <div className="space-y-1 text-slate-300">
                <a href={developerInfo.telUrl} className="flex items-center space-x-2 hover:text-teal-400 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{developerInfo.formattedPhone}</span>
                </a>
                <a href={developerInfo.mailtoUrl} className="flex items-center space-x-2 hover:text-teal-400 transition-colors truncate">
                  <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{developerInfo.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Smart Pet Care System. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Designed & Built by</span>
            <strong className="text-slate-300">{developerInfo.name}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
