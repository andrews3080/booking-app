// routes/slotRoutes.js
const express = require('express');
const pool = require('../config/db');
const { NOT_IN_PAST } = require('../utils/slotSql');

// A Router is a mini-app that groups related routes; server.js mounts it under /api
const router = express.Router();


// GET /api/dates: upcoming dates with how many free slots each has
router.get('/dates', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         to_char(s.slot_date, 'YYYY-MM-DD') AS date,
         COUNT(*)::int AS total_slots,
         COUNT(*) FILTER (WHERE b.id IS NULL AND ${NOT_IN_PAST})::int AS free_slots
       FROM slots s
       LEFT JOIN bookings b ON b.slot_id = s.id
       WHERE s.slot_date >= CURRENT_DATE
       GROUP BY s.slot_date
       ORDER BY s.slot_date`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// GET /api/slots?date=YYYY-MM-DD: every slot that day, with an "available" flag
router.get('/slots', async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
  }

  try {
    const result = await pool.query(
      `SELECT
         s.id,
         to_char(s.slot_date, 'YYYY-MM-DD') AS date,
         to_char(s.start_time, 'HH24:MI') AS start_time,
         to_char(s.end_time, 'HH24:MI') AS end_time,
         (b.id IS NULL) AS available
       FROM slots s
       LEFT JOIN bookings b ON b.slot_id = s.id
       WHERE s.slot_date = $1 AND ${NOT_IN_PAST}
       ORDER BY s.start_time`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    // 22007 / 22008: Postgres rejected the date (e.g. 2026-13-45), a client mistake, not a server one
    if (err.code === '22007' || err.code === '22008') {
      return res.status(400).json({ error: 'Invalid date' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

module.exports = router;