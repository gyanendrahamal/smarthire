import React from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  Award,
  XCircle,
  FileText,
  Video,
  UserCheck,
} from 'lucide-react';

const formatTimestamp = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const Timeline = ({ events = [], currentStatus, applicationViews = [] }) => {
  // Ordered standard milestones
  const stages = [
    { key: 'SUBMITTED', title: 'Application Submitted', icon: FileText },
    { key: 'VIEWED', title: 'Application Viewed', icon: Eye },
    { key: 'UNDER_REVIEW', title: 'Under Review', icon: Clock },
    { key: 'SHORTLISTED', title: 'Shortlisted for Consideration', icon: Award },
    { key: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', icon: Video },
    { key: 'INTERVIEW_COMPLETED', title: 'Interview Completed', icon: UserCheck },
    { key: 'OFFER_EXTENDED', title: 'Offer Extended', icon: Award },
    { key: 'HIRED', title: 'Hired 🎉', icon: CheckCircle2 },
  ];

  // Map events by type or find corresponding event
  const eventMap = {};
  events.forEach((ev) => {
    eventMap[ev.eventType] = ev;
  });

  // If viewed view records exist but no explicit VIEWED event
  const isViewed = applicationViews.length > 0 || !!eventMap['VIEWED'] || !!eventMap['RESUME_VIEWED'];
  const firstViewDate = applicationViews.length > 0 ? applicationViews[0].viewedAt : eventMap['VIEWED']?.eventTimestamp;

  const isRejected = currentStatus === 'REJECTED';
  const isWithdrawn = currentStatus === 'WITHDRAWN';

  // Find index of current status
  const currentStageIndex = stages.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-amber-900/50">
      {stages.map((stage, idx) => {
        let isDone = false;
        let isActive = false;
        let eventData = eventMap[stage.key];
        let timestamp = eventData ? formatTimestamp(eventData.eventTimestamp) : null;
        let note = null;

        if (eventData?.metadata) {
          try {
            const meta = typeof eventData.metadata === 'string' ? JSON.parse(eventData.metadata) : eventData.metadata;
            if (meta.note) note = meta.note;
            if (meta.interviewDate) {
              note = `${meta.interviewDate} at ${meta.startTime} (${meta.mode}) - ${meta.place || ''}`;
            }
          } catch (e) {
            // Keep plain note if not JSON
            if (typeof eventData.metadata === 'string') note = eventData.metadata;
          }
        }

        // Special handling for VIEWED stage
        if (stage.key === 'VIEWED') {
          if (isViewed) {
            isDone = true;
            timestamp = timestamp || formatTimestamp(firstViewDate);
            note = note || `Application opened by recruiter (${applicationViews.length || 1} view${applicationViews.length > 1 ? 's' : ''})`;
          }
        } else if (stage.key === 'SUBMITTED') {
          isDone = true;
        } else {
          // If stage has an explicit event or comes before current stage
          if (eventData) {
            isDone = true;
          } else if (currentStageIndex >= idx && !isRejected && !isWithdrawn) {
            isDone = true;
          }
        }

        if (currentStatus === stage.key) {
          isActive = true;
        }

        // Do not render stages past rejection/withdrawal
        if ((isRejected || isWithdrawn) && idx > 0 && !eventData && !isDone) {
          return null;
        }

        const Icon = stage.icon;

        return (
          <div key={stage.key} className="relative flex items-start gap-4 group">
            {/* Dot / Icon */}
            <div
              className={`relative z-10 flex items-center justify-center w-6 h-6 -ml-6 rounded-full border-2 transition-all ${
                isDone
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : isActive
                  ? 'bg-[#161922] border-amber-400 text-amber-300 ring-4 ring-amber-400/20'
                  : 'bg-[#161922] border-amber-900/60 text-amber-600/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Content Card */}
            <div
              className={`flex-1 p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-400/50 shadow-sm'
                  : isDone
                  ? 'bg-[#161922] border-amber-900/40'
                  : 'bg-[#12141c]/50 border-amber-950/40 opacity-60'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${isDone ? 'text-amber-200' : 'text-amber-400/70'}`}>
                  {stage.title}
                </span>
                {timestamp && (
                  <span className="text-xs text-amber-400/70 font-medium">
                    {timestamp}
                  </span>
                )}
              </div>

              {note && (
                <p className="mt-1 text-xs text-amber-200 bg-[#12141c] px-2 py-1 rounded border border-amber-900/40">
                  {note}
                </p>
              )}

              {isActive && (
                <span className="inline-block mt-2 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Current Status
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Terminal Rejection or Withdrawal Milestone if applicable */}
      {isRejected && (
        <div className="relative flex items-start gap-4">
          <div className="relative z-10 flex items-center justify-center w-6 h-6 -ml-6 rounded-full border-2 bg-rose-600 border-rose-600 text-white">
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 p-3.5 rounded-xl border bg-rose-50 border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-rose-900">Application Not Selected</span>
              {eventMap['REJECTED']?.eventTimestamp && (
                <span className="text-xs text-rose-600 font-medium">
                  {formatTimestamp(eventMap['REJECTED'].eventTimestamp)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-rose-700">
              The hiring team has concluded the review process for this role.
            </p>
          </div>
        </div>
      )}

      {isWithdrawn && (
        <div className="relative flex items-start gap-4">
          <div className="relative z-10 flex items-center justify-center w-6 h-6 -ml-6 rounded-full border-2 bg-slate-500 border-slate-500 text-white">
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 p-3.5 rounded-xl border bg-slate-100 border-slate-200">
            <span className="text-sm font-semibold text-slate-800">Application Withdrawn</span>
            <p className="mt-1 text-xs text-slate-600">Candidate withdrew this application.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
