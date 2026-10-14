// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE;

// If this variable is missing, requests silently go to the wrong place, so shout about it
if (!API_BASE) {
  console.error('VITE_API_BASE is not set. Check frontend/.env (or your Vercel settings).');
}

// An Error that remembers the HTTP status, so the UI can treat a 409 differently
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // fetch itself failed: server down, no network, or blocked by CORS
    throw new ApiError('Could not reach the server. Please try again.', 0);
  }

  // Error responses should be JSON, but don't crash if one isn't
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error || 'Something went wrong', res.status);
  }
  return data;
}

export const getDates = () => request('/dates');

export const getSlots = (date) => request(`/slots?date=${encodeURIComponent(date)}`);

export const createBooking = (slot_id, name, email) =>
  request('/bookings', { method: 'POST', body: JSON.stringify({ slot_id, name, email }) });

export const getBooking = (reference) =>
  request(`/bookings/${encodeURIComponent(reference)}`);

export const cancelBooking = (reference) =>
  request(`/bookings/${encodeURIComponent(reference)}`, { method: 'DELETE' });