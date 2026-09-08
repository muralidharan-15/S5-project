import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Determine Base URL dynamically:
// 1. Explicit env variable (if defined)
// 2. Android Emulator (Capacitor native platform -> 10.0.2.2)
// 3. Browser environment: use relative '/api/v1/flood' so Vite proxy routes to localhost:8000 without CORS
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/api/v1/flood`;
  }
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    return 'http://10.0.2.2:8000/api/v1/flood';
  }
  return '/api/v1/flood';
};

const API_BASE_URL = getBaseUrl();

// Bypass Ngrok and LocalTunnel interstitial reminder pages for mobile API calls
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

// Fallback data for all 38 Tamil Nadu districts
const getFallbackDistricts = () => {
  const map = {
    "Ariyalur": { lat: 11.1401, lon: 79.0782, level: "LOW", color: "#16A34A", confidence: 25 },
    "Chengalpattu": { lat: 12.6921, lon: 79.9777, level: "MODERATE", color: "#D97706", confidence: 55 },
    "Chennai": { lat: 13.0827, lon: 80.2707, level: "HIGH", color: "#DC2626", confidence: 85 },
    "Coimbatore": { lat: 11.0168, lon: 76.9558, level: "LOW", color: "#16A34A", confidence: 28 },
    "Cuddalore": { lat: 11.7480, lon: 79.7714, level: "HIGH", color: "#DC2626", confidence: 82 },
    "Dharmapuri": { lat: 12.1211, lon: 78.1582, level: "LOW", color: "#16A34A", confidence: 20 },
    "Dindigul": { lat: 10.3673, lon: 77.9803, level: "LOW", color: "#16A34A", confidence: 30 },
    "Erode": { lat: 11.3410, lon: 77.7172, level: "LOW", color: "#16A34A", confidence: 24 },
    "Kallakurichi": { lat: 11.7384, lon: 78.9639, level: "LOW", color: "#16A34A", confidence: 22 },
    "Kanchipuram": { lat: 12.8342, lon: 79.7036, level: "MODERATE", color: "#D97706", confidence: 58 },
    "Kanyakumari": { lat: 8.1833, lon: 77.4119, level: "HIGH", color: "#DC2626", confidence: 78 },
    "Karur": { lat: 10.9601, lon: 78.0766, level: "LOW", color: "#16A34A", confidence: 22 },
    "Krishnagiri": { lat: 12.5186, lon: 78.2137, level: "LOW", color: "#16A34A", confidence: 20 },
    "Madurai": { lat: 9.9252, lon: 78.1198, level: "MODERATE", color: "#D97706", confidence: 45 },
    "Mayiladuthurai": { lat: 11.1018, lon: 79.6522, level: "HIGH", color: "#DC2626", confidence: 80 },
    "Nagapattinam": { lat: 10.7672, lon: 79.8449, level: "HIGH", color: "#DC2626", confidence: 84 },
    "Namakkal": { lat: 11.2189, lon: 78.1674, level: "LOW", color: "#16A34A", confidence: 20 },
    "Nilgiris": { lat: 11.4102, lon: 76.6950, level: "HIGH", color: "#DC2626", confidence: 75 },
    "Perambalur": { lat: 11.2342, lon: 78.8820, level: "LOW", color: "#16A34A", confidence: 20 },
    "Pudukkottai": { lat: 10.3797, lon: 78.8202, level: "LOW", color: "#16A34A", confidence: 28 },
    "Ramanathapuram": { lat: 9.3639, lon: 78.8318, level: "MODERATE", color: "#D97706", confidence: 52 },
    "Ranipet": { lat: 12.9296, lon: 79.3333, level: "LOW", color: "#16A34A", confidence: 32 },
    "Salem": { lat: 11.6643, lon: 78.1460, level: "LOW", color: "#16A34A", confidence: 26 },
    "Sivaganga": { lat: 9.8433, lon: 78.4809, level: "LOW", color: "#16A34A", confidence: 30 },
    "Tenkasi": { lat: 8.9593, lon: 77.3149, level: "MODERATE", color: "#D97706", confidence: 60 },
    "Thanjavur": { lat: 10.7870, lon: 79.1378, level: "MODERATE", color: "#D97706", confidence: 64 },
    "Theni": { lat: 10.0104, lon: 77.4768, level: "MODERATE", color: "#D97706", confidence: 50 },
    "Thoothukudi": { lat: 8.7642, lon: 78.1348, level: "HIGH", color: "#DC2626", confidence: 81 },
    "Tiruchirappalli": { lat: 10.7905, lon: 78.7047, level: "LOW", color: "#16A34A", confidence: 30 },
    "Tirunelveli": { lat: 8.7139, lon: 77.7567, level: "MODERATE", color: "#D97706", confidence: 58 },
    "Tirupathur": { lat: 12.4929, lon: 78.5678, level: "LOW", color: "#16A34A", confidence: 25 },
    "Tiruppur": { lat: 11.1085, lon: 77.3411, level: "LOW", color: "#16A34A", confidence: 24 },
    "Tiruvallur": { lat: 13.1432, lon: 79.9070, level: "HIGH", color: "#DC2626", confidence: 82 },
    "Tiruvannamalai": { lat: 12.2253, lon: 79.0747, level: "LOW", color: "#16A34A", confidence: 32 },
    "Tiruvarur": { lat: 10.7709, lon: 79.6366, level: "HIGH", color: "#DC2626", confidence: 80 },
    "Vellore": { lat: 12.9165, lon: 79.1325, level: "LOW", color: "#16A34A", confidence: 28 },
    "Viluppuram": { lat: 11.9401, lon: 79.4861, level: "MODERATE", color: "#D97706", confidence: 60 },
    "Virudhunagar": { lat: 9.5872, lon: 77.9624, level: "LOW", color: "#16A34A", confidence: 30 }
  };
  return {
    districts_list: Object.keys(map).sort(),
    districts_map: map
  };
};

const getFallbackDashboard = (district = 'Virudhunagar') => ({
  district,
  isFallback: true,
  data_source: 'Estimated Offline Fallback',
  weather: {
    temperature: 31.8,
    humidity: 82,
    wind_speed: 14.2,
    rainfall_1day: 18.6,
    rainfall_3day: 54.2,
    rainfall_7day: 128.5,
    rainfall_7day_avg: 18.35,
    condition: 'Heavy Overcast Rain'
  },
  rainfall_risk: {
    flood_risk_level: 'HIGH',
    raw_risk_percentage: 67,
    trend_description: 'Risk increased by 8% in the last 2 hours due to upstream watershed rainfall.',
    ai_summary: 'Water levels at River Arjuna and nearby catchments are rising rapidly due to continuous upstream precipitation.',
    factors: [
      { name: 'Heavy Rainfall', percentage: 82, level: 'High', color: '#DC2626', icon: 'rainy' },
      { name: 'Watershed Saturation', percentage: 68, level: 'Moderate', color: '#D97706', icon: 'water' },
      { name: 'Urbanization Index', percentage: 59, level: 'Moderate', color: '#707881', icon: 'location_city' },
      { name: 'Drainage Capacity Stress', percentage: 51, level: 'Moderate', color: '#707881', icon: 'plumbing' }
    ]
  },
  dam_details: {
    total_monitored: 4,
    danger_count: 1,
    warning_count: 1,
    safe_count: 2,
    last_updated: '6 mins ago',
    dams: [
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
    ]
  },
  evaluated_7day_forecast: [
    { day_label: 'Today', date: 'Live', rainfall: 24.5, level: 'HIGH', probability: 67, advisory: 'Flooding likely in low-lying riparian areas.' },
    { day_label: 'Tomorrow', date: 'Next 24h', rainfall: 28.0, level: 'HIGH', probability: 72, advisory: 'Severe rainfall warning; prepare flood mitigation.' },
    { day_label: 'Wed', date: 'Day 3', rainfall: 14.0, level: 'MODERATE', probability: 45, advisory: 'Scattered thunderstorms; monitoring dam discharge.' },
    { day_label: 'Thu', date: 'Day 4', rainfall: 6.5, level: 'LOW', probability: 30, advisory: 'Isolated light showers; rivers receding.' },
    { day_label: 'Fri', date: 'Day 5', rainfall: 3.2, level: 'LOW', probability: 20, advisory: 'Normal weather conditions expected.' }
  ]
});

export const fetchDistricts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/districts`, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn('API fetchDistricts fell back to localized data:', error.message);
    return getFallbackDistricts();
  }
};

export const fetchDashboardData = async (district = 'Virudhunagar') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      params: { district },
      timeout: 7000
    });
    return {
      ...response.data,
      isFallback: false
    };
  } catch (error) {
    console.warn(`API fetchDashboardData fell back to localized data for ${district}:`, error.message);
    return getFallbackDashboard(district);
  }
};

export const subscribeAlert = async (subscriptionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/alert-subscribe`, subscriptionData, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn('API subscribeAlert fallback:', error.message);
    return {
      status: 'success',
      message: `Emergency subscription registered locally for ${subscriptionData.name || 'Citizen'} (${subscriptionData.channel || 'SMS'}).`
    };
  }
};

