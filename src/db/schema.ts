import { pgTable, uuid, varchar, text, decimal, integer, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'hotel_owner', 'admin']);
export const hotelStatusEnum = pgEnum('hotel_status', ['active', 'inactive', 'suspended']);
export const roomStatusEnum = pgEnum('room_status', ['available', 'occupied', 'maintenance', 'out_of_order']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending_payment', 'confirmed', 'cancelled', 'expired', 'refunded']);
export const paymentProviderEnum = pgEnum('payment_provider', ['chappa', 'telebirr', 'ebirr', 'kaafi']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'success', 'failed', 'cancelled']);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('customer').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const hotels = pgTable('hotels', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id').references(() => users.id),
  name: text('name').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  status: hotelStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  room_number: text('room_number').notNull(),
  room_type: text('room_type').notNull(),
  price_per_night: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  status: roomStatusEnum('status').default('available').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  room_id: uuid('room_id').references(() => rooms.id).notNull(),
  checkin_date: date('checkin_date').notNull(),
  checkout_date: date('checkout_date').notNull(),
  nights: integer('nights').notNull(),
  total_amount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: bookingStatusEnum('status').default('pending_payment').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  booking_id: uuid('booking_id').references(() => bookings.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  provider: paymentProviderEnum('provider').notNull(),
  provider_reference: text('provider_reference'),
  status: paymentStatusEnum('status').default('pending').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

export const paymentLogs = pgTable('payment_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  payment_id: uuid('payment_id').references(() => payments.id).notNull(),
  booking_id: uuid('booking_id').references(() => bookings.id).notNull(),
  action: text('action').notNull(),
  details: text('details'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hotels: many(hotels),
  bookings: many(bookings),
}));

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  owner: one(users, {
    fields: [hotels.owner_id],
    references: [users.id],
  }),
  rooms: many(rooms),
  bookings: many(bookings),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotel_id],
    references: [hotels.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.user_id],
    references: [users.id],
  }),
  hotel: one(hotels, {
    fields: [bookings.hotel_id],
    references: [hotels.id],
  }),
  room: one(rooms, {
    fields: [bookings.room_id],
    references: [rooms.id],
  }),
  payments: many(payments),
  paymentLogs: many(paymentLogs),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [payments.booking_id],
    references: [bookings.id],
  }),
  paymentLogs: many(paymentLogs),
}));

export const paymentLogsRelations = relations(paymentLogs, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentLogs.payment_id],
    references: [payments.id],
  }),
  booking: one(bookings, {
    fields: [paymentLogs.booking_id],
    references: [bookings.id],
  }),
}));