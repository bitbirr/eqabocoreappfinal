"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
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
                hotelId: setup_1.testHotel.id,
                roomId: setup_1.testRoom.id,
                checkIn,
                checkOut
            };
            const response = await (0, supertest_1.default)(setup_1.app)
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
            expect(booking.hotel.id).toBe(setup_1.testHotel.id);
            expect(booking.room.id).toBe(setup_1.testRoom.id);
        });
        it('should return 400 for invalid data', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/bookings')
                .send({
                userName: '',
                phone: 'invalid',
                hotelId: setup_1.testHotel.id,
                roomId: setup_1.testRoom.id,
                checkIn: '2025-10-01',
                checkOut: '2025-10-02'
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('BAD_REQUEST');
        });
        it('should return 404 for non-existent hotel', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/bookings')
                .send({
                userName: 'Test Guest',
                phone: '+251911111112',
                hotelId: '00000000-0000-0000-0000-000000000000',
                roomId: setup_1.testRoom.id,
                checkIn: '2025-10-01',
                checkOut: '2025-10-02'
            })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('NOT_FOUND');
        });
    });
});
