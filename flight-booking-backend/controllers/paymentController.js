// controllers/paymentController.js
const pool = require('../config/db');

// Process payment
exports.processPayment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { booking_id, payment_method, amount } = req.body;
    
    // Check if booking exists and belongs to user
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [booking_id, req.user.id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const booking = bookings[0];
    
    // Check if payment already exists
    const [existingPayments] = await connection.query(
      'SELECT * FROM payments WHERE booking_id = ? AND payment_status != ?',
      [booking_id, 'Refunded']
    );
    
    if (existingPayments.length > 0) {
      return res.status(400).json({ message: 'Payment already exists for this booking' });
    }
    
    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway
    const paymentStatus = Math.random() > 0.1 ? 'Completed' : 'Failed';
    
    // Create payment record
    const [payment] = await connection.query(
      'INSERT INTO payments (booking_id, payment_method, payment_status, transaction_date, amount) VALUES (?, ?, ?, NOW(), ?)',
      [booking_id, payment_method, paymentStatus, amount]
    );
    
    // Update booking status if payment is successful
    if (paymentStatus === 'Completed') {
      await connection.query(
        'UPDATE bookings SET status = ? WHERE booking_id = ?',
        ['Confirmed', booking_id]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      message: paymentStatus === 'Completed' ? 'Payment successful' : 'Payment failed',
      payment_id: payment.insertId,
      payment_status: paymentStatus
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// Get payment by booking ID
exports.getPaymentByBookingId = async (req, res) => {
  try {
    // Check if booking belongs to user
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [req.params.bookingId, req.user.id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Get payment info
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ?',
      [req.params.bookingId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};