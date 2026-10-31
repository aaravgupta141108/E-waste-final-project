import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow
} from '@vis.gl/react-google-maps';
import {
  Truck,
  Building2,
  Factory,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation,
  Activity,
  Layers,
  Sparkles,
  Phone,
  Maximize2,
  RotateCcw,
  Compass
} from 'lucide-react';
import { FleetTruck } from '../types';

export interface GoogleMapsFleetGISLayerProps {
  trucks: FleetTruck[];
  selectedTruckId: string;
  onSelectTruck: (truckId: string) => void;
  hubs: {
    id: string;
    name: string;
    code: string;
    city: string;
    state: string;
    coords: [number, number];
    dailyCapacityKg: number;
    currentIntakeKg: number;
    dockBays: number;
    activeVehicles: number;
    contactPerson: string;
    contactPhone: string;
  }[];
  recyclers: {
    id: string;
    name: string;
    cpcbRegNumber: string;
    spcbConsentNumber: string;
    city: string;
    state: string;
    coords: [number, number];
    annualCapacityTonnes: number;
    recoveryEfficiencyPct: number;
    streams: string[];
  }[];
  activeLayers: {
    traffic: boolean;
    hubs: boolean;
    recyclers: boolean;
    corridors: boolean;
  };
}

export const GoogleMapsFleetGISLayer: React.FC<GoogleMapsFleetGISLayerProps> = ({
  trucks,
  selectedTruckId,
  onSelectTruck,
  hubs,
  recyclers,
  activeLayers
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid');
  const [activeInfoWindow, setActiveInfoWindow] = useState<{
    type: 'truck' | 'hub' | 'recycler';
    data: any;
  } | null>(null);

  const selectedTruck = useMemo(() => {
    return trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  }, [trucks, selectedTruckId]);

  const center = useMemo(() => {
    if (selectedTruck && selectedTruck.coordinates && selectedTruck.coordinates.length >= 2) {
      return { lat: selectedTruck.coordinates[0], lng: selectedTruck.coordinates[1] };
    }
    return { lat: 21.7679, lng: 78.8718 };
  }, [selectedTruck]);

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[580px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <h4 className="text-base font-bold text-white">Google Maps API Key Missing</h4>
        <p className="text-xs text-slate-400 max-w-md">
          Please add <code className="text-purple-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to your environment or configure it in the Google Maps setup modal.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[580px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Map Engine Controls Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg text-xs">
        <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">TYPE:</span>
        {(
          [
            { id: 'hybrid', label: 'Satellite Hybrid' },
            { id: 'roadmap', label: 'Vector Road' },
            { id: 'terrain', label: 'Topography' }
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMapTypeId(t.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              mapTypeId === t.id
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top Right Live Telemetry Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 shadow-lg text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-purple-300 font-bold">Google Maps Platform</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-300">{trucks.length} Active Vehicles</span>
      </div>

      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={center}
          defaultZoom={5.5}
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full min-h-[580px]"
          style={{ width: '100%', height: '100%', minHeight: '580px' }}
        >
          {/* Collection Trucks Advanced Markers */}
          {trucks.map((truck) => {
            const isSelected = selectedTruckId === truck.id;
            const tLat = truck.coordinates?.[0] ?? 28.5355;
            const tLng = truck.coordinates?.[1] ?? 77.391;
            return (
              <AdvancedMarker
                key={truck.id}
                position={{ lat: tLat, lng: tLng }}
                onClick={() => {
                  onSelectTruck(truck.id);
                  setActiveInfoWindow({ type: 'truck', data: truck });
                }}
                title={`${truck.vehicleNumber} (${truck.driverName})`}
              >
                <div className="relative flex flex-col items-center justify-center cursor-pointer select-none group">
                  {isSelected && (
                    <span className="animate-ping absolute inline-flex h-11 w-11 rounded-full bg-emerald-400 opacity-70" />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center shadow-xl transition-transform ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/50 scale-110'
                        : truck.status === 'In Transit'
                        ? 'bg-slate-900 border-2 border-emerald-400 text-emerald-400 group-hover:scale-105'
                        : 'bg-slate-900 border-2 border-amber-400 text-amber-400 group-hover:scale-105'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div
                    className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md ${
                      isSelected
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {truck.vehicleNumber}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Logistics Hubs Advanced Markers */}
          {activeLayers.hubs &&
            hubs.map((hub) => (
              <AdvancedMarker
                key={hub.id}
                position={{ lat: hub.coords[0], lng: hub.coords[1] }}
                onClick={() => setActiveInfoWindow({ type: 'hub', data: hub })}
                title={`Logistics Hub: ${hub.name}`}
              >
                <div className="relative flex flex-col items-center justify-center cursor-pointer select-none group">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-115 transition-transform">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-cyan-300 border border-cyan-800 text-[8px] font-mono shadow">
                    {hub.code}
                  </span>
                </div>
              </AdvancedMarker>
            ))}

          {/* Recyclers Advanced Markers */}
          {activeLayers.recyclers &&
            recyclers.map((rec) => (
              <AdvancedMarker
                key={rec.id}
                position={{ lat: rec.coords[0], lng: rec.coords[1] }}
                onClick={() => setActiveInfoWindow({ type: 'recycler', data: rec })}
                title={`Recycler: ${rec.name}`}
              >
                <div className="relative flex flex-col items-center justify-center cursor-pointer select-none group">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-purple-400 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-115 transition-transform">
                    <Factory className="w-3.5 h-3.5" />
                  </div>
                  <span className="mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-purple-300 border border-purple-800 text-[8px] font-mono shadow">
                    {rec.city.slice(0, 8)}
                  </span>
                </div>
              </AdvancedMarker>
            ))}

          {/* Info Window Popover */}
          {activeInfoWindow && activeInfoWindow.type === 'truck' && (
            <InfoWindow
              position={{
                lat: activeInfoWindow.data.coordinates?.[0] ?? 28.5355,
                lng: activeInfoWindow.data.coordinates?.[1] ?? 77.391
              }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="text-slate-950 p-1 font-sans text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-sm text-slate-900">
                    {activeInfoWindow.data.vehicleNumber}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {activeInfoWindow.data.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                  <div>Driver: <strong>{activeInfoWindow.data.driverName}</strong></div>
                  <div>Phone: {activeInfoWindow.data.driverPhone}</div>
                  <div>Speed: <strong className="text-blue-700">{activeInfoWindow.data.speedKmph} km/h</strong></div>
                  <div>Payload: <strong>{activeInfoWindow.data.payloadKg} kg</strong> ({activeInfoWindow.data.capacityUtilizationPct}%)</div>
                  <div>Tamper Seal: <strong className="text-emerald-700">{activeInfoWindow.data.tamperSealStatus}</strong></div>
                  <div>Route: {activeInfoWindow.data.currentRoute}</div>
                </div>
              </div>
            </InfoWindow>
          )}

          {activeInfoWindow && activeInfoWindow.type === 'hub' && (
            <InfoWindow
              position={{ lat: activeInfoWindow.data.coords[0], lng: activeInfoWindow.data.coords[1] }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="text-slate-950 p-1 font-sans text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-sm text-cyan-900">{activeInfoWindow.data.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                    {activeInfoWindow.data.code}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                  <div>Location: {activeInfoWindow.data.city}, {activeInfoWindow.data.state}</div>
                  <div>Daily Intake: <strong>{activeInfoWindow.data.currentIntakeKg} / {activeInfoWindow.data.dailyCapacityKg} kg</strong></div>
                  <div>Dock Bays: {activeInfoWindow.data.dockBays} Active</div>
                  <div>Fleet: {activeInfoWindow.data.activeVehicles} Vehicles</div>
                  <div>Contact: {activeInfoWindow.data.contactPerson} ({activeInfoWindow.data.contactPhone})</div>
                </div>
              </div>
            </InfoWindow>
          )}

          {activeInfoWindow && activeInfoWindow.type === 'recycler' && (
            <InfoWindow
              position={{ lat: activeInfoWindow.data.coords[0], lng: activeInfoWindow.data.coords[1] }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="text-slate-950 p-1 font-sans text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-sm text-purple-900">{activeInfoWindow.data.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    CPCB Verified
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                  <div>Location: {activeInfoWindow.data.city}, {activeInfoWindow.data.state}</div>
                  <div>Reg No: {activeInfoWindow.data.cpcbRegNumber}</div>
                  <div>Annual Capacity: <strong>{activeInfoWindow.data.annualCapacityTonnes.toLocaleString()} MT/yr</strong></div>
                  <div>Recovery Rate: <strong className="text-emerald-700">{activeInfoWindow.data.recoveryEfficiencyPct}%</strong></div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
