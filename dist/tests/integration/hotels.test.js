"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
describe('Hotels API', () => {
    describe('GET /api/hotels', () => {
        it('should return list of hotels for a city', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .get('/api/hotels')
                .query({ city: 'Addis Ababa' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            const hotel = response.body.data[0];
            expect(hotel).toHaveProperty('id');
            expect(hotel).toHaveProperty('name');
            expect(hotel).toHaveProperty('location');
            expect(hotel.location).toBe('Addis Ababa');
        });
        it('should return empty list for non-existent city', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .get('/api/hotels')
                .query({ city: 'NonExistentCity' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });
        it('should return 400 for missing city parameter', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .get('/api/hotels')
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('BAD_REQUEST');
        });
    });
});
