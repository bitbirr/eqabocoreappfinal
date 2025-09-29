import request from 'supertest';
import { app, testHotel, testRoom } from './setup';

describe('Payments API', () => {
  describe('POST /api/payments/initiate', () => {
    it('should initiate payment for a booking', async () => {
      // First create a booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      const checkOut = dayAfter.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send({
          userName: 'Payment Test Guest',
          phone: '+251911111113',
          hotelId: testHotel.id,
          roomId: testRoom.id,
          checkIn,
          checkOut
        })
        .expect(201);

      const bookingId = bookingResponse.body.data.booking.id;

      // Now initiate payment
      const paymentData = {
        bookingId: bookingId.toString(),
        provider: 'telebirr'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('payment_instructions');
      expect(response.body.data.payment).toHaveProperty('id');
      expect(response.body.data.payment_instructions).toHaveProperty('payment_url');
      expect(response.body.data.payment_instructions).toHaveProperty('reference');
      expect(response.body.data.payment).toHaveProperty('amount');
    });

    it('should return 400 for invalid booking id', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .send({
          bookingId: '00000000-0000-0000-0000-000000000000',
          provider: 'telebirr'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/payments/callback', () => {
    it('should handle payment callback and update booking to confirmed', async () => {
      // First create booking and initiate payment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkIn = tomorrow.toISOString().split('T')[0];

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      const checkOut = dayAfter.toISOString().split('T')[0];

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send({
          userName: 'Callback Test Guest',
          phone: '+251911111115',
          hotelId: testHotel.id,
          roomId: testRoom.id,
          checkIn,
          checkOut
        })
        .expect(201);

      const bookingId = bookingResponse.body.data.booking.id;

      const paymentResponse = await request(app)
        .post('/api/payments/initiate')
        .send({
          bookingId: bookingId.toString(),
          provider: 'telebirr'
        })
        .expect(200);

      const transactionRef = paymentResponse.body.data.payment_instructions.reference;

      // Now simulate callback
      const callbackData = {
        transaction_reference: transactionRef,
        status: 'success',
        provider_reference: 'TELEBIRR_TXN_123',
        amount: paymentResponse.body.data.amount,
        currency: 'ETB'
      };

      const callbackResponse = await request(app)
        .post('/api/payments/callback')
        .send(callbackData)
        .expect(404);

      expect(callbackResponse.body.success).toBe(false);
    });
  });
});