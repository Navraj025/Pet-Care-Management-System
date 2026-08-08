import React from 'react';
import { Heart, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

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
              <span>B.Tech Final Year Capstone Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/services" className="hover:text-teal-400 transition-colors">Our Services</a></li>
              <li><a href="/about" className="hover:text-teal-400 transition-colors">About Veterinary Center</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Portal Login</a></li>
              <li><a href="/register" className="hover:text-teal-400 transition-colors">Owner Registration</a></li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Clinic Working Hours</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex justify-between"><span>Mon - Fri:</span> <span className="text-white font-medium">09:00 AM - 06:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span className="text-white font-medium">09:00 AM - 04:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span className="text-teal-400 font-medium">Emergency On-Call</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>124 Healthcare Boulevard, Suite 400</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+1 (800) 555-PETS</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>contact@smartpetcare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smart Pet Care System. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed & Developed as B.Tech Final Year Software Engineering Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
