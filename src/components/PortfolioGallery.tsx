import React, { useState, useEffect, useCallback } from 'react';
import { portfolioItems } from '../data/salonData';
import { PortfolioItem } from '../types';
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Calendar, User, Tag } from 'lucide-react';

interface PortfolioGalleryProps {
  onBookLook?: (item: PortfolioItem) => void;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ onBookLook }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tabs = [
    { id: 'all', label: 'Todos los Trabajos' },
    { id: 'color', label: 'Color & Balayage' },
    { id: 'cortes', label: 'Cortes & Styling' },
    { id: 'tratamientos', label: 'Tratamientos Capilares' },
    { id: 'eventos', label: 'Novias & Eventos' },
  ];

  const filteredItems = activeTab === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeTab);

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev! + 1) % filteredItems.length));
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev! - 1 + filteredItems.length) % filteredItems.length));
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  return (
    <section id="galeria" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8E5] text-[#B77176] text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles size={13} />
            Galería de Trabajos
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141213] tracking-tight">
            Resultados reales en Your place
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#665A5C] font-light leading-relaxed">
            Cada melena cuenta una historia de cuidado, luminosidad y diseño a medida. Mirá algunas de las transformaciones realizadas por Jessica Lescano.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setLightboxIndex(null);
              }}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#181818] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#665E60] hover:bg-[#F2ECE4] border border-[#E6DDD0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative rounded-2xl overflow-hidden bg-[#F2ECE4] aspect-[4/3] cursor-pointer border border-[#EAE2D7] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white" />

              {/* Card Content (always visible on mobile, hover on desktop) */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white transform sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[11px] font-semibold text-[#E8B4B8] uppercase tracking-wider block mb-1">
                  {item.categoryLabel}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight drop-shadow-sm mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#E5D7D8]">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-[#E8B4B8]" />
                    {item.stylist}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <Maximize2 size={11} /> Ver detalle
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && activeItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 z-10 transition-colors"
              aria-label="Cerrar vista completa"
            >
              <X size={26} />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-6 p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/70 z-10 transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-6 p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/70 z-10 transition-colors"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={28} />
            </button>

            {/* Main Lightbox Card */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#181818] rounded-3xl overflow-hidden border border-[#E8B4B8]/30 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Image side */}
              <div className="md:w-3/5 bg-black flex items-center justify-center overflow-hidden max-h-[55vh] md:max-h-[80vh]">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-contain md:object-cover"
                />
              </div>

              {/* Details side */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-[#FAF7F2] overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#E8B4B8]">
                      {activeItem.categoryLabel}
                    </span>
                    <span className="text-xs text-[#666]">•</span>
                    <span className="text-xs text-[#A89C9E]">
                      {lightboxIndex + 1} de {filteredItems.length}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-3">
                    {activeItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#C4B6B8] leading-relaxed mb-6 font-light">
                    {activeItem.description}
                  </p>

                  {/* Stylist attribution */}
                  <div className="bg-[#242022] p-3.5 rounded-xl border border-[#3A3335] mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[#E8B4B8]/20 text-[#E8B4B8]">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#998F91] block">Realizado por</span>
                      <span className="text-xs font-semibold text-white">
                        {activeItem.stylist}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {activeItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#2A2426] text-[#E8B4B8] border border-[#E8B4B8]/30"
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Booking CTA inside Lightbox */}
                <div className="pt-4 border-t border-[#2C2426]">
                  <button
                    onClick={() => {
                      setLightboxIndex(null);
                      if (onBookLook) onBookLook(activeItem);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#141213] bg-gradient-to-r from-[#F5D0D3] via-[#D89A9E] to-[#B77176] hover:brightness-110 shadow-md transition-all"
                  >
                    <Calendar size={16} />
                    <span>Quiero este estilo • Reservar Turno</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
