import React from 'react';
import { Cpu, Info, AlertCircle } from 'lucide-react';

const XaiPanel = ({ explainability, loading }) => {
  if (loading) {
    return (
      <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!explainability || !explainability.all_drivers) {
    return (
      <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="text-sm text-slate-500">Explainable AI details unavailable for current district dataset.</p>
      </div>
    );
  }

  const drivers = explainability.all_drivers.slice(0, 6); // Top 6 drivers for clean visual
  const summaryBanner = explainability.summary_banner;

  return (
    <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-500" />
            Explainable AI (XAI) SHAP Feature Decomposition
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Machine Learning decision drivers & impact percentages
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-400/20 rounded-md">
          SHAP Explicit
        </span>
      </div>

      {/* Horizontal Bar Breakdown */}
      <div className="space-y-3 mb-5">
        {drivers.map((driver, idx) => {
          const isHighImpact = driver.impact_percent > 15;
          const isPositiveRisk = driver.direction === 'positive';
          const barColor = isPositiveRisk ? 'bg-red-500' : 'bg-emerald-500';

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  {driver.display_name}
                  <span className="text-slate-400 font-normal">({driver.raw_display})</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {driver.pct_display}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(4, driver.impact_percent)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Plain Language Summary */}
      <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed font-medium">
          {summaryBanner}
        </div>
      </div>
    </div>
  );
};

export default XaiPanel;
