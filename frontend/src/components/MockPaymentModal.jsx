import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

const MockPaymentModal = ({ appointment, onSuccess, onClose }) => {
  const [method, setMethod] = useState('ONLINE_MOCK');
  const [cardName, setCardName] = useState('John Owner');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);
  const { showSuccess, showError } = useToast();

  const servicesList = appointment.appointment_services && appointment.appointment_services.length > 0
    ? appointment.appointment_services.map((as) => ({
        name: as.service?.name || 'Care Service',
        price: as.price_at_booking
      }))
    : appointment.service
    ? [{ name: appointment.service.name, price: appointment.service.price }]
    : [{ name: 'Veterinary Service', price: 4250 }];

  const serviceSubtotal = servicesList.reduce((acc, item) => acc + item.price, 0);
  const tax = Math.round(serviceSubtotal * 0.05 * 100) / 100;
  const total = Math.round((serviceSubtotal + tax) * 100) / 100;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await API.post('/payments/process', {
        appointment_id: appointment.id,
        payment_method: method,
        card_name: cardName,
        card_number_last4: cardNumber.slice(-4)
      });
      showSuccess(`Payment of ${formatCurrency(total)} completed successfully!`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error("Payment error:", err);
      showError(err.response?.data?.detail || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 transition-colors">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Secure Checkout</h3>
              <p className="text-xs text-teal-200">Mock Payment Gateway (INR ₹)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Appointment #{appointment.id} Breakdown
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pet: {appointment.pet?.name} ({appointment.pet?.species})
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded">
              {appointment.appointment_date} at {appointment.start_time}
            </span>
          </div>

          {/* Itemized Services */}
          <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-3">
            {servicesList.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">{formatCurrency(item.price)}</span>
              </div>
            ))}

            <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Subtotal Fee</span>
              <span>{formatCurrency(serviceSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Payable</span>
              <span className="text-teal-700 dark:text-teal-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('ONLINE_MOCK')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === 'ONLINE_MOCK'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Card (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === 'UPI'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CASH')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === 'CASH'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Pay at Clinic</span>
              </button>
            </div>
          </div>

          {method === 'ONLINE_MOCK' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Card Number (Mock)</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">CVV</label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'UPI' && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
              <p className="text-xs font-medium text-teal-800 dark:text-teal-200 mb-2">Scan QR Code or Enter UPI ID</p>
              <div className="w-28 h-28 bg-white border border-teal-300 mx-auto rounded-lg flex items-center justify-center p-2">
                <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-white text-[10px] text-center">
                  MOCK UPI QR CODE
                </div>
              </div>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-2">smartpetcare@upi</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {processing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Pay {formatCurrency(total)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MockPaymentModal;
