import { UserRole, HotelStatus, RoomStatus, BookingStatus, PaymentProvider, PaymentStatus } from '../../models';

export const seedUsers = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+251911123456',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+251911234567',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  },
  {
    first_name: 'Ahmed',
    last_name: 'Hassan',
    email: 'ahmed.hassan@hotelowner.com',
    phone: '+251911345678',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.HOTEL_OWNER
  },
  {
    first_name: 'Meron',
    last_name: 'Tadesse',
    email: 'meron.tadesse@hotelowner.com',
    phone: '+251911456789',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.HOTEL_OWNER
  },
  {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@eqabo.com',
    phone: '+251911567890',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.ADMIN
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+251911678901',
    password_hash: '$2b$10$rQZ9QmjytWIeVqNDdNGzUeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    role: UserRole.CUSTOMER
  },
  {
    first_name: 'Michael',
    last_name: 'Brown',
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
    hotelName: 'Skylight Hotel Addis',
    room_number: 'SKY-101',
    room_type: 'Standard Single',
    price_per_night: 1200.0,
    capacity: 1,
    status: RoomStatus.AVAILABLE,
    description: 'Cozy room with city view and complimentary breakfast.'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    room_number: 'SKY-102',
    room_type: 'Standard Double',
    price_per_night: 1800.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Spacious double room ideal for couples or business travelers.'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    room_number: 'SKY-201',
    room_type: 'Deluxe Suite',
    price_per_night: 3500.0,
    capacity: 4,
    status: RoomStatus.AVAILABLE,
    description: 'Suite with living area, kitchenette, and panoramic city views.'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    room_number: 'SKY-301',
    room_type: 'Presidential Suite',
    price_per_night: 6000.0,
    capacity: 6,
    status: RoomStatus.AVAILABLE,
    description: 'Premium suite featuring private office, dining room, and butler service.'
  },

  // Blue Nile Resort rooms
  {
    hotelName: 'Blue Nile Resort',
    room_number: 'BNR-101',
    room_type: 'Lake View Room',
    price_per_night: 2200.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Lake-facing room with balcony and sunrise views over Lake Tana.'
  },
  {
    hotelName: 'Blue Nile Resort',
    room_number: 'BNR-201',
    room_type: 'Family Room',
    price_per_night: 3200.0,
    capacity: 4,
    status: RoomStatus.AVAILABLE,
    description: 'Family suite with two bedrooms and kids play area.'
  },
  {
    hotelName: 'Blue Nile Resort',
    room_number: 'BNR-301',
    room_type: 'Luxury Villa',
    price_per_night: 5500.0,
    capacity: 8,
    status: RoomStatus.AVAILABLE,
    description: 'Standalone villa with private pool and dedicated concierge.'
  },

  // Rift Valley Lodge rooms
  {
    hotelName: 'Rift Valley Lodge',
    room_number: 'RVL-101',
    room_type: 'Eco Cabin',
    price_per_night: 1500.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Sustainable cabin built with local materials and lake breeze.'
  },
  {
    hotelName: 'Rift Valley Lodge',
    room_number: 'RVL-201',
    room_type: 'Tree House',
    price_per_night: 2800.0,
    capacity: 3,
    status: RoomStatus.AVAILABLE,
    description: 'Elevated tree house with wraparound deck and birdwatching guide.'
  },
  {
    hotelName: 'Rift Valley Lodge',
    room_number: 'RVL-301',
    room_type: 'Safari Tent',
    price_per_night: 2000.0,
    capacity: 2,
    status: RoomStatus.OCCUPIED,
    description: 'Luxury safari tent with ensuite bathroom and outdoor shower.'
  },

  // Capital Grand Hotel rooms
  {
    hotelName: 'Capital Grand Hotel',
    room_number: 'CGH-101',
    room_type: 'Classic Room',
    price_per_night: 1600.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Classic room with vintage décor and modern amenities.'
  },
  {
    hotelName: 'Capital Grand Hotel',
    room_number: 'CGH-201',
    room_type: 'Executive Room',
    price_per_night: 2400.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Executive-level room including lounge access and meeting credits.'
  },
  {
    hotelName: 'Capital Grand Hotel',
    room_number: 'CGH-301',
    room_type: 'Royal Suite',
    price_per_night: 4500.0,
    capacity: 4,
    status: RoomStatus.MAINTENANCE,
    description: 'Two-bedroom suite undergoing scheduled maintenance upgrade.'
  },

  // Mountain View Inn rooms
  {
    hotelName: 'Mountain View Inn',
    room_number: 'MVI-101',
    room_type: 'Mountain View Single',
    price_per_night: 1000.0,
    capacity: 1,
    status: RoomStatus.AVAILABLE,
    description: 'Compact single room with terrace overlooking mountain range.'
  },
  {
    hotelName: 'Mountain View Inn',
    room_number: 'MVI-201',
    room_type: 'Mountain View Double',
    price_per_night: 1400.0,
    capacity: 2,
    status: RoomStatus.AVAILABLE,
    description: 'Corner double room with floor-to-ceiling windows.'
  },
  {
    hotelName: 'Mountain View Inn',
    room_number: 'MVI-301',
    room_type: 'Traditional Suite',
    price_per_night: 2500.0,
    capacity: 3,
    status: RoomStatus.AVAILABLE,
    description: 'Traditional suite featuring handcrafted furnishings and fireplace.'
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
    status: BookingStatus.PENDING
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
    status: BookingStatus.PENDING
  }
];

export const seedPayments = [
  {
    provider: PaymentProvider.CHAPPA,
    provider_reference: 'CHX_001_20240215',
    amount: 5400.0,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.TELEBIRR,
    provider_reference: 'TBR_002_20240220',
    amount: 11000.0,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.EBIRR,
    provider_reference: 'EBR_003_20240301',
    amount: 6000.0,
    status: PaymentStatus.PENDING
  },
  {
    provider: PaymentProvider.CHAPPA,
    provider_reference: 'CHX_004_20240310',
    amount: 3200.0,
    status: PaymentStatus.SUCCESS
  },
  {
    provider: PaymentProvider.KAAFI,
    provider_reference: 'KAF_005_20240315',
    amount: 7000.0,
    status: PaymentStatus.FAILED
  },
  {
    provider: PaymentProvider.TELEBIRR,
    provider_reference: 'TBR_006_20240401',
    amount: 13200.0,
    status: PaymentStatus.PENDING
  }
];

export const seedPaymentLogs = [
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'chappa',
      transaction_id: 'CHX_001_20240215',
      status: 'completed',
      amount: 5400.0,
      currency: 'ETB',
      received_at: '2024-02-15T10:30:00Z'
    })
  },
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'telebirr',
      transaction_id: 'TBR_002_20240220',
      status: 'completed',
      amount: 11000.0,
      currency: 'ETB',
      received_at: '2024-02-20T14:15:00Z'
    })
  },
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'ebirr',
      transaction_id: 'EBR_003_20240301',
      status: 'pending',
      amount: 6000.0,
      currency: 'ETB',
      received_at: '2024-03-01T09:45:00Z'
    })
  },
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'chappa',
      transaction_id: 'CHX_004_20240310',
      status: 'completed',
      amount: 3200.0,
      currency: 'ETB',
      received_at: '2024-03-10T16:20:00Z'
    })
  },
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'kaafi',
      transaction_id: 'KAF_005_20240315',
      status: 'failed',
      amount: 7000.0,
      currency: 'ETB',
      received_at: '2024-03-15T11:10:00Z',
      error: 'Insufficient funds'
    })
  },
  {
    action: 'provider_callback',
    details: JSON.stringify({
      provider: 'telebirr',
      transaction_id: 'TBR_006_20240401',
      status: 'pending',
      amount: 13200.0,
      currency: 'ETB',
      received_at: '2024-04-01T08:30:00Z'
    })
  }
];