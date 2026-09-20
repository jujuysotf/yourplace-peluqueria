import React, { useState, useEffect } from 'react';
import { Service, Stylist, Booking, ClientUser } from '../types';
import { services, stylists, salonInfo, availableHours } from '../data/salonData';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  ShieldCheck,
  Scissors,
  Lock,
  LogIn,
  LogOut,
  Info,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { createWhatsAppConfirmationUrl } from '../utils/calendar';
import { getStoredClientUser, saveClientUser, createGoogleClientUser, createGuestClientUser, removeClientUser } from '../utils/auth';
import { signInWithGoogleAccount } from '../utils/googleAuth';
import { 
  getStoredBookings, 
  saveBooking, 
  calculateHourSlots, 
  HourSlotStatus,
  fetchGoogleCalendarAvailability,
  createGoogleCalendarBooking
} from '../utils/bookingAvailability';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  onBookingConfirmed?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
  onBookingConfirmed
}) => {
  // Pasos: 1: Servicio, 2: Día y Horario, 3: Identificación y Datos, 4: Confirmación y Sincronización
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);


  // Estado del usuario cliente (Google o Invitado)
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [authChoice, setAuthChoice] = useState<'google' | 'guest'>('guest');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Estado del formulario de reserva
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist>(stylists[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  // Google Calendar Live Integration States
  const [hourSlots, setHourSlots] = useState<HourSlotStatus[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [isSubmittingToGoogle, setIsSubmittingToGoogle] = useState<boolean>(false);
  const [googleCalendarSyncSuccess, setGoogleCalendarSyncSuccess] = useState<boolean>(false);
  const [googleCalendarEventLink, setGoogleCalendarEventLink] = useState<string>('');
  const [calendarSource, setCalendarSource] = useState<string>('Google Calendar');

  // Navegación mensual del calendario
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Cargar usuario guardado y turnos existentes
  useEffect(() => {
    const user = getStoredClientUser();
    if (user) {
      setClientUser(user);
      setAuthChoice(user.provider);
      setClientName(user.name);
      if (user.email) setClientEmail(user.email);
    }
  }, []);

  // REINICIO AL ABRIR LA VENTANA (Resuelve el problema de no poder realizar otra reserva al cerrar)
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setConfirmedBooking(null);
      setSelectedTime('');

      // Recargar turnos actuales desde el almacenamiento
      const currentBookings = getStoredBookings();
      setExistingBookings(currentBookings);

      // Si viene un servicio preseleccionado, asignarlo
      if (initialServiceId) {
        const found = services.find(s => s.id === initialServiceId);
        if (found) setSelectedService(found);
      } else if (!selectedService && services.length > 0) {
        setSelectedService(services[0]);
      }

      // Pre-cargar datos de usuario si está logueado
      const user = getStoredClientUser();
      if (user) {
        setClientUser(user);
        setAuthChoice(user.provider);
        if (!clientName) setClientName(user.name);
        if (!clientEmail && user.email) setClientEmail(user.email);
      }
    }
  }, [isOpen, initialServiceId]);

  // Fecha inicial predeterminada (mañana o próximo día hábil de Lunes a Sábado)
  useEffect(() => {
    if (!selectedDate) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Si es domingo, pasar al lunes
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      setSelectedDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
  }, [selectedDate]);

  // Manejador para reiniciar reserva y hacer otra
  const handleStartNewBooking = () => {
    setCurrentStep(1);
    setConfirmedBooking(null);
    setSelectedTime('');
    const currentBookings = getStoredBookings();
    setExistingBookings(currentBookings);
  };

  // Manejo de Inicio de Sesión con Google para la clienta (popup real de cuentas)
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      const profile = await signInWithGoogleAccount();
      const user = createGoogleClientUser(profile);
      setClientUser(user);
      setAuthChoice('google');
      setClientName(user.name);
      setClientEmail(user.email);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      window.alert(err?.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleChooseGuest = () => {
    setAuthChoice('guest');
    if (!clientUser || clientUser.provider === 'google') {
      const guest = createGuestClientUser(clientName || 'Invitada', clientEmail);
      setClientUser(guest);
    }
  };

  const handleLogout = () => {
    removeClientUser();
    setClientUser(null);
    setAuthChoice('guest');
    setClientName('');
    setClientEmail('');
  };

  // Lógica del Calendario
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 es Domingo
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isDaySelectable = (dayNum: number) => {
    const d = new Date(currentYear, currentMonth, dayNum);
    const dayOfWeek = d.getDay();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // Días pasados deshabilitados
    if (d < todayMidnight) return false;

    // Solo Domingos (0) está cerrado. Lunes a Sábados (1 a 6) está abierto.
    if (dayOfWeek === 0) return false;

    return true;
  };

  const formatSelectedDateFull = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDayClick = (dayNum: number) => {
    if (!isDaySelectable(dayNum)) return;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
    setSelectedDate(formatted);
    setSelectedTime(''); // Reiniciar hora al cambiar día
  };

  // Cargar disponibilidad real en vivo desde Google Calendar de Jessica
  useEffect(() => {
    if (!isOpen || !selectedDate || !selectedService) return;
    let isMounted = true;
    setIsLoadingAvailability(true);

    fetchGoogleCalendarAvailability(selectedDate, selectedService.durationMinutes)
      .then((res) => {
        if (isMounted) {
          setHourSlots(res.slots);
          setCalendarSource(res.source === 'google-calendar' ? 'Google Calendar (jujuysotf@gmail.com)' : 'Agenda Local');
          setIsLoadingAvailability(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHourSlots(calculateHourSlots(selectedDate, selectedService.durationMinutes, existingBookings));
          setCalendarSource('Agenda Local');
          setIsLoadingAvailability(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDate, selectedService?.id, selectedService?.durationMinutes, existingBookings]);

  const availableSlotsCount = hourSlots.filter(s => s.isAvailable).length;
  const blockedSlotsCount = hourSlots.filter(s => s.isBlocked).length;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert('Por favor completá los campos obligatorios para agendar tu turno.');
      return;
    }

    setIsSubmittingToGoogle(true);

    const randomRef = 'YP-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      referenceCode: randomRef,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || 'sin-correo@yourplace.com',
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      clientAuthProvider: authChoice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      syncedToGoogleCalendar: false
    };

    try {
      // Registrar directamente en el Google Calendar de Jessica mediante la Service Account
      const gResult = await createGoogleCalendarBooking(newBooking);
      if (gResult.success) {
        newBooking.syncedToGoogleCalendar = true;
        setGoogleCalendarSyncSuccess(true);
        if (gResult.htmlLink) {
          setGoogleCalendarEventLink(gResult.htmlLink);
        }
      } else {
        setGoogleCalendarSyncSuccess(false);
        console.warn('Could not auto-insert to Google Calendar:', gResult.error);
      }
    } catch (err) {
      console.warn('Google Calendar auto-sync error:', err);
      setGoogleCalendarSyncSuccess(false);
    } finally {
      setIsSubmittingToGoogle(false);
    }

    // Guardar en almacenamiento y actualizar estado de turnos bloqueados
    saveBooking(newBooking);
    const updatedBookings = getStoredBookings();
    setExistingBookings(updatedBookings);

    setConfirmedBooking(newBooking);
    if (onBookingConfirmed) {
      onBookingConfirmed(newBooking);
    }
    setCurrentStep(4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative bg-[#FAF6F4] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D89A9E]/40 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-[#141213] text-[#FAF6F4] p-5 sm:p-6 relative border-b border-[#2D2426]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#D89A9E] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar ventana de reservas"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Scissors size={15} className="text-[#D89A9E]" />
            <span className="text-xs uppercase tracking-widest text-[#D89A9E] font-semibold">
              Reserva de Turnos
            </span>
          </div>

          {/* Barra de progreso de pasos */}
          {currentStep < 4 && (
            <div className="flex items-center gap-2 mt-4">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#D89A9E]' : 'bg-[#2A2325]'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#D89A9E]' : 'bg-[#2A2325]'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 3 ? 'bg-[#D89A9E]' : 'bg-[#2A2325]'}`} />
            </div>
          )}
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
              {/* PASO 1: Elegir Servicio */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#141213]">
                      1. Seleccioná el servicio que deseas realizarte
                    </h3>
                    <p className="text-xs text-[#665A5C] mt-0.5">
                      Todos los turnos son por <strong>1 hora completa</strong> o <strong>2 horas completas</strong> para garantizar dedicación exclusiva.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {services.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'border-[#B77176] bg-[#FAF0F1] shadow-md ring-1 ring-[#B77176]'
                              : 'border-[#E8DDD8] bg-white hover:border-[#D89A9E] hover:bg-[#FAF6F4]'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-[#141213]">
                              {service.name}
                            </h4>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#B77176] text-white flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-[#665A5C] line-clamp-2 mb-3">
                            {service.description}
                          </p>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2ECE8]">
                            <span className="font-bold text-[#141213] text-sm">
                              {service.formattedPrice}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-[#B77176] bg-white px-2 py-0.5 rounded-full border border-[#E8DDD8]">
                              <Clock size={12} />
                              {service.durationLabel} completa
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>



                  {/* Botón Siguiente */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!selectedService}
                      onClick={() => setCurrentStep(2)}
                      className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <span>Continuar a Fecha y Horario</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: Elegir Día y Horario (Con Turnos Bloqueados y Horas Completas) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Resumen del Servicio Seleccionado y Duración */}
                  <div className="flex items-center justify-between border-b border-[#E8DDD8] pb-3">
                    <div>
                      <span className="text-xs text-[#888] block">Servicio elegido:</span>
                      <span className="text-sm font-bold text-[#141213]">{selectedService?.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#888] block">Duración de la sesión:</span>
                      <span className="text-xs font-bold text-[#B77176] bg-[#FAF0F1] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <Clock size={12} />
                        {selectedService?.durationLabel} completa
                      </span>
                    </div>
                  </div>

                  {/* Calendario de días */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-base font-bold text-[#141213]">
                        {monthNames[currentMonth]} {currentYear}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-lg hover:bg-[#F2E5E2] text-[#555] transition-colors"
                          aria-label="Mes anterior"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg hover:bg-[#F2E5E2] text-[#555] transition-colors"
                          aria-label="Mes siguiente"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#887E80] mb-2">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span className="text-[#C55]">Dom</span>
                    </div>

                    {/* Matriz de días */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: startOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
                        const isSelected = selectedDate === dateStr;
                        const selectable = isDaySelectable(dayNum);

                        return (
                          <button
                            key={`day-${dayNum}`}
                            type="button"
                            disabled={!selectable}
                            onClick={() => handleDayClick(dayNum)}
                            className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#141213] text-[#FAF6F4] shadow-sm scale-105 border border-[#D89A9E]'
                                : selectable
                                ? 'bg-white border border-[#E8DDD8] text-[#141213] hover:bg-[#F5E8E5]'
                                : 'bg-transparent text-[#CCC] cursor-not-allowed'
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#665A5C] mt-3 pt-2 border-t border-[#E8DDD8]">
                      <span>Lunes a Sábados: Abierto (09:00 a 20:00 hs)</span>
                      <span className="text-[#C55]">Domingos: Cerrado</span>
                    </div>
                  </div>

                  {/* Selección de Horarios y VISUALIZACIÓN DE TURNOS BLOQUEADOS */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C]">
                          Horarios para el {formatSelectedDateFull(selectedDate)}
                        </label>
                        {isLoadingAvailability && (
                          <span className="text-[10px] text-[#B77176] animate-pulse flex items-center gap-1 font-medium">
                            <Clock size={11} className="animate-spin" />
                            Consultando Google Calendar...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-[#2F855A] font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#38A169]" />
                          {availableSlotsCount} disponibles
                        </span>
                        <span className="text-[#A0AEC0] font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#CBD5E0]" />
                          {blockedSlotsCount} reservados
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#555] bg-[#F4EDE9] px-3 py-1.5 rounded-lg mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 size={12} className="text-[#38A169]" />
                        Sincronización directa con Google Calendar
                      </span>
                      <span className="text-[10px] text-[#888]">jujuysotf@gmail.com</span>
                    </div>

                    {/* Grilla de turnos de 1h o 2h completas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {hourSlots.map((slot) => {
                        const isSelected = selectedTime === slot.hour;

                        if (slot.isBlocked) {
                          return (
                            <div
                              key={slot.hour}
                              title={slot.blockedReason || 'Turno ya ocupado'}
                              className="py-2.5 px-3 rounded-xl text-xs font-medium bg-[#EFECE9] text-[#9A9193] border border-[#DDD5D2] flex items-center justify-between cursor-not-allowed opacity-80 select-none"
                            >
                              <span className="line-through flex items-center gap-1">
                                <Lock size={11} className="text-[#9A9193]" />
                                {slot.hour} hs
                              </span>
                              <span className="text-[10px] bg-[#E2DBD7] text-[#7A7072] font-semibold px-1.5 py-0.5 rounded">
                                Ocupado
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot.hour}
                            type="button"
                            onClick={() => setSelectedTime(slot.hour)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-[#B77176] text-white shadow-sm scale-105 ring-2 ring-[#141213]'
                                : 'bg-white border border-[#E8DDD8] text-[#141213] hover:border-[#D89A9E] hover:bg-[#FAF6F4]'
                            }`}
                          >
                            <Clock size={13} />
                            <span>{slot.hour} hs</span>
                            {isSelected && <Check size={13} strokeWidth={3} className="ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {availableSlotsCount === 0 && (
                      <div className="p-3.5 mt-2 bg-[#FFF5F5] border border-[#FED7D7] rounded-xl text-xs text-[#C53030] text-center">
                        Todos los turnos para este día están completos. Por favor elegí otra fecha en el calendario o consultanos por WhatsApp.
                      </div>
                    )}
                  </div>

                  {/* Botones de navegación */}
                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#665A5C] hover:text-[#141213]"
                    >
                      Volver a servicios
                    </button>
                    <button
                      type="button"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setCurrentStep(3)}
                      className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <span>Continuar a tus datos</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: Identificación (Auth Google o Invitada) y Datos */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Resumen del Turno */}
                  <div className="bg-white rounded-2xl p-4 border border-[#E8DDD8] mb-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#888] block">Turno a agendar:</span>
                        <strong className="text-[#141213]">{selectedService?.name}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[#888] block">Fecha y horario:</span>
                        <strong className="text-[#B77176]">{selectedDate} - {selectedTime} hs ({selectedService?.durationLabel})</strong>
                      </div>
                    </div>
                  </div>

                  {/* SELECCIÓN DE IDENTIFICACIÓN: GOOGLE AUTH O INVITADA */}
                  <div className="bg-[#FAF0F1] p-4 rounded-2xl border border-[#E8B4B8]/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#141213] flex items-center gap-1.5">
                        <User size={14} className="text-[#B77176]" />
                        Identificación de la clienta
                      </span>
                      {clientUser && (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-[11px] text-[#B77176] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <LogOut size={12} />
                          Cambiar / Salir
                        </button>
                      )}
                    </div>

                    {/* Estado cuando está conectada con Google */}
                    {clientUser?.provider === 'google' ? (
                      <div className="bg-white p-3 rounded-xl border border-[#D89A9E] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs">
                            G
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#141213]">
                              {clientUser.name}
                            </div>
                            <div className="text-[11px] text-[#666]">
                              {clientUser.email} • Cuenta Google conectada
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-[#E6F4EA] text-[#137333] font-bold px-2 py-0.5 rounded-full">
                          Verificada
                        </span>
                      </div>
                    ) : (
                      /* Opciones: Iniciar sesión con Google o Entrar como Invitada */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Botón Google */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isGoogleSigningIn}
                          className="p-3 rounded-xl bg-white border border-[#DDD] hover:border-[#4285F4] hover:shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-[#3C4043] transition-all disabled:opacity-60 disabled:cursor-wait"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>{isGoogleSigningIn ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
                        </button>

                        {/* Botón Entrar como Invitada */}
                        <button
                          type="button"
                          onClick={handleChooseGuest}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            authChoice === 'guest'
                              ? 'bg-[#141213] text-white border-[#141213]'
                              : 'bg-white text-[#555] border-[#DDD] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          <User size={14} />
                          <span>Entrar como invitada</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campos de Nombre y Teléfono */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1">
                      Nombre y Apellido *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-[#999]" />
                      <input
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-sm focus:outline-none focus:border-[#B77176]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3.5 text-[#999]" />
                        <input
                          type="tel"
                          required
                          placeholder="Ej: 381 123-4567"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-sm focus:outline-none focus:border-[#B77176]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1">
                        Correo de Google Calendar {authChoice === 'google' && '(Conectado)'}
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-3.5 text-[#999]" />
                        <input
                          type="email"
                          placeholder="tuemail@gmail.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-sm focus:outline-none focus:border-[#B77176]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1">
                      Notas sobre tu cabello o consulta previa (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Cabello teñido castaño, busco reflejos claros..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#E8DDD8] bg-white text-sm focus:outline-none focus:border-[#B77176]"
                    />
                  </div>

                  <div className="text-[11px] text-[#665A5C] flex items-center gap-2 pt-1">
                    <ShieldCheck size={14} className="text-[#38A169] shrink-0" />
                    <span>Tu turno se registrará y bloqueará en la agenda del salón de Jessica Lescano.</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#665A5C] hover:text-[#141213]"
                    >
                      Volver a horario
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingToGoogle}
                      className="px-7 py-3 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSubmittingToGoogle ? (
                        <>
                          <Clock size={16} className="animate-spin text-[#D89A9E]" />
                          <span>Agendando en Google Calendar...</span>
                        </>
                      ) : (
                        <>
                          <CalendarIcon size={16} className="text-[#D89A9E]" />
                          <span>Confirmar y Reservar Turno</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 4: Confirmación y Notificación */}
              {currentStep === 4 && confirmedBooking && (
                <div className="text-center py-4 space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 bg-[#F5E8E5] text-[#B77176] rounded-full flex items-center justify-center mx-auto border-2 border-[#D89A9E] shadow-inner">
                    <Check size={32} strokeWidth={2.5} />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#B77176] font-bold">
                      ¡Turno #{confirmedBooking.referenceCode} Confirmado!
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141213] mt-1">
                      Te esperamos en Your place, {confirmedBooking.clientName.split(' ')[0]}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#665A5C] mt-1">
                      El horario ha quedado reservado exclusivamente para vos en la agenda.
                    </p>
                  </div>

                  {/* Ficha del turno */}
                  <div className="bg-white rounded-2xl border border-[#E8DDD8] p-5 text-left max-w-lg mx-auto shadow-xs space-y-3">
                    <div className="flex justify-between items-start border-b border-[#F2ECE8] pb-3">
                      <div>
                        <span className="text-xs text-[#888] block">Servicio</span>
                        <span className="font-serif text-lg font-bold text-[#141213]">
                          {confirmedBooking.serviceName}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#B77176] bg-[#FAF0F1] px-2.5 py-1 rounded-lg">
                        ${confirmedBooking.servicePrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-[#888] block">Fecha & Hora</span>
                        <span className="font-semibold text-[#141213]">
                          {confirmedBooking.date} a las {confirmedBooking.time} hs
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block">Duración</span>
                        <span className="font-semibold text-[#B77176]">
                          {confirmedBooking.serviceDuration} minutos completos
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#888] block">Ubicación del salón</span>
                        <span className="font-medium text-[#141213]">
                          Libertad y Lavalle - San Miguel de Tucumán
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-[#F2ECE8]">
                        <span className="text-[11px] text-[#666] flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#25D366]" />
                          Organizador: Jessica Lescano (<code>jujuysotf@gmail.com</code>)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notificación a Jessica por WhatsApp */}
                  <div className="max-w-lg mx-auto pt-2">
                    <a
                      href={createWhatsAppConfirmationUrl(confirmedBooking, salonInfo.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors shadow-sm"
                    >
                      <div className="relative flex items-center justify-center">
                        <MessageCircle size={17} strokeWidth={2.3} className="text-white" />
                        <Phone size={7} className="text-white fill-white absolute -translate-y-px translate-x-px -rotate-12" />
                      </div>
                      <span>Confirmar por WhatsApp</span>
                    </a>
                  </div>

                  {/* Acciones de Cierre y Nueva Reserva */}
                  <div className="pt-3 border-t border-[#E8DDD8] flex items-center justify-center gap-5">
                    <button
                      type="button"
                      onClick={handleStartNewBooking}
                      className="text-xs font-semibold text-[#B77176] hover:text-[#141213] flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw size={14} />
                      <span>Hacer otra reserva</span>
                    </button>
                    
                    <span className="text-[#DDD]">|</span>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-[#665A5C] hover:text-[#141213] underline font-medium"
                    >
                      Listo, cerrar ventana
                    </button>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};
