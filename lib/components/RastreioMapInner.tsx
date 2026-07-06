'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Yellow bus icon
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const studentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // Student home icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface RastreioMapInnerProps {
  busLat: number;
  busLng: number;
  studentLat?: number | null;
  studentLng?: number | null;
  studentName: string;
}

export default function RastreioMapInner({ busLat, busLng, studentLat, studentLng, studentName }: RastreioMapInnerProps) {
  return (
    <MapContainer 
      center={[busLat, busLng]} 
      zoom={14} 
      style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[busLat, busLng]} icon={busIcon}>
        <Popup>
          <div className="text-center font-bold text-xs text-slate-800">
            Ônibus Escolar
          </div>
        </Popup>
      </Marker>
      
      {studentLat && studentLng && (
        <Marker position={[studentLat, studentLng]} icon={studentIcon}>
          <Popup>
            <div className="text-center font-bold text-xs text-slate-800">
              Ponto de {studentName}
            </div>
          </Popup>
        </Marker>
      )}

      <MapBoundsFitter busLat={busLat} busLng={busLng} studentLat={studentLat} studentLng={studentLng} />
    </MapContainer>
  );
}

// Helper to fit bounds to show both markers
import { useMap } from 'react-leaflet';

function MapBoundsFitter({ busLat, busLng, studentLat, studentLng }: { busLat: number, busLng: number, studentLat?: number | null, studentLng?: number | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (studentLat && studentLng) {
      const bounds = L.latLngBounds([
        [busLat, busLng],
        [studentLat, studentLng]
      ]);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([busLat, busLng], 14);
    }
  }, [map, busLat, busLng, studentLat, studentLng]);
  
  return null;
}
