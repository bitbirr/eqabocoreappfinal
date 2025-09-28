import { User, UserRole } from './User';
import { Hotel, HotelStatus } from './Hotel';
import { Room, RoomStatus } from './Room';
import { Booking, BookingStatus } from './Booking';
import { Payment, PaymentProvider, PaymentStatus } from './Payment';
import { PaymentLog } from './PaymentLog';

// Re-export all entities and enums
export { User, UserRole };
export { Hotel, HotelStatus };
export { Room, RoomStatus };
export { Booking, BookingStatus };
export { Payment, PaymentProvider, PaymentStatus };
export { PaymentLog };

// Export all entities as an array for TypeORM configuration
export const entities = [
  User,
  Hotel,
  Room,
  Booking,
  Payment,
  PaymentLog
];