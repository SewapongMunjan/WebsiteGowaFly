// server.js
const express = require('express');
const cors = require('cors'); // Only import cors ONCE here
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create Prisma instance and make it available globally
const prisma = new PrismaClient();
global.prisma = prisma;

// Configure CORS options
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Use cors with options here
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});