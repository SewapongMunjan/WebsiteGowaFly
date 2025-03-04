// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed airports
  const airports = [
    { airportName: 'Suvarnabhumi Airport', airportCode: 'BKK', city: 'Bangkok', country: 'Thailand' },
    { airportName: 'Changi Airport', airportCode: 'SIN', city: 'Singapore', country: 'Singapore' },
    { airportName: 'Narita Airport', airportCode: 'NRT', city: 'Tokyo', country: 'Japan' },
    { airportName: 'Heathrow Airport', airportCode: 'LHR', city: 'London', country: 'UK' },
    { airportName: 'Los Angeles Airport', airportCode: 'LAX', city: 'Los Angeles', country: 'USA' },
    { airportName: 'Dubai Airport', airportCode: 'DXB', city: 'Dubai', country: 'UAE' },
    { airportName: 'Sydney Airport', airportCode: 'SYD', city: 'Sydney', country: 'Australia' },
    { airportName: 'Hong Kong Airport', airportCode: 'HKG', city: 'Hong Kong', country: 'Hong Kong' },
    { airportName: 'Incheon Airport', airportCode: 'ICN', city: 'Seoul', country: 'South Korea' },
    { airportName: 'Frankfurt Airport', airportCode: 'FRA', city: 'Frankfurt', country: 'Germany' }
  ];

  // Seed flights
  const flights = [
    { airline: 'Thai Air', flightNumber: 'TG102', departureAirportId: 1, arrivalAirportId: 2, departureTime: new Date('2025-02-10T08:00:00'), arrivalTime: new Date('2025-02-10T11:00:00'), price: 3500.00, availableSeats: 120 },
    { airline: 'Singapore Airlines', flightNumber: 'SQ201', departureAirportId: 2, arrivalAirportId: 3, departureTime: new Date('2025-02-11T09:00:00'), arrivalTime: new Date('2025-02-11T17:00:00'), price: 7800.00, availableSeats: 180 },
    // Add remaining flights...
  ];

  // Create airports
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { airportCode: airport.airportCode },
      update: {},
      create: airport,
    });
  }

  // Create flights
  for (const flight of flights) {
    await prisma.flight.create({
      data: flight,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });