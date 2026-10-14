// src/components/SlotSheet.jsx
import { SheetSkeleton } from './Skeletons';

// A ruled sign-up sheet: one row per hour. The booking form (children) opens
// inside the row you picked, so there is nothing to scroll to.
function SlotSheet({ slots, loading, selectedSlotId, onSelect, children }) {
  if (loading) return <SheetSkeleton />;
  if (slots.length === 0) return <p className="muted">No times left on this day.</p>;

  return (
    <ul className="sheet">
      {slots.map((s) => {
        const time = `${s.start_time} - ${s.end_time}`;

        if (!s.available) {
          return (
            <li key={s.id} className="sheet-row taken">
              <span className="sheet-time">{time}</span>
              <span className="sheet-leader" />
              <span className="sheet-tag">Taken</span>
            </li>
          );
        }

        if (s.id === selectedSlotId) {
          return (
            <li key={s.id} className="sheet-pick">
              <div className="sheet-row">
                <span className="sheet-time sheet-time-pick">{time}</span>
                <span className="sheet-leader sheet-leader-hidden" />
                <button type="button" className="link-btn" onClick={() => onSelect(null)}>Change</button>
              </div>
              {children}
            </li>
          );
        }

        return (
          <li key={s.id} className="sheet-row">
            <span className="sheet-time">{time}</span>
            <span className="sheet-leader" />
            <button type="button" className="sheet-book" aria-label={`Book ${time}`} onClick={() => onSelect(s)}>
              Book
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default SlotSheet;