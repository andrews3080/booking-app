// scripts/seedSlots.js: run by hand with `node scripts/seedSlots.js`
const pool = require('../config/db');
const { seedSlots } = require('../utils/seedSlots');

seedSlots()
  .then((n) => console.log(`Inserted ${n} new slots`))
  .catch((err) => console.error('Seeding failed:', err))
  .finally(() => pool.end()); // close the pool so the script can exit