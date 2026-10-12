import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadCandidateResume,
  getCandidateResumes,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.get('/resumes', authenticate, getCandidateResumes);
router.post('/resumes', authenticate, uploadResume.single('resume'), uploadCandidateResume);

export default router;
