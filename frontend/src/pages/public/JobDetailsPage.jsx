import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Clock,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';
import Modal from '../../components/common/Modal';
import CompanyLogo from '../../components/common/CompanyLogo';
import { useAuth } from '../../contexts/AuthContext';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.success) {
          setJob(res.job);
        }
      } catch (err) {
        setError(err.message || 'Job not found');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Fetch candidate's existing resumes if logged in
  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      api.get('/auth/resumes').then((res) => {
        if (res.success && res.resumes?.length > 0) {
          setUserResumes(res.resumes);
          setSelectedResumeId(res.resumes[0].id);
        }
      });
    }
  }, [user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'CANDIDATE') {
      alert('Only candidates can submit job applications. Please log in as a candidate.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('coverLetter', coverLetter);

      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else if (selectedResumeId) {
        formData.append('resumeId', selectedResumeId);
      }

      const res = await api.upload('/applications', formData);
      if (res.success) {
        setApplySuccess(true);
        // Refresh job to update application status
        const updated = await api.get(`/jobs/${id}`);
        if (updated.success) setJob(updated.job);
      }
    } catch (err) {
      alert(err.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'This job posting does not exist.'}</p>
        <Link to="/jobs" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <CompanyLogo
              src={job.company?.logo}
              name={job.company?.companyName}
              className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-md"
            />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h1>
                <Badge status={job.workMode} />
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 font-medium">
                <span className="font-semibold text-slate-800">{job.company?.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span>{job.employmentType.replace('_', ' ')}</span>
                {job.salaryMin && job.salaryMax && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {job.application ? (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-900 block">
                  You Applied for this Role
                </span>
                <span className="text-[11px] text-blue-700 block mt-0.5">
                  Current Status: <strong className="uppercase">{job.application.status}</strong>
                </span>
                <Link
                  to="/candidate/applications"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Track in ATS</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : job.isExpired ? (
              <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs">
                Deadline Expired
              </div>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Apply for Position</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Deadline Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <DeadlineBadge deadline={job.applicationDeadline} />
          {job.vacancies > 1 && (
            <span className="text-xs text-slate-500 font-medium">
              👥 {job.vacancies} open vacancies
            </span>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Description & Requirements */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {job.requirements && (
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Key Qualifications & Skills</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Complete Company Profile & ATS Transparency */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">About the Employer</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <CompanyLogo
                src={job.company?.logo}
                name={job.company?.companyName}
                className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{job.company?.companyName}</h4>
                <p className="text-xs text-slate-500">{job.company?.industry}</p>
              </div>
            </div>

            {job.company?.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.company.description}
              </p>
            )}

            {/* Quick Company Facts */}
            <div className="p-4 rounded-2xl bg-[#0c152b] border border-blue-500/20 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Headquarters:</span>
                <span className="font-semibold text-white">📍 {job.company?.location || 'USA'}</span>
              </div>
              {job.company?.companySize && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Company Size:</span>
                  <span className="font-semibold text-white">👥 {job.company.companySize}</span>
                </div>
              )}
              {job.company?.foundedYear && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Founded:</span>
                  <span className="font-semibold text-white">📅 {job.company.foundedYear}</span>
                </div>
              )}
              {job.company?.website && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-medium">Official Site:</span>
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline truncate max-w-[160px] transition-colors"
                  >
                    {job.company.website.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>

            {/* Benefits & Perks */}
            {job.company?.benefits && (
              <div className="pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Employee Perks & Benefits
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {job.company.benefits.split(',').map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      ✓ {b.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121c38] to-[#0c1329] border border-blue-500/25 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>TechHire Transparency Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you submit your application:
            </p>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>You receive an alert the exact second a recruiter opens your resume.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Instant notifications for shortlisting & interview invites with date and time.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        {applySuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Application Submitted Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your application has been delivered to the hiring team at {job.company?.companyName}. You can now monitor recruiter view events and status updates in your ATS dashboard.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsApplyModalOpen(false);
                  navigate('/candidate/applications');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
              >
                Go to My Applications
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-6">
            {/* Resume Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select or Upload Resume (PDF)
              </label>

              {userResumes.length > 0 && !resumeFile && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-slate-500">Existing saved resumes:</p>
                  {userResumes.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedResumeId === r.id
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resumeChoice"
                        checked={selectedResumeId === r.id}
                        onChange={() => setSelectedResumeId(r.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-800">
                        {r.originalFilename}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Upload new option */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                <input
                  type="file"
                  id="resumeUpload"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="resumeUpload"
                  className="cursor-pointer inline-flex flex-col items-center gap-1.5"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-bold text-blue-600 hover:underline">
                    {resumeFile ? resumeFile.name : 'Upload a new PDF resume'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF up to 10MB</span>
                </label>
                {resumeFile && (
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="mt-2 text-[10px] text-rose-600 hover:underline block mx-auto"
                  >
                    Remove uploaded file
                  </button>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Application Message / Cover Letter
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are an ideal fit for this role, your relevant achievements, and availability..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default JobDetailsPage;
