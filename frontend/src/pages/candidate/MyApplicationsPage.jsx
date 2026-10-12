import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Building,
  Video,
  Send,
  User,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';
import Timeline from '../../components/common/Timeline';
import Modal from '../../components/common/Modal';
import CompanyLogo from '../../components/common/CompanyLogo';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected application for ATS detail modal
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Interview response state inside modal
  const [candidateNotes, setCandidateNotes] = useState('');
  const [respondingInterview, setRespondingInterview] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAppDetails = async (id) => {
    setSelectedAppId(id);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.success) {
        setSelectedApp(res.application);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleInterviewResponse = async (interviewId, response) => {
    setRespondingInterview(true);
    try {
      const res = await api.patch(`/interviews/${interviewId}/respond`, {
        response,
        candidateNotes,
      });
      if (res.success) {
        // Refresh detail
        const updated = await api.get(`/applications/${selectedAppId}`);
        if (updated.success) setSelectedApp(updated.application);
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Failed to update interview response');
    } finally {
      setRespondingInterview(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.patch(`/applications/${id}/withdraw`);
      if (res.success) {
        openAppDetails(id);
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Applicant Tracking System (ATS)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your candidacies in real time with genuine recruiter view logs, status milestones, and interview schedules.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center shadow-card">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Applications Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse open positions and submit your application to start tracking recruiter activity.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Info with Company Logo */}
              <div className="flex items-start gap-4 flex-1">
                <CompanyLogo
                  src={app.companyLogo}
                  name={app.companyName}
                  className="w-12 h-12 rounded-2xl flex-shrink-0 shadow-sm"
                />
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{app.jobTitle}</h3>
                    <Badge status={app.status} />
                    {app.interview && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Interview: {app.interview.interviewDate}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                    <span className="font-semibold text-slate-700">{app.companyName}</span>
                    <span>•</span>
                    <span>{app.location}</span>
                    <span>•</span>
                    <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Recruiter View Tracking Banner */}
                  {app.isViewed ? (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#121c38] to-[#0c1329] border border-blue-500/25 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold">
                          Viewed by Recruiter on{' '}
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(app.firstViewedAt || app.lastViewedAt))}
                        </span>
                        {app.viewCount > 1 && (
                          <span className="text-blue-700 ml-1.5 text-[11px]">
                            (Opened {app.viewCount} times)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                      Verified View
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Awaiting recruiter review. You will receive an instant notification once opened.</span>
                  </div>
                )}
              </div>
              </div>

              {/* Right Action */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3">
                <button
                  onClick={() => openAppDetails(app.id)}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>View Timeline & Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed ATS Tracking Modal */}
      <Modal
        isOpen={!!selectedAppId}
        onClose={() => {
          setSelectedAppId(null);
          setSelectedApp(null);
        }}
        title="Application Tracking & Recruitment Timeline"
        maxWidth="max-w-4xl"
      >
        {loadingDetail || !selectedApp ? (
          <div className="p-12 text-center animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Summary Banner */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedApp.job?.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedApp.job?.company?.companyName} • {selectedApp.job?.location}
                  </p>
                </div>
                <Badge status={selectedApp.status} size="lg" />
              </div>

              {/* Recruiter view stamp */}
              {selectedApp.isViewed ? (
                <div className="p-3 rounded-xl bg-blue-100/60 border border-blue-200 text-xs text-blue-900 font-medium">
                  👀 Your application was viewed by the recruiter on{' '}
                  <strong>
                    {new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(selectedApp.firstViewedAt))}
                  </strong>
                  . Total views logged: {selectedApp.viewCount}.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-600">
                  ⌛ Your application has not yet been opened by the recruiter.
                </div>
              )}
            </div>

            {/* Scheduled Interview Card (if any) */}
            {selectedApp.interviews?.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1438] to-[#0e1026] border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-slate-100 text-sm">
                      Interview Scheduled with Hiring Team
                    </h4>
                  </div>
                  <Badge status={selectedApp.interviews[0].candidateResponse} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200 bg-[#0c1329]/80 p-4 rounded-xl border border-purple-500/20">
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <strong className="text-slate-900 text-sm">
                      📅 {selectedApp.interviews[0].interviewDate} at {selectedApp.interviews[0].startTime}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Interview Mode:</span>
                    <Badge status={selectedApp.interviews[0].interviewMode} />
                  </div>

                  {selectedApp.interviews[0].meetingLink && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Meeting URL:</span>
                      <a
                        href={selectedApp.interviews[0].meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-bold underline truncate block"
                      >
                        {selectedApp.interviews[0].meetingLink}
                      </a>
                    </div>
                  )}

                  {selectedApp.interviews[0].interviewLocation && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Location:</span>
                      <strong>📍 {selectedApp.interviews[0].interviewLocation}</strong>
                    </div>
                  )}

                  {selectedApp.interviews[0].instructions && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Interviewer Instructions:</span>
                      <p className="mt-1 italic text-slate-600">
                        "{selectedApp.interviews[0].instructions}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Response Action Buttons */}
                <div className="p-4 rounded-xl bg-white border border-purple-100 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Your Response to Invitation:
                  </span>
                  <input
                    type="text"
                    placeholder="Optional message to interviewer (e.g. looking forward to it or preferred reschedule time)..."
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleInterviewResponse(selectedApp.interviews[0].id, 'ACCEPTED')}
                      disabled={respondingInterview}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      ✓ Confirm Attendance
                    </button>
                    <button
                      onClick={() => handleInterviewResponse(selectedApp.interviews[0].id, 'RESCHEDULE_REQUESTED')}
                      disabled={respondingInterview}
                      className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      Request Rescheduling
                    </button>
                    <button
                      onClick={() => handleInterviewResponse(selectedApp.interviews[0].id, 'DECLINED')}
                      disabled={respondingInterview}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Timeline Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">
                Recruitment Progress Timeline
              </h4>
              <Timeline
                events={selectedApp.events || []}
                currentStatus={selectedApp.status}
                applicationViews={selectedApp.views || []}
              />
            </div>

            {/* Cover Letter & Resume Attached */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Submitted Application Materials
              </h4>
              {selectedApp.coverLetter && (
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Cover Note:</span>
                  <p className="mt-1 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}
              {selectedApp.resume && (
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {selectedApp.resume.originalFilename}
                  </span>
                </div>
              )}
            </div>

            {/* Withdraw Button if still active */}
            {selectedApp.status !== 'WITHDRAWN' && selectedApp.status !== 'REJECTED' && (
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Need to cancel your candidacy?
                </span>
                <button
                  onClick={() => handleWithdraw(selectedApp.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  Withdraw Application
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplicationsPage;
