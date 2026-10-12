import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  toggleSaveJob,
  getSavedJobs,
} from '../controllers/jobController.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public / optional auth
router.get('/', optionalAuth, getJobs);
router.get('/saved', authenticate, requireRole('CANDIDATE'), getSavedJobs);
router.get('/:id', optionalAuth, getJobById);

// Candidate save/unsave
router.post('/:id/save', authenticate, requireRole('CANDIDATE'), toggleSaveJob);

// Recruiter / Admin job management
router.post('/', authenticate, requireRole('RECRUITER', 'ADMIN'), createJob);
router.patch('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), updateJob);

export default router;
