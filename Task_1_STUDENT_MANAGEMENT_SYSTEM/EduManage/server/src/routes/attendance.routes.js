import { Router } from 'express';
import {
  getAttendance,
  markAttendanceBatch,
  getStudentAttendance
} from '../controllers/attendance.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getAttendance);
router.post('/', verifyToken, authorize('ADMIN', 'TEACHER'), markAttendanceBatch);
router.get('/student/:studentId', verifyToken, getStudentAttendance);

export default router;
