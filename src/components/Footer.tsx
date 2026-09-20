import React from 'react';
import { Logo } from './Logo';
import { salonInfo } from '../data/salonData';
import { 
  Instagram, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart,
  Calendar
} from 'lucide-react';

interface FooterProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  return (
    <footer className="bg-[#141213] text-[#FAF6F4] border-t border-[#2A2325] relative overflow-hidden">
      {/* Borde superior metálico en gradiente oro rosa */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F5D0D3] via-[#D89A9E] to-[#B77176]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Marca y Logo Piloto */}
          <div className="lg:col-span-4 space-y-4">
            <Logo size="lg" variant="light" layout="stacked" className="items-start text-left" />
            <p className="text-xs sm:text-sm text-[#BDB0B1] leading-relaxed pt-2">
              Peluquería exclusiva de <strong>Jessica Lescano</strong> en Tucumán. Especializada en balayage, colorimetría, cortes de diseño, botox capilar y alisados.
            </p>

            {/* Redes y Contacto Directo */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={salonInfo.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @un_mimo_para_ty"
                className="w-9 h-9 rounded-full bg-[#241E20] border border-[#3A3032] flex items-center justify-center text-[#D89A9E] hover:bg-[#D89A9E] hover:text-[#141213] transition-all"
              >
                <Instagram size={17} />
              </a>
              <a
                href={`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp directo"
                className="w-9 h-9 rounded-full bg-[#241E20] border border-[#3A3032] flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
              >
                <div className="relative flex items-center justify-center">
                  <Phone size={15} className="fill-current" />
                </div>
              </a>
            </div>
          </div>

          {/* Col 2: Navegación */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#2D2426] pb-2">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#C2B5B7]">
              <li>
                <a href="#servicios" className="hover:text-[#D89A9E] transition-colors">
                  Servicios & Precios
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-[#D89A9E] transition-colors">
                  Trabajos Realizados
                </a>
              </li>
              <li>
                <a href="#sobre-nosotros" className="hover:text-[#D89A9E] transition-colors">
                  Sobre Jessica
                </a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-[#D89A9E] transition-colors">
                  Opiniones de Clientas
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#D89A9E] transition-colors">
                  Ubicación & Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Servicios Principales */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#2D2426] pb-2">
              Peluquería
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#C2B5B7]">
              <li>
                <button
                  onClick={() => onOpenBooking('corte-femenino')}
                  className="hover:text-[#D89A9E] text-left transition-colors"
                >
                  Corte Femenino (Lavado y Secado)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('tintura-raiz-completa')}
                  className="hover:text-[#D89A9E] text-left transition-colors"
                >
                  Tintura Completa o Retoque
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('reflejos-claritos')}
                  className="hover:text-[#D89A9E] text-left transition-colors"
                >
                  Claritos / Reflejos Iluminados
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('botox-capilar')}
                  className="hover:text-[#D89A9E] text-left transition-colors"
                >
                  Botox Capilar Antifrizz
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBooking('alisado-keratina')}
                  className="hover:text-[#D89A9E] text-left transition-colors"
                >
                  Alisado o Shock de Keratina
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Horarios y Ubicación */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#2D2426] pb-2">
              Atención
            </h4>
            <div className="space-y-2 text-xs text-[#C2B5B7]">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#D89A9E] shrink-0 mt-0.5" />
                <span>Libertad y Lavalle, San Miguel de Tucumán</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-[#D89A9E] shrink-0" />
                <span>{salonInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock size={15} className="text-[#D89A9E] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Lunes a Sábados: 09:00 a 20:00 hs</span>
                  <span className="text-[#888]">Domingos: Cerrado</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-[#141213] bg-[#D89A9E] hover:bg-[#F5D0D3] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar size={13} />
                  <span>Reservar Turno Online</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Barra Inferior */}
        <div className="mt-12 pt-6 border-t border-[#241E20] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8284] gap-4">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Your place por Jessica Lescano. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Hecho con <Heart size={12} className="text-[#D89A9E] fill-[#D89A9E]" /> en Tucumán
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
