import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignSubjects
} from '../controllers/teacher.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getTeachers);
router.get('/:id', verifyToken, getTeacherById);
router.post('/', verifyToken, authorize('ADMIN'), createTeacher);
router.put('/:id', verifyToken, authorize('ADMIN'), updateTeacher);
router.delete('/:id', verifyToken, authorize('ADMIN'), deleteTeacher);
router.post('/:id/assign-subjects', verifyToken, authorize('ADMIN'), assignSubjects);

export default router;
