// src/components/WeekCalendar.jsx
import { groupIntoWeeks, longDate, parseDate } from '../utils/dates';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function WeekCalendar({ dates, selectedDate, onSelect }) {
  // flat() turns the weeks into one list of cells; the 5-column grid wraps them into rows
  const cells = groupIntoWeeks(dates).flat();

  return (
    <div className="cal" role="group" aria-label="Choose a day">
      {DAY_NAMES.map((name) => <div key={name} className="cal-head">{name}</div>)}

      {cells.map((cell, i) => {
        if (!cell) return <div key={`gap-${i}`} className="cal-gap" aria-hidden="true" />;

        const full = cell.free_slots === 0;
        const selected = cell.date === selectedDate;
        const pct = cell.total_slots > 0 ? Math.round((cell.free_slots / cell.total_slots) * 100) : 0;

        return (
          <button
            key={cell.date}
            type="button"
            disabled={full}
            aria-pressed={selected}
            aria-label={`${longDate(cell.date)}, ${full ? 'fully booked' : `${cell.free_slots} hours free`}`}
            className={`cal-day${selected ? ' selected' : ''}${full ? ' full' : ''}`}
            onClick={() => onSelect(cell.date)}
          >
            <span className="cal-num">{parseDate(cell.date).getDate()}</span>
            {!full && <span className="cal-bar" style={{ width: `${pct}%` }} />}
          </button>
        );
      })}
    </div>
  );
}

export default WeekCalendar;