import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (val) => {
    switch (val?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'PENDING':
      case 'UPCOMING':
      case 'CHECKED_IN':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'IN_PROGRESS':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'CANCELLED':
      case 'FAILED':
      case 'OVERDUE':
      case 'NO_SHOW':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'REFUNDED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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
