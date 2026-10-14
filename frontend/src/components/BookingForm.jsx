// src/components/BookingForm.jsx
import { useEffect, useRef, useState } from 'react';
import { createBooking } from '../api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function BookingForm({ slot, onBooked, onSlotTaken }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);

  // The "Book" button you just pressed disappears when this form opens, so move focus
  // into the form. Otherwise keyboard and screen-reader users lose their place.
  useEffect(() => {
    nameRef.current?.focus();
    setError('');
  }, [slot.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // ignore double clicks and double Enter presses

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName) { setError('Enter your name.'); return; }
    if (!EMAIL_RE.test(cleanEmail)) { setError('Enter a valid email address.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const booking = await createBooking(slot.id, cleanName, cleanEmail);
      onBooked(booking);
    } catch (err) {
      // 409 = someone else booked it first. 404 = the slot is no longer bookable.
      // Both mean "pick another time", so the page handles them the same way.
      if (err.status === 409 || err.status === 404) {
        onSlotTaken(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // noValidate turns off the browser's own popups so our messages look consistent
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        Full name
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)}
               maxLength={100} autoComplete="name" />
      </label>

      <label className="field">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               maxLength={150} autoComplete="email" />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Booking...' : 'Confirm booking'}
      </button>
    </form>
  );
}

export default BookingForm;