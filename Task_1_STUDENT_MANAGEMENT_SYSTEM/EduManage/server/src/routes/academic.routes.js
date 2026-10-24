import { Router } from 'express';
import { getStudentAcademicRecords, createAcademicRecord } from '../controllers/academic.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/student/:studentId', verifyToken, getStudentAcademicRecords);
router.post('/', verifyToken, authorize('ADMIN'), createAcademicRecord);

export default router;
