import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Building, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DeadlineBadge from '../../components/common/DeadlineBadge';

export const SavedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/jobs/saved');
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.post(`/jobs/${id}/save`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Job Opportunities
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Keep track of positions you want to apply for before the closing deadline.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center shadow-card">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Saved Jobs</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse open jobs and click the bookmark icon to save them to your shortlist.
          </p>
          <Link to="/jobs" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                  <Badge status={job.workMode} />
                </div>
                <p className="text-xs text-slate-600">
                  {job.company?.companyName} • {job.location}
                </p>
                <DeadlineBadge deadline={job.applicationDeadline} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRemove(job.id)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
