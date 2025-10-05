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
exports.PaymentLog = void 0;
const typeorm_1 = require("typeorm");
const Booking_1 = require("./Booking");
const Payment_1 = require("./Payment");
let PaymentLog = class PaymentLog {
};
exports.PaymentLog = PaymentLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], PaymentLog.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], PaymentLog.prototype, "booking_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], PaymentLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentLog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payment_1.Payment, payment => payment.payment_logs),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", Payment_1.Payment)
], PaymentLog.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Booking_1.Booking, booking => booking.payment_logs),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", Booking_1.Booking)
], PaymentLog.prototype, "booking", void 0);
exports.PaymentLog = PaymentLog = __decorate([
    (0, typeorm_1.Entity)('payment_logs'),
    (0, typeorm_1.Index)('idx_payment_logs_payment', ['payment_id']),
    (0, typeorm_1.Index)('idx_payment_logs_booking', ['booking_id'])
], PaymentLog);
