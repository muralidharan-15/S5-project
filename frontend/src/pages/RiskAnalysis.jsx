import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../api/floodApi';

const RiskAnalysis = ({ district = 'Virudhunagar' }) => {
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
        console.error('Failed to load risk analysis data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [district]);

  const riskPercent = data?.rainfall_risk?.probability !== undefined
    ? Math.round(data.rainfall_risk.probability)
    : data?.rainfall_risk?.raw_risk_percentage !== undefined
    ? Math.round(data.rainfall_risk.raw_risk_percentage)
    : null;

  const riskLevel = data?.rainfall_risk?.level || data?.rainfall_risk?.flood_risk_level || (riskPercent !== null ? (riskPercent >= 70 ? 'HIGH' : riskPercent >= 40 ? 'MODERATE' : 'LOW') : 'LOW');

  // Map live SHAP explainability drivers if available from backend
  const backendDrivers = data?.rainfall_risk?.explainability?.top_drivers ||
    data?.rainfall_risk?.explainability?.all_drivers ||
    data?.rainfall_risk?.explainability?.drivers;
  const factors = backendDrivers && backendDrivers.length > 0
    ? backendDrivers.slice(0, 4).map(d => ({
        name: d.display_name,
        percentage: Math.round(d.impact_percent),
        color: d.impact_percent >= 40 ? '#DC2626' : d.impact_percent >= 20 ? '#D97706' : '#707881',
        icon: d.feature.includes('Rainfall') ? 'rainy' : d.feature.includes('Urban') ? 'location_city' : d.feature.includes('Drain') ? 'plumbing' : 'water'
      }))
    : data?.rainfall_risk?.factors || [
        { name: 'Heavy Rainfall', percentage: 82, color: '#DC2626', icon: 'rainy' },
        { name: 'Watershed Saturation', percentage: 68, color: '#D97706', icon: 'water' },
        { name: 'Urbanization Index', percentage: 59, color: '#707881', icon: 'location_city' },
        { name: 'Drainage Capacity Stress', percentage: 51, color: '#707881', icon: 'plumbing' },
      ];

  const aiSummaryText = data?.rainfall_risk?.explainability?.summary_banner ||
    data?.rainfall_risk?.advisory ||
    data?.rainfall_risk?.ai_summary ||
    `Current meteorological conditions indicate flood risk across ${district} is ${riskLevel}. Ground monitoring in progress.`;

  // SVG circumference: 2 * PI * 54 ~= 339.29
  const strokeDashoffset = 339.29 - (339.29 * riskPercent) / 100;
  const riskColor = riskLevel === 'HIGH' ? '#DC2626' : riskLevel === 'MODERATE' ? '#D97706' : '#10B981';

  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-md flex flex-col items-center pb-32 animate-fadeIn">
      <div className="w-full md:max-w-2xl flex flex-col gap-stack-lg">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#0F172A]">Risk Analysis Detail</h1>
            <p className="text-[11px] font-medium text-slate-400">{district} District</p>
          </div>
          <button
            onClick={() => navigate('/flood-alert')}
            className="flex items-center justify-center p-2 rounded-full hover:bg-red-50 text-red-600 active:scale-95 cursor-pointer"
            title="Emergency Action"
          >
            <span className="material-symbols-outlined">warning</span>
          </button>
        </div>

        {/* Hero Circular Summary */}
        <section className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" fill="none" r="54" stroke="#e5eeff" strokeWidth="8" opacity="0.6" />
              <circle
                className="transition-all duration-1000 ease-out"
                cx="60"
                cy="60"
                fill="none"
                r="54"
                stroke={riskColor}
                strokeDasharray="339.29"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="11"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[46px] font-extrabold text-[#0F172A] leading-none">
                {riskPercent}%
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest mt-1" style={{ color: riskColor }}>
                {riskLevel}
              </span>
            </div>
          </div>

          <div
            className={`mt-2 px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-xs ${
              riskLevel === 'HIGH'
                ? 'bg-red-50 border-red-200/60 text-red-700'
                : 'bg-amber-50 border-amber-200/60 text-amber-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span className="text-xs font-bold uppercase tracking-wider">{riskLevel} Flood Threat</span>
          </div>
        </section>

        {/* AI Summary Card */}
        <section className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0 border border-blue-100">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                AI Risk Assessment
              </h3>
              <p className="text-[14px] text-slate-700 leading-relaxed font-normal">
                {aiSummaryText}
              </p>
            </div>
          </div>
        </section>

        {/* Factors Section: Why is the risk high? */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-primary">Why is the risk elevated?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {factors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-primary transition-colors cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <span className="material-symbols-outlined">{factor.icon || 'water_drop'}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">{factor.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: factor.color }}>
                    {factor.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${factor.percentage}%`, backgroundColor: factor.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={() => navigate('/flood-alert')}
          className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">notification_important</span>
          <span>View Recommended Evacuation Actions</span>
        </button>
      </div>
    </div>
  );
};

export default RiskAnalysis;
