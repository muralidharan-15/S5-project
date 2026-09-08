import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../api/floodApi';

const Dams = ({ district = 'Virudhunagar', onSelectDistrict }) => {
  const [damDetails, setDamDetails] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchDashboardData(district);
        setIsOffline(res?.isOffline || false);
        if (res?.dam_details) {
          setDamDetails(res.dam_details);
        }
      } catch (err) {
        console.error('Failed to fetch dam details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [district]);

  const dams = damDetails?.dams || [
    {
      id: 'suruliyar',
      name: 'Suruliyar Dam',
      river: 'Suruliyar Reservoir',
      status: 'Danger',
      frl: 40.0,
      current_level: 39.8,
      storage_percent: 99,
      inflow: 2100,
      outflow: 1850,
      ai_note: 'Outflow has increased 18% in the last 24 hours due to heavy inflow from upstream catchment rainfall.',
      image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      trend: [80, 75, 70, 60, 45, 30, 22]
    },
    {
      id: 'vaigai',
      name: 'Vaigai Dam',
      river: 'Vaigai River',
      status: 'Warning',
      frl: 71.0,
      current_level: 68.2,
      storage_percent: 84,
      inflow: 1240,
      outflow: 800,
      ai_note: 'Controlled reservoir discharge active to preserve buffer margin ahead of overnight rain.',
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      trend: [40, 45, 52, 60, 68, 76, 84]
    },
    {
      id: 'manjalar',
      name: 'Manjalar Dam',
      river: 'Manjalar River',
      status: 'Safe',
      frl: 48.5,
      current_level: 42.1,
      storage_percent: 52,
      inflow: 310,
      outflow: 0,
      ai_note: 'Stable capacity with zero spillway spill observed in current monitoring window.',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      trend: [48, 49, 50, 50, 51, 52, 52]
    },
    {
      id: 'gundar',
      name: 'Gundar Reservoir',
      river: 'Gundar Basin',
      status: 'Safe',
      frl: 30.0,
      current_level: 21.4,
      storage_percent: 38,
      inflow: 150,
      outflow: 0,
      ai_note: 'Sufficient retention headroom remaining. Low downstream flood threat.',
      image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      trend: [32, 33, 34, 35, 36, 37, 38]
    }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md flex flex-col items-center pb-32 animate-fadeIn">
      <div className="w-full md:max-w-3xl flex flex-col gap-stack-lg">
        {/* Offline Safety Alert */}
        {isOffline && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 flex items-start gap-3.5 border border-slate-700 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <span className="material-symbols-outlined text-2xl">cloud_off</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Hydro-Basin Telemetry Disconnected
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950 text-red-300 border border-red-800">
                  Offline
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dam spillway discharge and live storage sensors are disconnected. Unverified flood discharges are withheld to avoid misinformation. Dial 1070 for emergency flood control.
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <section className="flex flex-col gap-2">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight">
            Dam Water Levels
          </h1>
          <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full shadow-xs">
            <span className="text-[13px] font-semibold text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              {district} District Hydro-Basin
            </span>
          </div>
        </section>

        {/* District Summary Card */}
        <section className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                Total Monitored
              </p>
              <div className="text-[28px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-none">
                {damDetails?.total_monitored || dams.length} Dams{' '}
                <span className="font-semibold text-slate-400 text-[20px]">Monitored</span>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              {isOffline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Offline
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 live-dot" />
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Live Data
                  </span>
                </div>
              )}
              <span className="text-[12px] text-slate-500 mt-1.5 font-medium">
                {isOffline ? 'Sensor stream offline' : `Updated ${damDetails?.last_updated || '6 mins ago'}`}
              </span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#E2E8F0] my-1" />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
              <span className="text-[13px] font-semibold text-slate-700">
                {damDetails?.danger_count || 1} Danger
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
              <span className="text-[13px] font-semibold text-slate-700">
                {damDetails?.warning_count || 1} Warning
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-safe inline-block" />
              <span className="text-[13px] font-semibold text-slate-700">
                {damDetails?.safe_count || 2} Safe
              </span>
            </div>
          </div>
        </section>

        {/* Dam List Cards */}
        <section className="flex flex-col gap-5">
          {dams.map((dam, index) => {
            const isDanger = dam.status === 'Danger';
            const isWarning = dam.status === 'Warning';
            const statusColor = isDanger ? '#DC2626' : isWarning ? '#EA580C' : '#10B981';

            return (
              <article
                key={dam.id}
                className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden flex flex-col"
              >
                {/* Visual Image Header (Only for Danger or first 2 dams to match Stitch aesthetic) */}
                {index === 0 && (
                  <div className="relative overflow-hidden h-44 w-full">
                    <img
                      src={dam.image_url}
                      alt={dam.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[12px] font-semibold border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot" />
                        {dam.river} — Live Feed
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-[11px] uppercase tracking-wider font-bold shadow-sm">
                        Critical Spillway
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[20px] font-bold text-[#0F172A] tracking-tight leading-tight">
                        {dam.name}
                      </h3>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">
                        FRL (Full Reservoir Level): {dam.frl}m
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                        isDanger
                          ? 'bg-red-50 text-red-700 border border-red-200 danger-pulse'
                          : isWarning
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isDanger || isWarning ? 'warning' : 'check_circle'}
                      </span>
                      <span>{dam.status}</span>
                    </div>
                  </div>

                  {/* Level & Storage Bar */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Current Level
                      </div>
                      <div className="text-[26px] font-bold tracking-tight" style={{ color: statusColor }}>
                        {dam.current_level}
                        <span className="text-[16px] font-medium ml-0.5 text-slate-500">m</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Storage Capacity
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[24px] font-bold tracking-tight" style={{ color: statusColor }}>
                          {dam.storage_percent}%
                        </span>
                        <div className="w-[70px] h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${dam.storage_percent}%`,
                              backgroundColor: statusColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inflow & Outflow pill */}
                  <div className="flex justify-between items-center text-[13px] text-slate-600 bg-[#F8FAFC] px-3.5 py-2.5 rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">arrow_downward</span>
                      <span className="text-slate-500">Inflow:</span>
                      <span className="text-[#0F172A] font-semibold ml-0.5">{dam.inflow} cusecs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">arrow_upward</span>
                      <span className="text-slate-500">Outflow:</span>
                      <span className="text-[#0F172A] font-semibold ml-0.5">{dam.outflow} cusecs</span>
                    </div>
                  </div>
                </div>

                {/* AI Note & 7-Day Trend Footer */}
                {dam.ai_note && (
                  <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 bg-blue-50/80 p-3 rounded-xl border border-blue-100/80">
                      <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
                        smart_toy
                      </span>
                      <p className="text-[13px] leading-snug font-medium text-slate-700">
                        <strong className="text-primary font-semibold">AI Hydro Note: </strong>
                        {dam.ai_note}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          7-Day Discharge & Fill Trend
                        </h4>
                        <span className="text-[11px] font-semibold text-[#DC2626]">Spillway Level</span>
                      </div>
                      <div className="h-16 w-full relative">
                        <svg className="overflow-visible w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#DC2626" strokeWidth="1" strokeDasharray="4" />
                          <path
                            d="M0,80 L16,75 L33,70 L50,60 L66,45 L83,30 L100,22"
                            fill="none"
                            stroke={statusColor}
                            strokeWidth="2.5"
                          />
                          <path
                            d="M0,100 L0,80 L16,75 L33,70 L50,60 L66,45 L83,30 L100,22 L100,100 Z"
                            fill={isDanger ? 'rgba(220, 38, 38, 0.08)' : 'rgba(0, 97, 148, 0.08)'}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Dams;
