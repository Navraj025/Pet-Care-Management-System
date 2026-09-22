import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/business-owner/payments');
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      showToast("Failed to load payments.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.final_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payments & Financial Invoices</h1>
          <p className="text-xs text-slate-500">Transaction history and earnings for your business</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2 rounded-2xl flex items-center space-x-2">
          <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Total Earnings</span>
            <span className="font-extrabold text-base text-emerald-700 dark:text-emerald-300">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Payments Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Payment receipts for completed appointments will be displayed here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Appointment ID</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-slate-100">{p.transaction_id || `TXN-${p.id}`}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">#{p.appointment_id}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{p.payment_method}</td>
                    <td className="p-4 text-slate-500">{p.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase ${
                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-teal-600 dark:text-teal-400 text-sm">
                      ₹{p.final_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPaymentsPage;
