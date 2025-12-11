import { Router } from 'express';
import * as showController from '../controllers/showController';
import * as bookingController from '../controllers/bookingController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Shows
router.get('/shows', showController.getShows); // Public
router.get('/shows/:id', showController.getShow); // Public
router.post('/shows', authenticateToken, requireAdmin, showController.createShow); // Admin
router.delete('/shows/:id', authenticateToken, requireAdmin, showController.deleteShow); // Admin

// Bookings
router.post('/bookings/hold', authenticateToken, bookingController.holdSeats); // Auth User
router.post('/bookings/confirm', authenticateToken, bookingController.confirmBooking); // Auth User
router.post('/bookings/reset', authenticateToken, requireAdmin, bookingController.resetBookings); // Admin

export default router;
