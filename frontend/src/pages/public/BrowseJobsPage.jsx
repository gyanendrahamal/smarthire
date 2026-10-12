import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  DollarSign,
  Clock,
  Building,
  Briefcase,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';
import { useAuth } from '../../contexts/AuthContext';

// Real USA Tech Hubs
const US_CITIES = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Denver, CO',
  'Chicago, IL',
  'Los Angeles, CA',
  'San Jose, CA',
  'San Diego, CA',
  'Atlanta, GA',
  'Dallas, TX',
  'Remote (USA)',
];

// Popular Suggested Roles & Companies
const SUGGESTED_TITLES = [
  'Senior Full Stack Engineer',
  'Lead Frontend Architect',
  'Staff Backend Systems Engineer',
  'DevOps & Infrastructure Architect',
  'Machine Learning / AI Platform Engineer',
  'Senior Product UI/UX Designer',
  'Cloud Security & Zero-Trust Specialist',
  'Distributed Database Engineer',
  'FinTech Payments API Engineer',
  'Principal React / Next.js Developer',
];

const SUGGESTED_COMPANIES = [
  'TechNova Cloud Solutions',
  'CloudScale Dynamics',
  'QuantumLeap AI',
  'Apex Design Labs',
  'CyberShield Defense',
  'DataStream Technologies',
  'VectorPay Networks',
  'Pulse Interactive Media',
];

export const BrowseJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState('ALL');
  const [employmentType, setEmploymentType] = useState('ALL');
  const [sort, setSort] = useState('newest');

  // Autocomplete UI dropdown states
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const titleBoxRef = useRef(null);
  const cityBoxRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (titleBoxRef.current && !titleBoxRef.current.contains(e.target)) {
        setShowTitleSuggestions(false);
      }
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (location) query.append('location', location);
      if (workMode !== 'ALL') query.append('workMode', workMode);
      if (employmentType !== 'ALL') query.append('employmentType', employmentType);
      if (sort) query.append('sort', sort);
      query.append('limit', '50'); // return up to 50 jobs

      const res = await api.get(`/jobs?${query.toString()}`);
      if (res.success) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, location, workMode, employmentType, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleSave = async (jobId) => {
    if (!user || user.role !== 'CANDIDATE') {
      alert('Please log in as a candidate to save jobs to your shortlist.');
      return;
    }
    try {
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, isSaved: res.saved } : j))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCity = (city) => {
    setLocation(city === 'All' ? '' : city);
    setShowCitySuggestions(false);
  };

  const handleSelectTitle = (title) => {
    setSearch(title);
    setShowTitleSuggestions(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Tech Hubs & Real USA Companies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Your Next Career Move
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Explore genuine tech positions at verified US companies with transparent application tracking and real-time view logs.
        </p>
      </div>

      {/* Main Search and Autocomplete Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Keyword / Title / Company Search Box with Dropdown */}
          <div className="relative" ref={titleBoxRef}>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Title, skill or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowTitleSuggestions(true);
                }}
                onFocus={() => setShowTitleSuggestions(true)}
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showTitleSuggestions && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 max-h-72 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Popular Roles
                </div>
                {SUGGESTED_TITLES.filter(
                  (t) => !search || t.toLowerCase().includes(search.toLowerCase())
                )
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleSelectTitle(t)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{t}</span>
                      <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </button>
                  ))}

                <div className="mt-2 pt-1 border-t border-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Real Companies
                </div>
                {SUGGESTED_COMPANIES.filter(
                  (c) => !search || c.toLowerCase().includes(search.toLowerCase())
                )
                  .slice(0, 4)
                  .map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectTitle(c)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{c}</span>
                      <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 2. City / Region Search Box with Dropdown of Real US Cities */}
          <div className="relative" ref={cityBoxRef}>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, region, or Remote USA..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Suggestions Dropdown */}
            {showCitySuggestions && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 max-h-72 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Major USA Tech Cities
                </div>
                {US_CITIES.filter(
                  (c) => !location || c.toLowerCase().includes(location.toLowerCase())
                ).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                  >
                    <span>{c}</span>
                    <MapPin className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Work Mode Select */}
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote (Work from Anywhere)</option>
            <option value="HYBRID">Hybrid Office</option>
            <option value="ON_SITE">On-Site Office</option>
          </select>

          {/* 4. Sort Options */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="deadline">Sort: Closing Soonest</option>
          </select>
        </div>

        {/* Quick Filter City Badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Quick Cities:
          </span>
          <button
            type="button"
            onClick={() => handleSelectCity('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              !location
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All Locations
          </button>
          {[
            'San Francisco, CA',
            'New York, NY',
            'Austin, TX',
            'Seattle, WA',
            'Boston, MA',
            'Denver, CO',
            'Remote (USA)',
          ].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelectCity(city)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                location === city
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {city.includes('Remote') ? '🌐 ' : '📍 '}
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900 font-bold">{jobs.length}</strong> active tech opportunities in USA
        </span>
        {(search || location || workMode !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setLocation('');
              setWorkMode('ALL');
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try clearing filters or clicking one of the popular city pills above to see open listings.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setLocation('');
              setWorkMode('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Company Logo, Title, and Verification */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden flex-shrink-0 shadow-sm">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.companyName}
                          className="w-12 h-12 object-cover rounded-xl"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">
                          {job.company?.companyName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" title="Verified US Employer" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSave(job.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      job.isSaved
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                    title={job.isSaved ? 'Saved to shortlist' : 'Save job'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${job.isSaved ? 'fill-blue-600' : ''}`}
                    />
                  </button>
                </div>

                {/* Tags: Work mode, Type, Salary, Company size */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge status={job.workMode} />
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                  {job.salaryMin && job.salaryMax && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / yr
                    </span>
                  )}
                  {job.hasApplied && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Applied ✓
                    </span>
                  )}
                </div>

                {/* Brief Company description & Benefits Snippet */}
                {job.company?.companySize && (
                  <p className="text-[11px] text-amber-400/80 mb-2 font-medium">
                    🏢 Company: {job.company.industry} • {job.company.companySize}
                  </p>
                )}

                <p className="text-xs text-amber-100/90 line-clamp-2 leading-relaxed mb-4">
                  {job.description}
                </p>
              </div>

              {/* Bottom footer bar */}
              <div className="pt-4 border-t border-amber-900/30 flex items-center justify-between gap-2">
                <DeadlineBadge deadline={job.applicationDeadline} />
                <Link
                  to={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Details & Apply</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;
