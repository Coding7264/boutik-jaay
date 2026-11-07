import React from 'react';

interface JaayLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light' | 'auto';
}

export const JaayLogo: React.FC<JaayLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
  theme = 'auto',
}) => {
  const iconSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official Jaay Icon Badge (Matching the attached brand icon) */}
      <div
        className={`${iconSize} rounded-xl bg-[#13274F] flex items-center justify-center p-1 shadow-sm shrink-0 relative overflow-hidden`}
        title="Jaay"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tilted white price tag */}
          <g transform="rotate(-8 50 50)">
            <path
              d="M44 14C47.5 10 52.5 10 56 14L80 40C83.5 44 83.5 50 80 54L64 78C60.5 82 55.5 84 51 82L24 72C19.5 70 17 65.5 18 61L24 33C25 28.5 28.5 24 32.5 21L44 14Z"
              fill="#FFFFFF"
            />
            {/* Mint green dot above j */}
            <circle cx="50" cy="38" r="6" fill="#34D399" />
            {/* Lowercase 'j' glyph in dark navy */}
            <path
              d="M53 48V62C53 68 49 71 43 71C39 71 36 69 35 67L38 62C39 63.5 41 64.5 43 64.5C45.5 64.5 47 63.5 47 60.5V48H53Z"
              fill="#13274F"
            />
          </g>
        </svg>
      </div>

      {/* Jaay Wordmark */}
      {showWordmark && (
        <span
          className={`font-black tracking-tight font-sans ${textSize} ${
            theme === 'dark'
              ? 'text-white'
              : theme === 'light'
              ? 'text-[#13274F]'
              : 'text-[#13274F] dark:text-white'
          }`}
        >
          Jaay
        </span>
      )}
    </div>
  );
};
