import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' for light backgrounds (navbar), 'dark' for dark backgrounds (footer)
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  preferImage?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  preferImage = true,
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);
  const isDark = variant === 'dark';

  // Size configurations
  const heightClass =
    size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-11 sm:h-12';
  const textScale =
    size === 'sm'
      ? { title: 'text-base', sub: 'text-[8px]' }
      : size === 'lg'
      ? { title: 'text-2xl sm:text-3xl', sub: 'text-[10px] sm:text-xs' }
      : { title: 'text-xl sm:text-2xl', sub: 'text-[9px] sm:text-[10px]' };

  // If preferImage is true and not dark and image hasn't failed, render high-res image
  if (preferImage && !isDark && !imageFailed) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img
          src="/panelpro-logo.jpg"
          alt="PanelPro Precast and Logistics Ltd Logo"
          className={`${heightClass} w-auto object-contain`}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  // Dark background image badge or vector rendering
  if (preferImage && isDark && !imageFailed) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="bg-white p-1 rounded-md shadow-xs flex items-center justify-center">
          <img
            src="/panelpro-logo.jpg"
            alt="PanelPro Precast and Logistics Ltd"
            className="h-9 sm:h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem matching the official PanelPro Precast & Logistics Logo */}
      <div className={`${heightClass} aspect-square shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
          aria-hidden="true"
        >
          {/* Isometric 3D Precast Concrete Cube Structure */}
          <g transform="translate(60, 56)">
            {/* Top Face of upper block */}
            <polygon
              points="0,-32 24,-18 0,-4 -24,-18"
              fill={isDark ? '#94a3b8' : '#718096'}
            />
            {/* Right Face of upper block */}
            <polygon
              points="0,-4 24,-18 24,6 0,20"
              fill={isDark ? '#64748b' : '#4a5568'}
            />
            {/* Left Face of upper block */}
            <polygon
              points="-24,-18 0,-4 0,20 -24,6"
              fill={isDark ? '#475569' : '#2d3748'}
            />

            {/* Inner Hollow / Structural Precast Channel */}
            <polygon
              points="0,-16 12,-9 0,-2 -12,-9"
              fill={isDark ? '#1e293b' : '#1a202c'}
            />
            <polygon
              points="0,-2 12,-9 12,3 0,10"
              fill={isDark ? '#334155' : '#2d3748'}
            />
            <polygon
              points="-12,-9 0,-2 0,10 -12,3"
              fill={isDark ? '#0f172a' : '#171923'}
            />

            {/* Bottom Support Concrete Column */}
            <polygon
              points="-18,10 -6,17 -6,30 -18,23"
              fill={isDark ? '#64748b' : '#4a5568'}
            />
            <polygon
              points="6,17 18,10 18,23 6,30"
              fill={isDark ? '#475569' : '#2d3748'}
            />
          </g>

          {/* Dynamic Dual-Color Logistics Arrow Swoosh */}
          {/* Outer Deep Navy Blue Ribbon */}
          <path
            d="M 18,68 C 12,50 32,32 54,26 C 70,22 84,26 94,36"
            stroke="#1d4ed8"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 16,68 C 16,84 38,94 62,88 C 76,84 88,74 96,60"
            stroke="#1e3a8a"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner Sharp Vibrant Orange Swoosh Ribbon */}
          <path
            d="M 26,74 C 30,86 46,92 64,88 C 78,85 88,76 96,62"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 28,66 C 26,52 40,36 60,30 C 74,26 86,30 95,38"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Upward-pointing Orange Logistics Arrow Head */}
          <polygon
            points="92,20 106,34 88,38 93,31 78,35 80,31 93,28"
            fill="#ea580c"
          />
          {/* Blue Arrow Backing Accent */}
          <polygon
            points="84,33 93,28 88,38"
            fill="#1e3a8a"
          />
        </svg>
      </div>

      {/* Typography: PANELPRO / PRECAST AND LOGISTICS LTD */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight font-black">
          <span
            className={`${textScale.title} ${
              isDark ? 'text-white' : 'text-[#0f2c59]'
            }`}
          >
            PANELPRO
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${textScale.sub} font-bold uppercase tracking-[0.18em] mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Precast and Logistics Ltd
          </span>
        )}
      </div>
    </div>
  );
};
