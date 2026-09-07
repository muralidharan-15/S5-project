import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileHeader = ({ currentDistrict = 'Virudhunagar', onSelectDistrict, districts = [] }) => {
  const navigate = useNavigate();

  return (
    <header className="md:hidden flex justify-between items-start w-full px-container-padding-mobile pt-safe pt-4 pb-3 bg-surface/95 backdrop-blur-sm top-0 sticky z-40 border-b border-outline-variant/30">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
          Live AI Monitor 👋
        </p>
        <h1 className="text-[24px] leading-tight font-bold tracking-tight text-[#0F172A] mb-2">
          Flood Risk Monitor
        </h1>

        <div className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] shadow-xs rounded-full px-3 py-1">
          <span className="material-symbols-outlined text-primary text-sm">location_on</span>
          {districts && districts.length > 0 && onSelectDistrict ? (
            <select
              value={currentDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              aria-label="Select Tamil Nadu District"
              className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}, Tamil Nadu
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-700 font-medium tracking-normal">
              {currentDistrict}, Tamil Nadu
            </span>
          )}
        </div>
      </div>

      <div
        onClick={() => navigate('/alerts')}
        className="relative cursor-pointer mt-1"
        title="Alerts Center"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EA580C] rounded-full border-2 border-white"></span>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
