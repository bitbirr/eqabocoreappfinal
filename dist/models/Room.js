"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.RoomStatus = void 0;
const typeorm_1 = require("typeorm");
const Hotel_1 = require("./Hotel");
const Booking_1 = require("./Booking");
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["AVAILABLE"] = "available";
    RoomStatus["OCCUPIED"] = "occupied";
    RoomStatus["MAINTENANCE"] = "maintenance";
    RoomStatus["OUT_OF_ORDER"] = "out_of_order";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
let Room = class Room {
};
exports.Room = Room;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], Room.prototype, "hotel_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Room.prototype, "room_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Room.prototype, "room_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Room.prototype, "price_per_night", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Room.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoomStatus,
        default: RoomStatus.AVAILABLE,
        nullable: false
    }),
    __metadata("design:type", String)
], Room.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Room.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Hotel_1.Hotel, hotel => hotel.rooms),
    (0, typeorm_1.JoinColumn)({ name: 'hotel_id' }),
    __metadata("design:type", Hotel_1.Hotel)
], Room.prototype, "hotel", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, booking => booking.room),
    __metadata("design:type", Array)
], Room.prototype, "bookings", void 0);
exports.Room = Room = __decorate([
    (0, typeorm_1.Entity)('rooms'),
    (0, typeorm_1.Index)('idx_rooms_hotel', ['hotel_id'])
], Room);
