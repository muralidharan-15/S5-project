import React from 'react';

const RiskBadge = ({ level = 'LOW', confidence = null, size = 'md' }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  let colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let dotColor = 'bg-emerald-500';

  if (normalizedLevel === 'MODERATE') {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    dotColor = 'bg-amber-500';
  } else if (normalizedLevel === 'HIGH') {
    colorClasses = 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
    dotColor = 'bg-red-600';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-semibold' 
    : size === 'lg' 
    ? 'px-4 py-1.5 text-base font-bold' 
    : 'px-3 py-1 text-sm font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} ${normalizedLevel === 'HIGH' ? 'animate-ping' : ''}`}></span>
      <span>{normalizedLevel} RISK</span>
      {confidence !== null && confidence !== undefined && (
        <span className="text-xs opacity-80 font-normal">({confidence}%)</span>
      )}
    </span>
  );
};

export default RiskBadge;
