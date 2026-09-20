import React, { useState } from 'react';
import { salonInfo } from '../data/salonData';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Instagram, 
  MessageCircle,
  Scissors
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceInterest: 'color',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Preparar mensaje directo a WhatsApp de Jessica
    const text = encodeURIComponent(
      `¡Hola Jessica! Mi nombre es ${formData.name}. ` +
      `Te contacto desde la web de Your place.\n` +
      `Teléfono: ${formData.phone}\n` +
      `Servicio de interés: ${formData.serviceInterest}\n` +
      (formData.message ? `Consulta: ${formData.message}` : '')
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      window.open(`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
    }, 400);
  };

  return (
    <section id="contacto" className="py-20 bg-[#FAF6F4] border-t border-[#EFE3E0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8E5] text-[#B77176] text-xs font-semibold tracking-wider uppercase mb-3">
            <Scissors size={13} />
            Ubicación & Consultas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141213] tracking-tight">
            Vení a conocer Your place
          </h2>
          <p className="mt-3 text-base text-[#665A5C] font-light">
            Estamos en una ubicación céntrica y de fácil acceso en San Miguel de Tucumán.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Columna Izquierda: Tarjetas de Información Directa */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tarjeta de Datos del Salón */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DDD8] shadow-xs space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#141213] border-b border-[#F2ECE8] pb-3">
                Datos del Salón
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-[#FAF0F1] text-[#B77176] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-xs text-[#888] font-medium block">Dirección</span>
                  <span className="text-sm font-semibold text-[#141213] block">
                    Libertad y Lavalle
                  </span>
                  <span className="text-xs text-[#665A5C]">
                    San Miguel de Tucumán, Tucumán, Argentina
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-[#FAF0F1] text-[#B77176] shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="text-xs text-[#888] font-medium block">Teléfono / WhatsApp</span>
                  <a
                    href={`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#141213] hover:text-[#B77176] transition-colors block"
                  >
                    {salonInfo.phone}
                  </a>
                  <span className="text-xs text-[#25D366] font-medium">
                    ● Atención directa de Jessica Lescano
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-[#FAF0F1] text-[#B77176] shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-xs text-[#888] font-medium block">Horarios de Atención</span>
                  <div className="text-xs text-[#443E40] space-y-1 mt-1">
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">Lunes a Sábados:</span>
                      <span>09:00 a 20:00 hs</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[#A85055]">
                      <span className="font-semibold">Domingos:</span>
                      <span>Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes y Contacto Directo */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DDD8] shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#141213] mb-3">
                Canales Directos
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={salonInfo.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF6F4] hover:bg-[#F5E8E5] border border-[#E8DDD8] hover:border-[#D89A9E] transition-all group"
                >
                  <Instagram size={22} className="text-[#E1306C] group-hover:scale-110 transition-transform shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#141213] block">Instagram</span>
                    <span className="text-[11px] text-[#888] truncate block">@un_mimo_para_ty</span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF6F4] hover:bg-[#E8F8EE] border border-[#E8DDD8] hover:border-[#25D366] transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <div className="relative flex items-center justify-center">
                      <MessageCircle size={19} className="text-white" strokeWidth={2.2} />
                      <Phone size={8} className="text-white fill-white absolute -translate-y-px translate-x-px -rotate-12" />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#141213] block">WhatsApp</span>
                    <span className="text-[11px] text-[#888] truncate block">{salonInfo.phone}</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Formulario de Consulta Directa */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-7 sm:p-9 border border-[#E8DDD8] shadow-xs">
              <h3 className="font-serif text-2xl font-bold text-[#141213] mb-2">
                Envianos un mensaje
              </h3>
              <p className="text-xs sm:text-sm text-[#665A5C] mb-6">
                Completá los datos y te contestamos de manera personalizada para coordinar tu consulta.
              </p>

              {submitted ? (
                <div className="bg-[#FAF0F1] border border-[#D89A9E] rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 bg-white text-[#B77176] rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#141213]">
                    ¡Mensaje listo!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#554A4C]">
                    Se abrió la conversación de WhatsApp con Jessica para responderte de inmediato.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-[#B77176] font-semibold hover:underline pt-2"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1.5">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-[#FAF6F4] text-sm focus:outline-none focus:border-[#B77176] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1.5">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 388 607-4857"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-[#FAF6F4] text-sm focus:outline-none focus:border-[#B77176] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1.5">
                      Servicio de interés
                    </label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-[#FAF6F4] text-sm focus:outline-none focus:border-[#B77176] focus:bg-white transition-all"
                    >
                      <option value="Corte Femenino">Corte Femenino (Lavado y Secado)</option>
                      <option value="Tintura o Retoque">Tintura Completa o Retoque de Raíz</option>
                      <option value="Claritos / Reflejos">Claritos / Reflejos Iluminados</option>
                      <option value="Botox Capilar">Botox Capilar Antifrizz y Brillo</option>
                      <option value="Alisado o Keratina">Alisado Progresivo / Keratina</option>
                      <option value="Brushing o Peinado">Brushing / Secado & Peinado</option>
                      <option value="Otro">Otra consulta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#665A5C] mb-1.5">
                      Consulta o detalle
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contanos sobre tu cabello o la duda que tengas..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-[#FAF6F4] text-sm focus:outline-none focus:border-[#B77176] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Send size={15} className="text-[#D89A9E]" />
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar Consulta por WhatsApp'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
