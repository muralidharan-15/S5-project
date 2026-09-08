import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Determine Base URL dynamically:
// 1. Capacitor native mobile app -> use cloud tunnel (VITE_API_BASE_URL) or Android emulator
// 2. Local browser (localhost / 127.0.0.1) -> use local proxy '/api/v1/flood' -> http://127.0.0.1:8000
// 3. Remote web browser -> use VITE_API_BASE_URL
const getBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    if (import.meta.env.VITE_API_BASE_URL) {
      return `${import.meta.env.VITE_API_BASE_URL}/api/v1/flood`;
    }
    return 'http://10.0.2.2:8000/api/v1/flood';
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/v1/flood';
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/api/v1/flood`;
  }
  return '/api/v1/flood';
};

const API_BASE_URL = getBaseUrl();

// Bypass Ngrok and LocalTunnel interstitial reminder pages for mobile API calls
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

// Offline state generator - Zero Dummy Data Policy for Life Safety
export const getOfflineDashboardState = (district = 'Virudhunagar') => ({
  district,
  isOffline: true,
  isFallback: false,
  data_source: 'Live Server Disconnected',
  error: 'Live AI telemetry station is offline. No unverified estimates are shown.',
  rainfall_risk: null,
  weather: null,
  dam_details: null,
  evaluated_7day_forecast: []
});

// Neutral offline district map with coordinates for basic rendering, but UNAVAILABLE threat status
export const getOfflineDistricts = () => {
  const coords = {
    "Ariyalur": [11.1401, 79.0782],
    "Chengalpattu": [12.6921, 79.9777],
    "Chennai": [13.0827, 80.2707],
    "Coimbatore": [11.0168, 76.9558],
    "Cuddalore": [11.7480, 79.7714],
    "Dharmapuri": [12.1211, 78.1582],
    "Dindigul": [10.3673, 77.9803],
    "Erode": [11.3410, 77.7172],
    "Kallakurichi": [11.7384, 78.9639],
    "Kanchipuram": [12.8342, 79.7036],
    "Kanyakumari": [8.1833, 77.4119],
    "Karur": [10.9601, 78.0766],
    "Krishnagiri": [12.5186, 78.2137],
    "Madurai": [9.9252, 78.1198],
    "Mayiladuthurai": [11.1018, 79.6522],
    "Nagapattinam": [10.7672, 79.8449],
    "Namakkal": [11.2189, 78.1674],
    "Nilgiris": [11.4102, 76.6950],
    "Perambalur": [11.2342, 78.8820],
    "Pudukkottai": [10.3797, 78.8202],
    "Ramanathapuram": [9.3639, 78.8318],
    "Ranipet": [12.9296, 79.3333],
    "Salem": [11.6643, 78.1460],
    "Sivaganga": [9.8433, 78.4809],
    "Tenkasi": [8.9593, 77.3149],
    "Thanjavur": [10.7870, 79.1378],
    "Theni": [10.0104, 77.4768],
    "Thoothukudi": [8.7642, 78.1348],
    "Tiruchirappalli": [10.7905, 78.7047],
    "Tirunelveli": [8.7139, 77.7567],
    "Tirupathur": [12.4929, 78.5678],
    "Tiruppur": [11.1085, 77.3411],
    "Tiruvallur": [13.1432, 79.9070],
    "Tiruvannamalai": [12.2253, 79.0747],
    "Tiruvarur": [10.7709, 79.6366],
    "Vellore": [12.9165, 79.1325],
    "Viluppuram": [11.9401, 79.4861],
    "Virudhunagar": [9.5872, 77.9624]
  };

  const map = {};
  for (const [name, [lat, lon]] of Object.entries(coords)) {
    map[name] = {
      name,
      lat,
      lon,
      level: "UNAVAILABLE",
      color: "#64748B", // neutral slate
      confidence: null
    };
  }

  return {
    districts_list: Object.keys(map).sort(),
    districts_map: map,
    isOffline: true
  };
};

// Client-side in-memory cache for instantaneous switches
const clientDashboardCache = new Map();
const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const fetchDistricts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/districts`, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn('API fetchDistricts: server offline, using neutral coordinates map');
    return getOfflineDistricts();
  }
};

export const fetchDashboardData = async (district = 'Virudhunagar') => {
  // 1. Instant Cache Check: If already requested recently, return in 0ms!
  const cached = clientDashboardCache.get(district);
  if (cached && (Date.now() - cached.timestamp < CLIENT_CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      params: { district },
      timeout: 5000
    });
    const result = {
      ...response.data,
      isOffline: false,
      isFallback: false
    };
    clientDashboardCache.set(district, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.warn(`API fetchDashboardData offline for ${district}:`, error.message);
    return getOfflineDashboardState(district);
  }
};

// Background prefetcher for popular districts
export const prefetchDistricts = (districts = []) => {
  districts.forEach((d) => {
    if (!clientDashboardCache.has(d)) {
      axios.get(`${API_BASE_URL}/dashboard`, { params: { district: d }, timeout: 5000 })
        .then((res) => {
          clientDashboardCache.set(d, { data: { ...res.data, isOffline: false, isFallback: false }, timestamp: Date.now() });
        })
        .catch(() => {});
    }
  });
};

export const subscribeAlert = async (subscriptionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/alert-subscribe`, subscriptionData, { timeout: 4000 });
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      message: 'Live alert service is currently offline. For urgent emergency updates, please dial TNSDMA helpline 1070.'
    };
  }
};

