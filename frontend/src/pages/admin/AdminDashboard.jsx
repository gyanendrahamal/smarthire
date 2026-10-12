import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Building,
  Briefcase,
  FileText,
  Video,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Server,
  Database,
  ExternalLink,
  Lock,
  LogIn,
  RefreshCw,
  Compass,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' | 'metrics' | 'services'
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Admin stats fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDefaultAdminLogin = async () => {
    setLoggingIn(true);
    try {
      await login('admin@smarthire.com', 'Admin@123');
      // After login, useEffect will fire and fetchAdminStats()
    } catch (err) {
      alert(err.message || 'Failed to authenticate default administrator');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminStats();
  };

  // If user is not logged in as ADMIN, show the Default Admin Portal Gateway
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-purple-800/40 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Default Administrator Portal</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Platform Workflow & Operations Inspector
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Welcome to the TechHire default administrator portal. This workspace provides comprehensive visibility into overall website workflows, candidate-to-hire pipelines, ATS stage transitions, and backend service telemetry.
              </p>
            </div>

            {/* Default Admin Credentials Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 max-w-lg space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Pre-Configured Default Admin Account</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Admin Email</span>
                  <span className="font-mono text-white font-bold select-all">admin@smarthire.com</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Security Role</span>
                  <span className="text-purple-300 font-bold">Chief Administrator</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleDefaultAdminLogin}
                disabled={loggingIn}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loggingIn ? 'Authenticating Admin...' : 'Enter Default Admin Console (1-Click)'}</span>
              </button>

              <Link
                to="/jobs"
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Live Jobs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Workflow Overview Preview */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">End-to-End TechHire Recruitment Workflow</h2>
              <p className="text-xs text-slate-500">How the platform coordinates candidate discovery, recruiter ATS management, and interviews.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-600">1. Candidate Portal</span>
              <p className="text-slate-600">Candidates register, build verified profiles, upload PDF resumes, and track applications with real-time views.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-indigo-600">2. Recruiter ATS Engine</span>
              <p className="text-slate-600">Recruiters publish jobs, review incoming applicants, screen resumes, and move candidates across Kanban stages.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-purple-600">3. Interview & Placement</span>
              <p className="text-slate-600">Schedule virtual interviews with video links, manage calendars, send instant alerts, and extend final job offers.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading System Workflow Telemetry...</p>
      </div>
    );
  }

  const { stats, workflow, recentUsers, recentApplications, recentJobs, recentInterviews } = data || {
    stats: {},
    workflow: { pipeline: [], services: [] },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-purple-300">
              Default Administrator Portal
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Live Workflow Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Overall Website Workflow & Governance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time status monitoring, candidate-to-placement pipeline verification, and system telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Refresh Workflow Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            Manage Users ({stats?.totalCandidates + stats?.totalRecruiters || 0})
          </Link>
          <Link
            to="/admin/companies"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs transition-all"
          >
            Verify Companies ({stats?.totalCompanies || 0})
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#12141c] border border-amber-900/40 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'workflow'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-amber-200/70 hover:text-amber-200'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Overall Website Workflow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-amber-200/70 hover:text-amber-200'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Key Metrics & Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-amber-200/70 hover:text-amber-200'
          }`}
        >
          <Server className="w-4 h-4 text-amber-400" />
          <span>System Architecture & Services</span>
        </button>
      </div>

      {/* TAB 1: OVERALL WEBSITE WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-8">
          {/* Quick Persona Testing Switcher */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Role Perspective Simulation</h3>
                <p className="text-xs text-slate-500">Jump directly into any user perspective to test workflows interactively.</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Interactive Testing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/jobs"
                className="p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Candidate Journey</span>
                  </div>
                  <p className="text-[11px] text-blue-700/80 mt-1">Browse open roles, apply with resume, review ATS stage updates.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/recruiter/dashboard"
                className="p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/80 transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Recruiter Journey</span>
                  </div>
                  <p className="text-[11px] text-indigo-700/80 mt-1">Review candidates, track views, update statuses, schedule interviews.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/recruiter/post-job"
                className="p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-50 border border-teal-200/80 transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-teal-900">
                    <Send className="w-4 h-4 text-teal-600" />
                    <span>Post Job Pipeline</span>
                  </div>
                  <p className="text-[11px] text-teal-700/80 mt-1">Publish new job openings with salaries, benefits, and location modes.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 7-STAGE PIPELINE TRACKER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">End-to-End Recruitment Pipeline Telemetry</h2>
                <p className="text-xs text-slate-500">Live tally of candidates, jobs, and applications progressing through the platform.</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 7 Stages Healthy</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflow?.pipeline?.map((stage) => (
                <div
                  key={stage.step}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between hover:border-purple-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                        {stage.step}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {stage.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                        {stage.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{stage.count}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{stage.subMetric}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <Link
                      to={stage.link}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
                    >
                      <span>{stage.linkLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Activity Streams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Registered Users */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent User Registrations</h3>
                <Link to="/admin/users" className="text-xs font-bold text-purple-600 hover:underline">
                  All Users →
                </Link>
              </div>

              <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-card divide-y divide-slate-100">
                {recentUsers?.map((u) => (
                  <div key={u.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{u.fullName}</h4>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Live Application Stream</h3>
                <span className="text-xs text-slate-400">Total: {stats?.totalApplications || 0}</span>
              </div>

              <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-card divide-y divide-slate-100">
                {recentApplications?.map((a) => (
                  <div key={a.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{a.candidate?.fullName}</h4>
                      <p className="text-slate-500">
                        Applied for <strong>{a.job?.title}</strong> ({a.job?.company?.companyName})
                      </p>
                    </div>
                    <span className="text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(a.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEY METRICS & TELEMETRY */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Candidates</span>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.totalCandidates || 0}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">{stats?.totalResumes || 0} resumes uploaded</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Recruiters</span>
              <div className="text-2xl font-black text-indigo-600 mt-2">{stats?.totalRecruiters || 0}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Active talent partners</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Companies</span>
              <div className="text-2xl font-black text-purple-600 mt-2">{stats?.totalCompanies || 0}</div>
              <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">{stats?.verifiedCompanies || 0} verified</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Jobs</span>
              <div className="text-2xl font-black text-blue-600 mt-2">{stats?.totalJobs || 0}</div>
              <span className="text-[11px] text-blue-600 mt-1 block font-semibold">{stats?.activeJobs || 0} active now</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Applications</span>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.totalApplications || 0}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">{stats?.submittedCount || 0} pending review</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Shortlisted</span>
              <div className="text-2xl font-black text-amber-600 mt-2">{stats?.shortlistedCount || 0}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Passed initial screen</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Interviews</span>
              <div className="text-2xl font-black text-purple-600 mt-2">{stats?.interviewsScheduled || 0}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Live video rounds</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hired Total</span>
              <div className="text-2xl font-black text-teal-600 mt-2">{stats?.hiredCount || 0}</div>
              <span className="text-[11px] text-teal-600 mt-1 block font-semibold">Workflow complete</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & ARCHITECTURE */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Platform Infrastructure Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {workflow?.services?.map((svc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{svc.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {svc.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    {svc.port && <p>Port: {svc.port}</p>}
                    <p>Protocol: {svc.protocol}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
