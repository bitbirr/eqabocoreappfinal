"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Eqabo Hotel Booking API',
            version: '1.0.0',
            description: 'A comprehensive hotel booking API with authentication, hotel management, room booking, and payment processing.',
            contact: {
                name: 'Eqabo Team',
                email: 'support@eqabo.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['first_name', 'last_name', 'email', 'phone', 'password'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID',
                            example: 1
                        },
                        first_name: {
                            type: 'string',
                            description: 'User first name',
                            example: 'John'
                        },
                        last_name: {
                            type: 'string',
                            description: 'User last name',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john.doe@example.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Ethiopian phone number',
                            example: '+251927802065'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'hotel_owner'],
                            description: 'User role',
                            example: 'hotel_owner'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp'
                        }
                    }
                },
                Hotel: {
                    type: 'object',
                    required: ['name', 'description', 'address', 'city', 'phone', 'email'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Hotel ID',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Hotel name',
                            example: 'Grand Palace Hotel'
                        },
                        description: {
                            type: 'string',
                            description: 'Hotel description',
                            example: 'A luxurious 5-star hotel in the heart of Addis Ababa'
                        },
                        address: {
                            type: 'string',
                            description: 'Hotel address',
                            example: 'Bole Road, Addis Ababa'
                        },
                        city: {
                            type: 'string',
                            description: 'Hotel city',
                            example: 'Addis Ababa'
                        },
                        phone: {
                            type: 'string',
                            description: 'Hotel phone number',
                            example: '+251911123456'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Hotel email',
                            example: 'info@grandpalace.com'
                        },
                        rating: {
                            type: 'number',
                            format: 'float',
                            minimum: 0,
                            maximum: 5,
                            description: 'Hotel rating (0-5)',
                            example: 4.5
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'pending'],
                            description: 'Hotel status',
                            example: 'active'
                        },
                        amenities: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Hotel amenities',
                            example: ['WiFi', 'Pool', 'Gym', 'Restaurant']
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Hotel image URLs',
                            example: ['https://example.com/hotel1.jpg', 'https://example.com/hotel2.jpg']
                        }
                    }
                },
                Room: {
                    type: 'object',
                    required: ['hotel_id', 'room_number', 'type', 'price_per_night', 'capacity'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Room ID',
                            example: 1
                        },
                        hotel_id: {
                            type: 'integer',
                            description: 'Hotel ID this room belongs to',
                            example: 1
                        },
                        room_number: {
                            type: 'string',
                            description: 'Room number',
                            example: '101'
                        },
                        type: {
                            type: 'string',
                            description: 'Room type',
                            example: 'Deluxe Suite'
                        },
                        description: {
                            type: 'string',
                            description: 'Room description',
                            example: 'Spacious room with city view'
                        },
                        price_per_night: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Price per night in ETB',
                            example: 2500.00
                        },
                        capacity: {
                            type: 'integer',
                            description: 'Room capacity (number of guests)',
                            example: 2
                        },
                        amenities: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Room amenities',
                            example: ['Air Conditioning', 'TV', 'Mini Bar']
                        },
                        status: {
                            type: 'string',
                            enum: ['available', 'occupied', 'maintenance'],
                            description: 'Room status',
                            example: 'available'
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Room image URLs',
                            example: ['https://example.com/room1.jpg']
                        }
                    }
                },
                Booking: {
                    type: 'object',
                    required: ['user_id', 'room_id', 'check_in_date', 'check_out_date', 'guests'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Booking ID',
                            example: 1
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID who made the booking',
                            example: 1
                        },
                        room_id: {
                            type: 'integer',
                            description: 'Room ID being booked',
                            example: 1
                        },
                        check_in_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Check-in date',
                            example: '2025-10-01'
                        },
                        check_out_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Check-out date',
                            example: '2025-10-03'
                        },
                        guests: {
                            type: 'integer',
                            description: 'Number of guests',
                            example: 2
                        },
                        total_amount: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Total booking amount in ETB',
                            example: 5000.00
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
                            description: 'Booking status',
                            example: 'confirmed'
                        },
                        special_requests: {
                            type: 'string',
                            description: 'Special requests from guest',
                            example: 'Late check-in requested'
                        }
                    }
                },
                Payment: {
                    type: 'object',
                    required: ['booking_id', 'amount', 'payment_method'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Payment ID',
                            example: 1
                        },
                        booking_id: {
                            type: 'integer',
                            description: 'Booking ID this payment is for',
                            example: 1
                        },
                        amount: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Payment amount in ETB',
                            example: 5000.00
                        },
                        payment_method: {
                            type: 'string',
                            description: 'Payment method used',
                            example: 'credit_card'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed', 'refunded'],
                            description: 'Payment status',
                            example: 'completed'
                        },
                        transaction_id: {
                            type: 'string',
                            description: 'External transaction ID',
                            example: 'txn_1234567890'
                        },
                        payment_date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Payment completion date'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'string',
                            example: 'Validation failed'
                        },
                        message: {
                            type: 'string',
                            example: 'The provided data is invalid'
                        },
                        details: {
                            type: 'object',
                            description: 'Additional error details'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation completed successfully'
                        },
                        data: {
                            type: 'object',
                            description: 'Response data'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/models/*.ts'
    ]
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
