import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  ShieldCheck,
  CheckCircle,
  Globe,
  Users,
} from 'lucide-react';
import api from '../../services/api';

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

const COMMON_BENEFITS = [
  '401(k) 5% Match',
  'Comprehensive Medical/Dental/Vision',
  'Unlimited Paid Time Off (PTO)',
  '$2,500 Home Office & Tech Stipend',
  'Company Equity / Stock Grants',
  'Annual Learning & Conference Budget',
  'Paid Parental Leave (16 Weeks)',
  'Wellness & Gym Membership',
];

export const PostJobPage = () => {
  const navigate = useNavigate();

  // Company details
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('San Francisco, CA');
  const [industry, setIndustry] = useState('Enterprise Cloud & Distributed Systems');
  const [companySize, setCompanySize] = useState('250 - 500 employees');
  const [foundedYear, setFoundedYear] = useState('2018');
  const [website, setWebsite] = useState('https://technova.io');
  const [companyDescription, setCompanyDescription] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState([
    '401(k) 5% Match',
    'Comprehensive Medical/Dental/Vision',
    'Unlimited Paid Time Off (PTO)',
    '$2,500 Home Office & Tech Stipend',
  ]);

  // Job details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('San Francisco, CA');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('140000');
  const [salaryMax, setSalaryMax] = useState('180000');
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ yrs)');
  const [requirements, setRequirements] = useState('');
  const [vacancies, setVacancies] = useState(1);
  const [applicationDeadline, setApplicationDeadline] = useState(
    new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing company profile
  useEffect(() => {
    api.get('/recruiter/company').then((res) => {
      if (res.success && res.company) {
        setCompanyName(res.company.companyName || '');
        if (res.company.location) setCompanyLocation(res.company.location);
        if (res.company.industry) setIndustry(res.company.industry);
        if (res.company.companySize) setCompanySize(res.company.companySize);
        if (res.company.foundedYear) setFoundedYear(res.company.foundedYear);
        if (res.company.website) setWebsite(res.company.website);
        if (res.company.description) setCompanyDescription(res.company.description);
        if (res.company.benefits) {
          setSelectedBenefits(res.company.benefits.split(',').map((b) => b.trim()));
        }
      }
    }).catch((err) => console.warn(err));
  }, []);

  const handleToggleBenefit = (benefit) => {
    if (selectedBenefits.includes(benefit)) {
      setSelectedBenefits(selectedBenefits.filter((b) => b !== benefit));
    } else {
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a job title.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a job description or role overview.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update company profile with full recruiter information
      try {
        await api.patch('/recruiter/company', {
          companyName,
          location: companyLocation,
          industry,
          companySize,
          foundedYear,
          website,
          description: companyDescription,
          benefits: selectedBenefits.join(', '),
        });
      } catch (companyErr) {
        console.warn('Company profile sync note:', companyErr);
      }

      // Safe date parsing
      let formattedDeadline = null;
      if (applicationDeadline) {
        const parsed = new Date(applicationDeadline);
        if (!isNaN(parsed.getTime())) {
          formattedDeadline = parsed.toISOString();
        }
      }

      // 2. Publish Job
      const res = await api.post('/jobs', {
        title: title.trim(),
        description: description.trim(),
        location: jobLocation,
        workMode,
        employmentType,
        salaryMin: salaryMin && !isNaN(Number(salaryMin)) ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax && !isNaN(Number(salaryMax)) ? parseFloat(salaryMax) : null,
        experienceLevel,
        requirements: requirements ? requirements.trim() : '',
        vacancies: vacancies && !isNaN(Number(vacancies)) ? Math.max(1, parseInt(vacancies, 10)) : 1,
        applicationDeadline: formattedDeadline,
        status: 'PUBLISHED',
      });

      if (res.success) {
        navigate('/recruiter/dashboard');
      }
    } catch (err) {
      let detailedMsg = err.message || 'Job creation failed';
      if (err.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
        detailedMsg = err.data.errors.map((e) => `${e.field}: ${e.message}`).join(' • ');
      } else if (err.data?.message) {
        detailedMsg = err.data.message;
      }
      setErrorMessage(detailedMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Employer Transparency Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Publish a New Job Listing
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Recruiters must provide complete company intelligence, authentic USA location details, and comprehensive compensation for candidate transparency.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold underline ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: FULL COMPANY INFORMATION */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Full Company Information</h2>
              <p className="text-xs text-slate-500">Provide complete information so candidates understand your mission and scale.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TechNova Cloud Solutions"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Headquarters (Real USA City & State) *
              </label>
              <select
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {US_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Industry Domain *
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Enterprise Cloud & Distributed Systems"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Company Size *
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                <option value="50 - 150 employees">50 - 150 employees</option>
                <option value="150 - 300 employees">150 - 300 employees</option>
                <option value="300 - 600 employees">300 - 600 employees</option>
                <option value="600 - 1,200 employees">600 - 1,200 employees</option>
                <option value="1,200 - 2,500 employees">1,200 - 2,500 employees</option>
                <option value="5,000+ employees">5,000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Founded Year *
              </label>
              <input
                type="text"
                required
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2017"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Official Company Website *
            </label>
            <input
              type="url"
              required
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Company Mission & Overview *
            </label>
            <textarea
              rows={3}
              required
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your company's mission, market leadership, and the problems you solve..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Perks & Benefits Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Company Perks & Benefits (Select all offered)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_BENEFITS.map((b) => (
                <label
                  key={b}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                    selectedBenefits.includes(b)
                      ? 'bg-blue-50/70 border-blue-400 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBenefits.includes(b)}
                    onChange={() => handleToggleBenefit(b)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: JOB VACANCY DETAILS */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Job Opportunity Details</h2>
              <p className="text-xs text-slate-500">Specify requirements, location mode, and competitive compensation.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer (React & Distributed Node)"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Work City / Location *
              </label>
              <select
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                {US_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Work Mode *
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                <option value="REMOTE">Remote (Work From Anywhere)</option>
                <option value="HYBRID">Hybrid Office</option>
                <option value="ON_SITE">On-Site Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Employment Type *
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Salary Min ($ / yr)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="140000"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Salary Max ($ / yr)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="180000"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Vacancies Count
              </label>
              <input
                type="number"
                min="1"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Closing Deadline
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Role Description & Mission *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the daily responsibilities, technical challenges, and growth opportunities..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Requirements & Qualifications
            </label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="- 5+ years of software development in modern React and Node.js
- Strong database architecture and query optimization
- Hands-on experience with cloud infrastructure (AWS/GCP, Docker, CI/CD)"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-amber-900/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-950/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs disabled:opacity-50 shadow-md shadow-amber-500/25 transition-all"
            >
              {submitting ? 'Publishing...' : 'Publish Job & Update Company Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJobPage;
