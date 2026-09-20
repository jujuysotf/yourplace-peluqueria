import { Booking } from '../types';

/**
 * Formats a Date object to Google Calendar format (YYYYMMDDTHHmmSS)
 */
export function formatGoogleCalendarDate(dateStr: string, timeStr: string, durationMinutes: number): { start: string; end: string } {
  // dateStr is YYYY-MM-DD, timeStr is HH:mm
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatLocal = (d: Date) => 
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  return {
    start: formatLocal(startDate),
    end: formatLocal(endDate)
  };
}

/**
 * Creates an instant URL to add the appointment to Google Calendar,
 * linking both the client and Jessica Lescano's calendar.
 */
export function createGoogleCalendarUrl(
  booking: Booking, 
  salonAddress: string = 'Libertad y Lavalle, San Miguel de Tucumán',
  ownerCalendarEmail: string = 'jujuysotf@gmail.com'
): string {
  const { start, end } = formatGoogleCalendarDate(booking.date, booking.time, booking.serviceDuration || 60);
  
  const title = encodeURIComponent(`Turno: ${booking.serviceName} - Your place Peluquería`);
  const details = encodeURIComponent(
    `✨ Turno de Peluquería confirmado en Your place\n\n` +
    `💇‍♀️ Servicio: ${booking.serviceName}\n` +
    `👤 Profesional: ${booking.stylistName}\n` +
    `⏱️ Duración aproximada: ${booking.serviceDuration} minutos\n` +
    `💰 Valor estimado: $${booking.servicePrice.toLocaleString('es-AR')}\n` +
    `🎫 Código de reserva: #${booking.referenceCode}\n` +
    `👤 Clienta: ${booking.clientName} (${booking.clientPhone})\n` +
    `📍 Lugar: ${salonAddress}\n\n` +
    `Te esperamos en Libertad y Lavalle, Tucumán. ¡Muchas gracias por elegirnos!`
  );
  const location = encodeURIComponent(salonAddress);
  const addEmail = encodeURIComponent(ownerCalendarEmail);

  // Parameter 'add' adds jujuysotf@gmail.com as attendee/host to associate with calendar
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&add=${addEmail}&sf=true&output=xml`;
}

/**
 * Generates and triggers download of an .ics file for Apple Calendar, Google Calendar & Outlook
 */
export function downloadIcsFile(booking: Booking, salonAddress: string = 'Libertad y Lavalle, San Miguel de Tucumán'): void {
  const { start, end } = formatGoogleCalendarDate(booking.date, booking.time, booking.serviceDuration || 60);
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your place Peluqueria Lescano Jessica//Reservas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:yourplace-${booking.referenceCode}-${Date.now()}@yourplace.com`,
    `DTSTAMP:${start}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Turno: ${booking.serviceName} - Your place`,
    `DESCRIPTION:Servicio: ${booking.serviceName}\\nPeluquera: ${booking.stylistName}\\nClienta: ${booking.clientName}\\nRef: #${booking.referenceCode}\\nContacto: +54 9 3886 07-4857`,
    `LOCATION:${salonAddress.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'ORGANIZER;CN=Jessica Lescano:mailto:jujuysotf@gmail.com',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio: Turno en Your place Peluquería en 2 horas',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Turno-YourPlace-${booking.referenceCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generates WhatsApp link with pre-filled message for confirmation to Jessica's number
 */
export function createWhatsAppConfirmationUrl(booking: Booking, phone: string = '+54 9 3886 07-4857'): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = encodeURIComponent(
    `¡Hola Jessica! 👋 Acabo de solicitar mi turno en la web de *Your place*:\n\n` +
    `💇‍♀️ *Servicio*: ${booking.serviceName}\n` +
    `📅 *Fecha*: ${booking.date}\n` +
    `⏰ *Horario*: ${booking.time} hs\n` +
    `👤 *Nombre*: ${booking.clientName}\n` +
    `📱 *Teléfono*: ${booking.clientPhone}\n` +
    (booking.clientNotes ? `📝 *Nota*: ${booking.clientNotes}\n` : '') +
    `🎫 *Código*: #${booking.referenceCode}\n\n` +
    `¡Muchas gracias!`
  );

  return `https://wa.me/${cleanPhone}?text=${message}`;
}
