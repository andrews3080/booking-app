// src/components/TicketCard.jsx
import { longDate, parseDate } from '../utils/dates';

// The tear-off appointment card. Used on the confirmation page and the manage page.
function TicketCard({ booking, label }) {
  const d = parseDate(booking.date);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const month = d.toLocaleDateString('en-GB', { month: 'long' });

  return (
    <article className="ticket" aria-label={`Booking ${booking.reference}`}>
      <div className="ticket-main">
        <p className="ticket-label">{label}</p>

        {/* The big date is for the eyes; screen readers get the full date from the hidden text */}
        <div className="ticket-date" aria-hidden="true">
          <span className="ticket-day">{d.getDate()}</span>
          <span className="ticket-month">{weekday}<br />{month}</span>
        </div>
        <span className="sr-only">{longDate(booking.date)}</span>

        <p className="ticket-time">{booking.start_time} - {booking.end_time}</p>
        <p className="ticket-who">{booking.name}, {booking.email}</p>
      </div>

      <div className="ticket-stub">
        <i className="ticket-notch top" aria-hidden="true" />
        <i className="ticket-notch bottom" aria-hidden="true" />
        <span className="ticket-code">{booking.reference}</span>
      </div>
    </article>
  );
}

export default TicketCard;