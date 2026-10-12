const COURSE_PATTERN = /^[A-Z]{3,4} ?\d{3}[A-Z]?$/;
const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export const MAX_SEATS = 12;

// "csce490" and "csce  490" both become "CSCE 490".
export function normalizeCourse(course) {
  return course
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/^([A-Z]+)(\d)/, '$1 $2');
}

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

// Accepts "9:05" or "09:05" and returns "09:05" so times sort as strings.
export function normalizeTime(time) {
  const match = time.trim().match(TIME_PATTERN);
  if (!match) return null;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function validateSession({ host, course, location, time, seats }) {
  const errors = {};

  if (!normalizeName(host)) errors.host = 'Enter your name.';

  if (!COURSE_PATTERN.test(normalizeCourse(course))) {
    errors.course = 'Use a course code like CSCE 490.';
  }

  if (!location.trim()) errors.location = 'Pick a location.';

  if (!normalizeTime(time)) errors.time = 'Use 24-hour time, e.g. 14:30.';

  const seatCount = Number(seats);
  if (!Number.isInteger(seatCount) || seatCount < 2 || seatCount > MAX_SEATS) {
    errors.seats = `Seats must be a whole number from 2 to ${MAX_SEATS}.`;
  }

  return errors;
}

export function seatsLeft(session) {
  return session.seats - session.attendees.length;
}
