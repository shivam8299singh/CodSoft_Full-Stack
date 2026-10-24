import { Router } from 'express';
import { getAdminDashboard, getTeacherDashboard, getStudentDashboard } from '../controllers/dashboard.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/admin', verifyToken, authorize('ADMIN'), getAdminDashboard);
router.get('/teacher', verifyToken, authorize('TEACHER', 'ADMIN'), getTeacherDashboard);
router.get('/student', verifyToken, authorize('STUDENT', 'ADMIN'), getStudentDashboard);

export default router;
