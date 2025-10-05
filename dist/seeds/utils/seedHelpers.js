"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedHelpers = void 0;
const bcrypt = __importStar(require("bcrypt"));
class SeedHelpers {
    /**
     * Generate a hashed password for seed data
     */
    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    /**
     * Generate random Ethiopian phone number
     */
    static generateEthiopianPhone() {
        const prefixes = ['911', '912', '913', '914', '915', '916', '917', '918', '919'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `+251${prefix}${number}`;
    }
    /**
     * Generate random date within a range
     */
    static randomDateBetween(start, end) {
        const startTime = start.getTime();
        const endTime = end.getTime();
        const randomTime = startTime + Math.random() * (endTime - startTime);
        return new Date(randomTime);
    }
    /**
     * Generate random price within a range
     */
    static randomPrice(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 100) / 100;
    }
    /**
     * Generate Ethiopian names
     */
    static getRandomEthiopianName() {
        const firstNames = [
            'Abebe', 'Almaz', 'Bekele', 'Chaltu', 'Dawit', 'Emebet', 'Fekadu', 'Genet',
            'Haile', 'Iyasu', 'Jemal', 'Kalkidan', 'Lemma', 'Meron', 'Negash', 'Oljira',
            'Petros', 'Rahel', 'Selamawit', 'Tadesse', 'Urael', 'Wondwossen', 'Yohannes', 'Zara'
        ];
        const lastNames = [
            'Abera', 'Bekele', 'Chala', 'Desta', 'Eshetu', 'Fanta', 'Girma', 'Hailu',
            'Kebede', 'Lemma', 'Mekonnen', 'Negash', 'Oljira', 'Petros', 'Regassa',
            'Sisay', 'Tadesse', 'Urgessa', 'Wolde', 'Yimer'
        ];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return { firstName, lastName };
    }
    /**
     * Generate Ethiopian city names
     */
    static getRandomEthiopianCity() {
        const cities = [
            'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Awassa', 'Bahir Dar',
            'Dessie', 'Jimma', 'Jijiga', 'Shashamane', 'Nekemte', 'Bishoftu',
            'Arba Minch', 'Hosaena', 'Harar', 'Dilla', 'Sodo', 'Debre Markos',
            'Kombolcha', 'Debre Birhan', 'Asella', 'Adigrat', 'Wukro', 'Axum'
        ];
        return cities[Math.floor(Math.random() * cities.length)];
    }
    /**
     * Generate hotel names with Ethiopian context
     */
    static getRandomHotelName() {
        const prefixes = [
            'Blue Nile', 'Rift Valley', 'Highland', 'Simien', 'Bale Mountain',
            'Lake Tana', 'Awash', 'Danakil', 'Lalibela', 'Axum', 'Harar',
            'Sheger', 'Entoto', 'Merkato', 'Piazza', 'Bole'
        ];
        const suffixes = [
            'Hotel', 'Resort', 'Lodge', 'Inn', 'Suites', 'Palace', 'Grand Hotel',
            'Boutique Hotel', 'Guest House', 'Retreat'
        ];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${suffix}`;
    }
    /**
     * Generate room types
     */
    static getRandomRoomType() {
        const roomTypes = [
            'Standard Single', 'Standard Double', 'Deluxe Room', 'Executive Suite',
            'Presidential Suite', 'Family Room', 'Twin Room', 'King Room',
            'Lake View Room', 'Mountain View Room', 'Garden View Room',
            'Business Room', 'Luxury Suite', 'Penthouse', 'Villa'
        ];
        return roomTypes[Math.floor(Math.random() * roomTypes.length)];
    }
    /**
     * Calculate nights between two dates
     */
    static calculateNights(checkinDate, checkoutDate) {
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return Math.max(1, daysDiff);
    }
    /**
     * Generate payment reference
     */
    static generatePaymentReference(provider) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const providerCode = provider.substring(0, 3).toUpperCase();
        return `${providerCode}_${timestamp}_${random}`;
    }
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Format currency for Ethiopian Birr
     */
    static formatETB(amount) {
        return `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    /**
     * Generate realistic booking dates (future dates)
     */
    static generateBookingDates() {
        const today = new Date();
        const futureDate = new Date(today.getTime() + (Math.random() * 90 * 24 * 60 * 60 * 1000)); // Up to 90 days in future
        const checkinDate = new Date(futureDate);
        // Checkout date is 1-7 days after checkin
        const stayDuration = Math.floor(Math.random() * 7) + 1;
        const checkoutDate = new Date(checkinDate.getTime() + (stayDuration * 24 * 60 * 60 * 1000));
        return { checkinDate, checkoutDate };
    }
}
exports.SeedHelpers = SeedHelpers;
