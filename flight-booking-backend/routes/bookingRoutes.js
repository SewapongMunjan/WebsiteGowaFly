// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Create a new booking (protected route)
router.post('/', auth, bookingController.createBooking);

// Get user bookings (protected route)
router.get('/user', auth, bookingController.getUserBookings);

// Get booking by ID (protected route)
router.get('/:id', auth, bookingController.getBookingById);

// Cancel booking (protected route)
router.put('/:id/cancel', auth, bookingController.cancelBooking);

module.exports = router;