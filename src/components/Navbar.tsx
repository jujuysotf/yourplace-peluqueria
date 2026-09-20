import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { salonInfo } from '../data/salonData';
import { 
  Calendar, 
  Menu, 
  X, 
  Phone, 
  Clock, 
  Instagram, 
  MapPin,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking: (serviceId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Servicios & Precios', href: '#servicios' },
    { label: 'Trabajos Realizados', href: '#galeria' },
    { label: 'Sobre Jessica', href: '#sobre-nosotros' },
    { label: 'Opiniones', href: '#testimonios' },
    { label: 'Ubicación & Contacto', href: '#contacto' },
  ];

  return (
    <>
      {/* Barra superior de información rápida */}
      <div className="bg-[#141213] text-[#E5D7D8] text-xs py-2 px-4 border-b border-[#2C2426] hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#F2D5D7]">
              <Clock size={13} className="text-[#D89A9E]" />
              Lunes a Sábados: 09:00 a 20:00 hs
            </span>
            <span className="text-[#6E6466]">|</span>
            <span className="flex items-center gap-1.5 text-[#D0C5C6]">
              <MapPin size={13} className="text-[#D89A9E]" />
              Libertad y Lavalle, San Miguel de Tucumán
            </span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href={`https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#E5D7D8] hover:text-[#D89A9E] transition-colors"
            >
              <Phone size={13} className="text-[#D89A9E]" />
              WhatsApp: {salonInfo.phone}
            </a>
            <span className="text-[#6E6466]">|</span>
            <a
              href={salonInfo.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Your place"
              className="flex items-center gap-1 hover:text-[#D89A9E] transition-colors text-[#F5D0D3]"
            >
              <Instagram size={14} />
              <span>@un_mimo_para_ty</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra de navegación principal */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF6F4]/95 backdrop-blur-md shadow-sm border-b border-[#D89A9E]/40 py-2.5'
            : 'bg-[#FAF6F4] border-b border-[#EFE3E0] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Principal con el Isotipo Piloto */}
          <a href="#" className="flex items-center focus:outline-none" aria-label="Ir al inicio de Your place">
            <Logo size={isScrolled ? 'sm' : 'md'} />
          </a>

          {/* Enlaces para pantallas medianas y grandes */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#4A4042]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[#B77176] transition-colors duration-200 relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D89A9E] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Botón de Reserva Directa para Clientes */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 border border-[#D89A9E]/30"
            >
              <Calendar size={15} className="text-[#D89A9E]" />
              <span>Reservar Turno</span>
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onOpenBooking()}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#141213] flex items-center gap-1.5 shadow-sm"
            >
              <Calendar size={13} className="text-[#D89A9E]" />
              <span>Turnos</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#141213] hover:bg-[#F0DFDA] focus:outline-none transition-colors"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable en Móviles */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF6F4] border-b border-[#EFE3E0] px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-base font-medium text-[#2E2829] hover:bg-[#F2E5E2] hover:text-[#B77176] transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-4 border-t border-[#EFE3E0] space-y-3">
                <div className="text-xs text-[#6A5E60] space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-[#D89A9E]" />
                    <span>Lunes a Sábados: 09:00 a 20:00 hs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[#D89A9E]" />
                    <span>Libertad y Lavalle - Tucumán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#D89A9E]" />
                    <span>{salonInfo.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full py-3 rounded-xl text-center text-sm font-semibold text-white bg-[#141213] hover:bg-[#B77176] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Calendar size={16} className="text-[#D89A9E]" />
                  <span>Reservar Turno Online</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
