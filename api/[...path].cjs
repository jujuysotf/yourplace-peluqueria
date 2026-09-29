var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/vercelEntry.ts
var vercelEntry_exports = {};
__export(vercelEntry_exports, {
  default: () => vercelEntry_default,
  toApiPath: () => toApiPath
});
module.exports = __toCommonJS(vercelEntry_exports);
var import_express2 = __toESM(require("express"), 1);

// server/createApp.ts
var import_express = __toESM(require("express"), 1);

// server/calendarService.ts
var import_googleapis = require("googleapis");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var OWNER_CALENDAR_ID = "jujuysotf@gmail.com";
var TIMEZONE = "America/Argentina/Buenos_Aires";
var TIMEZONE_OFFSET = "-03:00";
function hasCalendarCredentials() {
  const credPath = import_path.default.join(process.cwd(), "google-credentials.json");
  return import_fs.default.existsSync(credPath) || !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !!process.env.GOOGLE_CLIENT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY;
}
function getCalendarClient() {
  let clientEmail;
  let privateKey;
  const credPath = import_path.default.join(process.cwd(), "google-credentials.json");
  if (import_fs.default.existsSync(credPath)) {
    try {
      const raw = import_fs.default.readFileSync(credPath, "utf8");
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
  const auth = new import_googleapis.google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ]
  });
  return import_googleapis.google.calendar({ version: "v3", auth });
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
async function createGoogleCalendarEvent(bookingData) {
  const calendar = getCalendarClient();
  if (!calendar) {
    return {
      id: "local-" + Date.now(),
      status: "confirmed",
      htmlLink: ""
    };
  }
  const [hours, minutes] = bookingData.time.split(":").map(Number);
  const startMinTotal = hours * 60 + minutes;
  const endMinTotal = startMinTotal + bookingData.serviceDuration;
  const endHours = Math.floor(endMinTotal / 60).toString().padStart(2, "0");
  const endMins = (endMinTotal % 60).toString().padStart(2, "0");
  const endTimeStr = `${endHours}:${endMins}`;
  const startDateTime = `${bookingData.date}T${bookingData.time}:00${TIMEZONE_OFFSET}`;
  const endDateTime = `${bookingData.date}T${endTimeStr}:00${TIMEZONE_OFFSET}`;
  const description = [
    `Turno en Peluqueria Your place (Jessica Lescano)`,
    `----------------------------------------------------`,
    `Ref: ${bookingData.referenceCode || "YP-" + Date.now().toString().slice(-4)}`,
    `Servicio: ${bookingData.serviceName} (${bookingData.serviceDuration} min)`,
    `Clienta: ${bookingData.clientName}`,
    `Telefono: ${bookingData.clientPhone}`,
    bookingData.clientEmail ? `Email: ${bookingData.clientEmail}` : "",
    bookingData.clientNotes ? `Nota de la clienta: ${bookingData.clientNotes}` : "",
    ``,
    `Salon: Libertad y Lavalle, San Miguel de Tucuman`,
    `WhatsApp Salon: +54 9 3886 07-4857`
  ].filter(Boolean).join("\n");
  const eventPayload = {
    summary: `Turno Your place: ${bookingData.serviceName} - ${bookingData.clientName}`,
    description,
    location: "Libertad y Lavalle, San Miguel de Tucuman, Argentina",
    start: {
      dateTime: startDateTime,
      timeZone: TIMEZONE
    },
    end: {
      dateTime: endDateTime,
      timeZone: TIMEZONE
    },
    colorId: "4",
    status: "confirmed",
    transparency: "opaque",
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 120 },
        { method: "email", minutes: 1440 }
      ]
    }
  };
  const created = await calendar.events.insert({
    calendarId: OWNER_CALENDAR_ID,
    requestBody: eventPayload
  });
  return created.data;
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
function createApiApp() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/calendar/status", async (_req, res) => {
    try {
      if (!hasCalendarCredentials()) {
        return res.json({
          connected: false,
          calendarId: "jujuysotf@gmail.com",
          message: "Sin credenciales activas de Google Service Account"
        });
      }
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const busy = await getCalendarBusyTimes(todayStr);
      res.json({
        connected: true,
        calendarId: "jujuysotf@gmail.com",
        busySlotsTodayCount: busy.length,
        message: "Google Calendar API conectado exitosamente con jujuysotf@gmail.com"
      });
    } catch (err) {
      const message = err?.message || "Error al conectar con Google Calendar API";
      console.error("Error in /api/calendar/status:", message);
      res.status(200).json({
        connected: false,
        calendarId: "jujuysotf@gmail.com",
        error: message,
        hint: message.includes("self-signed certificate") ? "En esta PC hay un proxy/antivirus. Agreg\xE1 ALLOW_INSECURE_TLS=1 al .env (solo local) y reinici\xE1." : void 0
      });
    }
  });
  app.get("/api/calendar/availability", async (req, res) => {
    try {
      const date = req.query.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const durationMinutes = parseInt(req.query.duration || "60", 10);
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
  });
  app.post("/api/calendar/book", async (req, res) => {
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
        return res.status(400).json({ error: "Faltan campos obligatorios" });
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
        message: "Turno agendado exitosamente en Google Calendar de Jessica",
        eventId: eventData.id,
        htmlLink: eventData.htmlLink,
        status: eventData.status
      });
    } catch (err) {
      console.error("Error in /api/calendar/book:", err);
      res.status(500).json({
        error: "Error al registrar el turno en Google Calendar",
        details: err?.message || String(err)
      });
    }
  });
  return app;
}

// server/vercelEntry.ts
function toApiPath(url) {
  const queryIndex = url.indexOf("?");
  const path2 = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const forwarded = params.get("__path");
  if (forwarded) {
    params.delete("__path");
    const clean = forwarded.replace(/^\/+/, "").replace(/^api\//, "").split("?")[0];
    const rest2 = params.toString();
    return `/api/${clean}${rest2 ? `?${rest2}` : ""}`;
  }
  if (path2 === "/api" || path2.startsWith("/api/")) {
    return url;
  }
  const withSlash = path2.startsWith("/") ? path2 : `/${path2}`;
  const rest = params.toString();
  return `/api${withSlash}${rest ? `?${rest}` : ""}`;
}
var api = createApiApp();
var handler = (0, import_express2.default)();
handler.use((req, _res, next) => {
  req.url = toApiPath(req.url || "/");
  next();
});
handler.use(api);
var vercelEntry_default = handler;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  toApiPath
});
module.exports = (module.exports && module.exports.default) || module.exports;
