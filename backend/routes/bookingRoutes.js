// routes/bookingRoutes.js
const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const { NOT_IN_PAST } = require('../utils/slotSql');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/bookings: body { slot_id, name, email }
router.post('/bookings', async (req, res) => {
  const { slot_id, name, email } = req.body;

  // Never trust the client: validate everything
  const slotId = Number(slot_id);
  if (!Number.isInteger(slotId) || slotId <= 0) {
    return res.status(400).json({ error: 'slot_id must be a positive integer' });
  }
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanName || cleanName.length > 100) {
    return res.status(400).json({ error: 'name is required (max 100 characters)' });
  }
  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 150) {
    return res.status(400).json({ error: 'a valid email is required' });
  }

  // A random reference could (very rarely) collide with an existing one,
  // so allow a few attempts with a fresh code each time
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A3F9C21B"

    try {
      // INSERT ... SELECT: the row is only inserted if the slot exists AND hasn't started.
      // No separate "is it free?" check: the UNIQUE constraint on slot_id decides that.
      const result = await pool.query(
        `INSERT INTO bookings (slot_id, name, email, reference)
         SELECT s.id, $2::text, $3::text, $4::text
         FROM slots s
         WHERE s.id = $1 AND ${NOT_IN_PAST}
         RETURNING id, slot_id, name, email, reference, created_at`,
        [slotId, cleanName, cleanEmail, reference]
      );

      if (result.rows.length === 0) {
        // The SELECT matched nothing: slot doesn't exist, or it is already in the past
        return res.status(404).json({ error: 'Slot not found or no longer available' });
      }

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      // 23505 = unique_violation. Check WHICH constraint was hit.
      if (err.code === '23505' && err.constraint === 'bookings_slot_id_key') {
        return res.status(409).json({ error: 'That slot was just booked by someone else' });
      }
      if (err.code === '23505' && err.constraint === 'bookings_reference_key') {
        continue; // reference collision: loop around and try a new code
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  res.status(500).json({ error: 'Could not generate a unique booking reference' });
});

// Reference codes are 8 uppercase hex characters (we generate them that way).
// Normalizing lets users type them in lowercase or with spaces.
function normalizeReference(raw) {
  const ref = String(raw).trim().toUpperCase();
  return /^[A-F0-9]{8}$/.test(ref) ? ref : null;
}

// GET /api/bookings/:reference: booking details plus the slot's date and time
router.get('/bookings/:reference', async (req, res) => {
  const reference = normalizeReference(req.params.reference);
  if (!reference) return res.status(404).json({ error: 'Booking not found' });

  try {
    const result = await pool.query(
      `SELECT
         b.reference, b.name, b.email, b.created_at,
         to_char(s.slot_date, 'YYYY-MM-DD') AS date,
         to_char(s.start_time, 'HH24:MI') AS start_time,
         to_char(s.end_time, 'HH24:MI') AS end_time
       FROM bookings b
       JOIN slots s ON s.id = b.slot_id
       WHERE b.reference = $1`,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// DELETE /api/bookings/:reference: cancel a booking, which frees the slot
router.delete('/bookings/:reference', async (req, res) => {
  const reference = normalizeReference(req.params.reference);
  if (!reference) return res.status(404).json({ error: 'Booking not found' });

  try {
    const result = await pool.query(
      'DELETE FROM bookings WHERE reference = $1 RETURNING reference',
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ cancelled: result.rows[0].reference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;