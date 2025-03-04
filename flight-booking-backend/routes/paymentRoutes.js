// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Process payment (protected route)
router.post('/', auth, paymentController.processPayment);

// Get payment by booking ID (protected route)
router.get('/booking/:bookingId', auth, paymentController.getPaymentByBookingId);

module.exports = router;