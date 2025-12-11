import { Router } from 'express';
import * as showController from '../controllers/showController';
import * as bookingController from '../controllers/bookingController';

const router = Router();

// Shows
router.post('/shows', showController.createShow);
router.get('/shows', showController.getShows);
router.get('/shows/:id', showController.getShow);
router.delete('/shows/:id', showController.deleteShow);

// Bookings
router.post('/bookings/hold', bookingController.holdSeats);
router.post('/bookings/confirm', bookingController.confirmBooking);
router.post('/bookings/reset', bookingController.resetBookings);

export default router;
