import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateAccountStatus,
  getAdminCompanies,
  updateCompanyVerification,
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateAccountStatus);
router.get('/companies', getAdminCompanies);
router.patch('/companies/:id/verification', updateCompanyVerification);

export default router;
