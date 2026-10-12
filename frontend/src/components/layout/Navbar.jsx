import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CheckCheck,
  Calendar,
  ExternalLink,
  Shield,
  Building,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPortalLink = () => {
    if (!user) return '/jobs';
    if (user.role === 'CANDIDATE') return '/candidate/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/jobs';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-blue-900/40 bg-[#0a142c]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                TechHire
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35">
                ATS 2.0
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white">
            <Link to="/jobs" className="hover:text-amber-300 transition-colors">
              Find Jobs
            </Link>
            {isAuthenticated && user?.role === 'CANDIDATE' && (
              <>
                <Link to="/candidate/applications" className="hover:text-yellow-400 transition-colors">
                  My Applications
                </Link>
                <Link to="/candidate/interviews" className="hover:text-yellow-400 transition-colors">
                  Interviews
                </Link>
                <Link to="/candidate/saved" className="hover:text-yellow-400 transition-colors">
                  Saved Jobs
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'RECRUITER' && (
              <>
                <Link to="/recruiter/dashboard" className="hover:text-yellow-400 transition-colors">
                  Recruiter ATS
                </Link>
                <Link to="/recruiter/applicants" className="hover:text-yellow-400 transition-colors">
                  Applicants
                </Link>
                <Link to="/recruiter/post-job" className="text-amber-400 font-bold hover:text-yellow-300">
                  + Post a Job
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' ? (
              <Link to="/admin" className="text-amber-300 font-bold hover:text-yellow-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Console
              </Link>
            ) : (
              <Link to="/admin" className="text-amber-400 font-semibold hover:text-yellow-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Workflow
              </Link>
            )}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden z-50">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">
                          No notifications yet. You will be alerted when applications or interviews update.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={`p-3.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                              !n.isRead ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.fullName}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50">
                    <Link
                      to={getPortalLink()}
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    {user.role === 'CANDIDATE' && (
                      <Link
                        to="/candidate/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Resume
                      </Link>
                    )}
                    <Link
                      to="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      Admin Workflow Portal
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:text-amber-300 hover:bg-white/10 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
