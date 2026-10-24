import { APP_TIMEZONE } from '@/lib/time';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatAppointmentDateTime(date: Date, _timeZone?: string): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${formatted} IST`;
}
