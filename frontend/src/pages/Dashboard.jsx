import React, { useState, useEffect } from 'react';
import { fetchDistricts, fetchDashboardData } from '../api/floodApi';
import MetricCard from '../components/MetricCard';
import MapView from '../components/MapView';
import RainfallChart from '../components/RainfallChart';
import XaiPanel from '../components/XaiPanel';
import ForecastList from '../components/ForecastList';
import DamDetails from '../components/DamDetails';
import { Search, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore');
  const [districtsList, setDistrictsList] = useState([]);
  const [districtsMap, setDistrictsMap] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Load 38 districts list & map risk levels
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const data = await fetchDistricts();
        if (data?.districts_list) {
          setDistrictsList(data.districts_list);
          setDistrictsMap(data.districts_map || {});
        }
      } catch (err) {
        console.warn('Backend districts endpoint offline, using fallback list.');
        // Fallback Tamil Nadu districts list
        const fallback = [
          'Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Erode', 'Tiruchirappalli',
          'Tirunelveli', 'Vellore', 'Thanjavur', 'Kanchipuram', 'Cuddalore', 'Tiruppur',
          'Dindigul', 'Kanyakumari', 'Nagapattinam', 'Thoothukudi', 'Ramanathapuram',
          'Dharmapuri', 'Krishnagiri', 'Karur', 'Namakkal', 'Pudukkottai', 'Sivaganga',
          'Theni', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Viluppuram', 'Virudhunagar',
          'Ariyalur', 'Perambalur', 'Nilgiris', 'Ranipet', 'Tirupathur', 'Chengalpattu',
          'Kallakurichi', 'Tenkasi', 'Mayiladuthurai'
        ];
        setDistrictsList(fallback);
      }
    };
    loadDistricts();
  }, []);

  // Load specific district dashboard metrics
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorNotice(null);
      try {
        const res = await fetchDashboardData(selectedDistrict);
        setDashboardData(res);
      } catch (err) {
        console.warn(`Error loading live backend data for ${selectedDistrict}.`);
        setErrorNotice(`Live backend API connecting... displaying baseline forecast for ${selectedDistrict}.`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedDistrict]);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner & District Selector */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tamil Nadu Flood Risk Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/20">
              Live Satellite AI Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing 38 districts with Random Forest Machine Learning & Open-Meteo satellite feed
          </p>
        </div>

        {/* Searchable District Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[220px]">
            <MapPin className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {districtsList.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} District
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subdued Error/Offline Notice */}
      {errorNotice && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{errorNotice}</span>
          </div>
          <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">Backend Port 8000</span>
        </div>
      )}

      {/* 1. Metric Cards (Row of 4) */}
      <MetricCard
        weather={dashboardData?.weather}
        rainfallRisk={dashboardData?.rainfall_risk}
        loading={loading}
      />

      {/* 2. Full-Width Interactive Map */}
      <MapView
        districtsMap={districtsMap}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={(dist) => setSelectedDistrict(dist)}
        loading={loading}
      />

      {/* 3. Grid Row: 7-Day Precipitation Trend Chart + Explainable AI (SHAP) Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RainfallChart
          graphData={dashboardData?.rainfall_graph}
          district={selectedDistrict}
          loading={loading}
        />
        <XaiPanel
          explainability={dashboardData?.rainfall_risk?.explainability}
          loading={loading}
        />
      </div>

      {/* 4. 7-Day Daily Forecast Row */}
      <ForecastList
        forecastList={dashboardData?.evaluated_7day_forecast}
        peakRisk={dashboardData?.peak_forecast_risk}
        loading={loading}
      />

      {/* 5. Hydro-Reservoir Dam Details */}
      <DamDetails
        damDetails={dashboardData?.dam_details}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
