import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-navy-900 border-t border-navy-700/60 text-slate-400 text-xs py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Tamil Nadu State AI Disaster Alert & Early Risk Prediction System</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="bg-navy-800 border border-navy-700 px-2.5 py-1 rounded text-slate-300 font-mono text-[11px]">
              System Version: v2.0.0-FastAPI-React
            </span>
            <span className="text-slate-400 text-[11px]">
              Model Last Trained: Sept 2026
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-navy-800 text-[11px] leading-relaxed text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Official Disaster Management Disclaimer:</strong> This system uses artificial intelligence, machine learning (Random Forest Classifiers), and satellite telemetry for early flood risk prediction. Information provided here is intended for situational awareness. For life-threatening emergency responses, follow official directives issued by the Tamil Nadu State Disaster Management Authority (TNSDMA) and District Collector Offices.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
