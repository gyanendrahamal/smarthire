import React from 'react';
import { Briefcase, Heart, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#060b18] text-slate-200 text-sm border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">TechHire</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transparent, modern applicant tracking and intelligent tech recruitment connecting world-class engineering talent with innovative teams.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Real-time Recruiter View Tracking Active</span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">For Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Explore Opportunities</Link></li>
              <li><Link to="/candidate/applications" className="hover:text-white transition-colors">Track Applications (ATS)</Link></li>
              <li><Link to="/candidate/interviews" className="hover:text-white transition-colors">Interview Calendar</Link></li>
              <li><Link to="/candidate/profile" className="hover:text-white transition-colors">Resume & Profile</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">For Recruiters</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
              <li><Link to="/recruiter/post-job" className="hover:text-white transition-colors">Post Opportunities</Link></li>
              <li><Link to="/recruiter/applicants" className="hover:text-white transition-colors">Manage Applicants</Link></li>
              <li><Link to="/recruiter/interviews" className="hover:text-white transition-colors">Interview Scheduling</Link></li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Security & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Role-Based Access Control
              </li>
              <li>Encrypted Resume Storage</li>
              <li>Transparent Recruiter Activity Logs</li>
              <li>Prisma + Relational Database</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TechHire Systems. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern React, Express, Prisma & Socket.IO
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
