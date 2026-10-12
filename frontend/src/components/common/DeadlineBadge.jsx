import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export const DeadlineBadge = ({ deadline, showDays = true }) => {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
        <Clock className="w-3.5 h-3.5" /> No deadline specified
      </span>
    );
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffTime < 0;

  const formattedDate = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-500" />
        Applications Closed ({formattedDate})
      </span>
    );
  }

  const isUrgent = diffDays <= 3;

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        Closes: {formattedDate}
      </span>
      {showDays && (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            isUrgent
              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse-subtle'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {diffDays === 0 ? 'Closes Today!' : diffDays === 1 ? '1 day left' : `${diffDays} days left`}
        </span>
      )}
    </div>
  );
};

export default DeadlineBadge;
