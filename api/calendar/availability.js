// server/createApp.ts
import express from "express";

// server/calendarService.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";
var OWNER_CALENDAR_ID = "jujuysotf@gmail.com";
var TIMEZONE = "America/Argentina/Buenos_Aires";
var TIMEZONE_OFFSET = "-03:00";
function getCalendarClient() {
  let clientEmail;
  let privateKey;
  const credPath = path.join(process.cwd(), "google-credentials.json");
  if (fs.existsSync(credPath)) {
    try {
      const raw = fs.readFileSync(credPath, "utf8");
      const credentials = JSON.parse(raw);
      clientEmail = credentials.client_email;
      privateKey = credentials.private_key;
    } catch (e) {
      console.error("Error reading google-credentials.json:", e);
    }
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      clientEmail = credentials.client_email;
      privateKey = credentials.private_key;
    } catch (e) {
      console.error("Error parsing GOOGLE_SERVICE_ACCOUNT_KEY JSON:", e);
    }
  } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  }
  if (!clientEmail || !privateKey) {
    return null;
  }
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ]
  });
  return google.calendar({ version: "v3", auth });
}
async function getCalendarBusyTimes(dateStr) {
  const calendar = getCalendarClient();
  if (!calendar) {
    return [];
  }
  const timeMin = `${dateStr}T00:00:00${TIMEZONE_OFFSET}`;
  const timeMax = `${dateStr}T23:59:59${TIMEZONE_OFFSET}`;
  const freeBusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: TIMEZONE,
      items: [{ id: OWNER_CALENDAR_ID }]
    }
  });
  const calResult = freeBusyRes.data.calendars?.[OWNER_CALENDAR_ID];
  if (calResult?.errors?.length) {
    const detail = calResult.errors.map((e) => e.reason || e.domain).join(", ");
    throw new Error(
      `Sin acceso al Calendar de ${OWNER_CALENDAR_ID} (${detail}). Compart\xED el calendario con la Service Account (permiso "Hacer cambios en los eventos").`
    );
  }
  const busyList = calResult?.busy || [];
  const ranges = busyList.map((item) => ({
    start: new Date(item.start),
    end: new Date(item.end)
  }));
  try {
    const eventsRes = await calendar.events.list({
      calendarId: OWNER_CALENDAR_ID,
      timeMin,
      timeMax,
      timeZone: TIMEZONE,
      singleEvents: true,
      orderBy: "startTime"
    });
    const events = eventsRes.data.items || [];
    for (const ev of events) {
      if (ev.status === "cancelled") continue;
      if (ev.start?.dateTime && ev.end?.dateTime) {
        ranges.push({
          start: new Date(ev.start.dateTime),
          end: new Date(ev.end.dateTime),
          summary: ev.summary || "Ocupado"
        });
      } else if (ev.start?.date) {
        ranges.push({
          start: /* @__PURE__ */ new Date(`${ev.start.date}T00:00:00${TIMEZONE_OFFSET}`),
          end: /* @__PURE__ */ new Date(`${ev.start.date}T23:59:59${TIMEZONE_OFFSET}`),
          summary: ev.summary || "D\xEDa Bloqueado"
        });
      }
    }
  } catch (e) {
    console.warn("Could not fetch events list, relying on freebusy", e);
  }
  return ranges;
}

// server/createApp.ts
var TIMEZONE_OFFSET2 = "-03:00";
var SALON_HOURS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00"
];
function queryValue(req, key) {
  const fromQuery = req.query?.[key];
  if (typeof fromQuery === "string" && fromQuery) return fromQuery;
  const url = new URL(req.url || "/", "http://127.0.0.1");
  return url.searchParams.get(key) || void 0;
}
async function calendarAvailabilityHandler(req, res) {
  try {
    const date = queryValue(req, "date") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const durationRaw = queryValue(req, "duration") || "60";
    const durationMinutes = parseInt(durationRaw, 10);
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) {
      return res.json({
        date,
        isOpen: false,
        reason: "Domingo cerrado",
        slots: []
      });
    }
    const busyRanges = await getCalendarBusyTimes(date);
    const slots = SALON_HOURS.map((hour) => {
      const [h, m] = hour.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + durationMinutes;
      if (endMinutes > 20 * 60) {
        return {
          hour,
          isAvailable: false,
          isBlocked: true,
          blockedReason: "Supera horario de cierre (20:00 hs)"
        };
      }
      const slotStart = (/* @__PURE__ */ new Date(`${date}T${hour}:00${TIMEZONE_OFFSET2}`)).getTime();
      const endHourStr = Math.floor(endMinutes / 60).toString().padStart(2, "0");
      const endMinStr = (endMinutes % 60).toString().padStart(2, "0");
      const slotEnd = (/* @__PURE__ */ new Date(`${date}T${endHourStr}:${endMinStr}:00${TIMEZONE_OFFSET2}`)).getTime();
      for (const busy of busyRanges) {
        const bStart = busy.start.getTime();
        const bEnd = busy.end.getTime();
        if (slotStart < bEnd && slotEnd > bStart) {
          return {
            hour,
            isAvailable: false,
            isBlocked: true,
            blockedReason: busy.summary || "Ocupado en Google Calendar"
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
      calendarSource: "Google Calendar (jujuysotf@gmail.com)",
      slots
    });
  } catch (err) {
    console.error("Error in /api/calendar/availability:", err);
    res.status(500).json({
      error: "Error al consultar Google Calendar",
      details: err?.message || String(err)
    });
  }
}

// server/handlers/http.ts
async function runNodeHandler(request, handler) {
  const url = new URL(request.url);
  let statusCode = 200;
  let payload = null;
  const req = {
    url: `${url.pathname}${url.search}`,
    query: Object.fromEntries(url.searchParams.entries()),
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: void 0
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      req.body = await request.json();
    } catch {
      req.body = {};
    }
  }
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
    }
  };
  await handler(req, res);
  return Response.json(payload, { status: statusCode });
}

// server/handlers/calendarAvailability.ts
function GET(request) {
  return runNodeHandler(request, calendarAvailabilityHandler);
}
export {
  GET
};
