
import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showTagline = true }) => {
  return (
    <div className={`flex flex-col items-center ${className} transition-all duration-500`}>
      {/* Main COTRAC Text SVG - Optimized for Sharpness */}
      <svg viewBox="0 0 540 100" className="w-full h-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        <text 
            x="50%" 
            y="80" 
            textAnchor="middle"
            style={{ 
                fill: '#000080', 
                font: '900 110px "Plus Jakarta Sans", Arial, sans-serif', 
                letterSpacing: '-6px' 
            }}
        >
          COTRAC
        </text>
      </svg>
      
      {showTagline && (
        <div className="flex items-center gap-4 mt-2 whitespace-nowrap px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <span className="text-slate-400 font-extrabold text-[8px] md:text-[10px] uppercase tracking-[0.2em]">Technology</span>
          <div className="w-[1.5px] h-3 bg-[#f7941d]/40"></div>
          <span className="text-slate-400 font-extrabold text-[8px] md:text-[10px] uppercase tracking-[0.2em]">Security</span>
          <div className="w-[1.5px] h-3 bg-[#f7941d]/40"></div>
          <span className="text-slate-400 font-extrabold text-[8px] md:text-[10px] uppercase tracking-[0.2em]">Intelligence</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
