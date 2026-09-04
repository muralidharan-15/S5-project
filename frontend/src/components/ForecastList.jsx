import React from 'react';
import { Calendar, CloudRain, AlertTriangle } from 'lucide-react';
import RiskBadge from './RiskBadge';

const ForecastList = ({ forecastList, peakRisk, loading }) => {
  if (loading) {
    return (
      <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            7-Day Daily AI Flood Risk Forecast
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Day 1 to Day 7 predictive risk classification & expected rainfall
          </p>
        </div>

        {peakRisk && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Peak Risk: <strong>{peakRisk.peak_day_label}</strong> ({peakRisk.level})</span>
          </div>
        )}
      </div>

      {/* 7-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecastList && forecastList.length > 0 ? (
          forecastList.map((day, idx) => {
            const isHigh = day.level === 'HIGH';
            const isMod = day.level === 'MODERATE';

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between text-center ${
                  isHigh
                    ? 'bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/60 shadow-sm'
                    : isMod
                    ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                    : 'bg-slate-50/80 border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/60'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {day.day_label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2">
                    {day.date}
                  </span>

                  <div className="my-2 flex flex-col items-center justify-center">
                    <CloudRain className={`w-6 h-6 mb-1 ${isHigh ? 'text-red-500' : isMod ? 'text-amber-500' : 'text-sky-500'}`} />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {day.rainfall} <span className="text-xs font-normal text-slate-500">mm</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center gap-1">
                  <RiskBadge level={day.level} confidence={day.probability} size="sm" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-6 text-slate-400 text-sm">
            Forecast data unavailable.
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastList;
