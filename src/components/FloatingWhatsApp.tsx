import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { salonInfo } from '../data/salonData';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${salonInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(salonInfo.whatsappMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="bg-white text-[#141213] p-3 rounded-2xl shadow-xl border border-[#D89A9E]/50 mb-2 max-w-[220px] text-xs relative animate-fadeIn">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -left-1.5 bg-[#141213] text-white rounded-full p-0.5 hover:bg-[#B77176] transition-colors"
            aria-label="Cerrar mensaje"
          >
            <X size={12} />
          </button>
          <div className="font-semibold text-[#141213] flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>¿Tenés alguna duda?</span>
          </div>
          <p className="text-[#665A5C] leading-tight text-[11px]">
            Escribile a Jessica directamente por WhatsApp.
          </p>
        </div>
      )}

      {/* WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp a Jessica Lescano"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white/90"
        title="Consultar por WhatsApp"
      >
        <div className="relative flex items-center justify-center w-8 h-8 pointer-events-none">
          <MessageCircle size={32} className="text-white" strokeWidth={2.4} />
          <Phone size={14} className="text-white fill-white absolute -translate-y-0.5 translate-x-0.5 -rotate-12" />
        </div>
      </a>
    </div>
  );
};
