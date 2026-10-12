import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, MapPin, Building, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/candidate');
      if (res.success) {
        setInterviews(res.interviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleRespond = async (id, response) => {
    try {
      const res = await api.patch(`/interviews/${id}/respond`, {
        response,
        candidateNotes: notes[id] || '',
      });
      if (res.success) {
        fetchInterviews();
      }
    } catch (err) {
      alert(err.message || 'Failed to update interview response');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scheduled Interviews
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review interview dates, meeting links, instructions, and respond to invitations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center shadow-card">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Interviews Scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">
            When recruiters shortlist you and schedule an interview, all details will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {interviews.map((int) => (
            <div
              key={int.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {int.application?.job?.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {int.application?.job?.company?.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={int.interviewMode} />
                  <Badge status={int.candidateResponse} />
                </div>
              </div>

              {/* Schedule details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Date & Time</span>
                  <strong className="text-slate-900 text-sm">
                    📅 {int.interviewDate} at {int.startTime}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Interviewer</span>
                  <span className="font-semibold text-slate-900">
                    {int.interviewerName || int.scheduler?.fullName || 'Hiring Lead'}
                  </span>
                </div>

                {int.meetingLink && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Online Meeting URL</span>
                    <a
                      href={int.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold truncate block mt-0.5"
                    >
                      {int.meetingLink}
                    </a>
                  </div>
                )}

                {int.interviewLocation && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="font-semibold text-slate-900">
                      📍 {int.interviewLocation}
                    </span>
                  </div>
                )}

                {int.instructions && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Preparation Instructions</span>
                    <p className="text-slate-600 italic mt-0.5">
                      "{int.instructions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Attendance confirmation buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional message for recruiter..."
                  value={notes[int.id] || ''}
                  onChange={(e) => setNotes({ ...notes, [int.id]: e.target.value })}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(int.id, 'ACCEPTED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() => handleRespond(int.id, 'RESCHEDULE_REQUESTED')}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleRespond(int.id, 'DECLINED')}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewsPage;
