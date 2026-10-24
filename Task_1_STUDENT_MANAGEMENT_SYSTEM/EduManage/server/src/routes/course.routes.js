import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  getCourses,
  createCourse,
  getSubjects,
  createSubject
} from '../controllers/course.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

// Departments
router.get('/departments', verifyToken, getDepartments);
router.post('/departments', verifyToken, authorize('ADMIN'), createDepartment);

// Courses
router.get('/courses', verifyToken, getCourses);
router.post('/courses', verifyToken, authorize('ADMIN'), createCourse);

// Subjects
router.get('/subjects', verifyToken, getSubjects);
router.post('/subjects', verifyToken, authorize('ADMIN'), createSubject);

export default router;
