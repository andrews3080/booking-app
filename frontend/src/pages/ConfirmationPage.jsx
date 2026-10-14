// src/pages/ConfirmationPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBooking } from '../api';
import { downloadIcs, googleCalendarUrl } from '../utils/calendar';
import TicketCard from '../components/TicketCard';

function ConfirmationPage() {
  const { reference } = useParams(); // the :reference part of the URL
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // The page loads the booking by its code from the URL, rather than receiving it from
  // the form. That means refreshing the page, or opening the link later, still works.
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    setBooking(null);

    getBooking(reference)
      .then((data) => { if (!ignore) setBooking(data); })
      .catch((err) => {
        if (ignore) return;
        setError(err.status === 404 ? "We couldn't find a booking with that code." : err.message);
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [reference]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by the browser; the code is on screen anyway
    }
  };

  if (loading) {
    return (
      <div className="page page-narrow" role="status">
        <span className="sr-only">Loading your booking</span>
        <div className="skeleton skeleton-ticket" aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="banner-error" role="alert">{error}</div>
        <Link to="/" className="btn">Back to booking</Link>
      </div>
    );
  }

  // Link to the manage page; it is also written into the calendar event
  const manageUrl = `${window.location.origin}/manage?ref=${booking.reference}`;

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1><span aria-hidden="true">🎉</span> Booking confirmed</h1>
        <p>Keep the code on the stub. You need it to view or cancel this booking.</p>
      </header>

      <TicketCard booking={booking} label="Office hours" />

      <div className="ticket-actions">
        <a
          className="btn btn-small"
          href={googleCalendarUrl(booking, manageUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Calendar
        </a>
        <button type="button" className="btn btn-small" onClick={() => downloadIcs(booking, manageUrl)}>
          Download .ics file
        </button>
        <button type="button" className="btn btn-small" onClick={copyCode}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>

      <div className="ticket-links">
        <Link className="text-link" to={`/manage?ref=${booking.reference}`}>Manage this booking</Link>
        <Link className="text-link" to="/">Book another slot</Link>
      </div>
    </div>
  );
}

export default ConfirmationPage;