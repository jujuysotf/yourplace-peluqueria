import React from 'react';
import { Sparkles, Award, Scissors, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { salonFeatures, salonInfo } from '../data/salonData';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="sobre-nosotros" className="py-20 bg-white border-t border-[#EFE3E0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Foto de Jessica con marco de oro rosa */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Marco decorativo con gradiente oro rosa */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#F5D0D3] via-[#D89A9E] to-[#B77176] opacity-50 blur-sm transform -rotate-1" />
              
              {/* Contenedor de la foto */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#141213] aspect-[4/5]">
                <img
                  src="/src/assets/images/jessica_lescano_1789860146348.jpg"
                  alt="Jessica Lescano, Peluquera y Propietaria de Your place"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                
                {/* Etiqueta inferior */}
                <div className="absolute bottom-5 inset-x-5 text-white">
                  <span className="font-serif italic text-2xl text-[#F5D0D3] block">
                    Jessica Lescano
                  </span>
                  <span className="text-xs tracking-widest uppercase text-white/90 font-semibold">
                    Peluquera Profesional • Your place
                  </span>
                </div>
              </div>

              {/* Insignia de experiencia */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-4 rounded-2xl shadow-xl border border-[#D89A9E]/60 max-w-[210px] text-left">
                <div className="flex items-center gap-2 text-[#B77176] mb-1">
                  <Award size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Peluquería</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#141213]">
                  Tucumán
                </div>
                <div className="text-[11px] text-[#666] leading-tight mt-0.5">
                  Libertad y Lavalle • Turnos dedicados
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Biografía y Filosofía de Peluquería */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8E5] text-[#B77176] text-xs font-semibold tracking-wider uppercase">
              <Scissors size={13} />
              Sobre la Profesional
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141213] tracking-tight leading-tight">
              "Your place es un espacio pensado para mimar tu cabello y brindarte una atención cercana y de confianza."
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#554A4C] leading-relaxed font-light">
              <p>
                ¡Hola! Soy <strong className="font-semibold text-[#141213]">Jessica Lescano</strong>, peluquera profesional en San Miguel de Tucumán. Sé lo importante que es sentirte cómoda y segura al momento de confiar tu cabello a alguien.
              </p>
              <p>
                Por eso en <strong className="font-semibold text-[#141213]">Your place</strong> nos dedicamos exclusivamente a la peluquería: realizamos cortes femeninos, tinturas completas o retoques, claritos y reflejos, botox capilar y alisados. Cada clienta recibe un turno exclusivo, sin esperas ni apuros.
              </p>
            </div>

            {/* Características del salón */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8DDD8]">
              {salonFeatures.map((feat) => (
                <div key={feat.title} className="bg-[#FAF6F4] p-4 rounded-xl border border-[#E8DDD8] shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#FAF0F1] text-[#B77176] shrink-0 mt-0.5">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#141213]">{feat.title}</h4>
                    <p className="text-xs text-[#665A5C] mt-0.5 leading-snug">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Llamado a la acción */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all shadow-md"
              >
                <Calendar size={16} className="text-[#D89A9E]" />
                <span>Agendar Turno con Jessica</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[#665A5C]">
                <MapPin size={14} className="text-[#D89A9E]" />
                <span>Libertad y Lavalle, Tucumán</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
