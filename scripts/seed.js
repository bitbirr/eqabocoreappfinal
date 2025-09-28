const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.dev' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'eqabobackend',
};

// Sample data
const users = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@eqabo.com',
    phone: '+251911123456',
    password: 'AdminPass123',
    role: 'admin'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    first_name: 'Hotel',
    last_name: 'Owner',
    email: 'owner@eqabo.com',
    phone: '+251922234567',
    password: 'OwnerPass123',
    role: 'hotel_owner'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    first_name: 'John',
    last_name: 'Customer',
    email: 'customer@eqabo.com',
    phone: '+251933345678',
    password: 'CustomerPass123',
    role: 'customer'
  }
];

const hotels = [
  {
    id: '550e8400-e29b-41d4-a716-446655440101',
    name: 'Addis Grand Hotel',
    description: 'Luxury hotel in the heart of Addis Ababa with modern amenities and excellent service.',
    location: 'Bole Road, Addis Ababa',
    status: 'active',
    owner_id: '550e8400-e29b-41d4-a716-446655440002'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440102',
    name: 'Skylight Hotel Addis',
    description: 'Modern business hotel with conference facilities and city views.',
    location: 'Kazanchis, Addis Ababa',
    status: 'active',
    owner_id: '550e8400-e29b-41d4-a716-446655440002'
  }
];

const rooms = [
  // Addis Grand Hotel rooms
  {
    id: '550e8400-e29b-41d4-a716-446655440201',
    hotel_id: '550e8400-e29b-41d4-a716-446655440101',
    room_type: 'Standard',
    price_per_night: 1200.00,
    capacity: 2,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440202',
    hotel_id: '550e8400-e29b-41d4-a716-446655440101',
    room_type: 'Deluxe',
    price_per_night: 1800.00,
    capacity: 2,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440203',
    hotel_id: '550e8400-e29b-41d4-a716-446655440101',
    room_type: 'Suite',
    price_per_night: 2500.00,
    capacity: 4,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440204',
    hotel_id: '550e8400-e29b-41d4-a716-446655440101',
    room_type: 'Executive',
    price_per_night: 2000.00,
    capacity: 2,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440205',
    hotel_id: '550e8400-e29b-41d4-a716-446655440101',
    room_type: 'Presidential Suite',
    price_per_night: 4000.00,
    capacity: 6,
    status: 'available'
  },
  // Skylight Hotel rooms
  {
    id: '550e8400-e29b-41d4-a716-446655440206',
    hotel_id: '550e8400-e29b-41d4-a716-446655440102',
    room_type: 'Standard',
    price_per_night: 1000.00,
    capacity: 2,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440207',
    hotel_id: '550e8400-e29b-41d4-a716-446655440102',
    room_type: 'Business',
    price_per_night: 1500.00,
    capacity: 2,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440208',
    hotel_id: '550e8400-e29b-41d4-a716-446655440102',
    room_type: 'Deluxe',
    price_per_night: 1700.00,
    capacity: 3,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440209',
    hotel_id: '550e8400-e29b-41d4-a716-446655440102',
    room_type: 'Executive Suite',
    price_per_night: 2200.00,
    capacity: 4,
    status: 'available'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440210',
    hotel_id: '550e8400-e29b-41d4-a716-446655440102',
    room_type: 'Penthouse',
    price_per_night: 3500.00,
    capacity: 6,
    status: 'available'
  }
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function seedUsers(client) {
  console.log('👥 Seeding users...');
  
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    
    const query = `
      INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    await client.query(query, [
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      user.phone,
      hashedPassword,
      user.role
    ]);
    
    console.log(`   ✅ Created ${user.role}: ${user.first_name} ${user.last_name} (${user.email})`);
  }
}

async function seedHotels(client) {
  console.log('🏨 Seeding hotels...');
  
  for (const hotel of hotels) {
    const query = `
      INSERT INTO hotels (id, name, description, location, status, owner_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    await client.query(query, [
      hotel.id,
      hotel.name,
      hotel.description,
      hotel.location,
      hotel.status,
      hotel.owner_id
    ]);
    
    console.log(`   ✅ Created hotel: ${hotel.name} at ${hotel.location}`);
  }
}

async function seedRooms(client) {
  console.log('🛏️ Seeding rooms...');
  
  for (const room of rooms) {
    const query = `
      INSERT INTO rooms (id, hotel_id, room_type, price_per_night, capacity, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    await client.query(query, [
      room.id,
      room.hotel_id,
      room.room_type,
      room.price_per_night,
      room.capacity,
      room.status
    ]);
    
    const hotel = hotels.find(h => h.id === room.hotel_id);
    console.log(`   ✅ Created room (${room.room_type}) at ${hotel.name} - ${room.price_per_night} ETB/night`);
  }
}

async function clearExistingData(client) {
  console.log('🧹 Clearing existing data...');
  
  // Delete in reverse order of dependencies
  await client.query('DELETE FROM payment_logs');
  await client.query('DELETE FROM payments');
  await client.query('DELETE FROM bookings');
  await client.query('DELETE FROM rooms');
  await client.query('DELETE FROM hotels');
  await client.query('DELETE FROM users');
  
  console.log('   ✅ Existing data cleared');
}

async function showSummary(client) {
  console.log('\n📊 Database Summary:');
  console.log('====================');
  
  const tables = ['users', 'hotels', 'rooms', 'bookings', 'payments', 'payment_logs'];
  
  for (const table of tables) {
    const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
    const count = result.rows[0].count;
    const emoji = table === 'users' ? '👥' : table === 'hotels' ? '🏨' : table === 'rooms' ? '🛏️' : 
                  table === 'bookings' ? '📅' : table === 'payments' ? '💳' : '📋';
    console.log(`${emoji} ${table.charAt(0).toUpperCase() + table.slice(1)}: ${count}`);
  }
}

async function main() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🚀 Starting Eqabo Database Seeding...');
    console.log('====================================');
    
    await client.connect();
    console.log('📡 Connected to database');
    
    // Clear existing data
    await clearExistingData(client);
    
    // Seed data in order
    await seedUsers(client);
    await seedHotels(client);
    await seedRooms(client);
    
    // Show summary
    await showSummary(client);
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n💡 You can now:');
    console.log('   • Login as admin: admin@eqabo.com / AdminPass123');
    console.log('   • Login as hotel owner: owner@eqabo.com / OwnerPass123');
    console.log('   • Login as customer: customer@eqabo.com / CustomerPass123');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('📡 Database connection closed');
  }
}

// Run the seeding process
if (require.main === module) {
  main();
}

module.exports = { main };