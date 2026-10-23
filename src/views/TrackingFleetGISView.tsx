import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  AlertTriangle,
  Activity,
  Layers,
  Wrench,
  Gauge,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  Download,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { FLEET_TRUCKS, LANDFILL_CLUSTERS, NATIONAL_STATS } from '../data/mockData';
import { FleetTruck, LandfillCluster } from '../types';

export const TrackingFleetGISView: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState<FleetTruck>(FLEET_TRUCKS[0]);
  const [gisHeatmapActive, setGisHeatmapActive] = useState(true);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredLandfill, setHoveredLandfill] = useState<LandfillCluster | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // States with coordinate pins on India grid
  const stateNodes = [
    { id: 'DEL', name: 'Delhi NCR', x: 36, y: 30, genK: 95, rate: 62.0, fleet: 4, landfillRisk: 'Critical (Ghazipur)' },
    { id: 'UP', name: 'Uttar Pradesh', x: 48, y: 35, genK: 395, rate: 95.4, fleet: 8, landfillRisk: 'Managed' },
    { id: 'HR', name: 'Haryana', x: 32, y: 28, genK: 154, rate: 88.3, fleet: 5, landfillRisk: 'Normal' },
    { id: 'PB', name: 'Punjab', x: 28, y: 22, genK: 72, rate: 33.5, fleet: 3, landfillRisk: 'Under-collected' },
    { id: 'MH', name: 'Maharashtra', x: 34, y: 56, genK: 215, rate: 41.1, fleet: 7, landfillRisk: 'Critical (Deonar)' },
    { id: 'GJ', name: 'Gujarat', x: 20, y: 46, genK: 110, rate: 45.0, fleet: 4, landfillRisk: 'Elevated (Pirana)' },
    { id: 'TG', name: 'Telangana', x: 44, y: 64, genK: 182, rate: 89.0, fleet: 6, landfillRisk: 'Elevated (Jawaharnagar)' },
    { id: 'KA', name: 'Karnataka', x: 36, y: 74, genK: 160, rate: 46.4, fleet: 7, landfillRisk: 'Elevated (Mavallipura)' },
    { id: 'TN', name: 'Tamil Nadu', x: 42, y: 84, genK: 142, rate: 43.7, fleet: 5, landfillRisk: 'Normal (Kodungaiyur)' },
    { id: 'WB', name: 'West Bengal', x: 68, y: 44, genK: 85, rate: 32.7, fleet: 3, landfillRisk: 'Under-collected' },
    { id: 'MP', name: 'Madhya Pradesh', x: 40, y: 46, genK: 98, rate: 68.2, fleet: 4, landfillRisk: 'Swachh Apex' },
    { id: 'RJ', name: 'Rajasthan', x: 24, y: 36, genK: 88, rate: 38.0, fleet: 2, landfillRisk: 'Under-collected' }
  ];

  const handleExportTelemetry = (format: 'csv' | 'excel') => {
    setShowExportMenu(false);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const separator = format === 'csv' ? ',' : '\t';
    const extension = format === 'csv' ? 'csv' : 'xls';

    let content = '';

    // Statutory Header
    content += `CENTRAL POLLUTION CONTROL BOARD - NATIONAL E-WASTE TELEMETRY AUDIT REPORT\r\n`;
    content += `Export Timestamp: ${new Date().toLocaleString('en-IN')}\r\n`;
    content += `Dataset Scope: Active Logistics Fleet Telemetry & Municipal Landfill Satiation Grid\r\n`;
    content += `Regulatory Framework: E-Waste Management Rules 2022 (Schedule III/IV)\r\n\r\n`;

    // Section 1: Fleet Logistics
    content += `--- SECTION 1: LOGISTICS FLEET TELEMETRY & PREDICTIVE MAINTENANCE ---\r\n`;
    const fleetHeaders = [
      'Truck ID',
      'Vehicle Registration',
      'Assigned Driver',
      'Driver Contact',
      'Current Transit Route',
      'Current Hub Location',
      'Operational Status',
      'Load Percentage (%)',
      'Capacity (Kg)',
      'Current Load (Kg)',
      'Engine Operating Hours',
      'Tire Pressure (PSI)',
      'Past Breakdowns',
      'Vibration Anomaly Score (0-100)',
      'Predictive Maintenance Service Recommendation',
      'Traffic Condition',
      'GPS Coordinates'
    ];
    content += fleetHeaders.join(separator) + '\r\n';

    FLEET_TRUCKS.forEach((t) => {
      const row = [
        `"${t.id}"`,
        `"${t.vehicleNumber}"`,
        `"${t.driverName}"`,
        `"${t.driverPhone}"`,
        `"${t.currentRoute}"`,
        `"${t.currentLocationName}"`,
        `"${t.status}"`,
        t.loadPercentage,
        t.capacityKg,
        t.currentLoadKg,
        t.engineHours,
        t.tirePressurePsi,
        t.pastBreakdownCount,
        t.vibrationAnomalyScore,
        `"${t.serviceIntervalRecommendation}"`,
        `"${t.trafficLevel}"`,
        `"${t.coordinates[0]}, ${t.coordinates[1]}"`
      ];
      content += row.join(separator) + '\r\n';
    });

    content += `\r\n`;

    // Section 2: Landfill Occupancy & Leachate Risk
    content += `--- SECTION 2: MUNICIPAL LANDFILL OCCUPANCY & ENVIRONMENTAL METRICS ---\r\n`;
    const landfillHeaders = [
      'Landfill ID',
      'Facility Name',
      'City',
      'State',
      'Current Capacity (%)',
      'Saturation Risk Level',
      'Total E-Waste Diverted to Recyclers (Tonnes)',
      'Groundwater Leachate Prevented (Liters)',
      'Nearest Collection Hub',
      'GPS Coordinates'
    ];
    content += landfillHeaders.join(separator) + '\r\n';

    LANDFILL_CLUSTERS.forEach((lf) => {
      const row = [
        `"${lf.id}"`,
        `"${lf.name}"`,
        `"${lf.city}"`,
        `"${lf.state}"`,
        lf.currentCapacityPct,
        `"${lf.riskLevel}"`,
        lf.totalEwasteDivertedTonnes,
        lf.leachatePreventedLiters,
        `"${lf.nearestCollectionHub}"`,
        `"${lf.coordinates[0]}, ${lf.coordinates[1]}"`
      ];
      content += row.join(separator) + '\r\n';
    });

    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_National_Fleet_Landfill_Telemetry_${timestamp}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage(
      `Real-time telemetry successfully exported as ${format.toUpperCase()} (${extension.toUpperCase()}) for offline analytics!`
    );
    setTimeout(() => setExportSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Export Notification Toast */}
      {exportSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            <Navigation className="w-3.5 h-3.5" />
            <span>National Spatial GIS Fleet & Landfill Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Real-Time Logistics Fleet & Landfill Spatial Grid
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Live corridor dispatch monitoring, predictive maintenance for collection trucks, and municipal landfill saturation warning alerts across Indian states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setGisHeatmapActive(!gisHeatmapActive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
              gisHeatmapActive
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{gisHeatmapActive ? 'GIS Heatmap: ON' : 'GIS Heatmap: OFF'}</span>
          </button>

          {/* Export Telemetry Metrics Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Telemetry</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1">
                <button
                  onClick={() => handleExportTelemetry('csv')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Export as CSV</div>
                    <div className="text-[10px] text-slate-400">Comma-separated values (.csv)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExportTelemetry('excel')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold">Export for Excel</div>
                    <div className="text-[10px] text-slate-400">Tab-delimited workbook (.xls)</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Fleet Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: National Fleet & Landfill Spatial Grid Map (Interactive India Map) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 relative flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>National Fleet & Landfill Spatial Grid</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Hover over state symbols to reveal real-time e-waste generation clusters & landfill buffers
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> &gt;80% Recycled
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 40-80%
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> &lt;40% Lagging
              </span>
            </div>
          </div>

          {/* Interactive Spatial Grid Canvas Container */}
          <div className="flex-1 min-h-[460px] bg-slate-950 rounded-2xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center p-4">
            {/* Ambient India Boundary Silhouette */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full max-h-[440px] select-none pointer-events-none opacity-20 stroke-slate-600 fill-slate-900/50"
            >
              {/* Generalized India outline coordinates for spatial reference */}
              <polygon points="32,8 40,12 45,18 42,26 55,30 65,34 72,40 76,46 68,52 64,60 52,70 44,88 38,82 32,70 28,58 20,44 24,32 30,20 28,12" />
            </svg>

            {/* GIS Heatmap overlay circles */}
            {gisHeatmapActive && (
              <div className="absolute inset-0 pointer-events-none">
                {/* UP Cluster */}
                <div className="absolute top-[34%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl animate-pulse" />
                {/* Delhi NCR Cluster */}
                <div className="absolute top-[30%] left-[36%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                {/* Maharashtra Cluster */}
                <div className="absolute top-[56%] left-[34%] -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-rose-500/15 blur-2xl" />
                {/* Telangana Cluster */}
                <div className="absolute top-[64%] left-[44%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl" />
                {/* Karnataka / Bengaluru */}
                <div className="absolute top-[74%] left-[36%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl" />
              </div>
            )}

            {/* State Cluster Symbols - spread out, figures/signs only, details on hover */}
            {stateNodes.map((st) => {
              const isHovered = hoveredState === st.id;
              const colorClass =
                st.rate >= 80
                  ? 'border-emerald-500/70 text-emerald-300 bg-emerald-950/80 shadow-emerald-500/20'
                  : st.rate >= 40
                  ? 'border-amber-500/70 text-amber-300 bg-amber-950/80 shadow-amber-500/20'
                  : 'border-rose-500/70 text-rose-300 bg-rose-950/80 shadow-rose-500/20';

              return (
                <div
                  key={st.id}
                  style={{ top: `${st.y}%`, left: `${st.x}%` }}
                  onMouseEnter={() => setHoveredState(st.id)}
                  onMouseLeave={() => setHoveredState(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20"
                >
                  {/* Clean circular emblem badge */}
                  <div
                    className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center font-mono font-bold text-[10px] shadow-lg backdrop-blur-md transition ${colorClass}`}
                  >
                    <span>{st.id}</span>
                    <span className="text-[8px] font-sans opacity-80">{st.rate.toFixed(0)}%</span>
                  </div>

                  {/* Tooltip on Hover - shows clear concise facts without clutter */}
                  {isHovered && (
                    <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-52 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-left z-50 pointer-events-none animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
                        <span className="text-xs font-bold text-white">{st.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{st.rate}% Rate</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Generation:</span>
                          <span className="font-mono text-white">{st.genK}K Tonnes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Trucks:</span>
                          <span className="font-mono text-cyan-400">{st.fleet} In Transit</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Landfill Status:</span>
                          <span className="text-amber-300 text-[10px]">{st.landfillRisk}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Landfill Buffer Danger Markers */}
            {LANDFILL_CLUSTERS.map((lf) => (
              <div
                key={lf.id}
                onMouseEnter={() => setHoveredLandfill(lf)}
                onMouseLeave={() => setHoveredLandfill(null)}
                style={{
                  top: lf.id === 'LF-DEL-01' ? '28%' : lf.id === 'LF-MUM-02' ? '58%' : lf.id === 'LF-BLR-03' ? '76%' : lf.id === 'LF-HYD-04' ? '66%' : lf.id === 'LF-CHE-05' ? '82%' : '48%',
                  left: lf.id === 'LF-DEL-01' ? '39%' : lf.id === 'LF-MUM-02' ? '32%' : lf.id === 'LF-BLR-03' ? '38%' : lf.id === 'LF-HYD-04' ? '46%' : lf.id === 'LF-CHE-05' ? '45%' : '23%'
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full ring-2 animate-ping opacity-75 ${
                    lf.currentCapacityPct > 90 ? 'ring-rose-500 bg-rose-500' : 'ring-amber-500 bg-amber-500'
                  }`}
                />
              </div>
            ))}

            {/* Live Hover Details Bar at Bottom of Map */}
            <div className="absolute bottom-3 inset-x-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hover blocks above to see state & landfill cluster metrics</span>
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {FLEET_TRUCKS.length} ACTIVE TRUCKS MONITORED
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Predictive Maintenance Module for Logistics Fleet */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Fleet Predictive Maintenance Engine
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-semibold uppercase">
                IoT Telemetry
              </span>
            </div>

            {/* Truck Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Active Collection Vehicle:
              </label>
              <select
                value={selectedTruck.id}
                onChange={(e) => {
                  const t = FLEET_TRUCKS.find((x) => x.id === e.target.value);
                  if (t) setSelectedTruck(t);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              >
                {FLEET_TRUCKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.vehicleNumber} ({t.driverName} - {t.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Truck Card Telemetry */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    {selectedTruck.vehicleNumber}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTruck.currentRoute}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedTruck.maintenanceAlert
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {selectedTruck.status}
                </span>
              </div>

              {/* Real-time Diagnostics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Engine Hours Run:</span>
                  <span className="text-white font-bold text-sm">{selectedTruck.engineHours} hrs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Tire Pressure:</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedTruck.tirePressurePsi < 31 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedTruck.tirePressurePsi} PSI
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Vibration Anomaly Score:</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedTruck.vibrationAnomalyScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedTruck.vibrationAnomalyScore}/100
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Past Breakdowns:</span>
                  <span className="text-white font-bold text-sm">
                    {selectedTruck.pastBreakdownCount} Incidents
                  </span>
                </div>
              </div>

              {/* Maintenance Interval Recommendation */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  selectedTruck.maintenanceAlert
                    ? 'bg-rose-950/30 border-rose-600/50 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedTruck.maintenanceAlert ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Predictive Maintenance Recommendation:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedTruck.serviceIntervalRecommendation}
                </p>
              </div>

              {/* Active Route Alert */}
              {selectedTruck.activeAlert && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{selectedTruck.activeAlert}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Landfill Saturation & Remediation Buffer Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              National Municipal Landfill E-Waste Saturation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Automated trigger prevents toxic dumping when landfill capacity breaches statutory thresholds.
            </p>
          </div>
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Hazard Alert Mode</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANDFILL_CLUSTERS.map((lf) => {
            const isCritical = lf.currentCapacityPct >= 90;
            return (
              <div
                key={lf.id}
                className={`p-4 rounded-xl border space-y-3 transition ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-600/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{lf.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {lf.city}, {lf.state}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {lf.currentCapacityPct}% CAP
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${lf.currentCapacityPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">E-Waste Diverted:</span>
                    <span className="text-emerald-400 font-bold">{lf.totalEwasteDivertedTonnes} MT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Leachate Blocked:</span>
                    <span className="text-cyan-400 font-bold">{(lf.leachatePreventedLiters / 1000).toFixed(0)}k L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
