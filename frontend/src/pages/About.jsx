import React from 'react';
import { Cpu, Layers, Database, Globe, CloudRain, Server, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const About = () => {
  const features = [
    { name: '1-Day Rainfall Volume', type: 'Meteorological', desc: 'Real-time 24-hour satellite precipitation sum' },
    { name: '3-Day Cumulative Rain', type: 'Meteorological', desc: 'Short-term soil saturation buildup factor' },
    { name: '7-Day Cumulative Rain', type: 'Meteorological', desc: 'Prolonged rainfall accumulation tracking' },
    { name: '7-Day Daily Rain Average', type: 'Meteorological', desc: 'Baseline precipitation intensity rate' },
    { name: 'Drainage Quality Index', type: 'Infrastructure', desc: 'Urban concrete runoff & stormwater bottlenecks' },
    { name: 'Urbanization Level', type: 'Infrastructure', desc: 'Impermeable surface area density' },
    { name: 'Deforestation Index', type: 'Environmental', desc: 'Regional natural soil water retention capacity' },
    { name: 'Coastal Vulnerability', type: 'Environmental', desc: 'Elevation, sea surge, and tidal proximity' },
    { name: 'Dam Storage & Quality', type: 'Infrastructure', desc: 'Reservoir fill percentage and release rates' }
  ];

  const dataSources = [
    { name: 'Open-Meteo Weather API', desc: 'Hourly & 7-day daily satellite precipitation telemetry' },
    { name: 'Open-Meteo Marine API', desc: 'Coastal wave height, sea surface temp, and surge metrics' },
    { name: 'Open-Meteo Flood API', desc: 'Global river discharge & hydro-geological streamflow data' },
    { name: 'OSM Nominatim', desc: 'Geospatial boundary indexing for 38 Tamil Nadu districts' },
    { name: 'NASA POWER', desc: 'Solar radiation, surface humidity, and climatological baselines' }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/30 rounded-full text-xs font-bold text-sky-600 dark:text-sky-400">
            <ShieldAlert className="w-4 h-4" />
            State-Level Disaster Response AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Tamil Nadu AI Flood Alert & Risk Prediction System
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Engineered as an enterprise disaster-management platform for the state of Tamil Nadu. The system combines real-time satellite meteorology, hydro-reservoir dynamics, and Explainable AI (SHAP) to forecast flood threats up to 7 days in advance across all 38 districts.
          </p>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-500" />
            Machine Learning Methodology & 9-Feature Model Schema
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Random Forest Classifier trained with Synthetic Minority Over-sampling Technique (SMOTE) to eliminate historical flood class imbalance.
          </p>
        </div>

        {/* 9-Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/20">
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Flow */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-sky-500" />
          Enterprise System Architecture Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
            <Globe className="w-8 h-8 text-sky-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Telemetry Ingestion</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Open-Meteo satellite feed & dam storage gauges</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
            <Server className="w-8 h-8 text-sky-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. FastAPI Backend</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">REST API controllers, scaling, and caching daemon</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
            <Cpu className="w-8 h-8 text-sky-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. ML & SHAP Engine</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Random Forest evaluation & SHAP feature decomposition</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
            <Layers className="w-8 h-8 text-sky-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">4. React SPA UI</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Vite React frontend with Leaflet geospatial maps</p>
          </div>
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-sky-500" />
          Authoritative Telemetry Data Sources
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((ds, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ds.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ds.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
