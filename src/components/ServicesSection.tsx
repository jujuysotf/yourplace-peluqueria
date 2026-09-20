import React, { useState } from 'react';
import { services } from '../data/salonData';
import { Service, ServiceCategory } from '../types';
import { Clock, Sparkles, Check, Calendar, MessageCircle, Scissors } from 'lucide-react';
import { salonInfo } from '../data/salonData';

interface ServicesSectionProps {
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');

  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'all', label: 'Todos los Servicios' },
    { id: 'color', label: 'Color & Mechas' },
    { id: 'cortes', label: 'Cortes & Peinados' },
    { id: 'tratamientos', label: 'Tratamientos Capilares' },
    { id: 'eventos', label: 'Peinados de Fiesta' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <section id="servicios" className="py-20 bg-[#FAF6F4] relative border-t border-[#EFE3E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8E5] text-[#B77176] text-xs font-semibold tracking-wider uppercase mb-3">
            <Scissors size={13} />
            Carta de Peluquería
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141213] tracking-tight">
            Servicios dedicados al cuidado de tu cabello
          </h2>
          <p className="mt-3 text-base text-[#665A5C] font-light leading-relaxed">
            Elegí el servicio que buscás y agendá tu turno online en simples pasos. Precios claros y atención 100% personalizada en Libertad y Lavalle.
          </p>
        </div>

        {/* Pestañas de Filtrado */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-[#141213] text-[#FAF6F4] shadow-md scale-105 border border-[#D89A9E]'
                  : 'bg-white text-[#554A4C] hover:bg-[#F2E5E2] hover:text-[#141213] border border-[#E8DDD8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grilla de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-[#E8DDD8] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Imagen del Servicio si existe */}
              {service.image && (
                <div className="h-44 w-full overflow-hidden relative bg-[#F5ECE8]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#141213]/85 backdrop-blur-sm text-[#F5D0D3] border border-[#D89A9E]/40">
                    {service.durationLabel}
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Categoría & Distintivo */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B77176]">
                      {service.category === 'color' && 'Coloración & Mechas'}
                      {service.category === 'cortes' && 'Corte & Peinado'}
                      {service.category === 'tratamientos' && 'Tratamiento Capilar'}
                      {service.category === 'eventos' && 'Peinado para Eventos'}
                    </span>
                    {service.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF0F1] text-[#B77176] border border-[#D89A9E]">
                        <Sparkles size={10} /> Destacado
                      </span>
                    )}
                  </div>

                  {/* Título del Servicio */}
                  <h3 className="font-serif text-xl font-bold text-[#141213] group-hover:text-[#B77176] transition-colors mb-2">
                    {service.name}
                  </h3>

                  {/* Descripción */}
                  <p className="text-xs sm:text-sm text-[#665A5C] leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Características incluidas */}
                  {service.features && (
                    <ul className="space-y-1.5 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#554A4C]">
                          <Check size={14} className="text-[#D89A9E] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Precios y Botón de Reserva para Clientes */}
                <div className="pt-4 border-t border-[#F2ECE8] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-[#887E80] block">
                      Valor estimado
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#141213]">
                      {service.formattedPrice}
                    </span>
                    {!service.image && (
                      <span className="text-[11px] text-[#887E80] block flex items-center gap-1">
                        <Clock size={11} /> {service.durationLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectService(service)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Calendar size={13} className="text-[#D89A9E]" />
                      <span>Reservar</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Banner de asesoramiento directo */}
        <div className="mt-14 bg-white rounded-2xl p-6 sm:p-8 border border-[#D89A9E]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0F1] border border-[#D89A9E] flex items-center justify-center text-[#B77176] shrink-0">
              <Scissors size={24} />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#141213]">
                ¿Tenés dudas sobre qué servicio necesita tu cabello?
              </h4>
              <p className="text-xs sm:text-sm text-[#665A5C]">
                Escribile a Jessica por WhatsApp con una foto de tu cabello actual para recibir un diagnóstico previo.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
              '¡Hola Jessica! Quisiera consultarte por un asesoramiento para mi cabello.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-all shadow-md shrink-0"
          >
            <MessageCircle size={16} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
