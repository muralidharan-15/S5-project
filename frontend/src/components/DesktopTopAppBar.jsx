import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const DesktopTopAppBar = ({ currentDistrict = 'Virudhunagar', onSelectDistrict, districts = [] }) => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', end: true },
    { to: '/map', label: 'Map' },
    { to: '/dams', label: 'Dams' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <header className="hidden md:flex justify-between items-center w-full px-container-padding-desktop h-16 bg-surface top-0 sticky z-40 border-b border-outline-variant/60 shadow-xs">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">water</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 leading-none mb-1">
              Live AI Telemetry 👋
            </p>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] leading-none">
              Flood Risk Monitor
            </h1>
          </div>
        </div>

        {/* Desktop District Selection Dropdown Pill */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200/90 hover:border-primary/60 shadow-xs rounded-xl px-3 py-1.5 transition-all">
          <span className="material-symbols-outlined text-primary text-base">location_on</span>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">District</span>
            <select
              value={currentDistrict}
              onChange={(e) => onSelectDistrict && onSelectDistrict(e.target.value)}
              aria-label="Select Tamil Nadu District"
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}, TN
                </option>
              ))}
            </select>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-sm pointer-events-none">unfold_more</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="flex gap-1.5 items-center bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-slate-100 shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          onClick={() => navigate('/alerts')}
          className="relative cursor-pointer hover:bg-slate-100 transition-colors p-2 rounded-full text-slate-600"
          title="Alerts Center"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EA580C] rounded-full border-2 border-white"></span>
        </div>

        <button
          onClick={() => navigate('/sos')}
          className="bg-[#DC2626] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">emergency</span>
          SOS
        </button>
      </div>
    </header>
  );
};

export default DesktopTopAppBar;
