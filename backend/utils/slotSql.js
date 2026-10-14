// utils/slotSql.js
// SQL fragment meaning "this slot has not started yet".
// It expects the slots table to be aliased as `s` in the query.
// The time-of-day check only applies to TODAY's slots; any earlier date is always past.
const NOT_IN_PAST = `(s.slot_date > CURRENT_DATE
  OR (s.slot_date = CURRENT_DATE AND s.start_time > LOCALTIME))`;

module.exports = { NOT_IN_PAST };