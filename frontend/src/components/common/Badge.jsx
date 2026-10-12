import React from 'react';

const statusConfig = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  INTERVIEW_COMPLETED: { label: 'Interview Completed', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  OFFER_EXTENDED: { label: 'Offer Extended', bg: 'bg-teal-50 text-teal-800 border-teal-300 font-semibold' },
  HIRED: { label: 'Hired 🎉', bg: 'bg-green-100 text-green-800 border-green-300 font-bold' },
  REJECTED: { label: 'Not Selected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  WITHDRAWN: { label: 'Withdrawn', bg: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Modes
  ONLINE: { label: 'Online Video', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  IN_PERSON: { label: 'In-Person', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  TELEPHONE: { label: 'Phone Call', bg: 'bg-zinc-100 text-zinc-700 border-zinc-200' },

  // Response
  ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DECLINED: { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  PENDING: { label: 'Pending Response', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESCHEDULE_REQUESTED: { label: 'Reschedule Requested', bg: 'bg-orange-50 text-orange-700 border-orange-200' },

  // Verification
  VERIFIED: { label: 'Verified', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export const Badge = ({ status, customLabel, size = 'md', className = '' }) => {
  const config = statusConfig[status] || {
    label: customLabel || status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {customLabel || config.label}
    </span>
  );
};

export default Badge;
