import React from 'react';
import { Database, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const DamDetails = ({ damDetails, loading }) => {
  if (loading) {
    return (
      <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback dam metrics if API details missing
  const defaultDams = [
    {
      name: 'Mettur Dam (Stanley Reservoir)',
      district: 'Salem',
      capacity_mcft: 93470,
      current_storage_mcft: 68420,
      percentage: 73.2,
      inflow_cusecs: 14200,
      outflow_cusecs: 8500,
      trend: 'rising'
    },
    {
      name: 'Vaigai Reservoir',
      district: 'Theni / Madurai',
      capacity_mcft: 6091,
      current_storage_mcft: 4520,
      percentage: 74.2,
      inflow_cusecs: 2150,
      outflow_cusecs: 1800,
      trend: 'stable'
    },
    {
      name: 'Poondi Reservoir',
      district: 'Tiruvallur / Chennai',
      capacity_mcft: 3231,
      current_storage_mcft: 2680,
      percentage: 82.9,
      inflow_cusecs: 1100,
      outflow_cusecs: 450,
      trend: 'rising'
    }
  ];

  const dams = damDetails && damDetails.length > 0 ? damDetails : defaultDams;

  return (
    <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" />
            Key Hydro-Reservoir & Dam Storage Levels
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live storage percentage, inflow, outflow rates, and river release dynamics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dams.map((dam, idx) => {
          const pct = Math.min(100, Math.max(0, dam.percentage || 70));
          const isHighStorage = pct >= 80;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex items-center justify-between shadow-sm hover:border-sky-500/40 transition-colors"
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {dam.name}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Inflow: <strong>{dam.inflow_cusecs.toLocaleString()}</strong> cusecs</span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Outflow: <strong>{dam.outflow_cusecs.toLocaleString()}</strong> cusecs</span>
                </div>

                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{dam.current_storage_mcft?.toLocaleString()} / {dam.capacity_mcft?.toLocaleString()} mcft</span>
                </div>
              </div>

              {/* Circular Storage Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isHighStorage ? 'text-amber-500' : 'text-sky-500'}
                    strokeDasharray={`${pct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DamDetails;
