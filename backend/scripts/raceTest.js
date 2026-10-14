// scripts/raceTest.js
// Fires many booking requests for the SAME slot at the same moment.
// Usage: node scripts/raceTest.js <slot_id> [count]
const BASE = 'http://localhost:3002/api';
const SLOT_ID = Number(process.argv[2]);
const COUNT = Number(process.argv[3] || 10);

if (!Number.isInteger(SLOT_ID)) {
  console.error('Usage: node scripts/raceTest.js <slot_id> [count]');
  process.exit(1);
}

async function book(i) {
  const res = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slot_id: SLOT_ID,
      name: `Racer ${i}`,
      email: `racer${i}@example.com`,
    }),
  });
  return res.status;
}

(async () => {
  // Array.from + map starts every request immediately, in the same tick;
  // Promise.all then waits for all of them to finish
  const statuses = await Promise.all(
    Array.from({ length: COUNT }, (_, i) => book(i + 1))
  );

  // Count how many of each status code came back
  const tally = {};
  statuses.forEach((s) => { tally[s] = (tally[s] || 0) + 1; });
  console.log('Status counts:', tally);
})();