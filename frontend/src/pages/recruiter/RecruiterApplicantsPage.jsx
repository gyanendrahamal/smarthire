import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Award,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Send,
  Building,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Timeline from '../../components/common/Timeline';

export const RecruiterApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJobId, setSelectedJobId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected applicant for Review Drawer / Modal
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Schedule Interview Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [interviewMode, setInterviewMode] = useState('ONLINE');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/techhire-interview');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [instructions, setInstructions] = useState('Please have your IDE ready for a technical discussion.');
  const [scheduling, setScheduling] = useState(false);

  // Review note / status updating
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplications = async () => {
    try {
      const query = new URLSearchParams();
      if (selectedJobId !== 'ALL') query.append('jobId', selectedJobId);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);
      if (searchTerm) query.append('search', searchTerm);

      const [appsRes, jobsRes] = await Promise.all([
        api.get(`/recruiter/applications?${query.toString()}`),
        api.get('/recruiter/jobs'),
      ]);

      if (appsRes.success) setApplications(appsRes.applications);
      if (jobsRes.success) setJobs(jobsRes.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, statusFilter, searchTerm]);

  // Open applicant review modal and track genuine recruiter view
  const openReviewModal = async (id) => {
    setSelectedAppId(id);
    setLoadingApp(true);
    try {
      // Calling GET /api/recruiter/applications/:id triggers authentic view tracking!
      const res = await api.get(`/recruiter/applications/${id}`);
      if (res.success) {
        setSelectedApp(res.application);
      }
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApp(false);
    }
  };

  // Recruiter shortlists or updates application status
  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/recruiter/applications/${selectedApp.id}/status`, {
        status,
        note: statusNote || undefined,
      });
      if (res.success) {
        // Refresh open application and applications list
        const updated = await api.get(`/recruiter/applications/${selectedApp.id}`);
        if (updated.success) setSelectedApp(updated.application);
        setStatusNote('');
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Recruiter schedules interview
  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setScheduling(true);
    try {
      const payload = {
        applicationId: selectedApp.id,
        interviewDate,
        startTime,
        endTime,
        timezone: 'UTC',
        interviewMode,
        meetingLink: interviewMode === 'ONLINE' ? meetingLink : undefined,
        interviewLocation: interviewMode === 'IN_PERSON' ? interviewLocation : undefined,
        interviewerName,
        instructions,
      };

      const res = await api.post('/interviews', payload);
      if (res.success) {
        setIsScheduleModalOpen(false);
        // Refresh open application
        const updated = await api.get(`/recruiter/applications/${selectedApp.id}`);
        if (updated.success) setSelectedApp(updated.application);
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Interview scheduling failed');
    } finally {
      setScheduling(false);
    }
  };

  const handleDownloadResume = (appId) => {
    window.open(`/api/recruiter/applications/${appId}/resume`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Applicant Tracking & Review
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review candidates, track application views, shortlist profiles, and coordinate interviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Filter by Job */}
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Company Postings</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j._count?.applications || 0} apps)
            </option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted (New)</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="OFFER_EXTENDED">Offer Extended</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Not Selected</option>
        </select>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center shadow-card">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Applicants Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No candidate applications match the selected job or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {app.candidate?.fullName}
                  </h3>
                  <Badge status={app.status} />
                  {app.isViewed ? (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Viewed {app.viewCount}x (Last: {new Date(app.lastViewedAt).toLocaleDateString()})
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Unreviewed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Position: <strong className="text-slate-900">{app.job?.title}</strong> • Applied on{' '}
                  {new Date(app.appliedAt).toLocaleDateString()}
                </p>

                <p className="text-xs text-slate-500">
                  {app.candidate?.candidateProfile?.headline || app.candidate?.email}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openReviewModal(app.id)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Candidate Review Modal */}
      <Modal
        isOpen={!!selectedAppId}
        onClose={() => {
          setSelectedAppId(null);
          setSelectedApp(null);
        }}
        title="Candidate Profile & ATS Review"
        maxWidth="max-w-4xl"
      >
        {loadingApp || !selectedApp ? (
          <div className="p-12 text-center animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedApp.candidate?.fullName}
                  </h3>
                  <Badge status={selectedApp.status} size="lg" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Applying for <strong>{selectedApp.job?.title}</strong> • {selectedApp.candidate?.email} • {selectedApp.candidate?.phone || 'No phone'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedApp.resume && (
                  <button
                    onClick={() => handleDownloadResume(selectedApp.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume (PDF)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recruiter Action Bar: Core Flow Buttons */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                Recruiter Decision Actions:
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Shortlist Button */}
                <button
                  onClick={() => handleUpdateStatus('SHORTLISTED')}
                  disabled={updatingStatus || selectedApp.status === 'SHORTLISTED'}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{selectedApp.status === 'SHORTLISTED' ? 'Candidate Shortlisted ✓' : 'Shortlist Candidate'}</span>
                </button>

                {/* 2. Schedule Interview Button */}
                <button
                  onClick={() => {
                    setInterviewDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                    setIsScheduleModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Interview</span>
                </button>

                {/* 3. Offer Extended */}
                <button
                  onClick={() => handleUpdateStatus('OFFER_EXTENDED')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Extend Job Offer
                </button>

                {/* 4. Mark Hired */}
                <button
                  onClick={() => handleUpdateStatus('HIRED')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Mark as Hired 🎉
                </button>

                {/* 5. Reject */}
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Candidate Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Headline & Background
                </h4>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedApp.candidate?.candidateProfile?.headline || 'No headline set'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedApp.candidate?.candidateProfile?.bio || 'No bio submitted'}
                </p>
                <p className="text-xs text-slate-500">
                  📍 {selectedApp.candidate?.candidateProfile?.location || 'Remote'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Skills & Expertise
                </h4>
                {selectedApp.candidate?.candidateProfile?.skills ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedApp.candidate.candidateProfile.skills);
                        return parsed.map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            {s}
                          </span>
                        ));
                      } catch (e) {
                        return <span className="text-xs text-slate-600">{selectedApp.candidate.candidateProfile.skills}</span>;
                      }
                    })()}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No skills specified</span>
                )}
              </div>
            </div>

            {/* Cover letter */}
            {selectedApp.coverLetter && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Candidate Application Note
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {/* Timeline View */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Application Timeline & Views Log</h4>
              <Timeline
                events={selectedApp.events || []}
                currentStatus={selectedApp.status}
                applicationViews={selectedApp.views || []}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Interview with ${selectedApp?.candidate?.fullName}`}
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Interview Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Start Time
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Interview Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['ONLINE', 'IN_PERSON', 'TELEPHONE'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setInterviewMode(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    interviewMode === m
                      ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {interviewMode === 'ONLINE' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Video Meeting URL (Google Meet / Zoom)
              </label>
              <input
                type="url"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          )}

          {interviewMode === 'IN_PERSON' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Office Location / Room Address
              </label>
              <input
                type="text"
                required
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                placeholder="e.g. 500 Howard St, Floor 4, Meeting Room Alpha"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Interviewer Name / Title
            </label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins (Engineering VP)"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Instructions for Candidate
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Explain any prerequisites, portfolio review requirements, or agenda..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-500/20"
            >
              {scheduling ? 'Scheduling...' : 'Confirm & Dispatch Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterApplicantsPage;
