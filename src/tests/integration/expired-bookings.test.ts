import { dataSource, testUser, testHotel, testRoom } from './setup';
import { Booking, BookingStatus } from '../../models';
const { ExpirePendingBookingsJob } = require('../../jobs/expirePending');

describe('Expired Bookings Job', () => {
  it('should expire pending bookings older than 15 minutes', async () => {
    // Create a booking with old created_at
    const bookingRepo = dataSource.getRepository(Booking);

    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 20); // 20 minutes ago

    const expiredBooking = bookingRepo.create({
      user_id: testUser.id,
      hotel_id: testHotel.id,
      room_id: testRoom.id,
      checkin_date: new Date('2025-10-01'),
      checkout_date: new Date('2025-10-02'),
      nights: 1,
      total_amount: 100,
      status: BookingStatus.PENDING_PAYMENT,
      created_at: oldDate
    });

    await bookingRepo.save(expiredBooking);

    // Execute the job
    const job = new ExpirePendingBookingsJob(dataSource);
    const result = await job.executeJob();

    // Check that the booking was expired
    const updatedBooking = await bookingRepo.findOne({
      where: { id: expiredBooking.id }
    });

    expect(updatedBooking?.status).toBe(BookingStatus.EXPIRED);
    expect(result.success).toBe(true);
    expect(result.affectedRows).toBeGreaterThan(0);
  });

  it('should not expire recent pending bookings', async () => {
    // Create a booking with recent created_at
    const bookingRepo = dataSource.getRepository(Booking);

    const recentDate = new Date();
    recentDate.setMinutes(recentDate.getMinutes() - 5); // 5 minutes ago

    const recentBooking = bookingRepo.create({
      user_id: testUser.id,
      hotel_id: testHotel.id,
      room_id: testRoom.id,
      checkin_date: new Date('2025-10-01'),
      checkout_date: new Date('2025-10-02'),
      nights: 1,
      total_amount: 100,
      status: BookingStatus.PENDING_PAYMENT,
      created_at: recentDate
    });

    await bookingRepo.save(recentBooking);

    // Execute the job
    const job2 = new ExpirePendingBookingsJob(dataSource);
    await job2.executeJob();

    // Check that the booking was not expired
    const updatedBooking = await bookingRepo.findOne({
      where: { id: recentBooking.id }
    });

    expect(updatedBooking?.status).toBe(BookingStatus.PENDING_PAYMENT);
  });
});