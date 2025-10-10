import { CityStatus } from '../../models/City';
import { HotelStatus } from '../../models/Hotel';
import { RoomType, RoomStatus } from '../../models/Room';

/**
 * Ethiopian Cities Seed Data
 * GPS coordinates are real coordinates for major Ethiopian cities
 */
export const seedCities = [
  {
    cityName: 'Addis Ababa',
    gps: '9.0320,38.7469',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Bahir Dar',
    gps: '11.5933,37.3905',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Gondar',
    gps: '12.6034,37.4664',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Hawassa',
    gps: '7.0621,38.4762',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Dire Dawa',
    gps: '9.5931,41.8661',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Mekelle',
    gps: '13.4967,39.4753',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Adama',
    gps: '8.5400,39.2700',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Lalibela',
    gps: '12.0320,39.0396',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Jimma',
    gps: '7.6773,36.8355',
    status: CityStatus.ACTIVE
  },
  {
    cityName: 'Arba Minch',
    gps: '6.0368,37.5503',
    status: CityStatus.ACTIVE
  }
];

/**
 * Ethiopian Hotels Seed Data
 * Updated to link to cities using cityName
 */
export const seedCitiesHotels = [
  // Addis Ababa Hotels
  {
    cityName: 'Addis Ababa',
    hotelName: 'Skylight Hotel Addis',
    address: 'Bole Road, Near Bole International Airport',
    status: HotelStatus.ACTIVE,
    description: 'A luxury hotel in the heart of Addis Ababa with modern amenities and excellent service.'
  },
  {
    cityName: 'Addis Ababa',
    hotelName: 'Capital Grand Hotel',
    address: 'Piazza, Churchill Avenue',
    status: HotelStatus.ACTIVE,
    description: 'Historic hotel in the center of Addis Ababa with classic architecture and modern comfort.'
  },
  {
    cityName: 'Addis Ababa',
    hotelName: 'Radisson Blu Hotel',
    address: 'Kazanchis Business District',
    status: HotelStatus.ACTIVE,
    description: 'International standard hotel with conference facilities and fine dining.'
  },
  
  // Bahir Dar Hotels
  {
    cityName: 'Bahir Dar',
    hotelName: 'Blue Nile Resort',
    address: 'Lake Tana Shore, Bahir Dar',
    status: HotelStatus.ACTIVE,
    description: 'Beautiful lakeside resort with stunning views of Lake Tana and traditional Ethiopian hospitality.'
  },
  {
    cityName: 'Bahir Dar',
    hotelName: 'Kuriftu Resort & Spa',
    address: 'Peninsula, Lake Tana',
    status: HotelStatus.ACTIVE,
    description: 'Eco-luxury resort on a private peninsula with spa and water sports.'
  },
  
  // Gondar Hotels
  {
    cityName: 'Gondar',
    hotelName: 'Goha Hotel Gondar',
    address: 'Gondar City Center, Near Royal Enclosure',
    status: HotelStatus.ACTIVE,
    description: 'Historic hotel with panoramic views of Gondar and the royal castles.'
  },
  
  // Hawassa Hotels
  {
    cityName: 'Hawassa',
    hotelName: 'Rift Valley Lodge',
    address: 'Lake Hawassa Shore',
    status: HotelStatus.ACTIVE,
    description: 'Eco-friendly lodge surrounded by nature, perfect for relaxation and bird watching.'
  },
  {
    cityName: 'Hawassa',
    hotelName: 'Haile Resort Hawassa',
    address: 'Hawassa Industrial Park Road',
    status: HotelStatus.ACTIVE,
    description: 'Modern resort with lakeside views and conference facilities.'
  },
  
  // Lalibela Hotels
  {
    cityName: 'Lalibela',
    hotelName: 'Mountain View Inn',
    address: 'Near Rock-Hewn Churches Complex',
    status: HotelStatus.ACTIVE,
    description: 'Charming inn with breathtaking mountain views, close to the famous rock churches.'
  },
  {
    cityName: 'Lalibela',
    hotelName: 'Maribela Hotel',
    address: 'Lalibela Town Center',
    status: HotelStatus.ACTIVE,
    description: 'Traditional Ethiopian architecture with modern amenities, walking distance to churches.'
  },
  
  // Dire Dawa Hotels
  {
    cityName: 'Dire Dawa',
    hotelName: 'Samrat Hotel',
    address: 'Kezira Main Road',
    status: HotelStatus.ACTIVE,
    description: 'Modern business hotel with excellent dining and conference facilities.'
  },
  
  // Mekelle Hotels
  {
    cityName: 'Mekelle',
    hotelName: 'Planet Hotel',
    address: 'Mekelle City Center',
    status: HotelStatus.ACTIVE,
    description: 'Contemporary hotel with rooftop restaurant and city views.'
  },
  
  // Adama Hotels
  {
    cityName: 'Adama',
    hotelName: 'Adama Luxury Hotel',
    address: 'Adama-Addis Highway',
    status: HotelStatus.ACTIVE,
    description: 'Convenient stopover hotel between Addis Ababa and eastern Ethiopia.'
  },
  
  // Jimma Hotels
  {
    cityName: 'Jimma',
    hotelName: 'Honey Land Hotel',
    address: 'Jimma University Road',
    status: HotelStatus.ACTIVE,
    description: 'Comfortable hotel in the coffee capital of Ethiopia.'
  },
  
  // Arba Minch Hotels
  {
    cityName: 'Arba Minch',
    hotelName: 'Paradise Lodge',
    address: 'Near Nechisar National Park',
    status: HotelStatus.ACTIVE,
    description: 'Safari lodge with views of the twin lakes and access to national park.'
  }
];

/**
 * Room Seed Data for Ethiopian Hotels
 */
export const seedCitiesRooms = [
  // Skylight Hotel Addis rooms
  {
    hotelName: 'Skylight Hotel Addis',
    roomNumber: '101',
    roomType: RoomType.SINGLE,
    price: 2500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Comfortable single room with city view'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    roomNumber: '102',
    roomType: RoomType.DOUBLE,
    price: 3500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Spacious double room with king-size bed'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    roomNumber: '201',
    roomType: RoomType.SUITE,
    price: 6000.00,
    status: RoomStatus.AVAILABLE,
    description: 'Luxury suite with separate living area'
  },
  {
    hotelName: 'Skylight Hotel Addis',
    roomNumber: '103',
    roomType: RoomType.DOUBLE,
    price: 3500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Double room with balcony'
  },
  
  // Blue Nile Resort rooms
  {
    hotelName: 'Blue Nile Resort',
    roomNumber: 'LV-101',
    roomType: RoomType.DOUBLE,
    price: 3000.00,
    status: RoomStatus.AVAILABLE,
    description: 'Lake view double room'
  },
  {
    hotelName: 'Blue Nile Resort',
    roomNumber: 'LV-201',
    roomType: RoomType.SUITE,
    price: 5500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Premium lakeside suite'
  },
  {
    hotelName: 'Blue Nile Resort',
    roomNumber: 'LV-102',
    roomType: RoomType.SINGLE,
    price: 2000.00,
    status: RoomStatus.AVAILABLE,
    description: 'Cozy single room with garden view'
  },
  
  // Rift Valley Lodge rooms
  {
    hotelName: 'Rift Valley Lodge',
    roomNumber: 'RV-1',
    roomType: RoomType.DOUBLE,
    price: 2800.00,
    status: RoomStatus.AVAILABLE,
    description: 'Eco-friendly double room'
  },
  {
    hotelName: 'Rift Valley Lodge',
    roomNumber: 'RV-2',
    roomType: RoomType.SUITE,
    price: 4500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Family suite with terrace'
  },
  {
    hotelName: 'Rift Valley Lodge',
    roomNumber: 'RV-3',
    roomType: RoomType.SINGLE,
    price: 1800.00,
    status: RoomStatus.AVAILABLE,
    description: 'Single room with nature view'
  },
  
  // Capital Grand Hotel rooms
  {
    hotelName: 'Capital Grand Hotel',
    roomNumber: '301',
    roomType: RoomType.DOUBLE,
    price: 3200.00,
    status: RoomStatus.AVAILABLE,
    description: 'Classic double room'
  },
  {
    hotelName: 'Capital Grand Hotel',
    roomNumber: '401',
    roomType: RoomType.SUITE,
    price: 5000.00,
    status: RoomStatus.AVAILABLE,
    description: 'Presidential suite'
  },
  
  // Mountain View Inn rooms
  {
    hotelName: 'Mountain View Inn',
    roomNumber: 'MV-1',
    roomType: RoomType.DOUBLE,
    price: 2200.00,
    status: RoomStatus.AVAILABLE,
    description: 'Mountain view double room'
  },
  {
    hotelName: 'Mountain View Inn',
    roomNumber: 'MV-2',
    roomType: RoomType.SINGLE,
    price: 1500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Compact single room'
  },
  {
    hotelName: 'Mountain View Inn',
    roomNumber: 'MV-3',
    roomType: RoomType.SUITE,
    price: 4000.00,
    status: RoomStatus.AVAILABLE,
    description: 'Deluxe suite with panoramic views'
  },
  
  // Radisson Blu Hotel rooms
  {
    hotelName: 'Radisson Blu Hotel',
    roomNumber: '501',
    roomType: RoomType.DOUBLE,
    price: 4500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Business class double room'
  },
  {
    hotelName: 'Radisson Blu Hotel',
    roomNumber: '601',
    roomType: RoomType.SUITE,
    price: 7500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Executive suite with conference area'
  },
  
  // Kuriftu Resort & Spa rooms
  {
    hotelName: 'Kuriftu Resort & Spa',
    roomNumber: 'KR-101',
    roomType: RoomType.DOUBLE,
    price: 3800.00,
    status: RoomStatus.AVAILABLE,
    description: 'Spa double room'
  },
  {
    hotelName: 'Kuriftu Resort & Spa',
    roomNumber: 'KR-201',
    roomType: RoomType.SUITE,
    price: 6500.00,
    status: RoomStatus.AVAILABLE,
    description: 'Wellness suite with private spa access'
  },
  
  // Goha Hotel Gondar rooms
  {
    hotelName: 'Goha Hotel Gondar',
    roomNumber: 'GH-101',
    roomType: RoomType.DOUBLE,
    price: 2600.00,
    status: RoomStatus.AVAILABLE,
    description: 'Castle view double room'
  },
  {
    hotelName: 'Goha Hotel Gondar',
    roomNumber: 'GH-201',
    roomType: RoomType.SUITE,
    price: 4200.00,
    status: RoomStatus.AVAILABLE,
    description: 'Royal suite with panoramic views'
  }
];
