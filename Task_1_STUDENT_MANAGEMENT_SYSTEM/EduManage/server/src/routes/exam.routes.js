import { Router } from 'express';
import {
  getExams,
  createExam,
  submitExamMarks,
  getStudentResults
} from '../controllers/exam.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getExams);
router.post('/', verifyToken, authorize('ADMIN', 'TEACHER'), createExam);
router.post('/:examId/results', verifyToken, authorize('ADMIN', 'TEACHER'), submitExamMarks);
router.get('/student/:studentId', verifyToken, getStudentResults);

export default router;
