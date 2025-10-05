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
exports.Hotel = exports.HotelStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Room_1 = require("./Room");
const Booking_1 = require("./Booking");
var HotelStatus;
(function (HotelStatus) {
    HotelStatus["ACTIVE"] = "active";
    HotelStatus["INACTIVE"] = "inactive";
    HotelStatus["SUSPENDED"] = "suspended";
})(HotelStatus || (exports.HotelStatus = HotelStatus = {}));
let Hotel = class Hotel {
};
exports.Hotel = Hotel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Hotel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Hotel.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Hotel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Hotel.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Hotel.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: HotelStatus,
        default: HotelStatus.ACTIVE,
        nullable: false
    }),
    __metadata("design:type", String)
], Hotel.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Hotel.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.hotels),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", User_1.User)
], Hotel.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Room_1.Room, room => room.hotel),
    __metadata("design:type", Array)
], Hotel.prototype, "rooms", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, booking => booking.hotel),
    __metadata("design:type", Array)
], Hotel.prototype, "bookings", void 0);
exports.Hotel = Hotel = __decorate([
    (0, typeorm_1.Entity)('hotels')
], Hotel);
