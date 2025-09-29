import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏨 eQabo.com Hotel Booking System API',
      version: '1.0.0',
      description: 'A comprehensive hotel booking API with complete CRUD operations for hotels, rooms, bookings, and payments. Built with modern technologies and includes background job processing.\n\n**🚀 Key Features:**\n- JWT Authentication & Role-based Access Control\n- Complete CRUD operations for all entities\n- Real-time booking availability checking\n- Multiple payment provider integration\n- Background jobs for expired booking cleanup\n- Comprehensive API documentation\n\n**💻 Tech Stack:**\n- Node.js + TypeScript + Express\n- TypeORM + PostgreSQL (Neon & Local)\n- Swagger/OpenAPI documentation\n- Postman collection for testing\n\n**👨‍💻 Developed by Ismail Mohamed**\n*With the help of Grok Code Fast1, OpenAI GPT-4o-Mini, Kilo Code Extension, Trea IDE, context7-mcp, Git Repository, Neon Database, Local PostgreSQL, and Postman Collection.*',
      contact: {
        name: 'Ismail Mohamed - eQabo.com',
        email: 'ismail@eqabo.com'
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
           required: ['name', 'location'],
           properties: {
             id: {
               type: 'string',
               description: 'Hotel UUID',
               example: '550e8400-e29b-41d4-a716-446655440000'
             },
             owner_id: {
               type: 'string',
               description: 'Owner user UUID',
               example: '550e8400-e29b-41d4-a716-446655440001'
             },
             name: {
               type: 'string',
               description: 'Hotel name',
               example: 'Skylight Hotel Addis'
             },
             location: {
               type: 'string',
               description: 'Hotel location/city',
               example: 'Bole, Addis Ababa'
             },
             description: {
               type: 'string',
               description: 'Hotel description',
               example: 'A luxury hotel in the heart of Addis Ababa with modern amenities'
             },
             status: {
               type: 'string',
               enum: ['active', 'inactive', 'suspended'],
               description: 'Hotel status',
               example: 'active'
             },
             created_at: {
               type: 'string',
               format: 'date-time',
               description: 'Hotel creation timestamp'
             }
           }
         },
        Room: {
           type: 'object',
           required: ['hotel_id', 'room_number', 'room_type', 'price_per_night'],
           properties: {
             id: {
               type: 'string',
               description: 'Room UUID',
               example: '550e8400-e29b-41d4-a716-446655440002'
             },
             hotel_id: {
               type: 'string',
               description: 'Hotel UUID this room belongs to',
               example: '550e8400-e29b-41d4-a716-446655440000'
             },
             room_number: {
               type: 'string',
               description: 'Room number',
               example: '101'
             },
             room_type: {
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
             status: {
               type: 'string',
               enum: ['available', 'occupied', 'maintenance', 'out_of_order'],
               description: 'Room status',
               example: 'available'
             },
             created_at: {
               type: 'string',
               format: 'date-time',
               description: 'Room creation timestamp'
             }
           }
         },
        Booking: {
           type: 'object',
           required: ['user_id', 'hotel_id', 'room_id', 'checkin_date', 'checkout_date', 'nights', 'total_amount'],
           properties: {
             id: {
               type: 'string',
               description: 'Booking UUID',
               example: '550e8400-e29b-41d4-a716-446655440003'
             },
             user_id: {
               type: 'string',
               description: 'User UUID who made the booking',
               example: '550e8400-e29b-41d4-a716-446655440001'
             },
             hotel_id: {
               type: 'string',
               description: 'Hotel UUID',
               example: '550e8400-e29b-41d4-a716-446655440000'
             },
             room_id: {
               type: 'string',
               description: 'Room UUID being booked',
               example: '550e8400-e29b-41d4-a716-446655440002'
             },
             checkin_date: {
               type: 'string',
               format: 'date',
               description: 'Check-in date',
               example: '2025-10-01'
             },
             checkout_date: {
               type: 'string',
               format: 'date',
               description: 'Check-out date',
               example: '2025-10-03'
             },
             nights: {
               type: 'integer',
               description: 'Number of nights',
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
               enum: ['pending_payment', 'confirmed', 'cancelled', 'expired', 'refunded'],
               description: 'Booking status',
               example: 'confirmed'
             },
             created_at: {
               type: 'string',
               format: 'date-time',
               description: 'Booking creation timestamp'
             }
           }
         },
        Payment: {
           type: 'object',
           required: ['booking_id', 'amount', 'provider'],
           properties: {
             id: {
               type: 'string',
               description: 'Payment UUID',
               example: '550e8400-e29b-41d4-a716-446655440004'
             },
             booking_id: {
               type: 'string',
               description: 'Booking UUID this payment is for',
               example: '550e8400-e29b-41d4-a716-446655440003'
             },
             amount: {
               type: 'number',
               format: 'decimal',
               description: 'Payment amount in ETB',
               example: 5000.00
             },
             provider: {
               type: 'string',
               enum: ['chappa', 'telebirr', 'ebirr', 'kaafi'],
               description: 'Payment provider',
               example: 'chappa'
             },
             provider_reference: {
               type: 'string',
               description: 'Provider transaction reference',
               example: 'CHX_001_20240215'
             },
             status: {
               type: 'string',
               enum: ['pending', 'success', 'failed', 'cancelled'],
               description: 'Payment status',
               example: 'success'
             },
             created_at: {
               type: 'string',
               format: 'date-time',
               description: 'Payment creation timestamp'
             },
             updated_at: {
               type: 'string',
               format: 'date-time',
               description: 'Payment last update timestamp'
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

const specs = swaggerJsdoc(options);

// Custom Swagger UI options
const swaggerUiOptions = {
  customCss: `
    /* Hide the default topbar */
    .swagger-ui .topbar { display: none !important; }

    /* Add custom header with AI logo */
    .swagger-ui .swagger-ui-wrap:before {
      content: '';
      display: block;
      width: 120px;
      height: 120px;
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iMjAiIGZpbGw9IiMxODc3RjIiLz4KPHRleHQgeD0iNjAiIHk9IjYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5BSTwvdGV4dD4KPC9zdmc+') no-repeat center center;
      background-size: contain;
      margin: 20px auto 30px auto;
    }

    /* Custom footer with development credits */
    .swagger-ui .swagger-ui-wrap:after {
      content: '🏗️ Developed by Ismail Mohamed with the Help Of Grok Code Fast1, OpenAI - GPT-4o-Mini, Kilo Code Extension, Trea IDE, context7-mcp, Git Repo, Neon Database, Local Postgres DB, and Postman Collection. This hotel booking system is built using Node.js with TypeORM for database management (Neon and local Postgres), Express for the server, Swagger for API documentation, Postman for testing, and includes background jobs for handling expirations.';
      display: block;
      margin: 50px auto 20px auto;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px;
      font-size: 15px;
      line-height: 1.7;
      text-align: center;
      border: 3px solid #5a67d8;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      font-weight: 500;
      max-width: 1000px;
    }

    /* Enhance the main title */
    .swagger-ui .info .title {
      font-size: 3.2em !important;
      font-weight: bold !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      margin-bottom: 20px !important;
      text-align: center !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }

    /* Style the description */
    .swagger-ui .info p {
      font-size: 1.2em !important;
      line-height: 1.8 !important;
      color: #4a5568 !important;
      text-align: center !important;
      margin-bottom: 35px !important;
      max-width: 900px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      font-weight: 400 !important;
    }

    /* Style the main container */
    .swagger-ui .swagger-ui-wrap {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Improve the overall look */
    .swagger-ui {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
      min-height: 100vh;
    }

    /* Style the info section */
    .swagger-ui .info {
      background: white;
      border-radius: 15px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e5e9;
    }

    /* Style operation blocks */
    .swagger-ui .opblock {
      border-radius: 10px !important;
      margin-bottom: 15px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid #e1e5e9 !important;
    }

    .swagger-ui .opblock .opblock-summary {
      border-radius: 10px 10px 0 0 !important;
    }

    /* Style method badges */
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 8px 0 0 8px !important;
      font-weight: bold !important;
    }

    /* Style response blocks */
    .swagger-ui .responses-wrapper {
      border-radius: 0 0 10px 10px !important;
    }

    /* Add some animations */
    .swagger-ui .opblock {
      transition: all 0.3s ease !important;
    }

    .swagger-ui .opblock:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12) !important;
    }
  `,
  customSiteTitle: '🏨 eQabo.com Hotel Booking System API - Developed by Ismail Mohamed',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayOperationId: false,
    showMutatedRequest: true
  }
};

export { specs, swaggerUi, swaggerUiOptions };