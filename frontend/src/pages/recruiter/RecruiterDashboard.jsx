import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Award,
  Video,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import CompanyLogo from '../../components/common/CompanyLogo';

export const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, appRes] = await Promise.all([
          api.get('/recruiter/dashboard'),
          api.get('/recruiter/applications'),
        ]);

        if (dashRes.success) setData(dashRes);
        if (appRes.success) setRecentApps(appRes.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  const { stats, company } = data || { stats: {}, company: {} };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Company Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <CompanyLogo
            src={company?.logo}
            name={company?.companyName}
            className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{company?.companyName}</h1>
              <Badge status={company?.verificationStatus} />
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {company?.industry} • {company?.location || 'San Francisco, CA'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/recruiter/post-job"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/recruiter/applicants"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs transition-all"
          >
            Manage Applicants
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Jobs</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats?.activeJobs || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Applications</span>
          <div className="text-2xl font-black text-blue-600 mt-2">{stats?.totalApplications || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats?.pendingReview || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Shortlisted</span>
          <div className="text-2xl font-black text-indigo-600 mt-2">{stats?.shortlisted || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Interviews</span>
          <div className="text-2xl font-black text-purple-600 mt-2">{stats?.interviewsScheduled || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Hired</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats?.hired || 0}</div>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Candidate Applications</h2>
          <Link to="/recruiter/applicants" className="text-xs font-bold text-blue-600 hover:underline">
            View all applicants
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500">
            No applications received yet. Share your job postings to start receiving candidates.
          </div>
        ) : (
          <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-card divide-y divide-slate-100">
            {recentApps.slice(0, 6).map((app) => (
              <div
                key={app.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    {app.candidate?.fullName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{app.candidate?.fullName}</h4>
                    <p className="text-[11px] text-slate-500">
                      Applied for <strong className="text-slate-700">{app.job?.title}</strong> on{' '}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {app.isViewed ? (
                    <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                      <Eye className="w-3 h-3" /> Viewed
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Unread
                    </span>
                  )}
                  <Badge status={app.status} />
                  <Link
                    to="/recruiter/applicants"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-blue-600 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
