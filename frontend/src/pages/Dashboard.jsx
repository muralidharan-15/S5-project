import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData, prefetchDistricts } from '../api/floodApi';

const DEFAULT_TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

const Dashboard = ({
  district = 'Virudhunagar',
  onSelectDistrict,
  districtsList = []
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const availableDistricts = districtsList && districtsList.length > 0 ? districtsList : DEFAULT_TN_DISTRICTS;

  // Background pre-fetch top popular districts after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchDistricts([
        'Virudhunagar', 'Chennai', 'Coimbatore', 'Madurai', 'Cuddalore',
        'Salem', 'Tiruchirappalli', 'Kanyakumari', 'Thanjavur', 'Tirunelveli'
      ]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const loadDashboard = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetchDashboardData(district);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchDashboardData(district);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [district]);

  const isOffline = data?.isOffline || false;
  const isInitialLoading = loading && !data;

  const riskPercent = (!isOffline && data?.rainfall_risk?.probability !== undefined)
    ? Math.round(data.rainfall_risk.probability)
    : (!isOffline && data?.rainfall_risk?.raw_risk_percentage !== undefined)
    ? Math.round(data.rainfall_risk.raw_risk_percentage)
    : null;

  const riskLevel = isOffline
    ? 'OFFLINE'
    : (data?.rainfall_risk?.level || data?.rainfall_risk?.flood_risk_level || (riskPercent !== null ? (riskPercent >= 70 ? 'HIGH' : riskPercent >= 40 ? 'MODERATE' : 'LOW') : 'LOW'));

  const weather = {
    rainfall_1day: (!isOffline && (data?.rainfall_features?.rainfall_1day ?? data?.weather?.rainfall)) !== undefined
      ? (data?.rainfall_features?.rainfall_1day ?? data?.weather?.rainfall)
      : null,
    temperature: (!isOffline && data?.weather?.temperature !== undefined) ? data.weather.temperature : null,
    humidity: (!isOffline && data?.weather?.humidity !== undefined) ? data.weather.humidity : null,
    wind_speed: (!isOffline && data?.weather?.wind_speed !== undefined) ? data.weather.wind_speed : null,
  };

  const trendText = isOffline
    ? 'Live Satellite & AI Server Disconnected'
    : (data?.rainfall_risk?.explainability?.summary_banner ||
       data?.rainfall_risk?.message ||
       data?.rainfall_risk?.trend_description ||
       'Real-time satellite & ML telemetry active.');

  const aiSummaryText = isOffline
    ? `Live telemetry cannot be computed while the server is offline. Unverified estimations are withheld to prevent emergency misinformation. For urgent concerns, contact local district disaster helplines.`
    : (data?.rainfall_risk?.advisory ||
       data?.rainfall_risk?.ai_summary ||
       `Atmospheric sensors in ${district} indicate current flood threat is ${riskLevel}. Ground monitoring in progress.`);

  const damSummaryText = isOffline
    ? `Telemetry offline: Dam discharge and reservoir levels cannot be determined.`
    : (data?.dam_details?.dam_name
       ? `${data.dam_details.dam_name} (${data.dam_details.river_basin || 'Basin'}): Discharge ${data.dam_details.river_discharge_m3s || 0} m³/s — ${data.dam_details.status || 'Monitored'}`
       : `1 dam in Danger, 1 in Warning near ${district}`);

  const forecastList = (!isOffline && data?.evaluated_7day_forecast && data.evaluated_7day_forecast.length > 0)
    ? data.evaluated_7day_forecast
    : [
      { day_label: 'Today', probability: '--', level: 'OFFLINE' },
      { day_label: 'Tomorrow', probability: '--', level: 'OFFLINE' },
      { day_label: 'Day 3', probability: '--', level: 'OFFLINE' },
      { day_label: 'Day 4', probability: '--', level: 'OFFLINE' },
      { day_label: 'Day 5', probability: '--', level: 'OFFLINE' },
    ];

  // SVG circular circumference for r=40 is 2 * PI * 40 ~= 251.2
  const strokeDashoffset = (riskPercent !== null && !isOffline) ? (251.2 - (251.2 * riskPercent) / 100) : 251.2;
  const riskColor = isOffline ? '#64748B' : (riskLevel === 'HIGH' ? '#EA580C' : riskLevel === 'MODERATE' ? '#D97706' : '#16A34A');

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop pb-32 md:pb-12 pt-4 flex flex-col gap-6 animate-fadeIn">
      {/* OFFLINE SAFETY WARNING BANNER */}
      {isOffline && (
        <div
          id="offline-safety-banner"
          role="alert"
          className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700 shadow-lg animate-fadeIn"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <span className="material-symbols-outlined text-2xl">cloud_off</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Live Monitoring Station Disconnected
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950 text-red-300 border border-red-800">
                  No Live Telemetry
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Real-time satellite & hydrologic telemetry is currently offline. To prevent critical misinformation during emergencies, unverified risk estimations are not displayed.
              </p>
            </div>
          </div>
          <button
            onClick={() => loadDashboard(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-primary hover:bg-blue-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
            {loading ? 'Reconnecting...' : 'Retry Live Signal'}
          </button>
        </div>
      )}

      {/* 0. PROMINENT DISTRICT SELECTION & LIVE TELEMETRY CONTROL BAR */}
      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">location_on</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Target District Monitoring
                </span>
                <span
                  id="manual-badge"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                >
                  Manual Selection
                </span>
                {loading ? (
                  <span
                    id="telemetry-loading-badge"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Syncing Live Telemetry...
                  </span>
                ) : data?.isFallback ? (
                  <span
                    id="fallback-badge"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    Estimated Data (Live Offline)
                  </span>
                ) : (
                  <span
                    id="live-telemetry-badge"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Satellite & Hydro AI
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0F172A]">
                {district}, Tamil Nadu
              </h2>
            </div>
          </div>

          {/* Primary District Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <label htmlFor="home-district-select" className="sr-only">Select District</label>
              <div className="flex items-center bg-slate-50 hover:bg-slate-100/90 border-2 border-primary/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-3.5 py-2.5 transition-all shadow-xs">
                <span className="material-symbols-outlined text-primary text-xl mr-2">travel_explore</span>
                <select
                  id="home-district-select"
                  value={district}
                  onChange={(e) => onSelectDistrict && onSelectDistrict(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer pr-2"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}, Tamil Nadu
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-slate-400 text-lg pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Selection Chips */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-slate-400">touch_app</span>
            Quick Switch:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
            {['Virudhunagar', 'Chennai', 'Coimbatore', 'Madurai', 'Cuddalore', 'Salem', 'Tiruchirappalli', 'Kanyakumari', 'Thanjavur', 'Tirunelveli'].map((d) => {
              const isSelected = district === d;
              return (
                <button
                  key={d}
                  onClick={() => onSelectDistrict && onSelectDistrict(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 active:scale-95'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* 1. MAIN HERO CARD - Current Risk */}
        <div className="md:col-span-8 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 md:p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50/70 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: riskColor }} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Flood Risk
              </h2>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                isOffline
                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                  : riskLevel === 'HIGH'
                  ? 'bg-orange-50 border-orange-200/60 text-[#EA580C]'
                  : riskLevel === 'MODERATE'
                  ? 'bg-amber-50 border-amber-200/60 text-[#D97706]'
                  : 'bg-emerald-50 border-emerald-200/60 text-emerald-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {isOffline ? 'Server Offline' : `${riskLevel} Risk`}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 flex-1 relative z-10">
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="40" stroke="#F1F5F9" strokeWidth="7.5" />
                <circle
                  className="transition-all duration-1000 ease-out"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke={riskColor}
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="7.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                {isInitialLoading ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-1">
                      sync
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Analyzing
                    </span>
                  </>
                ) : isOffline ? (
                  <>
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
                      cloud_off
                    </span>
                    <span className="text-[44px] font-extrabold text-slate-500 leading-none tracking-tight">
                      --%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400">
                      Station Offline
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[52px] font-extrabold text-[#0F172A] leading-none tracking-tight">
                      {riskPercent !== null ? riskPercent : '--'}
                      <span className="text-2xl font-bold text-slate-400">%</span>
                    </span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest mt-1"
                      style={{ color: riskColor }}
                    >
                      {riskLevel}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Context & CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 flex-1">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <span className="material-symbols-outlined text-lg" style={{ color: riskColor }}>
                  {isOffline ? 'cloud_off' : 'trending_up'}
                </span>
                <span>{trendText}</span>
              </div>
              <p className="text-[14px] leading-relaxed text-slate-600 font-normal">
                {aiSummaryText}
              </p>
              {isOffline ? (
                <button
                  onClick={() => loadDashboard(true)}
                  disabled={loading}
                  className="mt-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
                  <span>{loading ? 'Reconnecting...' : 'Retry Live Signal'}</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/risk-analysis')}
                  className="mt-2 bg-[#006194] text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer"
                >
                  <span>View Risk Analysis</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. WEATHER CARD - Live Metrics 2x2 */}
        <div className="md:col-span-4 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50/60 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="flex justify-between items-center mb-5 relative z-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isOffline ? 'Live Telemetry' : (data?.isFallback ? 'Estimated Telemetry' : 'Live Data')}
            </h2>
            {isOffline ? (
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-xs">signal_disconnected</span> Offline
              </span>
            ) : data?.isFallback ? (
              <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-xs">history</span> Offline Fallback
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-xs animate-spin">sync</span> Just updated
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 relative z-10">
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">water_drop</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Rainfall</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {weather.rainfall_1day !== null ? weather.rainfall_1day : '--'}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">mm</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">thermostat</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Temp</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {weather.temperature !== null ? Math.round(weather.temperature) : '--'}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">°C</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">
                humidity_percentage
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Humidity</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {weather.humidity !== null ? weather.humidity : '--'}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">%</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">air</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Wind</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {weather.wind_speed !== null ? Math.round(weather.wind_speed) : '--'}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">km/h</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2.5 EMERGENCY HELPLINES DIRECT CARD */}
        <div className={`md:col-span-12 rounded-2xl border p-5 md:p-6 shadow-sm transition-all ${
          isOffline
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-[#E2E8F0] text-slate-900'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isOffline ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <span className="material-symbols-outlined text-2xl">emergency</span>
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight uppercase flex items-center gap-2 ${
                  isOffline ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  24x7 Disaster Emergency Helplines
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isOffline ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
                  }`}>
                    Toll Free
                  </span>
                </h3>
                <p className={`text-xs mt-0.5 ${isOffline ? 'text-slate-300' : 'text-slate-500'}`}>
                  Direct lines to State & District Emergency Operations Centres during adverse weather
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href="tel:1070"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm filled">call</span>
                <span>1070 State Disaster</span>
              </a>
              <a
                href="tel:1077"
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm filled">call</span>
                <span>1077 District Control</span>
              </a>
              <a
                href="tel:112"
                className={`px-4 py-2.5 active:scale-95 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isOffline
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm filled">local_police</span>
                <span>112 Police / NDRF</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. FORECAST ROW (72-Hour Forecast) */}
        <div className="md:col-span-12">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              72-Hour Forecast
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isOffline ? 'Offline - Next Days' : 'Next Days Evaluation'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
            {forecastList.map((f, idx) => {
              const isOfflineDay = f.level === 'OFFLINE';
              const isHigh = f.level === 'HIGH';
              const isMod = f.level === 'MODERATE';
              const topColor = isOfflineDay ? '#94A3B8' : (isHigh ? '#EA580C' : isMod ? '#D97706' : '#10B981');
              const badgeClass = isOfflineDay
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : isHigh
                ? 'bg-orange-50 text-[#EA580C] border-orange-100'
                : isMod
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-green-50 text-green-700 border-green-100';

              return (
                <div
                  key={idx}
                  className="snap-start shrink-0 w-32 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-3.5 flex flex-col items-center gap-2 relative"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-90"
                    style={{ backgroundColor: topColor }}
                  />
                  <p className="text-xs font-semibold tracking-tight text-slate-800">{f.day_label}</p>
                  <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                    {f.probability !== '--' ? `${f.probability}%` : '--%'}
                  </span>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeClass}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topColor }} />
                    {f.level === 'MODERATE' ? 'Mod' : f.level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. DAM LEVELS NEARBY CARD */}
        <div
          onClick={() => navigate('/dams')}
          className="md:col-span-12 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-[#DC2626] animate-pulse'}`} />
              <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Dam Levels Nearby
              </h3>
            </div>
            <span className="material-symbols-outlined text-primary opacity-80 text-xl">waves</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <p className="text-[14px] leading-relaxed text-slate-700 font-normal">
              {damSummaryText}
            </p>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 shrink-0">
              View Dam Levels
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* 5. AI INSIGHT CARD */}
        <div className="md:col-span-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 flex items-start gap-4">
          <div className="bg-blue-50 text-blue-700 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold tracking-tight text-[#0F172A]">AI Insight</h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {isOffline ? 'Offline' : 'Predictive'}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-600 font-normal mb-2.5">
              {isOffline
                ? 'AI hydrological modeling is offline. Real-time soil saturation and catchment runoff computations will automatically resume when telemetry is restored.'
                : (data?.rainfall_risk?.ai_insight ||
                   `Atmospheric sensors in ${district} indicate current risk status is ${riskLevel}. Hydrologic balance and precipitation runoff are continuously tracked.`)}
            </p>
            {!isOffline && (
              <span
                onClick={() => navigate('/analytics')}
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 w-fit cursor-pointer"
              >
                Read full prediction report
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
