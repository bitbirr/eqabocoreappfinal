-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- customer|hotel_owner|admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- hotels
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  price_per_night NUMERIC(12,2) NOT NULL,
  capacity INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
);
CREATE INDEX idx_rooms_hotel ON rooms(hotel_id);

-- bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (GREATEST(1, (checkout_date - checkin_date))) STORED,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment|confirmed|cancelled|expired|refunded
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, checkin_date, checkout_date, status);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- chappa|telebirr|ebirr|kaafi
  provider_ref TEXT,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|success|failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);

-- payment_logs (for callbacks, audits)
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  provider TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);