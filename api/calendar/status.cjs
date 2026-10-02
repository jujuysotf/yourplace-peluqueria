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

// server/handlers/calendarStatus.ts
var calendarStatus_exports = {};
__export(calendarStatus_exports, {
  default: () => calendarStatusHandler
});
module.exports = __toCommonJS(calendarStatus_exports);

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

// server/createApp.ts
async function calendarStatusHandler(_req, res) {
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
}
module.exports = (module.exports && module.exports.default) || module.exports;
