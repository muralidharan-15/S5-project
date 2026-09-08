import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../api/floodApi';

const FloodAlert = ({ district = 'Virudhunagar' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchDashboardData(district);
        setData(res);
      } catch (err) {
        console.error('Failed to load alert data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [district]);

  const isOffline = data?.isOffline || false;
  const riskPercent = (!isOffline && data?.rainfall_risk?.probability !== undefined)
    ? Math.round(data.rainfall_risk.probability)
    : (!isOffline && data?.rainfall_risk?.raw_risk_percentage !== undefined)
    ? Math.round(data.rainfall_risk.raw_risk_percentage)
    : null;

  const riskLevel = isOffline
    ? 'OFFLINE'
    : (data?.rainfall_risk?.level || data?.rainfall_risk?.flood_risk_level || (riskPercent !== null ? (riskPercent >= 70 ? 'HIGH' : riskPercent >= 40 ? 'MODERATE' : 'LOW') : 'LOW'));

  const isCritical = !isOffline && (riskLevel === 'HIGH' || (riskPercent !== null && riskPercent >= 70));

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-32 animate-fadeIn">
      {/* 1. Top Alert Urgent Band */}
      <div className={`w-full py-2.5 px-4 flex items-center justify-center shadow-md ${
        isOffline
          ? 'bg-slate-900 text-slate-200'
          : isCritical
          ? 'bg-[#DC2626] text-white animate-pulse'
          : 'bg-amber-600 text-white'
      }`}>
        <span className="material-symbols-outlined mr-2 text-xl">
          {isOffline ? 'cloud_off' : isCritical ? 'warning' : 'info'}
        </span>
        <span className="text-xs font-black tracking-widest uppercase">
          {isOffline
            ? 'OFFLINE SAFETY MODE — LIVE SENSOR STREAM DISCONNECTED'
            : isCritical
            ? '🚨 FLOOD ALERT — ELEVATED RISK MONITORED'
            : 'ADVISORY — PREPAREDNESS & MONITORING'}
        </span>
      </div>

      <main className="flex-grow flex flex-col px-container-padding-mobile md:px-container-padding-desktop py-stack-lg max-w-[1440px] mx-auto w-full md:max-w-3xl">
        {/* Navigation & Back */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Center</span>
          <div className="w-9" />
        </div>

        {/* Urgent Info Block */}
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className={`text-[32px] md:text-[44px] font-black leading-tight tracking-tight mb-2 ${
            isOffline ? 'text-slate-800' : isCritical ? 'text-[#DC2626]' : 'text-[#0F172A]'
          }`}>
            {isOffline
              ? 'EMERGENCY SAFETY & HELPLINES'
              : isCritical
              ? 'CRITICAL FLOOD RISK'
              : 'FLOOD READINESS & SAFETY'}
          </h1>
          <div className="flex items-center space-x-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            <span className="text-sm font-bold text-slate-900">{district} District, Tamil Nadu</span>
          </div>
        </div>

        {/* Metric & Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Probability Card */}
          <div className={`p-6 rounded-card shadow-card flex flex-col items-center justify-center relative overflow-hidden group border-2 ${
            isOffline
              ? 'bg-slate-50 border-slate-300'
              : isCritical
              ? 'bg-white border-[#DC2626]'
              : 'bg-white border-blue-200'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Live Threat Evaluation
            </span>
            <div className={`text-[52px] font-black leading-none flex items-baseline ${
              isOffline ? 'text-slate-500' : isCritical ? 'text-[#DC2626]' : 'text-primary'
            }`}>
              {isOffline ? '--' : (riskPercent !== null ? riskPercent : '--')}
              <span className="text-2xl font-bold ml-0.5">%</span>
            </div>
            <span className={`mt-2 text-xs font-bold flex items-center ${
              isOffline ? 'text-slate-500' : isCritical ? 'text-[#DC2626]' : 'text-slate-700'
            }`}>
              <span className="material-symbols-outlined mr-1 text-sm">
                {isOffline ? 'signal_disconnected' : isCritical ? 'trending_up' : 'check_circle'}
              </span>
              {isOffline ? 'Station Offline (Zero Dummy Mode)' : `${riskLevel} Threat Status`}
            </span>
          </div>

          {/* Context Card */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-card shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isOffline ? 'bg-slate-400' : isCritical ? 'bg-[#DC2626] animate-ping' : 'bg-emerald-500'
                }`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  isOffline ? 'text-slate-600' : isCritical ? 'text-[#DC2626]' : 'text-emerald-700'
                }`}>
                  {isOffline ? 'Station Telemetry Status' : 'Official Advisory'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {isOffline
                  ? 'Active connection to meteorological stream is disconnected. Simulated estimations are disabled to guarantee zero misinformation. For immediate emergency support, use direct toll-free numbers below.'
                  : (data?.rainfall_risk?.advisory ||
                     data?.rainfall_risk?.ai_summary ||
                     `Hydro-meteorological telemetry across ${district} is monitored. Keep communication channels open.`)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Response Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isOffline
                  ? 'bg-slate-200 text-slate-700'
                  : isCritical
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isOffline ? 'Telemetry Standby' : isCritical ? 'Level 3 Alert' : 'Monitored Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Evacuation / Preparedness Checklist */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#0F172A] mb-3 flex items-center">
            <span className="material-symbols-outlined mr-2 text-primary">task_alt</span>
            Essential Safety Actions
          </h2>

          <div className="bg-white border border-[#E2E8F0] rounded-card shadow-card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              <li className="p-4 flex items-start bg-red-50/40">
                <span className="material-symbols-outlined text-[#DC2626] mr-3 mt-0.5 text-xl">
                  directions_run
                </span>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">Move to Higher Ground</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    If low-lying or near riverbanks during heavy downpours, move immediately to elevated community shelters.
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
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">Charge Devices & Store Emergency Drinking Water</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Keep mobile phones and emergency flashlights charged in case of precautionary power grid shutdowns.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Hotline Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:1070"
            className="py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm filled">call</span>
            <span>1070 State Disaster</span>
          </a>
          <a
            href="tel:1077"
            className="py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm filled">call</span>
            <span>1077 District Control</span>
          </a>
          <a
            href="tel:112"
            className="py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm filled">local_police</span>
            <span>112 Police / NDRF</span>
          </a>
        </div>
      </main>
    </div>
  );
};

export default FloodAlert;
