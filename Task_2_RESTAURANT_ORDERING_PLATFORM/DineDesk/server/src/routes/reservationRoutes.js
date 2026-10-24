import { Router } from 'express';
import {
  cancelMyReservation,
  createReservation,
  getMyReservations,
  getReservationById,
  getReservations,
  updateReservationStatus,
} from '../controllers/reservationController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

// Public / Customer booking with optional auth
router.post('/', optionalAuthenticate, createReservation);
router.get('/my', authenticate, getMyReservations);
router.patch('/:id/cancel', authenticate, cancelMyReservation);

// Admin & Staff management
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getReservations);
router.get('/:id', authenticate, getReservationById);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), updateReservationStatus);

export default router;
