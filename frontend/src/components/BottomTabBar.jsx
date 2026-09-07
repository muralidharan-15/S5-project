import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSosActive = location.pathname === '/sos';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-surface pb-safe border-t border-outline-variant/60 shadow-lg rounded-t-2xl">
      {/* 1. Home */}
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full gap-1 active:scale-95 transition-transform ${
            isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>home</span>
            <span className="text-[10px] font-semibold tracking-tight leading-none">Home</span>
          </>
        )}
      </NavLink>

      {/* 2. Map */}
      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full gap-1 active:scale-95 transition-transform ${
            isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>map</span>
            <span className="text-[10px] font-semibold tracking-tight leading-none">Map</span>
          </>
        )}
      </NavLink>

      {/* 3. Center Raised SOS Button */}
      <div className="relative -top-5 flex flex-col items-center justify-center">
        <button
          onClick={() => navigate('/sos')}
          aria-label="Emergency SOS"
          className={`w-14 h-14 bg-[#DC2626] rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-surface danger-pulse ${
            isSosActive ? 'ring-4 ring-red-400/50' : ''
          }`}
        >
          <span className="material-symbols-outlined text-2xl filled">emergency_share</span>
        </button>
        <span className="text-[10px] font-bold text-[#DC2626] tracking-wider uppercase mt-1 leading-none">
          SOS
        </span>
      </div>

      {/* 4. Alerts */}
      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full gap-1 active:scale-95 transition-transform relative ${
            isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>notifications</span>
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#EA580C] ring-2 ring-surface" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight leading-none">Alerts</span>
          </>
        )}
      </NavLink>

      {/* 5. Dams */}
      <NavLink
        to="/dams"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full gap-1 active:scale-95 transition-transform ${
            isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>waves</span>
            <span className="text-[10px] font-semibold tracking-tight leading-none">Dams</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomTabBar;
