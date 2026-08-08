import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, FileText, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const PaymentsInvoicesPage = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, invRes] = await Promise.all([
          API.get('/payments'),
          API.get('/invoices')
        ]);
        setPayments(payRes.data);
        setInvoices(invRes.data);
      } catch (err) {
        console.error("Failed to load payments & invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Payments & Invoices</h2>
        <p className="text-xs text-slate-500">Track transaction history and view printable itemized receipts</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading billing records...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Payment History</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Payment records and printable receipts will appear here after appointment bookings.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Appointment / Service</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Invoice Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => {
                  const inv = invoices.find((i) => i.appointment_id === pay.appointment_id);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        Appointment #{pay.appointment_id}
                      </td>
                      <td className="p-4 text-slate-600">
                        {pay.payment_date ? pay.payment_date.slice(0, 10) : pay.created_at?.slice(0, 10)}
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{pay.payment_method.replace('_', ' ')}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{pay.transaction_id || 'Pending'}</td>
                      <td className="p-4 font-extrabold text-slate-900 text-sm">${pay.final_amount.toFixed(2)}</td>
                      <td className="p-4"><StatusBadge status={pay.status} /></td>
                      <td className="p-4 text-right">
                        {inv ? (
                          <Link
                            to={`/customer/invoices/${inv.id}`}
                            className="inline-flex items-center space-x-1 font-bold text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Invoice ({inv.invoice_number})</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400">No Invoice</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsInvoicesPage;
