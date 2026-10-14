// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { seedSlots } = require('./utils/seedSlots');

const app = express();

app.use(cors());
app.use(express.json());

// Health check: handy later to confirm the deployed server is alive
app.get('/', (req, res) => {
  res.json({ status: 'Booking API running' });
});

app.use('/api', slotRoutes);
app.use('/api', bookingRoutes);

// Keep the calendar filled: top up slots at startup, then every 6 hours.
// It is deliberately not awaited, so a slow or failed top-up can never stop the server.
const SIX_HOURS = 6 * 60 * 60 * 1000;

function topUpSlots() {
  seedSlots()
    .then((n) => { if (n > 0) console.log(`Topped up ${n} new slots`); })
    .catch((err) => console.error('Slot top-up failed:', err.message));
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  topUpSlots();
  setInterval(topUpSlots, SIX_HOURS);
});