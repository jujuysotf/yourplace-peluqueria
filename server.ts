import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getCalendarBusyTimes, createGoogleCalendarEvent, hasCalendarCredentials } from './server/calendarService';

// Solo para desarrollo en PCs con antivirus/proxy que interceptan HTTPS (certificado self-signed).
// Nunca usar en producción.
if (process.env.ALLOW_INSECURE_TLS === '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('[dev] ALLOW_INSECURE_TLS=1 — verificación TLS desactivada');
}

const PORT = 3000;
const TIMEZONE_OFFSET = '-03:00';

// Horarios estándar del salón (turnos completos de 1h o 2h entre 09:00 y 20:00)
const SALON_HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Google Calendar Connection Status
  app.get('/api/calendar/status', async (req, res) => {
    try {
      if (!hasCalendarCredentials()) {
        return res.json({
          connected: false,
          calendarId: 'jujuysotf@gmail.com',
          message: 'Sin credenciales activas de Google Service Account'
        });
      }
      const todayStr = new Date().toISOString().split('T')[0];
      const busy = await getCalendarBusyTimes(todayStr);
      res.json({
        connected: true,
        calendarId: 'jujuysotf@gmail.com',
        busySlotsTodayCount: busy.length,
        message: 'Google Calendar API conectado exitosamente con jujuysotf@gmail.com'
      });
    } catch (err: any) {
      const message = err?.message || 'Error al conectar con Google Calendar API';
      console.error('Error in /api/calendar/status:', message);
      res.status(200).json({
        connected: false,
        calendarId: 'jujuysotf@gmail.com',
        error: message,
        hint:
          message.includes('self-signed certificate')
            ? 'En esta PC hay un proxy/antivirus. Agregá ALLOW_INSECURE_TLS=1 al .env (solo local) y reiniciá.'
            : undefined
      });
    }
  });

  // Consultar disponibilidad real del Google Calendar de Jessica
  app.get('/api/calendar/availability', async (req, res) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const durationMinutes = parseInt((req.query.duration as string) || '60', 10);

      // Verificar día de la semana: 0 es Domingo
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();

      if (dayOfWeek === 0) {
        return res.json({
          date,
          isOpen: false,
          reason: 'Domingo cerrado',
          slots: []
        });
      }

      // Obtener rangos ocupados directamente de Google Calendar
      const busyRanges = await getCalendarBusyTimes(date);

      const slots = SALON_HOURS.map((hour) => {
        const [h, m] = hour.split(':').map(Number);
        const startMinutes = h * 60 + m;
        const endMinutes = startMinutes + durationMinutes;

        // Horario límite de cierre: 20:00 hs (1200 minutos)
        if (endMinutes > 20 * 60) {
          return {
            hour,
            isAvailable: false,
            isBlocked: true,
            blockedReason: 'Supera horario de cierre (20:00 hs)'
          };
        }

        // Crear fechas de inicio y fin del slot para contrastar con busyRanges
        const slotStart = new Date(`${date}T${hour}:00${TIMEZONE_OFFSET}`).getTime();
        const endHourStr = Math.floor(endMinutes / 60).toString().padStart(2, '0');
        const endMinStr = (endMinutes % 60).toString().padStart(2, '0');
        const slotEnd = new Date(`${date}T${endHourStr}:${endMinStr}:00${TIMEZONE_OFFSET}`).getTime();

        // Comparar con cada evento en Google Calendar
        for (const busy of busyRanges) {
          const bStart = busy.start.getTime();
          const bEnd = busy.end.getTime();

          // Solapamiento: slotStart < bEnd AND slotEnd > bStart
          if (slotStart < bEnd && slotEnd > bStart) {
            return {
              hour,
              isAvailable: false,
              isBlocked: true,
              blockedReason: busy.summary || 'Ocupado en Google Calendar'
            };
          }
        }

        return {
          hour,
          isAvailable: true,
          isBlocked: false
        };
      });

      res.json({
        date,
        isOpen: true,
        calendarSource: 'Google Calendar (jujuysotf@gmail.com)',
        slots
      });
    } catch (err: any) {
      console.error('Error in /api/calendar/availability:', err);
      res.status(500).json({
        error: 'Error al consultar Google Calendar',
        details: err?.message || String(err)
      });
    }
  });

  // Crear turno y agendar directamente en Google Calendar
  app.post('/api/calendar/book', async (req, res) => {
    try {
      const {
        serviceName,
        serviceDuration,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        clientNotes,
        referenceCode
      } = req.body;

      if (!serviceName || !date || !time || !clientName || !clientPhone) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      const eventData = await createGoogleCalendarEvent({
        serviceName,
        serviceDuration: Number(serviceDuration) || 60,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        clientNotes,
        referenceCode
      });

      res.json({
        success: true,
        message: 'Turno agendado exitosamente en Google Calendar de Jessica',
        eventId: eventData.id,
        htmlLink: eventData.htmlLink,
        status: eventData.status
      });
    } catch (err: any) {
      console.error('Error in /api/calendar/book:', err);
      res.status(500).json({
        error: 'Error al registrar el turno en Google Calendar',
        details: err?.message || String(err)
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
