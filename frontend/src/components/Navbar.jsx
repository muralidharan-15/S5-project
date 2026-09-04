import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Moon, Sun, RefreshCw } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode, lastUpdated = 'Just now' }) => {
  const navigate = useNavigate();

  const handleSosClick = () => {
    navigate('/contact', { state: { scrollToSos: true } });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-navy-700/50 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: System Logo + Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">FloodAlert AI</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-md">
                  Tamil Nadu
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">Emergency & Risk Prediction System</p>
            </div>
          </div>

          {/* Center: CRITICAL PERSISTENT CENTERED EMERGENCY SOS BUTTON */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSosClick}
              type="button"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 animate-sos-pulse border border-red-400/50 focus:outline-none"
              title="Click for Emergency Contact Numbers"
            >
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              <span className="hidden xs:inline">EMERGENCY</span> SOS
            </button>
          </div>

          {/* Right: Nav Links + Data Status + Theme Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive ? 'text-sky-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Dashboard
                    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 rounded-full"></span>}
                  </>
                )}
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive ? 'text-sky-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    About
                    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 rounded-full"></span>}
                  </>
                )}
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive ? 'text-sky-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Contact & Alerts
                    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 rounded-full"></span>}
                  </>
                )}
              </NavLink>
            </nav>

            {/* Live Data Status Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs text-slate-300">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{lastUpdated}</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-slate-200" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-navy-700/50 text-xs font-medium text-slate-300">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-sky-400 font-bold' : 'hover:text-white'}>
            Dashboard
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'text-sky-400 font-bold' : 'hover:text-white'}>
            About System
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-sky-400 font-bold' : 'hover:text-white'}>
            Emergency & Alerts
          </NavLink>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
