// controllers/bookingController.js

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
      const { flightId, passengers, totalPrice } = req.body;
      const userId = req.user.id;
      
      // Use Prisma transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Check flight availability
        const flight = await prisma.flight.findUnique({
          where: { id: parseInt(flightId) },
        });
        
        if (!flight) {
          throw new Error('Flight not found');
        }
        
        if (flight.availableSeats < passengers.length) {
          throw new Error('Not enough seats available');
        }
        
        // Create booking
        const booking = await prisma.booking.create({
          data: {
            userId: parseInt(userId),
            flightId: parseInt(flightId),
            bookingDate: new Date(),
            totalPrice: parseFloat(totalPrice),
            status: 'Pending',
            passengers: {
              create: passengers.map(passenger => ({
                fullName: passenger.fullName,
                passportNumber: passenger.passportNumber,
                dateOfBirth: new Date(passenger.dateOfBirth),
                seatNumber: passenger.seatNumber,
              })),
            },
          },
          include: {
            passengers: true,
          },
        });
        
        // Update available seats
        await prisma.flight.update({
          where: { id: parseInt(flightId) },
          data: {
            availableSeats: flight.availableSeats - passengers.length,
          },
        });
        
        return booking;
      });
      
      res.status(201).json({
        message: 'Booking created successfully',
        bookingId: result.id,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: error.message || 'Failed to create booking' });
    }
  };
  
  // Get user bookings
  exports.getUserBookings = async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: parseInt(req.user.id),
        },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
            },
          },
          passengers: true,
          payments: true,
        },
        orderBy: {
          bookingDate: 'desc',
        },
      });
      
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  };
  
  // Get booking by ID
  exports.getBookingById = async (req, res) => {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: parseInt(req.user.id),
        },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
            },
          },
          passengers: true,
          payments: true,
        },
      });
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ message: 'Failed to fetch booking details' });
    }
  };
  
  // Cancel booking
  exports.cancelBooking = async (req, res) => {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // Check if booking exists and belongs to user
        const booking = await prisma.booking.findFirst({
          where: {
            id: parseInt(req.params.id),
            userId: parseInt(req.user.id),
          },
          include: {
            flight: true,
            passengers: true,
          },
        });
        
        if (!booking) {
          throw new Error('Booking not found');
        }
        
        if (booking.status === 'Canceled') {
          throw new Error('Booking is already cancelled');
        }
        
        // Update booking status
        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'Canceled' },
        });
        
        // Update available seats
        await prisma.flight.update({
          where: { id: booking.flightId },
          data: {
            availableSeats: booking.flight.availableSeats + booking.passengers.length,
          },
        });
        
        // Update payment status if exists
        const payment = await prisma.payment.findFirst({
          where: {
            bookingId: booking.id,
            paymentStatus: 'Completed',
          },
        });
        
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { paymentStatus: 'Refunded' },
          });
        }
        
        return updatedBooking;
      });
      
      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: error.message || 'Failed to cancel booking' });
    }
  };