import { Router } from 'express';
import { login, getMe, forgotPassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', verifyToken, getMe);

export default router;
