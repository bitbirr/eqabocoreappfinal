import { UserRole, HotelStatus, RoomStatus, BookingStatus, PaymentProvider, PaymentStatus } from '../../models';

export const seedUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+251911123456',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // password: 'password123'
    role: UserRole.CUSTOMER
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+251911234567',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  },
  {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@hotelowner.com',
    phone: '+251911345678',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.HOTEL_OWNER
  },
  {
    name: 'Meron Tadesse',
    email: 'meron.tadesse@hotelowner.com',
    phone: '+251911456789',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.HOTEL_OWNER
  },
  {
    name: 'Admin User',
    email: 'admin@eqabo.com',
    phone: '+251911567890',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.ADMIN
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+251911678901',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+251911789012',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  }
];

export const seedHotels = [
  {
    name: 'Skylight Hotel Addis',
    location: 'Bole, Addis Ababa',
    description: 'A luxury hotel in the heart of Addis Ababa with modern amenities and excellent service.',
    status: HotelStatus.ACTIVE
  },
  {
    name: 'Blue Nile Resort',
    location: 'Bahir Dar, Amhara',
    description: 'Beautiful lakeside resort with stunning views of Lake Tana and traditional Ethiopian hospitality.',
    status: HotelStatus.ACTIVE
  },
  {
    name: 'Rift Valley Lodge',
    location: 'Hawassa, SNNPR',
    description: 'Eco-friendly lodge surrounded by nature, perfect for relaxation and bird watching.',
    status: HotelStatus.ACTIVE
  },
  {
    name: 'Capital Grand Hotel',
    location: 'Piazza, Addis Ababa',
    description: 'Historic hotel in the center of Addis Ababa with classic architecture and modern comfort.',
    status: HotelStatus.ACTIVE
  },
  {
    name: 'Mountain View Inn',
    location: 'Lalibela, Amhara',
    description: 'Charming inn with breathtaking mountain views, close to the famous rock churches.',
    status: HotelStatus.ACTIVE
  }
];

export const seedRooms = [
  // Skylight Hotel Addis rooms
  {
    room_type: 'Standard Single',
    price_per_night: 1200.00,
    capacity: 1,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Standard Double',
    price_per_night: 1800.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Deluxe Suite',
    price_per_night: 3500.00,
    capacity: 4,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Presidential Suite',
    price_per_night: 6000.00,
    capacity: 6,
    status: RoomStatus.AVAILABLE
  },
  
  // Blue Nile Resort rooms
  {
    room_type: 'Lake View Room',
    price_per_night: 2200.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Family Room',
    price_per_night: 3200.00,
    capacity: 4,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Luxury Villa',
    price_per_night: 5500.00,
    capacity: 8,
    status: RoomStatus.AVAILABLE
  },
  
  // Rift Valley Lodge rooms
  {
    room_type: 'Eco Cabin',
    price_per_night: 1500.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Tree House',
    price_per_night: 2800.00,
    capacity: 3,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Safari Tent',
    price_per_night: 2000.00,
    capacity: 2,
    status: RoomStatus.OCCUPIED
  },
  
  // Capital Grand Hotel rooms
  {
    room_type: 'Classic Room',
    price_per_night: 1600.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Executive Room',
    price_per_night: 2400.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Royal Suite',
    price_per_night: 4500.00,
    capacity: 4,
    status: RoomStatus.MAINTENANCE
  },
  
  // Mountain View Inn rooms
  {
    room_type: 'Mountain View Single',
    price_per_night: 1000.00,
    capacity: 1,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Mountain View Double',
    price_per_night: 1400.00,
    capacity: 2,
    status: RoomStatus.AVAILABLE
  },
  {
    room_type: 'Traditional Suite',
    price_per_night: 2500.00,
    capacity: 3,
    status: RoomStatus.AVAILABLE
  }
];

export const seedBookings = [
  {
    checkin_date: new Date('2024-02-15'),
    checkout_date: new Date('2024-02-18'),
    total_amount: 5400.00, // 3 nights * 1800
    status: BookingStatus.CONFIRMED
  },
  {
    checkin_date: new Date('2024-02-20'),
    checkout_date: new Date('2024-02-25'),
    total_amount: 11000.00, // 5 nights * 2200
    status: BookingStatus.CONFIRMED
  },
  {
    checkin_date: new Date('2024-03-01'),
    checkout_date: new Date('2024-03-05'),
    total_amount: 6000.00, // 4 nights * 1500
    status: BookingStatus.PENDING_PAYMENT
  },
  {
    checkin_date: new Date('2024-03-10'),
    checkout_date: new Date('2024-03-12'),
    total_amount: 3200.00, // 2 nights * 1600
    status: BookingStatus.CONFIRMED
  },
  {
    checkin_date: new Date('2024-03-15'),
    checkout_date: new Date('2024-03-20'),
    total_amount: 7000.00, // 5 nights * 1400
    status: BookingStatus.CANCELLED
  },
  {
    checkin_date: new Date('2024-04-01'),
    checkout_date: new Date('2024-04-07'),
    total_amount: 13200.00, // 6 nights * 2200
    status: BookingStatus.PENDING_PAYMENT
  }
];

export const seedPayments = [
  {
    provider: PaymentProvider.CHAPPA,
    provider_ref: 'CHX_001_20240215',
    amount: 5400.00,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.TELEBIRR,
    provider_ref: 'TBR_002_20240220',
    amount: 11000.00,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.EBIRR,
    provider_ref: 'EBR_003_20240301',
    amount: 6000.00,
    status: PaymentStatus.PENDING
  },
  {
    provider: PaymentProvider.CHAPPA,
    provider_ref: 'CHX_004_20240310',
    amount: 3200.00,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.KAAFI,
    provider_ref: 'KAF_005_20240315',
    amount: 7000.00,
    status: PaymentStatus.FAILED
  },
  {
    provider: PaymentProvider.TELEBIRR,
    provider_ref: 'TBR_006_20240401',
    amount: 13200.00,
    status: PaymentStatus.PENDING
  }
];

export const seedPaymentLogs = [
  {
    provider: 'chappa',
    payload: {
      transaction_id: 'CHX_001_20240215',
      status: 'completed',
      amount: 5400.00,
      currency: 'ETB',
      timestamp: '2024-02-15T10:30:00Z',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  },
  {
    provider: 'telebirr',
    payload: {
      transaction_id: 'TBR_002_20240220',
      status: 'completed',
      amount: 11000.00,
      currency: 'ETB',
      timestamp: '2024-02-20T14:15:00Z',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  },
  {
    provider: 'ebirr',
    payload: {
      transaction_id: 'EBR_003_20240301',
      status: 'pending',
      amount: 6000.00,
      currency: 'ETB',
      timestamp: '2024-03-01T09:45:00Z',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  },
  {
    provider: 'chappa',
    payload: {
      transaction_id: 'CHX_004_20240310',
      status: 'completed',
      amount: 3200.00,
      currency: 'ETB',
      timestamp: '2024-03-10T16:20:00Z',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  },
  {
    provider: 'kaafi',
    payload: {
      transaction_id: 'KAF_005_20240315',
      status: 'failed',
      amount: 7000.00,
      currency: 'ETB',
      timestamp: '2024-03-15T11:10:00Z',
      error_message: 'Insufficient funds',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  },
  {
    provider: 'telebirr',
    payload: {
      transaction_id: 'TBR_006_20240401',
      status: 'pending',
      amount: 13200.00,
      currency: 'ETB',
      timestamp: '2024-04-01T08:30:00Z',
      callback_url: 'https://api.eqabo.com/payments/callback'
    }
  }
];