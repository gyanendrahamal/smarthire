import express from 'express';
import {
  applyForJob,
  getCandidateApplications,
  getApplicationDetails,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

// Candidate endpoints
router.post(
  '/',
  authenticate,
  requireRole('CANDIDATE'),
  uploadResume.single('resumeFile'),
  applyForJob
);

router.get(
  '/my-applications',
  authenticate,
  requireRole('CANDIDATE'),
  getCandidateApplications
);

router.get(
  '/:id',
  authenticate,
  getApplicationDetails
);

router.patch(
  '/:id/withdraw',
  authenticate,
  requireRole('CANDIDATE'),
  withdrawApplication
);

export default router;
