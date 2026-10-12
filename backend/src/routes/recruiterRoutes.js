import express from 'express';
import {
  getRecruiterDashboardStats,
  getRecruiterJobs,
  getRecruiterApplications,
  viewApplication,
  updateApplicationStatus,
  viewResumeFile,
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/recruiterController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('RECRUITER', 'ADMIN'));

router.get('/dashboard', getRecruiterDashboardStats);
router.get('/company', getCompanyProfile);
router.patch('/company', updateCompanyProfile);
router.get('/jobs', getRecruiterJobs);
router.get('/applications', getRecruiterApplications);
router.get('/applications/:id', viewApplication);
router.post('/applications/:id/view', viewApplication);
router.patch('/applications/:id/status', updateApplicationStatus);
router.get('/applications/:id/resume', viewResumeFile);

export default router;
