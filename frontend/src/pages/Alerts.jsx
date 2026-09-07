import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Alerts = ({ district = 'Virudhunagar' }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  const alerts = [
    {
      id: 1,
      type: 'CRITICAL',
      title: 'Suruliyar Dam at 99% Capacity. Emergency Spillway Discharge Initiated.',
      location: `${district} • Arjuna River Basin`,
      time: '12 mins ago',
      desc: 'Controlled emergency discharge of 1,850 cusecs active. Citizens within 500m of riverbanks are advised to evacuate to designated elevated community shelters immediately.',
      icon: 'warning',
      color: '#DC2626',
      bgColor: 'bg-red-500',
    },
    {
      id: 2,
      type: 'CRITICAL',
      title: 'Severe Flash Flood Threat in Low-Lying Urban Sectors',
      location: `${district} • Urban Ward 4 & 7`,
      time: '34 mins ago',
      desc: 'Waterlogging over 1.2 feet recorded on major arterial roads. Emergency rescue boats deployed on standby.',
      icon: 'emergency',
      color: '#DC2626',
      bgColor: 'bg-red-500',
    },
    {
      id: 3,
      type: 'WARNING',
      title: 'Vaigai Reservoir Approaching Warning Threshold (84%)',
      location: 'Theni / Madurai Catchment Basin',
      time: '1 hour ago',
      desc: 'Continuous inflow from Western Ghats. Inflow monitored by hydrological sensors. Stage 1 advisory issued.',
      icon: 'waves',
      color: '#EA580C',
      bgColor: 'bg-orange-500',
    },
    {
      id: 4,
      type: 'ADVISORY',
      title: 'Risk Decreased in Elevated High-Slope Sectors',
      location: `${district} • Northern Sub-Basin`,
      time: '3 hours ago',
      desc: 'Runoff receding as localized rainfall pauses. Road clearing operations underway.',
      icon: 'check_circle',
      color: '#10B981',
      bgColor: 'bg-emerald-500',
    }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.type === filter;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md flex flex-col items-center pb-32 animate-fadeIn">
      <div className="w-full md:max-w-2xl flex flex-col gap-stack-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#0F172A] tracking-tight leading-tight">
              Alerts Center
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Live Emergency Bulletins for {district}
            </p>
          </div>

          <button
            onClick={() => navigate('/flood-alert')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">emergency</span>
            <span>SOS</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: 'ALL', label: 'All (4)' },
            { key: 'CRITICAL', label: 'Critical (2)' },
            { key: 'WARNING', label: 'Warnings (1)' },
            { key: 'ADVISORY', label: 'Advisories (1)' },
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                filter === chip.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="flex flex-col gap-4">
          {filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden flex flex-col relative group transition-all hover:border-slate-300"
            >
              {/* Left Color Indicator Stripe */}
              <div
                className="absolute top-0 bottom-0 left-0 w-2"
                style={{ backgroundColor: alert.color }}
              />

              <div className="p-5 pl-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ color: alert.color }}
                    >
                      {alert.icon}
                    </span>
                    <span
                      className="text-[11px] font-black uppercase tracking-wider"
                      style={{ color: alert.color }}
                    >
                      {alert.type} ALERT
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{alert.time}</span>
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A] leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    {alert.location}
                  </p>
                </div>

                <p className="text-[13px] leading-relaxed text-slate-600 font-normal">
                  {alert.desc}
                </p>

                {alert.type === 'CRITICAL' && (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => navigate('/flood-alert')}
                      className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">directions_run</span>
                      <span>Evacuation Route</span>
                    </button>
                    <button
                      onClick={() => navigate('/sos')}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Emergency Contacts
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
