import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloodAlert = ({ district = 'Virudhunagar' }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-32 animate-fadeIn">
      {/* 1. Top Alert Urgent Band */}
      <div className="bg-[#DC2626] text-white w-full py-2.5 px-4 flex items-center justify-center animate-pulse shadow-md">
        <span className="material-symbols-outlined mr-2 text-xl">warning</span>
        <span className="text-xs font-black tracking-widest uppercase">
          🚨 FLOOD ALERT — CRITICAL RISK DETECTED
        </span>
      </div>

      <main className="flex-grow flex flex-col px-container-padding-mobile md:px-container-padding-desktop py-stack-lg max-w-[1440px] mx-auto w-full md:max-w-3xl">
        {/* Urgent Info Block */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-[36px] md:text-[48px] font-black text-[#DC2626] leading-tight tracking-tight mb-3">
            CRITICAL FLOOD RISK<br />DETECTED
          </h1>
          <div className="flex items-center space-x-2 bg-red-50 px-4 py-1.5 rounded-full border border-red-200">
            <span className="material-symbols-outlined text-[#DC2626] text-sm">location_on</span>
            <span className="text-sm font-bold text-slate-900">{district} District</span>
          </div>
        </div>

        {/* Metric & Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Probability Card */}
          <div className="bg-white border-2 border-[#DC2626] p-6 rounded-card shadow-card flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500 opacity-5 pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Flood Probability
            </span>
            <div className="text-[58px] font-black text-[#DC2626] leading-none flex items-baseline">
              86<span className="text-3xl font-bold ml-0.5">%</span>
            </div>
            <span className="text-[#DC2626] mt-2 text-xs font-bold flex items-center">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span> Risk Increasing Rapidly
            </span>
          </div>

          {/* Context Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-card shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                  Immediate Flood Threat
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Continuous heavy downpour in catchment hills has pushed local river systems beyond safe containment. Spillway overflow active upstream.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Response Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                Level 3 Red Alert
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Evacuation Checklist */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#0F172A] mb-3 flex items-center">
            <span className="material-symbols-outlined mr-2 text-primary">task_alt</span>
            Recommended Safety Actions
          </h2>

          <div className="bg-white border border-[#E2E8F0] rounded-card shadow-card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              <li className="p-4 flex items-start bg-red-50/50">
                <span className="material-symbols-outlined text-[#DC2626] mr-3 mt-0.5 text-xl">
                  directions_run
                </span>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">Move to Higher Ground</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Evacuate low-lying riverside areas immediately. Do not delay evacuation.
                  </p>
                </div>
              </li>

              <li className="p-4 flex items-start">
                <span className="material-symbols-outlined text-primary mr-3 mt-0.5 text-xl">
                  no_crash
                </span>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">Avoid Flooded Roads</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Turn around, don't drown. Just 6 inches of fast-moving water can knock an adult down.
                  </p>
                </div>
              </li>

              <li className="p-4 flex items-start">
                <span className="material-symbols-outlined text-primary mr-3 mt-0.5 text-xl">
                  battery_charging_full
                </span>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">Charge Devices & Store Water</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Keep mobile phones and power banks fully charged in preparation for localized grid shutdowns.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Hotline Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:108"
            className="flex-1 py-3.5 bg-[#DC2626] hover:bg-red-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm filled">call</span>
            <span>Dial 108 Emergency Ambulance</span>
          </a>
          <a
            href="tel:1070"
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm filled">emergency</span>
            <span>Dial 1070 State Control</span>
          </a>
        </div>
      </main>
    </div>
  );
};

export default FloodAlert;
