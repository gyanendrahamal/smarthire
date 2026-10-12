import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastNotification from './components/common/ToastNotification';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import BrowseJobsPage from './pages/public/BrowseJobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import CandidateInterviewsPage from './pages/candidate/CandidateInterviewsPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import PostJobPage from './pages/recruiter/PostJobPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'CANDIDATE') return <Navigate to="/candidate/dashboard" replace />;
    if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#0a1128] text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/jobs" element={<BrowseJobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Candidate Portal */}
                <Route
                  path="/candidate/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/applications"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <MyApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/interviews"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateInterviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/profile"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/saved"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <SavedJobsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Portal */}
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applicants"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <RecruiterApplicantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <RecruiterJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/post-job"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal & Default Workflow Inspector */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/companies"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminCompaniesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastNotification />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
