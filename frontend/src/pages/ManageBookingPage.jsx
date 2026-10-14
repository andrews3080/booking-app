// src/pages/ManageBookingPage.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooking, cancelBooking } from '../api';
import { longDate } from '../utils/dates';
import TicketCard from '../components/TicketCard';

// References are 8 hex characters. Strip spaces and uppercase first, so a code
// pasted as "3f9a 12bc" still works.
const cleanReference = (raw) => raw.replace(/\s+/g, '').toUpperCase();
const REF_RE = /^[A-F0-9]{8}$/;

function ManageBookingPage() {
  // The confirmation page links here as /manage?ref=XXXXXXXX
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [input, setInput] = useState(initialRef);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const [confirming, setConfirming] = useState(false); // showing the "are you sure?" step
  const [cancelling, setCancelling] = useState(false);
  const [cancelledRef, setCancelledRef] = useState('');

  const lookup = async (rawRef) => {
    const ref = cleanReference(rawRef);
    // Start from a clean slate every time
    setError('');
    setBooking(null);
    setConfirming(false);
    setCancelledRef('');

    // Catch obvious typos without bothering the server
    if (!REF_RE.test(ref)) {
      setError('A booking reference has 8 characters (the numbers 0-9 and letters A-F), like 3F9A12BC.');
      return;
    }

    setLooking(true);
    try {
      setBooking(await getBooking(ref));
    } catch (err) {
      setError(
        err.status === 404
          ? "We couldn't find a booking with that code. Check it and try again."
          : err.message
      );
    } finally {
      setLooking(false);
    }
  };

  // Arrived with ?ref=... from the confirmation page: look it up straight away (runs once)
  useEffect(() => {
    if (initialRef) lookup(initialRef);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!looking) lookup(input);
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      await cancelBooking(booking.reference);
      setCancelledRef(booking.reference);
      setBooking(null);
      setInput('');
    } catch (err) {
      if (err.status === 404) {
        // Already cancelled, for example from another tab: the slot is free either way
        setError('This booking has already been cancelled.');
        setBooking(null);
      } else {
        setError(err.message);
      }
    } finally {
      setConfirming(false);
      setCancelling(false);
    }
  };

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1><span aria-hidden="true">🔎</span> Manage your booking</h1>
        <p>Enter your booking reference to view or cancel your slot.</p>
      </header>

      {cancelledRef && (
        <div className="banner-success" role="status">
          Booking {cancelledRef} is cancelled, and the time is free for others again.{' '}
          <Link to="/">Book a new slot</Link>
        </div>
      )}
      {error && <div className="banner-error" role="alert">{error}</div>}

      <form className="lookup-row" onSubmit={handleSubmit} noValidate>
        <label className="field lookup-field">
          Booking reference
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 3F9A12BC"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={20}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={looking}>
          {looking ? 'Looking...' : 'Find booking'}
        </button>
      </form>

      {booking && (
        <>
          <TicketCard booking={booking} label="Your booking" />

          <div className="manage-actions">
            {!confirming ? (
              <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
                Cancel this booking
              </button>
            ) : (
              <div className="cancel-confirm">
                <p>
                  Cancel your booking on <strong>{longDate(booking.date)}</strong> at{' '}
                  <strong>{booking.start_time}</strong>? This can't be undone.
                </p>
                <div className="action-row">
                  <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? 'Cancelling...' : 'Yes, cancel booking'}
                  </button>
                  <button type="button" className="btn" onClick={() => setConfirming(false)} disabled={cancelling}>
                    Keep booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ManageBookingPage;