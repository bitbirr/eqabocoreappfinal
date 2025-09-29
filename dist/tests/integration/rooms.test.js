"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
describe('Rooms API', () => {
    describe('GET /api/hotels/:id/rooms', () => {
        it('should return available rooms for a hotel with dates', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const checkin = tomorrow.toISOString().split('T')[0];
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            const checkout = dayAfter.toISOString().split('T')[0];
            const response = await (0, supertest_1.default)(setup_1.app)
                .get(`/api/hotels/${setup_1.testHotel.id}/rooms`)
                .query({ checkin, checkout })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('hotel');
            expect(response.body.data).toHaveProperty('available_rooms');
            expect(Array.isArray(response.body.data.available_rooms)).toBe(true);
            expect(response.body.data.available_rooms.length).toBeGreaterThan(0);
            const room = response.body.data.available_rooms[0];
            expect(room).toHaveProperty('id');
            expect(room).toHaveProperty('room_number');
            expect(room).toHaveProperty('status');
            expect(room.status).toBe('available');
            expect(room).toHaveProperty('total_amount');
        });
        it('should return 400 for invalid dates', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .get(`/api/hotels/${setup_1.testHotel.id}/rooms`)
                .query({ checkin: 'invalid', checkout: '2025-10-02' })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('BAD_REQUEST');
        });
        it('should return 404 for non-existent hotel', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .get('/api/hotels/00000000-0000-0000-0000-000000000000/rooms')
                .query({ checkin: '2025-10-01', checkout: '2025-10-02' })
                .expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('NOT_FOUND');
        });
    });
});
