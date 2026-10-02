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

// server/handlers/calendarBook.ts
var calendarBook_exports = {};
__export(calendarBook_exports, {
  default: () => calendarBookHandler
});
module.exports = __toCommonJS(calendarBook_exports);

// server/createApp.ts
var import_express = __toESM(require("express"), 1);

// server/calendarService.ts
var import_googleapis = require("googleapis");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var OWNER_CALENDAR_ID = "jujuysotf@gmail.com";
var TIMEZONE = "America/Argentina/Buenos_Aires";
var TIMEZONE_OFFSET = "-03:00";
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
async function readJsonBody(req) {
  const body = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body;
  if (typeof body === "string" && body.trim()) return JSON.parse(body);
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}
async function calendarBookHandler(req, res) {
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
    } = await readJsonBody(req);
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
}
module.exports = (module.exports && module.exports.default) || module.exports;
