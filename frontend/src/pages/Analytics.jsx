import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Analytics = ({ district = 'Virudhunagar' }) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7D');

  const rainfallBars = [
    { day: 'Mon', mm: 12, height: '40%' },
    { day: 'Tue', mm: 24, height: '65%' },
    { day: 'Wed', mm: 8, height: '30%' },
    { day: 'Thu', mm: 32, height: '85%' },
    { day: 'Fri', mm: 18, height: '50%' },
    { day: 'Sat', mm: 22, height: '60%' },
    { day: 'Sun', mm: 15, height: '45%' }
  ];

  const envFactors = [
    { name: 'Watershed Soil Saturation', value: '88%', status: 'Critical', color: '#DC2626' },
    { name: 'Topographical Elevation Index', value: '112m', status: 'Moderate', color: '#D97706' },
    { name: 'Catchment Inflow Volume', value: '3,850 cusecs', status: 'High', color: '#DC2626' },
    { name: 'Drainage Network Permeability', value: '42%', status: 'Warning', color: '#EA580C' }
  ];

  const shapFeatures = [
    { feature: 'Cumulative 7-Day Rainfall', weight: '+0.42', desc: 'Dominant risk driver based on Random Forest model' },
    { feature: 'Peak 24h Inflow Rate', weight: '+0.28', desc: 'Sharp spike in upstream gauge telemetry' },
    { feature: 'Reservoir Spillway Headroom', weight: '+0.19', desc: 'Storage capacity above 90% in district dams' },
    { feature: 'Soil Permeability Deficit', weight: '+0.11', desc: 'Ground saturation limiting absorption' }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md flex flex-col items-center pb-32 animate-fadeIn">
      <div className="w-full md:max-w-3xl flex flex-col gap-stack-md">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-primary">Flood Hydro-Analytics</h1>
            <p className="text-xs text-slate-500">Machine Learning & Telemetry Insights</p>
          </div>
          <div className="w-9" />
        </div>

        {/* 1. Risk History Chart Section */}
        <section className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[#0F172A]">Historical Risk Evolution</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['7D', '30D', '3M', '1Y'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    timeRange === t ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full h-56 bg-slate-50 rounded-xl overflow-hidden flex items-end justify-between px-4 pt-4 border border-slate-200">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006194" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#006194" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,100 L 0,65 Q 25,55 50,35 T 100,20 L 100,100 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M 0,65 Q 25,55 50,35 T 100,20"
                fill="none"
                stroke="#006194"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Y-axis Labels */}
            <div className="absolute left-2.5 top-3 bottom-6 flex flex-col justify-between text-[10px] font-bold text-slate-400">
              <span>High</span>
              <span>Med</span>
              <span>Low</span>
            </div>

            {/* X-axis Labels */}
            <div className="absolute bottom-2 left-12 right-4 flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </section>

        {/* 2. Bento Grid: Rainfall Trends & Environmental Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rainfall Trends Bar Chart */}
          <section className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Precipitation Trends</h3>
            <div className="w-full h-44 flex items-end justify-between gap-2 px-2 relative border-b border-slate-100 pb-2">
              {rainfallBars.map((b) => (
                <div key={b.day} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {b.mm}mm
                  </span>
                  <div
                    className="w-full max-w-[28px] bg-primary/70 group-hover:bg-primary rounded-t-md transition-all duration-300"
                    style={{ height: b.height }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">{b.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Environmental Risk Factors */}
          <section className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0F172A]">Catchment Telemetry</h3>
            <div className="flex flex-col gap-2.5">
              {envFactors.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{f.name}</p>
                    <span className="text-[10px] font-semibold" style={{ color: f.color }}>
                      {f.status} Risk Factor
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{f.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. SHAP Feature Explainability Section */}
        <section className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">psychology</span>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Explainable AI (SHAP) Model Attribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Quantifying each factor's mathematical contribution to {district}'s flood probability.
          </p>

          <div className="flex flex-col gap-2.5 mt-1">
            {shapFeatures.map((feat) => (
              <div
                key={feat.feature}
                className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{feat.feature}</h4>
                  <p className="text-[11px] text-slate-500">{feat.desc}</p>
                </div>
                <span className="text-xs font-bold text-primary font-mono px-2 py-1 bg-white rounded-lg border border-slate-200">
                  {feat.weight}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
