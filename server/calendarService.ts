import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const OWNER_CALENDAR_ID = 'jujuysotf@gmail.com';
const TIMEZONE = 'America/Argentina/Buenos_Aires';
const TIMEZONE_OFFSET = '-03:00';

export function hasCalendarCredentials(): boolean {
  const credPath = path.join(process.cwd(), 'google-credentials.json');
  return (
    fs.existsSync(credPath) ||
    !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    (!!process.env.GOOGLE_CLIENT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY)
  );
}

// Initialize Google Auth client with Service Account if available
function getCalendarClient() {
  let clientEmail: string | undefined;
  let privateKey: string | undefined;

  const credPath = path.join(process.cwd(), 'google-credentials.json');
  if (fs.existsSync(credPath)) {
    try {
      const raw = fs.readFileSync(credPath, 'utf8');
      const credentials = JSON.parse(raw);
      clientEmail = credentials.client_email;
      privateKey = credentials.private_key;
    } catch (e) {
      console.error('Error reading google-credentials.json:', e);
    }
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      clientEmail = credentials.client_email;
      privateKey = credentials.private_key;
    } catch (e) {
      console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_KEY JSON:', e);
    }
  } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Format private key if escaped \n are present
    privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });

  return google.calendar({ version: 'v3', auth });
}

export interface BusyRange {
  start: Date;
  end: Date;
  summary?: string;
}

/**
 * Queries Google Calendar FreeBusy and Events for the given date
 */
export async function getCalendarBusyTimes(dateStr: string): Promise<BusyRange[]> {
  const calendar = getCalendarClient();
  if (!calendar) {
    return [];
  }

  try {
    // Argentina Timezone: -03:00
    const timeMin = `${dateStr}T00:00:00${TIMEZONE_OFFSET}`;
    const timeMax = `${dateStr}T23:59:59${TIMEZONE_OFFSET}`;

    // 1. Query FreeBusy API
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        items: [{ id: OWNER_CALENDAR_ID }]
      }
    });

    const busyList = freeBusyRes.data.calendars?.[OWNER_CALENDAR_ID]?.busy || [];
    const ranges: BusyRange[] = busyList.map((item) => ({
      start: new Date(item.start!),
      end: new Date(item.end!)
    }));

    // 2. Also query Events list to catch any all-day or specific events
    try {
      const eventsRes = await calendar.events.list({
        calendarId: OWNER_CALENDAR_ID,
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = eventsRes.data.items || [];
      for (const ev of events) {
        if (ev.status === 'cancelled') continue;
        if (ev.start?.dateTime && ev.end?.dateTime) {
          ranges.push({
            start: new Date(ev.start.dateTime),
            end: new Date(ev.end.dateTime),
            summary: ev.summary || 'Ocupado'
          });
        } else if (ev.start?.date) {
          // All-day event (e.g. vacation / closed)
          ranges.push({
            start: new Date(`${ev.start.date}T00:00:00${TIMEZONE_OFFSET}`),
            end: new Date(`${ev.start.date}T23:59:59${TIMEZONE_OFFSET}`),
            summary: ev.summary || 'Día Bloqueado'
          });
        }
      }
    } catch (e) {
      console.warn('Could not fetch events list, relying on freebusy', e);
    }

    return ranges;
  } catch (err: any) {
    console.error('Error querying Google Calendar:', err?.message || err);
    return [];
  }
}

/**
 * Creates an event in the salon's Google Calendar.
 *
 * Service accounts on personal Gmail cannot invite attendees
 * (needs Domain-Wide Delegation / Google Workspace). Client info
 * is stored in the event description; the UI can offer "Add to my calendar".
 */
export async function createGoogleCalendarEvent(bookingData: {
  serviceName: string;
  serviceDuration: number;
  date: string;
  time: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientNotes?: string;
  referenceCode?: string;
}) {
  const calendar = getCalendarClient();
  if (!calendar) {
    return {
      id: 'local-' + Date.now(),
      status: 'confirmed',
      htmlLink: ''
    };
  }

  const [hours, minutes] = bookingData.time.split(':').map(Number);
  const startMinTotal = hours * 60 + minutes;
  const endMinTotal = startMinTotal + bookingData.serviceDuration;
  const endHours = Math.floor(endMinTotal / 60).toString().padStart(2, '0');
  const endMins = (endMinTotal % 60).toString().padStart(2, '0');
  const endTimeStr = `${endHours}:${endMins}`;

  const startDateTime = `${bookingData.date}T${bookingData.time}:00${TIMEZONE_OFFSET}`;
  const endDateTime = `${bookingData.date}T${endTimeStr}:00${TIMEZONE_OFFSET}`;

  const description = [
    `Turno en Peluqueria Your place (Jessica Lescano)`,
    `----------------------------------------------------`,
    `Ref: ${bookingData.referenceCode || 'YP-' + Date.now().toString().slice(-4)}`,
    `Servicio: ${bookingData.serviceName} (${bookingData.serviceDuration} min)`,
    `Clienta: ${bookingData.clientName}`,
    `Telefono: ${bookingData.clientPhone}`,
    bookingData.clientEmail ? `Email: ${bookingData.clientEmail}` : '',
    bookingData.clientNotes ? `Nota de la clienta: ${bookingData.clientNotes}` : '',
    ``,
    `Salon: Libertad y Lavalle, San Miguel de Tucuman`,
    `WhatsApp Salon: +54 9 3886 07-4857`
  ].filter(Boolean).join('\n');

  const eventPayload: any = {
    summary: `Turno Your place: ${bookingData.serviceName} - ${bookingData.clientName}`,
    description,
    location: 'Libertad y Lavalle, San Miguel de Tucuman, Argentina',
    start: {
      dateTime: startDateTime,
      timeZone: TIMEZONE
    },
    end: {
      dateTime: endDateTime,
      timeZone: TIMEZONE
    },
    colorId: '4',
    status: 'confirmed',
    transparency: 'opaque',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 120 },
        { method: 'email', minutes: 1440 }
      ]
    }
  };

  const created = await calendar.events.insert({
    calendarId: OWNER_CALENDAR_ID,
    requestBody: eventPayload
  });

  return created.data;
}
