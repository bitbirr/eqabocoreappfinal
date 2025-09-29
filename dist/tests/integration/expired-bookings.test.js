"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("./setup");
const models_1 = require("../../models");
const { ExpirePendingBookingsJob } = require('../../jobs/expirePending');
describe('Expired Bookings Job', () => {
    it('should expire pending bookings older than 15 minutes', async () => {
        // Create a booking with old created_at
        const bookingRepo = setup_1.dataSource.getRepository(models_1.Booking);
        const oldDate = new Date();
        oldDate.setMinutes(oldDate.getMinutes() - 20); // 20 minutes ago
        const expiredBooking = bookingRepo.create({
            user_id: setup_1.testUser.id,
            hotel_id: setup_1.testHotel.id,
            room_id: setup_1.testRoom.id,
            checkin_date: new Date('2025-10-01'),
            checkout_date: new Date('2025-10-02'),
            nights: 1,
            total_amount: 100,
            status: models_1.BookingStatus.PENDING_PAYMENT,
            created_at: oldDate
        });
        await bookingRepo.save(expiredBooking);
        // Execute the job
        const job = new ExpirePendingBookingsJob(setup_1.dataSource);
        const result = await job.executeJob();
        // Check that the booking was expired
        const updatedBooking = await bookingRepo.findOne({
            where: { id: expiredBooking.id }
        });
        expect(updatedBooking?.status).toBe(models_1.BookingStatus.EXPIRED);
        expect(result.success).toBe(true);
        expect(result.affectedRows).toBeGreaterThan(0);
    });
    it('should not expire recent pending bookings', async () => {
        // Create a booking with recent created_at
        const bookingRepo = setup_1.dataSource.getRepository(models_1.Booking);
        const recentDate = new Date();
        recentDate.setMinutes(recentDate.getMinutes() - 5); // 5 minutes ago
        const recentBooking = bookingRepo.create({
            user_id: setup_1.testUser.id,
            hotel_id: setup_1.testHotel.id,
            room_id: setup_1.testRoom.id,
            checkin_date: new Date('2025-10-01'),
            checkout_date: new Date('2025-10-02'),
            nights: 1,
            total_amount: 100,
            status: models_1.BookingStatus.PENDING_PAYMENT,
            created_at: recentDate
        });
        await bookingRepo.save(recentBooking);
        // Execute the job
        const job2 = new ExpirePendingBookingsJob(setup_1.dataSource);
        await job2.executeJob();
        // Check that the booking was not expired
        const updatedBooking = await bookingRepo.findOne({
            where: { id: recentBooking.id }
        });
        expect(updatedBooking?.status).toBe(models_1.BookingStatus.PENDING_PAYMENT);
    });
});
