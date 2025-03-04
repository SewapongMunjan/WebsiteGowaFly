// controllers/flightController.js

// Get all flights
exports.getAllFlights = async (req, res) => {
    try {
      const flights = await prisma.flight.findMany({
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      
      res.json(flights);
    } catch (error) {
      console.error('Error fetching flights:', error);
      res.status(500).json({ message: 'Failed to fetch flights' });
    }
  };
  
  // Search flights
  exports.searchFlights = async (req, res) => {
    try {
      const { departure, arrival, date, passengers = 1 } = req.query;
      
      // Build the query
      const where = {
        availableSeats: {
          gte: parseInt(passengers),
        },
      };
      
      if (departure) {
        where.OR = [
          {
            departureAirport: {
              airportCode: departure,
            },
          },
          {
            departureAirport: {
              city: {
                contains: departure,
              },
            },
          },
        ];
      }
      
      if (arrival) {
        where.OR = [
          {
            arrivalAirport: {
              airportCode: arrival,
            },
          },
          {
            arrivalAirport: {
              city: {
                contains: arrival,
              },
            },
          },
        ];
      }
      
      if (date) {
        const searchDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.departureTime = {
          gte: searchDate,
          lt: nextDay,
        };
      }
      
      const flights = await prisma.flight.findMany({
        where,
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      
      res.json(flights);
    } catch (error) {
      console.error('Error searching flights:', error);
      res.status(500).json({ message: 'Failed to search flights' });
    }
  };
  
  // Get flight by ID
  exports.getFlightById = async (req, res) => {
    try {
      const flight = await prisma.flight.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      
      res.json(flight);
    } catch (error) {
      console.error('Error fetching flight:', error);
      res.status(500).json({ message: 'Failed to fetch flight details' });
    }
  };