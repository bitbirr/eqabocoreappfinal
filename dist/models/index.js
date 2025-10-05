"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = exports.PaymentLog = exports.PaymentStatus = exports.PaymentProvider = exports.Payment = exports.BookingStatus = exports.Booking = exports.RoomStatus = exports.Room = exports.HotelStatus = exports.Hotel = exports.UserRole = exports.User = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return User_1.UserRole; } });
const Hotel_1 = require("./Hotel");
Object.defineProperty(exports, "Hotel", { enumerable: true, get: function () { return Hotel_1.Hotel; } });
Object.defineProperty(exports, "HotelStatus", { enumerable: true, get: function () { return Hotel_1.HotelStatus; } });
const Room_1 = require("./Room");
Object.defineProperty(exports, "Room", { enumerable: true, get: function () { return Room_1.Room; } });
Object.defineProperty(exports, "RoomStatus", { enumerable: true, get: function () { return Room_1.RoomStatus; } });
const Booking_1 = require("./Booking");
Object.defineProperty(exports, "Booking", { enumerable: true, get: function () { return Booking_1.Booking; } });
Object.defineProperty(exports, "BookingStatus", { enumerable: true, get: function () { return Booking_1.BookingStatus; } });
const Payment_1 = require("./Payment");
Object.defineProperty(exports, "Payment", { enumerable: true, get: function () { return Payment_1.Payment; } });
Object.defineProperty(exports, "PaymentProvider", { enumerable: true, get: function () { return Payment_1.PaymentProvider; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return Payment_1.PaymentStatus; } });
const PaymentLog_1 = require("./PaymentLog");
Object.defineProperty(exports, "PaymentLog", { enumerable: true, get: function () { return PaymentLog_1.PaymentLog; } });
// Export all entities as an array for TypeORM configuration
exports.entities = [
    User_1.User,
    Hotel_1.Hotel,
    Room_1.Room,
    Booking_1.Booking,
    Payment_1.Payment,
    PaymentLog_1.PaymentLog
];
