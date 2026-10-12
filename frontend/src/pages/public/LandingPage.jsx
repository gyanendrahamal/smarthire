import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  Calendar,
  Sparkles,
  Building,
  TrendingUp,
  X,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';
import { useAuth } from '../../contexts/AuthContext';

const US_CITIES = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Denver, CO',
  'Chicago, IL',
  'Los Angeles, CA',
  'Remote (USA)',
];

const SUGGESTED_ROLES = [
  'Senior Full Stack Engineer',
  'Lead Frontend Architect',
  'Staff Backend Systems Engineer',
  'DevOps & Infrastructure Architect',
  'Machine Learning / AI Platform Engineer',
  'Senior Product UI/UX Designer',
  'Cloud Security & Zero-Trust Specialist',
  'FinTech Payments API Engineer',
];

export const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showRoleDrop, setShowRoleDrop] = useState(false);
  const [showCityDrop, setShowCityDrop] = useState(false);
  const heroRoleRef = useRef(null);
  const heroCityRef = useRef(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs?limit=6');
        if (res.success) {
          setFeaturedJobs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (heroRoleRef.current && !heroRoleRef.current.contains(e.target)) {
        setShowRoleDrop(false);
      }
      if (heroCityRef.current && !heroCityRef.current.contains(e.target)) {
        setShowCityDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (searchLocation) params.append('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#0f1f42] via-[#0b1733] to-[#0a1128]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/35">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TechHire Verified USA Opportunities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Recruitment with{' '}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                Absolute Transparency
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-2xl mx-auto">
              Find positions at verified tech companies across the USA. Track the exact moment recruiters open your application with zero guesswork.
            </p>

            {/* Job Search Input Bar with Autocomplete Dropdowns */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-2.5 rounded-3xl glass-panel shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-3xl mx-auto relative z-20"
            >
              {/* Title Input */}
              <div className="relative flex-1 w-full border-b sm:border-b-0 sm:border-r border-slate-200" ref={heroRoleRef}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Role (e.g. Full Stack, AI, DevOps)..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowRoleDrop(true);
                    }}
                    onFocus={() => setShowRoleDrop(true)}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {showRoleDrop && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-left z-30 max-h-56 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular US Roles
                    </div>
                    {SUGGESTED_ROLES.filter(r => !searchTerm || r.toLowerCase().includes(searchTerm.toLowerCase())).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setSearchTerm(role);
                          setShowRoleDrop(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors block"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Input */}
              <div className="relative flex-1 w-full" ref={heroCityRef}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Real US City (SF, NY, Austin, Remote)..."
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      setShowCityDrop(true);
                    }}
                    onFocus={() => setShowCityDrop(true)}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                  {searchLocation && (
                    <button type="button" onClick={() => setSearchLocation('')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {showCityDrop && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-left z-30 max-h-56 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Real USA Cities
                    </div>
                    {US_CITIES.filter(c => !searchLocation || c.toLowerCase().includes(searchLocation.toLowerCase())).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchLocation(city);
                          setShowCityDrop(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors block"
                      >
                        {city.includes('Remote') ? '🌐 ' : '📍 '} {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick City Filter Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Explore cities:</span>
              {['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote (USA)'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    navigate(`/jobs?location=${encodeURIComponent(city)}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold hover:border-blue-500 hover:text-blue-600 shadow-sm"
                >
                  {city.includes('Remote') ? '🌐 ' : '📍 '} {city}
                </button>
              ))}
            </div>

            {/* Quick Registration & Explorer CTA */}
            {!isAuthenticated && (
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="text-slate-400 font-medium">New to TechHire?</span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <span>Register Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Authentic Recruiter View Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No black holes. Receive a real-time notification with exact date & time when the hiring manager opens your application and resume.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Interview Scheduling</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Recruiters schedule interviews with date, time, mode, and Google Meet links. Candidates confirm or request reschedule in 1 click.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Application Status Timeline</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Follow every stage from Submitted, Under Review, Shortlisted, to Job Offer Extended with full event audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Opportunities in Top Tech Hubs
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Verified high-paying engineering, product, and AI roles at established companies.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Browse all 20+ jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden flex-shrink-0">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.companyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{job.company?.companyName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                          📍 {job.location}
                        </p>
                      </div>
                    </div>
                    <Badge status={job.workMode} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {job.employmentType.replace('_', ' ')}
                    </span>
                    {job.salaryMin && job.salaryMax && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / yr
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <DeadlineBadge deadline={job.applicationDeadline} />
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-blue-600 transition-colors"
                  >
                    View & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3 Role Portals Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Role-Based Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three Distinct Portals. One Centralized Platform.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Job Seekers track genuine application status, Recruiters manage postings and conduct live interviews, and Administrators monitor platform safety and company verifications.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/candidate/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Candidate Portal (/candidate)
              </Link>
              <Link
                to="/recruiter/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Recruiter Portal (/recruiter)
              </Link>
              <Link
                to="/admin/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-900 text-purple-200 border border-purple-700 hover:bg-purple-800 transition-colors"
              >
                Admin Portal (/admin)
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
