// utils/seedSlots.js
const pool = require('../config/db');

// Creates any missing slots for the next 14 days (hourly, Mon-Fri, 09:00-17:00).
// Safe to run any number of times: slots that already exist are skipped,
// and existing bookings are never touched.
async function seedSlots() {
  const result = await pool.query(
    `INSERT INTO slots (slot_date, start_time, end_time)
     SELECT d::date, make_time(h, 0, 0), make_time(h + 1, 0, 0)
     FROM generate_series(CURRENT_DATE, CURRENT_DATE + 13, interval '1 day') AS d
     CROSS JOIN generate_series(9, 16) AS h
     WHERE EXTRACT(ISODOW FROM d) < 6          -- 1 = Monday ... 5 = Friday
     ON CONFLICT (slot_date, start_time) DO NOTHING`
  );
  return result.rowCount; // how many NEW slots were created
}

module.exports = { seedSlots };