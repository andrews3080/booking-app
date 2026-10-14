// src/pages/BookPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDates, getSlots } from '../api';
import { longDate, monthRange } from '../utils/dates';
import { useSlowFlag } from '../utils/useSlowFlag';
import WeekCalendar from '../components/WeekCalendar';
import SlotSheet from '../components/SlotSheet';
import BookingForm from '../components/BookingForm';
import { CalendarSkeleton } from '../components/Skeletons';

function BookPage() {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // Bumping this number re-runs both loading effects, like a manual refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // True when the first load is taking suspiciously long (a sleeping free-tier server)
  const slowStart = useSlowFlag(datesLoading);

  useEffect(() => {
    let ignore = false;

    getDates()
      .then((data) => {
        if (ignore) return;
        setDates(data);
        // Only choose a default day the first time, so a refresh never moves the user
        const firstOpen = data.find((d) => d.free_slots > 0);
        setSelectedDate((prev) => prev ?? (firstOpen ? firstOpen.date : null));
      })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setDatesLoading(false); });

    return () => { ignore = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedDate) return;

    // Throw away responses from an older day if the user has already clicked another
    let ignore = false;
    setSlotsLoading(true);
    setError('');

    getSlots(selectedDate)
      .then((data) => { if (!ignore) setSlots(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setSlotsLoading(false); });

    return () => { ignore = true; };
  }, [selectedDate, refreshKey]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setNotice('');
  };

  // slot is null when the user presses "Change" to close the form
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setNotice('');
  };

  // The server said the slot is gone: clear the selection, explain, and reload fresh data
  const handleSlotTaken = (message) => {
    setSelectedSlot(null);
    setNotice(`${message}. Pick another time.`);
    setRefreshKey((k) => k + 1);
  };

  const handleRetry = () => {
    setError('');
    setDatesLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleBooked = (booking) => navigate(`/booking/${booking.reference}`);

  const allFull = dates.length > 0 && dates.every((d) => d.free_slots === 0);
  const freeNow = slots.filter((s) => s.available).length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Book a one-hour slot</h1>
        <p>Weekdays, 9:00 to 17:00. Pick a day, then a time.</p>
      </header>

      {error && (
        <div className="banner-error with-action" role="alert">
          <span>{error}</span>
          <button type="button" className="link-btn" onClick={handleRetry}>Try again</button>
        </div>
      )}
      {notice && <div className="banner-notice" role="status">{notice}</div>}
      {datesLoading && slowStart && (
        <div className="banner-notice" role="status">
          The server is waking up. It runs on a free plan, so the first visit can take up
          to a minute.
        </div>
      )}

      <div className="book-cols">
         <section aria-label="Days" className="cal-panel">
        <p className="cal-month">{monthRange(dates) || 'Choose a day'}</p>
          {datesLoading ? (
            <CalendarSkeleton />
          ) : dates.length > 0 ? (
            <>
              <WeekCalendar dates={dates} selectedDate={selectedDate} onSelect={handleSelectDate} />
              <p className="muted cal-note">The bar under each date shows how many hours are still free.</p>
              {allFull && <p className="muted">Everything is fully booked right now.</p>}
            </>
          ) : !error ? (
            <p className="muted">There are no days to book right now.</p>
          ) : null}
        </section>

        <section aria-label="Times" className={selectedDate ? 'sheet-panel' : undefined}>
          {selectedDate ? (
            <>
              <h2 className="sheet-title">{longDate(selectedDate)}</h2>
              {!slotsLoading && (
                <p className="muted sheet-sub">{freeNow} of {slots.length} hours free</p>
              )}
              <SlotSheet
                slots={slots}
                loading={slotsLoading}
                selectedSlotId={selectedSlot?.id}
                onSelect={handleSelectSlot}
              >
                {selectedSlot && (
                  <BookingForm slot={selectedSlot} onBooked={handleBooked} onSlotTaken={handleSlotTaken} />
                )}
              </SlotSheet>
            </>
          ) : (
            !datesLoading && dates.length > 0 && <p className="muted">Pick a day to see its times.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default BookPage;