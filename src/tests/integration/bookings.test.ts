import request from 'supertest';
import { app, testHotel, testRoom } from './setup';

describe('Bookings API', () => {
  describe('POST /api/bookings', () => {
    it('should create a pending booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      const checkOut = dayAfter.toISOString().split('T')[0];

      const bookingData = {
        userName: 'Test Guest',
        phone: '+251911111112',
        hotelId: testHotel.id,
        roomId: testRoom.id,
        checkIn,
        checkOut
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('next_step');

      const booking = response.body.data.booking;
      expect(booking.status).toBe('pending_payment');
      expect(booking.user.name).toBe('Test Guest');
      expect(booking.hotel.id).toBe(testHotel.id);
      expect(booking.room.id).toBe(testRoom.id);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          userName: '',
          phone: 'invalid',
          hotelId: testHotel.id,
          roomId: testRoom.id,
          checkIn: '2025-10-01',
          checkOut: '2025-10-02'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('should return 404 for non-existent hotel', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          userName: 'Test Guest',
          phone: '+251911111112',
          hotelId: '00000000-0000-0000-0000-000000000000',
          roomId: testRoom.id,
          checkIn: '2025-10-01',
          checkOut: '2025-10-02'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });
  });
});