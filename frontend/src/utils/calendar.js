// src/utils/calendar.js

// Escape characters that have a special meaning inside an .ics text value
function escapeText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Lines longer than 75 characters must be "folded": split, with each continuation
// line starting with a single space
function fold(line) {
  const parts = [];
  while (line.length > 75) {
    parts.push(line.slice(0, 75));
    line = ' ' + line.slice(75);
  }
  parts.push(line);
  return parts.join('\r\n');
}

// "2026-10-12" + "09:00" -> "20261012T090000" (local time, no timezone)
function icsDateTime(date, time) {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

function describe(booking, manageUrl) {
  return `Booking reference: ${booking.reference}\nTo view or cancel this booking, visit ${manageUrl}`;
}

export function buildIcs(booking, manageUrl) {
  // DTSTAMP is "when this file was made", always in UTC (the trailing Z)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Appointments//Booking App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.reference}@appointments`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsDateTime(booking.date, booking.start_time)}`,
    `DTEND:${icsDateTime(booking.date, booking.end_time)}`,
    'SUMMARY:Appointment',
    `DESCRIPTION:${escapeText(describe(booking, manageUrl))}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // The .ics format requires Windows-style line endings (\r\n)
  return lines.map(fold).join('\r\n') + '\r\n';
}

// Makes the browser download the .ics file
export function downloadIcs(booking, manageUrl) {
  const blob = new Blob([buildIcs(booking, manageUrl)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${booking.reference}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke after a moment: freeing it instantly can cancel the download in some browsers
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// A link that opens Google Calendar with the event pre-filled
export function googleCalendarUrl(booking, manageUrl) {
  const start = icsDateTime(booking.date, booking.start_time);
  const end = icsDateTime(booking.date, booking.end_time);
  return 'https://calendar.google.com/calendar/render?' + [
    'action=TEMPLATE',
    `text=${encodeURIComponent('Appointment')}`,
    `dates=${start}/${end}`,
    `details=${encodeURIComponent(describe(booking, manageUrl))}`,
  ].join('&');
}