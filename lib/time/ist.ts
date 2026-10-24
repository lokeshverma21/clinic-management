/**
 * Indian Standard Time (IST) Helpers
 *
 * Core rule:
 * - Instants in storage: Database and APIs store and exchange exact UTC instants (TIMESTAMPTZ / ISO 8601 strings).
 * - IST for interpretation & display: All calendar boundaries ("today"), wall-clock times,
 *   form inputs, working hours, and displayed timestamps are interpreted in Asia/Kolkata (UTC+05:30).
 * - Pure functions, zero React dependency, safe to import on both client and server.
 * - Never use the `any` keyword.
 */

export const APP_TIMEZONE = 'Asia/Kolkata' as const;

/**
 * Fixed offset in milliseconds for Indian Standard Time (UTC+05:30).
 * India has never observed Daylight Saving Time, so this offset is constant.
 */
export const IST_OFFSET_MINUTES = 330;
export const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000; // 19,800,000 ms

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export interface IstParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;  // 0-23
  minute: number;// 0-59
  second: number;// 0-59
  weekday: string; // 'Sunday'..'Saturday'
  shortWeekday: string; // 'Sun'..'Sat'
  monthName: string; // 'January'..'December'
  shortMonth: string; // 'Jan'..'Dec'
}

/**
 * Converts a Date or ISO string into its IST calendar components.
 * Completely immune to machine runtime timezone.
 */
export function getIstParts(input: Date | string | number): IstParts {
  const date = typeof input === 'object' ? input : new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date passed to getIstParts: ${String(input)}`);
  }

  // Shifting the instant by +05:30 and querying UTC getters yields
  // exact IST calendar time regardless of the host machine's timezone.
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);

  const dayOfWeekIndex = shifted.getUTCDay();
  const monthIndex = shifted.getUTCMonth();

  return {
    year: shifted.getUTCFullYear(),
    month: monthIndex + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: WEEKDAYS[dayOfWeekIndex],
    shortWeekday: SHORT_WEEKDAYS[dayOfWeekIndex],
    monthName: MONTHS[monthIndex],
    shortMonth: SHORT_MONTHS[monthIndex],
  };
}

/**
 * Returns the IST calendar date key 'YYYY-MM-DD' for a given instant.
 */
export function istDateKey(input: Date | string | number): string {
  const parts = getIstParts(input);
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${parts.year}-${m}-${d}`;
}

/**
 * Returns today's date key 'YYYY-MM-DD' in Indian Standard Time.
 */
export function todayIstKey(): string {
  return istDateKey(Date.now());
}

/**
 * Returns 'HH:mm' (24-hour time of day) in IST for a given instant.
 * Used for prefilling time inputs and checking doctor working hours.
 */
export function istTimeOfDay(input: Date | string | number): string {
  const parts = getIstParts(input);
  const h = String(parts.hour).padStart(2, '0');
  const m = String(parts.minute).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Combines an IST date string ('YYYY-MM-DD') and IST time string ('HH:mm')
 * into the exact UTC Date instant.
 *
 * Example:
 * combineIstDateAndTime('2026-10-24', '10:30') => 2026-10-24T05:00:00.000Z
 */
export function combineIstDateAndTime(dateKey: string, timeOfDay: string): Date {
  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const [hourStr, minuteStr] = timeOfDay.split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr || '0', 10);
  const minute = parseInt(minuteStr || '0', 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    throw new Error(`Invalid date/time for combineIstDateAndTime: "${dateKey}" "${timeOfDay}"`);
  }

  // Create UTC time corresponding to the given numbers, then subtract IST offset
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0, 0) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

/**
 * Returns the UTC instant for the very start of the IST day (00:00:00.000 IST).
 */
export function startOfIstDay(keyOrDate: string | Date | number): Date {
  const key = typeof keyOrDate === 'string' && keyOrDate.length === 10 && keyOrDate.includes('-')
    ? keyOrDate
    : istDateKey(keyOrDate);
  const [year, month, day] = key.split('-').map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

/**
 * Returns the UTC instant for the very end of the IST day (23:59:59.999 IST).
 */
export function endOfIstDay(keyOrDate: string | Date | number): Date {
  const key = typeof keyOrDate === 'string' && keyOrDate.length === 10 && keyOrDate.includes('-')
    ? keyOrDate
    : istDateKey(keyOrDate);
  const [year, month, day] = key.split('-').map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, 23, 59, 59, 999) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

/**
 * Returns the UTC instant boundaries { start, end } for a given IST calendar day.
 */
export function istDayRange(keyOrDate: string | Date | number = Date.now()): { start: Date; end: Date } {
  return {
    start: startOfIstDay(keyOrDate),
    end: endOfIstDay(keyOrDate),
  };
}

/**
 * Formats a 12-hour time in IST (e.g. "10:30 AM", "12:00 AM", "11:59 PM").
 */
export function formatIstTime(input: Date | string | number): string {
  const parts = getIstParts(input);
  const period = parts.hour >= 12 ? 'PM' : 'AM';
  let hour12 = parts.hour % 12;
  if (hour12 === 0) hour12 = 12;
  const minute = String(parts.minute).padStart(2, '0');
  return `${hour12}:${minute} ${period}`;
}

export type IstDateFormatPattern =
  | 'EEE d MMM yyyy'   // e.g. "Sat 24 Oct 2026"
  | 'EEE, d MMM yyyy'  // e.g. "Sat, 24 Oct 2026"
  | 'd MMM yyyy'       // e.g. "24 Oct 2026"
  | 'MMM d, yyyy'      // e.g. "Oct 24, 2026"
  | 'MMMM d, yyyy'     // e.g. "October 24, 2026"
  | 'yyyy-MM-dd';      // e.g. "2026-10-24"

/**
 * Formats an instant in IST using standard UI patterns.
 * Defaults to 'd MMM yyyy' if not specified.
 */
export function formatIstDate(
  input: Date | string | number,
  pattern: IstDateFormatPattern = 'd MMM yyyy',
): string {
  const parts = getIstParts(input);
  const mShort = SHORT_MONTHS[parts.month - 1];
  const mLong = MONTHS[parts.month - 1];
  const mNum = String(parts.month).padStart(2, '0');
  const dNum = String(parts.day).padStart(2, '0');

  switch (pattern) {
    case 'EEE d MMM yyyy':
      return `${parts.shortWeekday} ${parts.day} ${mShort} ${parts.year}`;
    case 'EEE, d MMM yyyy':
      return `${parts.shortWeekday}, ${parts.day} ${mShort} ${parts.year}`;
    case 'd MMM yyyy':
      return `${parts.day} ${mShort} ${parts.year}`;
    case 'MMM d, yyyy':
      return `${mShort} ${parts.day}, ${parts.year}`;
    case 'MMMM d, yyyy':
      return `${mLong} ${parts.day}, ${parts.year}`;
    case 'yyyy-MM-dd':
      return `${parts.year}-${mNum}-${dNum}`;
    default:
      return `${parts.day} ${mShort} ${parts.year}`;
  }
}

/**
 * Formats both date and time in IST (e.g. "24 Oct 2026, 10:30 AM" or "yyyy-MM-dd HH:mm:ss").
 */
export function formatIstDateTime(
  input: Date | string | number,
  formatStyle: 'display' | 'full' | 'audit' | 'minute' = 'display',
): string {
  const parts = getIstParts(input);
  const time = formatIstTime(input);
  const mShort = SHORT_MONTHS[parts.month - 1];
  const mNum = String(parts.month).padStart(2, '0');
  const dNum = String(parts.day).padStart(2, '0');
  const h24 = String(parts.hour).padStart(2, '0');
  const min = String(parts.minute).padStart(2, '0');
  const sec = String(parts.second).padStart(2, '0');

  if (formatStyle === 'audit') {
    return `${parts.year}-${mNum}-${dNum} ${h24}:${min}:${sec}`;
  }
  if (formatStyle === 'minute') {
    return `${parts.year}-${mNum}-${dNum} ${h24}:${min}`;
  }
  if (formatStyle === 'full') {
    return `${parts.shortWeekday} ${parts.day} ${mShort} ${parts.year}, ${time}`;
  }
  return `${parts.day} ${mShort} ${parts.year}, ${time}`;
}

/**
 * Formats a date-only string ('YYYY-MM-DD') WITHOUT timezone conversion.
 * Avoids any possibility of shifting the calendar date backwards or forwards.
 */
export function formatDateOnly(
  dateOnlyString: string | null | undefined,
  pattern: 'd MMM yyyy' | 'MMM d, yyyy' | 'MMMM d, yyyy' | 'PPP' = 'd MMM yyyy',
): string {
  if (!dateOnlyString) return '—';
  const clean = dateOnlyString.slice(0, 10);
  const [yearStr, monthStr, dayStr] = clean.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12) {
    return dateOnlyString;
  }

  const mShort = SHORT_MONTHS[month - 1];
  const mLong = MONTHS[month - 1];

  switch (pattern) {
    case 'MMM d, yyyy':
      return `${mShort} ${day}, ${year}`;
    case 'PPP':
    case 'MMMM d, yyyy':
      return `${mLong} ${day}, ${year}`;
    case 'd MMM yyyy':
    default:
      return `${day} ${mShort} ${year}`;
  }
}

/**
 * Computes age in years from a date-of-birth date-only string ('YYYY-MM-DD')
 * relative to the current calendar date in Indian Standard Time.
 */
export function ageFromDateOnly(
  dateOfBirth: string | null | undefined,
  nowInput: Date | number = Date.now(),
): number | null {
  if (!dateOfBirth) return null;
  const clean = dateOfBirth.slice(0, 10);
  const [yStr, mStr, dStr] = clean.split('-');
  const birthYear = parseInt(yStr, 10);
  const birthMonth = parseInt(mStr, 10);
  const birthDay = parseInt(dStr, 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    return null;
  }

  const today = getIstParts(nowInput);
  let age = today.year - birthYear;
  const mDiff = today.month - birthMonth;

  if (mDiff < 0 || (mDiff === 0 && today.day < birthDay)) {
    age -= 1;
  }

  return Math.max(0, age);
}
