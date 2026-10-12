import express from 'express';
import {
  scheduleInterview,
  respondToInterview,
  updateInterview,
  getCandidateInterviews,
} from '../controllers/interviewController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Candidate routes
router.get('/candidate', requireRole('CANDIDATE'), getCandidateInterviews);
router.patch('/:id/respond', requireRole('CANDIDATE'), respondToInterview);

// Recruiter routes
router.post('/', requireRole('RECRUITER', 'ADMIN'), scheduleInterview);
router.patch('/:id', requireRole('RECRUITER', 'ADMIN'), updateInterview);

export default router;
