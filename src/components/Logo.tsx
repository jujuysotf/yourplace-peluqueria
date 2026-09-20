import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  layout?: 'horizontal' | 'stacked' | 'badge-only';
  showSubtext?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  layout = 'horizontal',
  showSubtext = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { badge: 40, script: 'text-lg', title: 'text-xs', sub: 'text-[8px]', gap: 'gap-2.5' },
    md: { badge: 52, script: 'text-2xl', title: 'text-sm', sub: 'text-[9px]', gap: 'gap-3' },
    lg: { badge: 84, script: 'text-3xl sm:text-4xl', title: 'text-base sm:text-lg', sub: 'text-[11px]', gap: 'gap-4' },
    xl: { badge: 120, script: 'text-5xl', title: 'text-xl', sub: 'text-xs', gap: 'gap-5' }
  };

  const dim = sizeMap[size];

  // The Pilot Badge Emblem based on the uploaded logo image
  const Badge = (
    <div 
      className="relative shrink-0 rounded-full p-[2px] shadow-sm group"
      style={{
        width: dim.badge,
        height: dim.badge,
        background: 'linear-gradient(135deg, #F5D0D3 0%, #D89A9E 50%, #B77176 100%)'
      }}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-[#141213] border border-[#F5D0D3]/60 relative flex items-center justify-center">
        <img
          src="/logo-piloto.jpg"
          alt="Your place - Lescano Jessica Peluquería"
          className="w-full h-full object-cover rounded-full transform transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to local image in assets if public path isn't loaded
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('logo_lescano_jessica')) {
              target.src = '/src/assets/images/logo_lescano_jessica_1789861198412.jpg';
            }
          }}
        />
        {/* Subtle metallic sheen ring */}
        <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
      </div>
    </div>
  );

  if (layout === 'badge-only') {
    return <div className={`inline-flex items-center ${className}`}>{Badge}</div>;
  }

  const isLight = variant === 'light';

  return (
    <div
      className={`inline-flex items-center ${
        layout === 'stacked' ? 'flex-col text-center' : 'flex-row text-left'
      } ${dim.gap} ${className}`}
    >
      {Badge}

      <div className={`flex flex-col justify-center ${layout === 'stacked' ? 'items-center mt-1' : 'items-start'}`}>
        {/* "Your place" in elegant script font */}
        <span
          className={`font-serif italic font-normal tracking-wide ${dim.script} ${
            isLight ? 'text-white' : 'text-[#141213]'
          } leading-none drop-shadow-xs`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Your place
        </span>

        {showSubtext && (
          <div className="flex flex-col items-start mt-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-sans font-bold uppercase tracking-[0.25em] ${dim.title} ${
                  isLight ? 'text-[#E8B4B8]' : 'text-[#B77176]'
                } leading-tight`}
              >
                LESCANO JESSICA
              </span>
              <span className="text-[#D89A9E] text-[10px]">♥</span>
            </div>

            <div className="flex items-center gap-1.5 w-full mt-0.5">
              <span className={`h-[0.5px] flex-1 ${isLight ? 'bg-white/20' : 'bg-[#B77176]/30'}`} />
              <span
                className={`font-sans font-semibold uppercase tracking-[0.28em] ${dim.sub} ${
                  isLight ? 'text-[#DDD]' : 'text-[#5A5052]'
                }`}
              >
                PELUQUERÍA
              </span>
              <span className="text-[#D89A9E] text-[8px]">✂</span>
              <span className={`h-[0.5px] flex-1 ${isLight ? 'bg-white/20' : 'bg-[#B77176]/30'}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
