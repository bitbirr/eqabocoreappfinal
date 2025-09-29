"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                first_name: 'Test',
                last_name: 'User',
                phone: '+251911111115',
                password: 'TestPassword123',
                role: 'hotel_owner'
            };
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.phone).toBe(userData.phone);
            expect(response.body.data.user.role).toBe(userData.role);
        });
        it('should return 400 for missing required fields', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/auth/register')
                .send({
                first_name: 'Test',
                last_name: 'User'
                // missing phone and password
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Missing required fields: phone, password');
        });
    });
    describe('POST /api/auth/login', () => {
        it('should login user and return JWT token', async () => {
            // First register a user
            const userData = {
                first_name: 'Login',
                last_name: 'Test',
                phone: '+251911111116',
                password: 'LoginPassword123',
                role: 'hotel_owner'
            };
            await (0, supertest_1.default)(setup_1.app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            // Now login
            const loginData = {
                phone: userData.phone,
                password: userData.password
            };
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.phone).toBe(userData.phone);
        });
        it('should return 401 for invalid credentials', async () => {
            const response = await (0, supertest_1.default)(setup_1.app)
                .post('/api/auth/login')
                .send({
                phone: '+251911111117',
                password: 'WrongPassword'
            })
                .expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid phone number or password');
        });
    });
});
