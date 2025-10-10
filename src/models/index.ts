import { User, UserRole } from './User';
import { City, CityStatus } from './City';
import { Hotel, HotelStatus } from './Hotel';
import { Room, RoomStatus, RoomType } from './Room';
import { Booking, BookingStatus } from './Booking';
import { Payment, PaymentProvider, PaymentStatus } from './Payment';
import { PaymentLog } from './PaymentLog';

// Re-export all entities and enums
export { User, UserRole };
export { City, CityStatus };
export { Hotel, HotelStatus };
export { Room, RoomStatus, RoomType };
export { Booking, BookingStatus };
export { Payment, PaymentProvider, PaymentStatus };
export { PaymentLog };

// Export all entities as an array for TypeORM configuration
export const entities = [
  User,
  City,
  Hotel,
  Room,
  Booking,
  Payment,
  PaymentLog
];