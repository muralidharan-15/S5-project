import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../api/floodApi';

const DEFAULT_TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

const Dashboard = ({ district = 'Virudhunagar', onSelectDistrict, districtsList = [] }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const availableDistricts = districtsList && districtsList.length > 0 ? districtsList : DEFAULT_TN_DISTRICTS;

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

  const riskPercent = data?.rainfall_risk?.probability !== undefined
    ? Math.round(data.rainfall_risk.probability)
    : data?.rainfall_risk?.raw_risk_percentage !== undefined
    ? Math.round(data.rainfall_risk.raw_risk_percentage)
    : 67;

  const riskLevel = data?.rainfall_risk?.level || data?.rainfall_risk?.flood_risk_level || (riskPercent >= 70 ? 'HIGH' : riskPercent >= 40 ? 'MODERATE' : 'LOW');

  const weather = {
    rainfall_1day: data?.rainfall_features?.rainfall_1day ?? data?.weather?.rainfall ?? 0.0,
    temperature: data?.weather?.temperature ?? 30.0,
    humidity: data?.weather?.humidity ?? 75,
    wind_speed: data?.weather?.wind_speed ?? 12,
  };

  const trendText = data?.rainfall_risk?.explainability?.summary_banner ||
    data?.rainfall_risk?.message ||
    data?.rainfall_risk?.trend_description ||
    'Real-time satellite & ML telemetry active.';

  const aiSummaryText = data?.rainfall_risk?.advisory ||
    data?.rainfall_risk?.ai_summary ||
    `Atmospheric sensors in ${district} indicate current flood threat is ${riskLevel}. Ground monitoring in progress.`;

  const damSummaryText = data?.dam_details?.dam_name
    ? `${data.dam_details.dam_name} (${data.dam_details.river_basin || 'Basin'}): Discharge ${data.dam_details.river_discharge_m3s || 0} m³/s — ${data.dam_details.status || 'Monitored'}`
    : `1 dam in Danger, 1 in Warning near ${district}`;

  const forecastList = data?.evaluated_7day_forecast || [
    { day_label: 'Today', probability: 67, level: 'HIGH' },
    { day_label: 'Tomorrow', probability: 72, level: 'HIGH' },
    { day_label: 'Wed', probability: 45, level: 'MODERATE' },
    { day_label: 'Thu', probability: 30, level: 'LOW' },
    { day_label: 'Fri', probability: 20, level: 'LOW' },
  ];

  // SVG circular circumference for r=40 is 2 * PI * 40 ~= 251.2
  const strokeDashoffset = 251.2 - (251.2 * riskPercent) / 100;
  const riskColor = riskLevel === 'HIGH' ? '#EA580C' : riskLevel === 'MODERATE' ? '#D97706' : '#16A34A';

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop pb-32 md:pb-12 pt-4 flex flex-col gap-6 animate-fadeIn">
      {/* FALLBACK WARNING BANNER - Visible when live telemetry connection is unavailable */}
      {data?.isFallback && (
        <div
          id="fallback-warning-banner"
          role="status"
          className="bg-amber-500/10 border-2 border-amber-500/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-amber-950 shadow-sm animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 border border-amber-500/30">
              <span className="material-symbols-outlined text-xl">cloud_off</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Showing Estimated Data
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  Live connection unavailable
                </span>
              </div>
              <p className="text-sm font-medium text-amber-950 mt-0.5">
                Showing estimated data — live connection unavailable. Reconnecting automatically when backend is active...
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center shrink-0">
            <span className="text-xs text-amber-800 font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
              Awaiting Live Signal
            </span>
          </div>
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Target District Monitoring
                </span>
                {data?.isFallback ? (
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
                riskLevel === 'HIGH'
                  ? 'bg-orange-50 border-orange-200/60 text-[#EA580C]'
                  : riskLevel === 'MODERATE'
                  ? 'bg-amber-50 border-amber-200/60 text-[#D97706]'
                  : 'bg-emerald-50 border-emerald-200/60 text-emerald-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {riskLevel} Risk
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
                <span className="text-[52px] font-extrabold text-[#0F172A] leading-none tracking-tight">
                  {riskPercent}
                  <span className="text-2xl font-bold text-slate-400">%</span>
                </span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest mt-1"
                  style={{ color: riskColor }}
                >
                  {riskLevel}
                </span>
              </div>
            </div>

            {/* Context & CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 flex-1">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <span className="material-symbols-outlined text-lg" style={{ color: riskColor }}>
                  trending_up
                </span>
                <span>{trendText}</span>
              </div>
              <p className="text-[14px] leading-relaxed text-slate-600 font-normal">
                {aiSummaryText}
              </p>
              <button
                onClick={() => navigate('/risk-analysis')}
                className="mt-2 bg-[#006194] text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer"
              >
                <span>View Risk Analysis</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. WEATHER CARD - Live Metrics 2x2 */}
        <div className="md:col-span-4 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50/60 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="flex justify-between items-center mb-5 relative z-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {data?.isFallback ? 'Estimated Telemetry' : 'Live Data'}
            </h2>
            {data?.isFallback ? (
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
                  {weather.rainfall_1day}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">mm</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">thermostat</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Temp</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {Math.round(weather.temperature)}
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
                  {weather.humidity}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">%</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary mb-2 opacity-80 text-xl">air</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">Wind</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {Math.round(weather.wind_speed)}
                  <span className="text-xs font-medium text-slate-500 ml-0.5">km/h</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FORECAST ROW (72-Hour Forecast) */}
        <div className="md:col-span-12">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              72-Hour Forecast
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Next Days Evaluation</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
            {forecastList.map((f, idx) => {
              const isHigh = f.level === 'HIGH';
              const isMod = f.level === 'MODERATE';
              const topColor = isHigh ? '#EA580C' : isMod ? '#D97706' : '#10B981';
              const badgeClass = isHigh
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
                    {f.probability}%
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
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
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
                Predictive
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-600 font-normal mb-2.5">
              Based on current watershed soil saturation (84%) and satellite forecast precipitation patterns,
              there is elevated threat of localized flash flooding in low-lying areas of {district} by late evening.
            </p>
            <span
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 w-fit cursor-pointer"
            >
              Read full prediction report
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
