import React from 'react';

interface HamdarLogoProps {
  className?: string;
  showFlankingMarks?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onTouchEnd?: (e: React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Geometric faceted ribbon 'H' emblem
 */
export const HamdarEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 38, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 select-none ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="redGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="redGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="redGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
    </defs>
    
    {/* Left vertical faceted polygon */}
    <path
      d="M18 14 L36 14 L36 46 L18 64 Z"
      fill="url(#redGrad1)"
    />
    <path
      d="M18 64 L36 46 L36 86 L18 86 Z"
      fill="url(#redGrad3)"
    />

    {/* Center diagonal faceted chevron bridge */}
    <path
      d="M36 34 L64 52 L64 68 L36 50 Z"
      fill="url(#redGrad2)"
    />
    <path
      d="M36 50 L64 68 L64 52 L36 34 Z"
      fill="#DC2626"
      opacity="0.85"
    />

    {/* Right vertical faceted polygon */}
    <path
      d="M64 14 L82 14 L82 64 L64 46 Z"
      fill="url(#redGrad2)"
    />
    <path
      d="M64 46 L82 64 L82 86 L64 86 Z"
      fill="url(#redGrad1)"
    />
  </svg>
);

/**
 * HAMDAR Fashion Wear official lockup with red chevron 'A' accents and cursive script
 */
export const HamdarLogo: React.FC<HamdarLogoProps> = ({
  className = "",
  showFlankingMarks = true,
  size = 'md',
  onTouchEnd,
  onClick
}) => {
  const emblemSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;

  return (
    <div
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none active:scale-98 transition-transform ${className}`}
      title="HAMDAR Fashion Wear"
    >
      {/* Left Red Geometric Ribbon Emblem */}
      <HamdarEmblem size={emblemSize} />

      {/* Typography Lockup */}
      <div className="flex flex-col items-center justify-center leading-none">
        {/* Bold uppercase HAMDAR with red chevron accents in 'A's */}
        <div className="flex items-center tracking-tight font-black font-['Outfit'] text-slate-950 text-xl sm:text-2xl md:text-3xl leading-none">
          <span>H</span>
          
          {/* Custom 'A' with sharp red chevron crossbar */}
          <span className="relative inline-block mx-[0.5px]">
            <span>A</span>
            <span
              className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-red-600"
              aria-hidden="true"
            />
          </span>

          <span>M</span>
          <span>D</span>

          {/* Second 'A' with red chevron */}
          <span className="relative inline-block mx-[0.5px]">
            <span>A</span>
            <span
              className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-red-600"
              aria-hidden="true"
            />
          </span>

          <span>R</span>
        </div>

        {/* Red Cursive Script "Fashion Wear" */}
        <span
          className="font-script text-[#B91C1C] text-xs sm:text-sm md:text-base font-normal tracking-wide -mt-0.5 sm:-mt-1 italic"
          style={{ fontFamily: "'Playball', 'Alex Brush', cursive" }}
        >
          Fashion Wear
        </span>
      </div>

      {/* Right Red Geometric Ribbon Emblem (as shown in official reference) */}
      {showFlankingMarks && (
        <HamdarEmblem size={emblemSize} />
      )}
    </div>
  );
};
