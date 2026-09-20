import { Booking } from '../types';

export type GoogleProfile = {
  name: string;
  email: string;
  picture?: string;
  sub: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
      error_callback?: (error: { type?: string; message?: string }) => void;
    }) => GoogleTokenClient;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

const TIMEZONE = 'America/Argentina/Buenos_Aires';
const TIMEZONE_OFFSET = '-03:00';

/** In-memory only — never persist access tokens in localStorage */
let googleAccessToken: string | null = null;

export function getGoogleAccessToken(): string | null {
  return googleAccessToken;
}

export function clearGoogleAccessToken(): void {
  googleAccessToken = null;
}

function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
}

function waitForGoogleScript(timeoutMs = 8000): Promise<GoogleAccounts> {
  return new Promise((resolve, reject) => {
    const existing = window.google?.accounts;
    if (existing?.oauth2) {
      resolve(existing);
      return;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      const accounts = window.google?.accounts;
      if (accounts?.oauth2) {
        window.clearInterval(timer);
        resolve(accounts);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('No se pudo cargar Google Identity Services. Revisá tu conexión e intentá de nuevo.'));
      }
    }, 100);
  });
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el perfil de Google.');
  }

  const data = await res.json();
  if (!data.email) {
    throw new Error('La cuenta de Google no devolvió un email.');
  }

  return {
    name: data.name || data.email.split('@')[0],
    email: data.email,
    picture: data.picture,
    sub: data.sub || data.email
  };
}

function requestAccessToken(prompt: 'select_account' | '' = 'select_account'): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return Promise.reject(
      new Error(
        'Falta VITE_GOOGLE_CLIENT_ID en el archivo .env. Creá un OAuth Client ID (tipo Web) en Google Cloud Console y agregalo ahí.'
      )
    );
  }

  return waitForGoogleScript().then(
    (accounts) =>
      new Promise<string>((resolve, reject) => {
        const tokenClient = accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPES,
          callback: (response) => {
            if (response.error || !response.access_token) {
              reject(
                new Error(
                  response.error_description ||
                    response.error ||
                    'Inicio de sesión con Google cancelado o fallido.'
                )
              );
              return;
            }
            googleAccessToken = response.access_token;
            resolve(response.access_token);
          },
          error_callback: (error) => {
            reject(new Error(error?.message || 'No se pudo abrir el login de Google.'));
          }
        });

        tokenClient.requestAccessToken({ prompt });
      })
  );
}

/**
 * Opens the real Google account picker, requests Calendar write access,
 * and returns the selected profile.
 */
export async function signInWithGoogleAccount(): Promise<GoogleProfile> {
  const accessToken = await requestAccessToken('select_account');
  return fetchGoogleProfile(accessToken);
}

function buildEventTimes(date: string, time: string, durationMinutes: number) {
  const [hours, minutes] = time.split(':').map(Number);
  const startMinTotal = hours * 60 + minutes;
  const endMinTotal = startMinTotal + durationMinutes;
  const endHours = Math.floor(endMinTotal / 60).toString().padStart(2, '0');
  const endMins = (endMinTotal % 60).toString().padStart(2, '0');

  return {
    start: `${date}T${time}:00${TIMEZONE_OFFSET}`,
    end: `${date}T${endHours}:${endMins}:00${TIMEZONE_OFFSET}`
  };
}

/**
 * Creates the appointment on the signed-in client's primary Google Calendar.
 */
export async function addBookingToClientGoogleCalendar(booking: Booking): Promise<{
  success: boolean;
  htmlLink?: string;
  error?: string;
}> {
  let token = getGoogleAccessToken();
  if (!token) {
    try {
      token = await requestAccessToken('');
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'No hay sesión de Google activa para sincronizar tu Calendar.'
      };
    }
  }

  const { start, end } = buildEventTimes(
    booking.date,
    booking.time,
    booking.serviceDuration || 60
  );

  const description = [
    `Turno en Peluqueria Your place (Jessica Lescano)`,
    `----------------------------------------------------`,
    `Ref: #${booking.referenceCode}`,
    `Servicio: ${booking.serviceName} (${booking.serviceDuration} min)`,
    `Profesional: ${booking.stylistName}`,
    `Telefono salón: +54 9 3886 07-4857`,
    booking.clientNotes ? `Nota: ${booking.clientNotes}` : '',
    ``,
    `Salon: Libertad y Lavalle, San Miguel de Tucuman`
  ]
    .filter(Boolean)
    .join('\n');

  const payload = {
    summary: `Turno Your place: ${booking.serviceName}`,
    description,
    location: 'Libertad y Lavalle, San Miguel de Tucuman, Argentina',
    start: { dateTime: start, timeZone: TIMEZONE },
    end: { dateTime: end, timeZone: TIMEZONE },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 120 },
        { method: 'email', minutes: 1440 }
      ]
    }
  };

  const insertOnce = async (accessToken: string) =>
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

  try {
    let res = await insertOnce(token);

    // Token expired → ask again quietly and retry once
    if (res.status === 401) {
      token = await requestAccessToken('');
      res = await insertOnce(token);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const apiMessage = data?.error?.message || `Error HTTP ${res.status}`;
      return {
        success: false,
        error:
          apiMessage.includes('accessNotConfigured') || apiMessage.includes('has not been used')
            ? 'Habilitá la API de Google Calendar en tu proyecto de Google Cloud.'
            : apiMessage
      };
    }

    return {
      success: true,
      htmlLink: data.htmlLink
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'No se pudo agregar el turno a tu Google Calendar.'
    };
  }
}
