import React from 'react';
import { testimonials, salonInfo } from '../data/salonData';
import { Star, Sparkles, Quote, Instagram, Heart } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonios" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EAEB] text-[#B77176] text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles size={13} />
            Experiencias Reales
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141213] tracking-tight">
            Lo que dicen nuestras clientas
          </h2>
          <p className="mt-3 text-base text-[#665A5C] font-light">
            La mayor satisfacción de Your place es ver a cada mujer salir renovada y enamorada de su melena.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#FAF7F2] p-7 rounded-2xl border border-[#EAE2D7] shadow-xs flex flex-col justify-between relative group hover:border-[#E8B4B8] transition-colors"
            >
              <div>
                <Quote size={28} className="text-[#E8B4B8]/60 mb-3" />
                
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-sm text-[#443E40] leading-relaxed italic mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DFD3] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#181818]">
                    {t.name}
                  </h4>
                  <span className="text-xs text-[#B77176] font-medium block">
                    Servicio: {t.service}
                  </span>
                </div>
                <span className="text-[11px] text-[#888]">
                  {t.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Follow Community Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#141213] via-[#241E20] to-[#141213] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border border-[#D89A9E]/40 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D89A9E] mb-2">
                <Instagram size={14} />
                Comunidad en Instagram
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                Conectate con nuestro día a día en el salón
              </h3>
              <p className="text-xs sm:text-sm text-[#D4C7C8] mt-1 max-w-xl">
                Seguinos para ver transformaciones reales, tips de cuidado en casa para cabellos tratados y novedades de turnos.
              </p>
            </div>

            <a
              href={salonInfo.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-[#141213] bg-gradient-to-r from-[#F5D0D3] via-[#D89A9E] to-[#B77176] hover:scale-105 transition-all shadow-md"
            >
              <Instagram size={18} />
              <span>@un_mimo_para_ty</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
