import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/student.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getStudents);
router.get('/:id', verifyToken, getStudentById);
router.post('/', verifyToken, authorize('ADMIN'), createStudent);
router.put('/:id', verifyToken, authorize('ADMIN'), updateStudent);
router.delete('/:id', verifyToken, authorize('ADMIN'), deleteStudent);

export default router;
