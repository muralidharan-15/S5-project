import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import DesktopTopAppBar from './components/DesktopTopAppBar';
import MobileHeader from './components/MobileHeader';
import BottomTabBar from './components/BottomTabBar';

import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Dams from './pages/Dams';
import RiskAnalysis from './pages/RiskAnalysis';
import Alerts from './pages/Alerts';
import Contact from './pages/Contact';
import FloodAlert from './pages/FloodAlert';
import Analytics from './pages/Analytics';
import About from './pages/About';

import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { fetchDistricts } from './api/floodApi';

// Native Bridge for Capacitor
const NativeBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#f8f9ff' }).catch(() => {});
      SplashScreen.hide().catch(() => {});

      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then((sub) => sub.remove()).catch(() => {});
      };
    }
  }, [navigate]);

  return null;
};

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('Virudhunagar');
  const [districtsList, setDistrictsList] = useState([
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
    'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
    'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
    'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
    'Viluppuram', 'Virudhunagar'
  ]);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const data = await fetchDistricts();
        if (data) {
          if (Array.isArray(data.districts_list) && data.districts_list.length > 0) {
            setDistrictsList(data.districts_list);
          } else if (data.districts_map && typeof data.districts_map === 'object') {
            setDistrictsList(Object.keys(data.districts_map).sort());
          } else if (typeof data === 'object') {
            const keys = Object.keys(data).filter(k => k !== 'districts_list' && k !== 'districts_map');
            if (keys.length > 0) setDistrictsList(keys.sort());
          }
        }
      } catch (err) {
        console.warn('Using default Tamil Nadu districts:', err);
      }
    };
    loadDistricts();
  }, []);

  return (
    <Router>
      <NativeBridge />
      <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans antialiased">
        {/* Desktop Sticky Header */}
        <DesktopTopAppBar
          currentDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          districts={districtsList}
        />

        {/* Mobile Sticky Header */}
        <MobileHeader
          currentDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          districts={districtsList}
        />

        {/* Primary Viewport Area (Max 1440px on Desktop, Fluid on Mobile) */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  district={selectedDistrict}
                  onSelectDistrict={setSelectedDistrict}
                  districtsList={districtsList}
                />
              }
            />
            <Route
              path="/map"
              element={
                <Map
                  district={selectedDistrict}
                  onSelectDistrict={setSelectedDistrict}
                />
              }
            />
            <Route
              path="/dams"
              element={
                <Dams
                  district={selectedDistrict}
                  onSelectDistrict={setSelectedDistrict}
                />
              }
            />
            <Route
              path="/risk-analysis"
              element={
                <RiskAnalysis
                  district={selectedDistrict}
                />
              }
            />
            <Route path="/alerts" element={<Alerts district={selectedDistrict} />} />
            <Route path="/sos" element={<Contact district={selectedDistrict} />} />
            <Route path="/flood-alert" element={<FloodAlert district={selectedDistrict} />} />
            <Route path="/analytics" element={<Analytics district={selectedDistrict} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Mobile Persistent Bottom Tab Bar */}
        <BottomTabBar />
      </div>
    </Router>
  );
}

export default App;
