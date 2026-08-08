import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess("Message dispatched! Clinic staff will contact you shortly.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Get In Touch</h1>
        <h2 className="text-4xl font-extrabold text-slate-900">We're Here to Help</h2>
        <p className="text-slate-600 text-sm">
          Have questions about your pet's appointment or our veterinary services? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white p-8 lg:p-10 rounded-3xl space-y-8 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold mb-2">Clinic Information</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Visit our central healthcare facility or reach out via emergency phone lines.
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold">Clinic Address</h4>
                <p className="text-xs text-slate-300">124 Healthcare Boulevard, Suite 400, Tech City</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold">Phone Lines</h4>
                <p className="text-xs text-slate-300">+91 9855900577 / Emergency: +1 (800) 555-9999</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold">Email Inquiry</h4>
                <p className="text-xs text-slate-300">navrajdeveshwar025@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for contacting Smart Pet Care. Our front desk staff will respond within 2 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Send a Direct Message</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Appointment inquiry / Medical record question"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write your query here..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
