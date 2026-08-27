import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const InvoiceViewPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        console.error("Failed to load invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Generating invoice view...</div>;
  }

  if (!invoice) {
    return <div className="py-20 text-center text-slate-500 text-sm">Invoice not found.</div>;
  }

  const appt = invoice.appointment;
  const payment = invoice.payment;

  const lineItems = appt?.appointment_services && appt.appointment_services.length > 0
    ? appt.appointment_services.map((as) => ({
        id: as.id,
        name: as.service?.name || 'Care Service',
        category: as.service?.category || 'General',
        price: as.price_at_booking,
        duration: as.duration_minutes
      }))
    : appt?.service
    ? [{ id: appt.service.id, name: appt.service.name, category: appt.service.category, price: payment?.amount || appt.service.price, duration: appt.service.duration_minutes }]
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <Link to="/customer/payments" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-8 text-slate-800 dark:text-slate-200 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-700 text-white rounded-2xl flex items-center justify-center font-bold">
              <Heart className="w-7 h-7 fill-current text-teal-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">Smart Pet Care & Vet Center</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">124 Healthcare Boulevard, Suite 400, Tech City, MH</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phone: +91 98765 43210 | contact@smartpetcare.com</p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-black text-2xl text-teal-800 dark:text-teal-400 tracking-tight">OFFICIAL INVOICE</h3>
            <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">{invoice.invoice_number}</p>
            <p className="text-xs text-slate-400">Issue Date: {invoice.issue_date}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Customer & Owner</span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{appt?.customer?.user?.full_name}</p>
            <p className="text-slate-500 dark:text-slate-400">{appt?.customer?.user?.email}</p>
            <p className="text-slate-500 dark:text-slate-400">{appt?.customer?.address}</p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Patient Details</span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{appt?.pet?.name} ({appt?.pet?.species})</p>
            <p className="text-slate-500 dark:text-slate-400">Breed: {appt?.pet?.breed || 'N/A'}</p>
            <p className="text-slate-500 dark:text-slate-400">Microchip: {appt?.pet?.microchip_id || 'N/A'}</p>
          </div>
        </div>

        {/* Appointment Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Line Items</h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Attending Vet</th>
                <th className="p-3 text-right">Amount (Price at booking)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{appt?.staff?.user?.full_name}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Calculations */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal Fee</span>
              <span>{formatCurrency(payment?.amount || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax (5.0%)</span>
              <span>{formatCurrency(payment?.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 text-base pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Amount</span>
              <span className="text-teal-800 dark:text-teal-400">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex justify-between items-center text-xs text-teal-900 dark:text-teal-200">
          <div>
            <span className="font-bold block">Payment Status: {payment?.status}</span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400">Transaction ID: {payment?.transaction_id || 'MOCK-TXN'}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100 dark:border-slate-800">
          Thank you for trusting Smart Pet Care & Veterinary Center with your pet's healthcare.
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage;
