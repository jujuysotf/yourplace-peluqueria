import { Booking } from '../types';
import { availableHours } from '../data/salonData';

export const LOCAL_STORAGE_BOOKINGS_KEY = 'yourplace_bookings';

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  try {
    const current = getStoredBookings();
    // Avoid duplicates by id or referenceCode
    const filtered = current.filter(b => b.id !== booking.id && b.referenceCode !== booking.referenceCode);
    filtered.push(booking);
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving booking to localStorage', e);
  }
}

export interface HourSlotStatus {
  hour: string;
  isAvailable: boolean;
  isBlocked: boolean;
  blockedReason?: string;
}

/**
 * Converts 'HH:mm' string to number of minutes from start of day
 */
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Client-side fallback calculator
 */
export function calculateHourSlots(
  dateStr: string,
  serviceDurationMinutes: number = 60,
  bookings: Booking[] = []
): HourSlotStatus[] {
  const salonClosingMinutes = 20 * 60; // 20:00 hs closing time

  const dateBookings = bookings.filter(
    (b) => b.date === dateStr && b.status !== 'cancelled'
  );

  return availableHours.map((hour) => {
    const slotStartMinutes = timeToMinutes(hour);
    const slotEndMinutes = slotStartMinutes + serviceDurationMinutes;

    if (slotEndMinutes > salonClosingMinutes) {
      return {
        hour,
        isAvailable: false,
        isBlocked: true,
        blockedReason: 'Supera horario de cierre (20:00 hs)'
      };
    }

    for (const b of dateBookings) {
      const bStart = timeToMinutes(b.time);
      const bDuration = b.serviceDuration || 60;
      const bEnd = bStart + bDuration;

      if (slotStartMinutes < bEnd && slotEndMinutes > bStart) {
        return {
          hour,
          isAvailable: false,
          isBlocked: true,
          blockedReason: 'Turno ya reservado'
        };
      }
    }

    return {
      hour,
      isAvailable: true,
      isBlocked: false
    };
  });
}

/**
 * Query real Google Calendar availability directly from our server API
 */
export async function fetchGoogleCalendarAvailability(
  dateStr: string,
  durationMinutes: number = 60
): Promise<{ slots: HourSlotStatus[]; source: string; warning?: string }> {
  try {
    const res = await fetch(`/api/calendar/availability?date=${dateStr}&duration=${durationMinutes}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.details || data.error || `Server returned ${res.status}`);
    }
    if (data.slots && Array.isArray(data.slots)) {
      return {
        slots: data.slots,
        source: 'google-calendar'
      };
    }
    throw new Error('Formato de respuesta inesperado');
  } catch (err: any) {
    console.warn('Fallback to local availability due to error:', err);
    const localBookings = getStoredBookings();
    return {
      slots: calculateHourSlots(dateStr, durationMinutes, localBookings),
      source: 'local-fallback',
      warning: err?.message || 'No se pudo leer Google Calendar'
    };
  }
}

/**
 * Send booking to Google Calendar through our backend service account
 */
export async function createGoogleCalendarBooking(booking: Booking): Promise<{
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/calendar/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceName: booking.serviceName,
        serviceDuration: booking.serviceDuration,
        date: booking.date,
        time: booking.time,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        clientNotes: booking.clientNotes,
        referenceCode: booking.referenceCode
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        eventId: data.eventId,
        htmlLink: data.htmlLink
      };
    }

    return {
      success: false,
      error: data.error || 'No se pudo agendar en Google Calendar'
    };
  } catch (err: any) {
    console.error('Error communicating with Google Calendar API:', err);
    return {
      success: false,
      error: err?.message || 'Error de conexión con el servidor'
    };
  }
}
