import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Eye,
  Calendar,
  Bookmark,
  CheckCircle,
  ArrowRight,
  Clock,
  Video,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';
import { useAuth } from '../../contexts/AuthContext';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, intRes, savedRes] = await Promise.all([
          api.get('/applications/my-applications'),
          api.get('/interviews/candidate'),
          api.get('/jobs/saved'),
        ]);

        if (appRes.success) setApplications(appRes.applications);
        if (intRes.success) setInterviews(resInterviews(intRes.interviews));
        if (savedRes.success) setSavedJobs(savedRes.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const resInterviews = (items) => items || [];
    fetchDashboardData();
  }, []);

  const viewedCount = applications.filter((a) => a.isViewed).length;
  const activeInterviews = interviews.filter((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-teal-200">
            Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
            Your ATS dashboard tracks recruiter views in real time, organizes interview invitations, and monitors application deadlines.
          </p>
        </div>
        <Link
          to="/jobs"
          className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all self-start md:self-auto flex items-center gap-2"
        >
          <span>Browse Open Roles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Apps</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{applications.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total submitted applications</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Views</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">{viewedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Viewed by hiring teams</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{activeInterviews.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Upcoming interviews</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-600">{savedJobs.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">In your shortlist</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications (ATS Status)</h2>
            <Link to="/candidate/applications" className="text-xs font-bold text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">You haven't submitted any applications yet.</p>
              <Link to="/jobs" className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                Find Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{app.jobTitle}</h3>
                      <p className="text-xs text-slate-500">{app.companyName} • {app.location}</p>
                    </div>
                    <Badge status={app.status} />
                  </div>

                  {/* Recruiter View Timestamp Indicator */}
                  {app.isViewed ? (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        Application viewed by recruiter!
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        {new Date(app.lastViewedAt).toLocaleDateString()} ({app.viewCount}x)
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Submitted {new Date(app.appliedAt).toLocaleDateString()} — pending initial recruiter review
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <DeadlineBadge deadline={app.isDeadlinePassed ? null : app.appliedAt} showDays={false} />
                    <Link
                      to="/candidate/applications"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Track Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Interviews</h2>
            <Link to="/candidate/interviews" className="text-xs font-bold text-blue-600 hover:underline">
              View calendar
            </Link>
          </div>

          {activeInterviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No interviews scheduled yet. Once you are shortlisted and scheduled, the date, time, and location will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {activeInterviews.map((int) => (
                <div
                  key={int.id}
                  className="p-5 rounded-2xl bg-white border border-purple-200 shadow-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {int.interviewMode}
                    </span>
                    <Badge status={int.candidateResponse} />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {int.application?.job?.title || 'Job Interview'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {int.application?.job?.company?.companyName}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 text-xs text-purple-900 space-y-1">
                    <div className="font-bold">
                      📅 {int.interviewDate} at {int.startTime}
                    </div>
                    {int.meetingLink && (
                      <div className="truncate">
                        🔗 <a href={int.meetingLink} target="_blank" rel="noreferrer" className="text-purple-700 underline font-medium">
                          {int.meetingLink}
                        </a>
                      </div>
                    )}
                    {int.interviewLocation && (
                      <div>📍 {int.interviewLocation}</div>
                    )}
                  </div>

                  <Link
                    to="/candidate/interviews"
                    className="block text-center py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
                  >
                    Respond / View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
