import React from 'react';
import { Thermometer, Droplets, CloudRain, ShieldCheck } from 'lucide-react';
import RiskBadge from './RiskBadge';

const MetricCard = ({ weather, rainfallRisk, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 glass-card rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
            <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const temp = weather?.temperature !== undefined ? `${weather.temperature}°C` : '28°C';
  const humidity = weather?.humidity !== undefined ? `${weather.humidity}%` : '75%';
  const rain = weather?.rainfall !== undefined ? `${weather.rainfall} mm` : '0 mm';

  const riskLevel = rainfallRisk?.level || 'LOW';
  const riskProb = rainfallRisk?.probability || 15.0;

  const metrics = [
    {
      title: 'Current Temperature',
      value: temp,
      subtitle: 'Real-time observation',
      icon: <Thermometer className="w-5 h-5 text-amber-500" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
    },
    {
      title: 'Relative Humidity',
      value: humidity,
      subtitle: 'Atmospheric moisture',
      icon: <Droplets className="w-5 h-5 text-sky-500" />,
      bgIcon: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500'
    },
    {
      title: '24h Precipitation',
      value: rain,
      subtitle: '1-Day rain volume',
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      bgIcon: 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
    },
    {
      title: 'Flood Threat Status',
      value: <RiskBadge level={riskLevel} confidence={riskProb} size="md" />,
      isBadge: true,
      subtitle: rainfallRisk?.message || 'Normal conditions',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => (
        <div
          key={idx}
          className="p-5 glass-card rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {item.title}
            </span>
            <div className={`p-2 rounded-lg ${item.bgIcon}`}>
              {item.icon}
            </div>
          </div>

          <div className="mt-3">
            {item.isBadge ? (
              <div className="my-1">{item.value}</div>
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {item.value}
              </span>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {item.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCard;
