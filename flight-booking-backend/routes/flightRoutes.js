// routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Get all flights
router.get('/', flightController.getAllFlights);

// Search flights
router.get('/search', flightController.searchFlights);

// Get flight by ID
router.get('/:id', flightController.getFlightById);

module.exports = router;