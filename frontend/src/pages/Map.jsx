import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { fetchDistricts } from '../api/floodApi';

// Component to handle recentering map
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 8);
    }
  }, [center, zoom, map]);
  return null;
};

const Map = ({ district = 'Virudhunagar', onSelectDistrict }) => {
  const navigate = useNavigate();
  const [districtsMap, setDistrictsMap] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDams, setShowDams] = useState(true);
  const [mapCenter, setMapCenter] = useState([9.5872, 77.9624]); // Virudhunagar default

  // Live dams data for Tamil Nadu
  const damsData = [
    { id: 'suruliyar', name: 'Suruliyar Dam', lat: 9.682, lon: 77.264, level: 'Danger', color: '#DC2626', storage: '99%', inflow: '2,100 cusecs', outflow: '1,850 cusecs' },
    { id: 'vaigai', name: 'Vaigai Dam', lat: 10.054, lon: 77.585, level: 'Warning', color: '#EA580C', storage: '84%', inflow: '1,240 cusecs', outflow: '800 cusecs' },
    { id: 'manjalar', name: 'Manjalar Dam', lat: 10.180, lon: 77.680, level: 'Safe', color: '#10B981', storage: '52%', inflow: '310 cusecs', outflow: '0 cusecs' },
    { id: 'gundar', name: 'Gundar Reservoir', lat: 9.380, lon: 78.120, level: 'Safe', color: '#10B981', storage: '38%', inflow: '150 cusecs', outflow: '0 cusecs' },
    { id: 'bhavanisagar', name: 'Bhavanisagar Dam', lat: 11.472, lon: 77.114, level: 'Warning', color: '#EA580C', storage: '92%', inflow: '3,800 cusecs', outflow: '3,200 cusecs' },
    { id: 'mettur', name: 'Mettur Dam', lat: 11.802, lon: 77.801, level: 'Safe', color: '#10B981', storage: '76%', inflow: '5,100 cusecs', outflow: '4,500 cusecs' }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDistricts();
        if (data && typeof data === 'object') {
          const mapData = data.districts_map || data;
          setDistrictsMap(mapData);
          if (mapData[district]) {
            setMapCenter([mapData[district].lat, mapData[district].lon]);
            setSelectedEntity({
              type: 'district',
              name: district,
              ...mapData[district]
            });
          }
        }
      } catch (err) {
        console.error('Failed to load districts for map:', err);
      }
    };
    load();
  }, [district]);

  // Handle Search Filtering
  const filteredDistricts = Object.keys(districtsMap).filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDistrictEntity = (name, info) => {
    if (onSelectDistrict) onSelectDistrict(name);
    setMapCenter([info.lat, info.lon]);
    setSelectedEntity({
      type: 'district',
      name,
      ...info
    });
  };

  const handleSelectDamEntity = (dam) => {
    setMapCenter([dam.lat, dam.lon]);
    setSelectedEntity({
      type: 'dam',
      ...dam
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col animate-fadeIn">
      {/* 1. Floating Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30">
        <div className="bg-white rounded-full shadow-card border border-[#E2E8F0] flex items-center px-4 py-2.5">
          <span className="material-symbols-outlined text-slate-400 mr-2.5 text-xl">search</span>
          <input
            type="text"
            placeholder="Search district or risk zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 p-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Search Autocomplete Dropdown */}
        {searchQuery && filteredDistricts.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] max-h-48 overflow-y-auto p-1.5 space-y-1">
            {filteredDistricts.slice(0, 5).map(name => (
              <div
                key={name}
                onClick={() => {
                  handleSelectDistrictEntity(name, districtsMap[name]);
                  setSearchQuery('');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>{name}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: districtsMap[name]?.color || '#006194' }}
                >
                  {districtsMap[name]?.level || 'DATA'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Floating Map Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2.5 z-30">
        <button
          onClick={() => setShowDams(!showDams)}
          className={`w-11 h-11 rounded-full shadow-card border flex flex-col items-center justify-center transition-all ${
            showDams
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-white text-slate-600 border-[#E2E8F0] hover:text-primary'
          }`}
          title="Toggle Dam Pins"
        >
          <span className="material-symbols-outlined text-lg">waves</span>
          <span className="text-[7px] font-black tracking-tighter">DAMS</span>
        </button>

        <button
          onClick={() => {
            if (districtsMap[district]) {
              setMapCenter([districtsMap[district].lat, districtsMap[district].lon]);
            }
          }}
          className="w-11 h-11 bg-white rounded-full shadow-card border border-[#E2E8F0] flex items-center justify-center text-slate-700 hover:text-primary transition-colors cursor-pointer"
          title="My District Location"
        >
          <span className="material-symbols-outlined text-lg">my_location</span>
        </button>
      </div>

      {/* 3. Interactive Leaflet Map Layer */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={8}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapRecenter center={mapCenter} zoom={8} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* District Circle Markers */}
          {Object.entries(districtsMap).map(([name, info]) => {
            const isSelected = selectedEntity?.name === name;
            return (
              <CircleMarker
                key={name}
                center={[info.lat, info.lon]}
                radius={isSelected ? 14 : 9}
                pathOptions={{
                  fillColor: info.color || '#DC2626',
                  fillOpacity: 0.85,
                  color: isSelected ? '#000000' : '#ffffff',
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => handleSelectDistrictEntity(name, info)
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-sm text-[#0F172A]">{name} District</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Risk: <strong style={{ color: info.color }}>{info.level}</strong>
                    </p>
                    <p className="text-xs text-slate-500">Confidence: {info.confidence}%</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Live Dam Markers */}
          {showDams &&
            damsData.map(dam => {
              const isSelected = selectedEntity?.name === dam.name;
              return (
                <CircleMarker
                  key={dam.id}
                  center={[dam.lat, dam.lon]}
                  radius={isSelected ? 16 : 11}
                  pathOptions={{
                    fillColor: dam.color,
                    fillOpacity: 0.95,
                    color: '#ffffff',
                    weight: 2,
                    dashArray: '3, 3'
                  }}
                  eventHandlers={{
                    click: () => handleSelectDamEntity(dam)
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">waves</span>
                        <h4 className="font-bold text-sm text-[#0F172A]">{dam.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Status: <strong style={{ color: dam.color }}>{dam.level}</strong></p>
                      <p className="text-xs text-slate-500">Storage: <strong>{dam.storage}</strong></p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* 4. Floating Bottom Summary Sheet Card */}
      {selectedEntity && (
        <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-30 animate-slideUp">
          <div className="bg-white rounded-card p-4 md:p-5 border border-[#E2E8F0] shadow-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: selectedEntity.color || '#006194' }}
              >
                <span className="material-symbols-outlined text-xl">
                  {selectedEntity.type === 'dam' ? 'waves' : 'location_on'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">{selectedEntity.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white tracking-wider"
                    style={{ backgroundColor: selectedEntity.color || '#DC2626' }}
                  >
                    {selectedEntity.level}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {selectedEntity.type === 'dam'
                    ? `Storage ${selectedEntity.storage} • Outflow ${selectedEntity.outflow}`
                    : `Telemetry active • Threat Confidence ${selectedEntity.confidence || 88}%`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedEntity.type === 'dam') {
                  navigate('/dams');
                } else {
                  navigate('/risk-analysis');
                }
              }}
              className="bg-primary text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>Details</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
