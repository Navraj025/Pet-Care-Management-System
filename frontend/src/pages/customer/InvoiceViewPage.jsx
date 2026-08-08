import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link to="/customer/payments" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
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
      <div id="printable-invoice" className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg space-y-8 text-slate-800">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-700 text-white rounded-2xl flex items-center justify-center font-bold">
              <Heart className="w-7 h-7 fill-current text-teal-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight text-slate-900">Smart Pet Care & Vet Center</h2>
              <p className="text-xs text-slate-500">124 Healthcare Boulevard, Suite 400, Tech City</p>
              <p className="text-xs text-slate-500">Phone: +1 (800) 555-PETS | contact@smartpetcare.com</p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-black text-2xl text-teal-800 tracking-tight">OFFICIAL INVOICE</h3>
            <p className="text-xs font-mono font-bold text-slate-700 mt-1">{invoice.invoice_number}</p>
            <p className="text-xs text-slate-400">Issue Date: {invoice.issue_date}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Customer & Owner</span>
            <p className="font-bold text-slate-900 text-sm">{appt?.customer?.user?.full_name}</p>
            <p className="text-slate-500">{appt?.customer?.user?.email}</p>
            <p className="text-slate-500">{appt?.customer?.address}</p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Patient Details</span>
            <p className="font-bold text-slate-900 text-sm">{appt?.pet?.name} ({appt?.pet?.species})</p>
            <p className="text-slate-500">Breed: {appt?.pet?.breed || 'N/A'}</p>
            <p className="text-slate-500">Microchip: {appt?.pet?.microchip_id || 'N/A'}</p>
          </div>
        </div>

        {/* Appointment Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Line Items</h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Attending Vet</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-bold text-slate-900">{appt?.service?.name}</td>
                <td className="p-3 text-slate-500">{appt?.service?.category}</td>
                <td className="p-3 text-slate-600">{appt?.staff?.user?.full_name}</td>
                <td className="p-3 text-right font-bold text-slate-900">${payment?.amount?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Calculations */}
        <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Fee</span>
              <span>${payment?.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5.0%)</span>
              <span>${payment?.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 text-base pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span className="text-teal-800">${invoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex justify-between items-center text-xs text-teal-900">
          <div>
            <span className="font-bold block">Payment Status: {payment?.status}</span>
            <span className="text-[11px] text-teal-700">Transaction ID: {payment?.transaction_id || 'MOCK-TXN'}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-teal-600" />
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100">
          Thank you for trusting Smart Pet Care & Veterinary Center with your pet's healthcare.
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage;
