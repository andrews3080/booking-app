-- schema.sql

-- One row per bookable time slot
CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE (slot_date, start_time)   -- no duplicate slots; makes the seed script safe to re-run
);

-- One row per confirmed booking
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  slot_id INT NOT NULL UNIQUE REFERENCES slots(id) ON DELETE CASCADE,  -- UNIQUE = one booking per slot
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  reference VARCHAR(12) NOT NULL UNIQUE,   -- short code for looking up / cancelling
  created_at TIMESTAMP DEFAULT NOW()
);