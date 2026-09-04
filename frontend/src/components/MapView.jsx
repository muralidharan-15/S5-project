import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import RiskBadge from './RiskBadge';
import { MapPin } from 'lucide-react';

// Helper component to center map when selected district changes
const MapController = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 8, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

const MapView = ({ districtsMap, selectedDistrict, onSelectDistrict, loading }) => {
  const defaultCenter = [11.1271, 78.6569]; // Tamil Nadu geographic center
  const districtsList = Object.values(districtsMap || {});

  const currentCoords = districtsMap?.[selectedDistrict]
    ? [districtsMap[selectedDistrict].lat, districtsMap[selectedDistrict].lon]
    : defaultCenter;

  if (loading) {
    return (
      <div className="w-full h-[420px] rounded-xl glass-card border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center space-y-2 text-slate-400">
          <MapPin className="w-8 h-8 animate-bounce" />
          <span className="text-sm font-medium">Loading Tamil Nadu District Geospatial Risk Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            Tamil Nadu Geospatial Flood Risk Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time status for all 38 districts (Click a marker to inspect details)
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-3 text-xs font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span> Low Risk</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> High Risk</span>
        </div>
      </div>

      {/* Leaflet Map container */}
      <div className="w-full h-[420px] rounded-xl overflow-hidden shadow-inner border border-slate-200/80 dark:border-slate-800">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={currentCoords} />

          {districtsList.map((dist) => {
            const isSelected = dist.name === selectedDistrict;
            return (
              <CircleMarker
                key={dist.name}
                center={[dist.lat, dist.lon]}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                  fillColor: dist.color,
                  color: isSelected ? '#000000' : '#ffffff',
                  weight: isSelected ? 3 : 1.5,
                  fillOpacity: 0.85
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(dist.name)
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[160px] text-slate-900">
                    <h4 className="font-bold text-sm mb-1">{dist.name} District</h4>
                    <div className="my-1.5">
                      <RiskBadge level={dist.level} confidence={dist.confidence} size="sm" />
                    </div>
                    <button
                      onClick={() => onSelectDistrict(dist.name)}
                      className="mt-2 w-full py-1 px-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
                    >
                      {isSelected ? 'Currently Viewing' : `Analyze ${dist.name}`}
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
