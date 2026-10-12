import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, UserPlus, Info, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminQuickLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('admin@smarthire.com', 'Admin@123');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login as default administrator');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.user.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (res.user.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(
        err.message || 'Invalid email or password. Please verify your credentials or register a new account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-md shadow-amber-500/25 font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-amber-200 tracking-tight">
            Sign in to TechHire
          </h2>
          <p className="text-xs text-amber-300/70">
            Access your personalized ATS portal, applications, and recruiter pipeline
          </p>
        </div>

        {/* Default Admin Portal Quick Access */}
        <div className="p-4 rounded-2xl bg-[#1d1911] border border-amber-500/35 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Default Admin Workflow Portal
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              Evaluation
            </span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Quick 1-click access to inspect overall website workflows, ATS stages, and platform status.
          </p>
          <button
            type="button"
            onClick={handleAdminQuickLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Sign in as Default Admin (admin@smarthire.com)</span>
          </button>
        </div>

        {/* Notice: Register First Requirement */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <UserPlus className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>New user? Register your account first</span>
          </div>
          <p className="text-[11px] text-blue-800/80 leading-relaxed">
            Please register with your Name, Gmail/Email, and profile details to create your real Candidate or Recruiter account.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span>Create New Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Authentication Error</span>
            </div>
            <p>{error}</p>
            <div className="pt-1">
              <Link to="/register" className="text-rose-900 font-bold underline hover:no-underline text-[11px]">
                Don't have an account yet? Register here →
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
