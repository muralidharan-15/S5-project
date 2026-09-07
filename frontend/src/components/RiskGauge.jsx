import React from 'react';
import RiskBadge from './RiskBadge';

const RiskGauge = ({ percentage = 45, level = 'Moderate', trend = '+2% vs 3h ago', size = 'lg' }) => {
  const normalizedValue = Math.min(Math.max(percentage, 0), 100);
  
  // Severity color mapping
  const getColor = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case 'low':
      case 'safe':
        return { stroke: '#16A34A', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' };
      case 'moderate':
      case 'warning':
        return { stroke: '#D97706', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' };
      case 'high':
        return { stroke: '#EA580C', bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' };
      case 'critical':
      case 'danger':
        return { stroke: '#DC2626', bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' };
      default:
        return { stroke: '#0EA5E9', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' };
    }
  };

  const { stroke, bg } = getColor(level);

  // SVG parameters
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-200 dark:text-slate-800"
          />
          {/* Progress Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {normalizedValue}%
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest -mt-1">
            Flood Risk
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center space-y-1">
        <RiskBadge level={level} size="md" />
        {trend && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default RiskGauge;
