import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (val) => {
    switch (val?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING':
      case 'UPCOMING':
      case 'CHECKED_IN':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'CANCELLED':
      case 'FAILED':
      case 'OVERDUE':
      case 'NO_SHOW':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'REFUNDED':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
