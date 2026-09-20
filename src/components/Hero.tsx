import React from 'react';
import { Calendar, ArrowRight, Star, Clock, MapPin, Scissors } from 'lucide-react';
import { Logo } from './Logo';
import { salonInfo } from '../data/salonData';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  return (
    <section className="relative overflow-hidden bg-[#141213] text-white">
      {/* Fondo con imagen tenue del salón y gradiente negro-oro rosa */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src="/src/assets/images/hero_salon_1789860136258.jpg"
          alt="Salón de peluquería Your place"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Capas de iluminación cálida en oro rosa y carbón */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#141213] via-[#1A1618]/95 to-[#241D20]/80" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-[#D89A9E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#B77176]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Columna Izquierda: Información & Reserva */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Distintivo de ubicación y horario */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#241E20] border border-[#D89A9E]/40 shadow-sm backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D89A9E] animate-ping" />
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#F5D0D3]">
                Peluquería Femenina • Libertad y Lavalle, Tucumán
              </span>
            </div>

            {/* Logo de marca */}
            <div className="mb-6 flex items-center justify-center lg:justify-start">
              <Logo size="lg" variant="light" layout="horizontal" />
            </div>

            {/* Título Principal */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-normal tracking-tight text-[#FAF6F4] leading-[1.2] mb-6">
              El espacio creado para cuidar, iluminar y{' '}
              <span className="italic text-[#E8B4B8] font-serif block sm:inline">
                renovar tu melena
              </span>
            </h1>

            {/* Subtítulo descriptivo */}
            <p className="text-base sm:text-lg text-[#D8CCC9] max-w-2xl font-light leading-relaxed mb-8">
              Cortes femeninos, tinturas, claritos, botox capilar y alisados. 
              Atención cálida y personalizada de la mano de <strong className="font-medium text-white">Jessica Lescano</strong>, 
              con turnos puntuales para que disfrutes de un mimo para tu cabello.
            </p>

            {/* Botones de acción directa */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <button
                id="btn-hero-booking"
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-[#141213] bg-gradient-to-r from-[#F5D0D3] via-[#D89A9E] to-[#B77176] hover:brightness-110 shadow-lg shadow-[#D89A9E]/20 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <Calendar size={18} className="text-[#141213]" />
                <span>Reservar Turno Online</span>
                <ArrowRight size={17} className="text-[#141213] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-medium text-[#FAF6F4] bg-[#241E20] hover:bg-[#302629] border border-[#D89A9E]/40 hover:border-[#D89A9E] transition-all duration-300"
              >
                <span>Ver Servicios & Precios</span>
              </button>
            </div>

            {/* Indicadores de confianza */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#2C2426] w-full max-w-lg text-left">
              <div>
                <div className="flex items-center gap-1 text-[#D89A9E] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#D89A9E]" />
                  ))}
                </div>
                <div className="text-xs text-[#AAA]">Clientas felices</div>
                <div className="text-sm font-bold text-white">5.0 de 5 estrellas</div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#D89A9E] mb-1">
                  <Clock size={16} />
                </div>
                <div className="text-xs text-[#AAA]">Lunes a Sábados</div>
                <div className="text-sm font-bold text-white">09:00 a 20:00 hs</div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1 text-[#D89A9E] mb-1">
                  <MapPin size={16} />
                </div>
                <div className="text-xs text-[#AAA]">Ubicación</div>
                <div className="text-sm font-bold text-white">Libertad y Lavalle</div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta con el Logo Piloto Oficial de Your place */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-3 rounded-3xl bg-gradient-to-br from-[#D89A9E]/30 via-transparent to-[#B77176]/20 border border-[#D89A9E]/40 shadow-2xl max-w-sm sm:max-w-md w-full">
              <div className="bg-[#141213] rounded-2xl p-6 border border-[#2D2426] flex flex-col items-center text-center space-y-4">
                
                {/* Imagen del Logo Piloto */}
                <div 
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1 shadow-xl relative group"
                  style={{
                    background: 'linear-gradient(135deg, #F5D0D3 0%, #D89A9E 50%, #B77176 100%)'
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#141213] relative">
                    <img
                      src="/logo-piloto.jpg"
                      alt="Your place - Lescano Jessica Peluquería"
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/src/assets/images/logo_lescano_jessica_1789861198412.jpg';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
                    Jessica Lescano
                  </h3>
                  <p className="text-xs font-semibold text-[#D89A9E] uppercase tracking-widest">
                    Peluquería Profesional
                  </p>
                  <p className="text-xs text-[#B2A4A6] pt-1">
                    Cuidado capilar, colorimetría y diseño personalizado en San Miguel de Tucumán.
                  </p>
                </div>

                {/* Botón rápido de reserva para clientes */}
                <button
                  onClick={onOpenBooking}
                  className="w-full py-3 rounded-full bg-[#221B1D] hover:bg-[#D89A9E] hover:text-[#141213] text-[#F5D0D3] text-xs font-bold uppercase tracking-wider border border-[#D89A9E]/50 transition-all flex items-center justify-center gap-2"
                >
                  <Scissors size={14} />
                  <span>Elegir Servicio & Turno</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
