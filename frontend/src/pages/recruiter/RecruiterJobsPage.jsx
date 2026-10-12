import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Users, Calendar, Clock, Edit } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/recruiter/jobs');
        if (res.success) {
          setJobs(res.jobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Job Postings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your published vacancies, check applicants, and monitor closing dates.
          </p>
        </div>
        <Link
          to="/recruiter/post-job"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center shadow-card">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Jobs Published Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click 'Create New Listing' to post your company's open opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <Badge status={job.workMode} />
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800">
                    {job._count?.applications || 0} applicants
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Location: {job.location} • Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>

                <DeadlineBadge deadline={job.applicationDeadline} />
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/recruiter/applicants?jobId=${job.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Applicants</span>
                </Link>
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Public View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
