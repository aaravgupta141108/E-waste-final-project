import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Layers,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';

export interface HotspotPrediction {
  id: string;
  region: string;
  city: string;
  state: string;
  dayOffset: number; // 1 to 7
  dayLabel: string;
  projectedWeightTonnes: number;
  surgePct: number;
  confidenceScorePct: number;
  primaryStream: string;
  secondaryStream: string;
  peakHours: string;
  recommendedFleetUnits: number;
  dispatchAssigned?: boolean;
}

const PREDICTIVE_HOTSPOTS: HotspotPrediction[] = [
  {
    id: 'HOT-NCR-01',
    region: 'NCR Okhla Phase III & Noida Sector 62',
    city: 'New Delhi / Noida',
    state: 'Delhi NCR',
    dayOffset: 1,
    dayLabel: 'Tomorrow (Day +1)',
    projectedWeightTonnes: 4.8,
    surgePct: 38,
    confidenceScorePct: 96,
    primaryStream: 'Enterprise Rack Servers & PCBs',
    secondaryStream: 'Lithium-ion Battery Modules',
    peakHours: '09:30 - 13:00 IST',
    recommendedFleetUnits: 2
  },
  {
    id: 'HOT-BLR-02',
    region: 'Bengaluru Whitefield & Electronics City Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    dayOffset: 2,
    dayLabel: 'Day +2',
    projectedWeightTonnes: 6.2,
    surgePct: 45,
    confidenceScorePct: 94,
    primaryStream: 'Corporate Laptops & NVMe Storage',
    secondaryStream: 'Silicon Wafer & SMT Assemblies',
    peakHours: '10:00 - 15:30 IST',
    recommendedFleetUnits: 3
  },
  {
    id: 'HOT-PUN-03',
    region: 'Pune Hinjawadi Infotech Zone Phase 1 & 2',
    city: 'Pune',
    state: 'Maharashtra',
    dayOffset: 3,
    dayLabel: 'Day +3',
    projectedWeightTonnes: 3.4,
    surgePct: 22,
    confidenceScorePct: 91,
    primaryStream: 'Telecom Switching Units & UPS Banks',
    secondaryStream: 'ABS Plastics & Display Panels',
    peakHours: '11:00 - 16:00 IST',
    recommendedFleetUnits: 1
  },
  {
    id: 'HOT-HYD-04',
    region: 'Hyderabad HITEC City Cyberabad Corridor',
    city: 'Hyderabad',
    state: 'Telangana',
    dayOffset: 4,
    dayLabel: 'Day +4',
    projectedWeightTonnes: 4.1,
    surgePct: 29,
    confidenceScorePct: 93,
    primaryStream: 'Data Center High-Density Blade Servers',
    secondaryStream: 'Copper Cabling & Fiber Modules',
    peakHours: '10:30 - 14:00 IST',
    recommendedFleetUnits: 2
  },
  {
    id: 'HOT-CHE-05',
    region: 'Chennai Sriperumbudur Hardware Cluster (NH-48)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    dayOffset: 5,
    dayLabel: 'Day +5',
    projectedWeightTonnes: 5.6,
    surgePct: 52,
    confidenceScorePct: 95,
    primaryStream: 'SMT Solder Scrap & Leaded Display Glass',
    secondaryStream: 'Gold-Plated Connector Pins',
    peakHours: '08:30 - 12:30 IST',
    recommendedFleetUnits: 2
  },
  {
    id: 'HOT-MUM-06',
    region: 'Mumbai Andheri East SEZ & Taloja MIDC',
    city: 'Mumbai',
    state: 'Maharashtra',
    dayOffset: 6,
    dayLabel: 'Day +6',
    projectedWeightTonnes: 3.8,
    surgePct: 18,
    confidenceScorePct: 89,
    primaryStream: 'Banking FinTech ATM Terminals',
    secondaryStream: 'POS Scanners & Thermal Printers',
    peakHours: '13:00 - 17:00 IST',
    recommendedFleetUnits: 1
  },
  {
    id: 'HOT-AMD-07',
    region: 'Ahmedabad Sanand Mega Electronic Hub',
    city: 'Ahmedabad',
    state: 'Gujarat',
    dayOffset: 7,
    dayLabel: 'Day +7',
    projectedWeightTonnes: 2.9,
    surgePct: 15,
    confidenceScorePct: 88,
    primaryStream: 'Automotive Electronic Control Units (ECUs)',
    secondaryStream: 'Rare Earth Permanent Magnets',
    peakHours: '09:00 - 13:00 IST',
    recommendedFleetUnits: 1
  }
];

export const PredictiveDemandCard: React.FC<{
  onInspectLocation?: (coords?: [number, number]) => void;
}> = ({ onInspectLocation }) => {
  const [selectedDayRange, setSelectedDayRange] = useState<'3d' | '7d'>('7d');
  const [activeHotspotId, setActiveHotspotId] = useState<string>(PREDICTIVE_HOTSPOTS[0].id);
  const [dispatchedHotspots, setDispatchedHotspots] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayedHotspots = selectedDayRange === '3d'
    ? PREDICTIVE_HOTSPOTS.slice(0, 3)
    : PREDICTIVE_HOTSPOTS;

  const activeHotspot = PREDICTIVE_HOTSPOTS.find(h => h.id === activeHotspotId) || PREDICTIVE_HOTSPOTS[0];

  const totalProjectedVolume = displayedHotspots.reduce((sum, h) => sum + h.projectedWeightTonnes, 0);
  const avgSurge = Math.round(displayedHotspots.reduce((sum, h) => sum + h.surgePct, 0) / displayedHotspots.length);

  const handlePreAllocateFleet = (hotspot: HotspotPrediction) => {
    setDispatchedHotspots(prev => ({ ...prev, [hotspot.id]: true }));
    setToastMessage(`Pre-allocation verified! Dispatched ${hotspot.recommendedFleetUnits} dedicated collection vehicles to ${hotspot.region}.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <span>Predictive Demand Hotspots</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  NEXT 7 DAYS
                </span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Heuristic projection trained on historical CPCB seasonal refresh cycles & bulk corporate intake records.
            </p>
          </div>
        </div>

        {/* Range Controls & Quick Summary */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 mr-1">
            <span>Volume: <strong className="text-emerald-400">{totalProjectedVolume.toFixed(1)} T</strong></span>
            <span>Avg Surge: <strong className="text-amber-400">+{avgSurge}%</strong></span>
          </div>

          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setSelectedDayRange('3d')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                selectedDayRange === '3d'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Next 3 Days
            </button>
            <button
              onClick={() => setSelectedDayRange('7d')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                selectedDayRange === '7d'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Floating Dispatch Alert Feedback Toast */}
      {toastMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-[10px] font-mono font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 2-Column Layout: Hotspot Horizontal Cards (Left) + Detail Telemetry / Dispatch (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left: Scrollable/Grid Hotspots List */}
        <div className="lg:col-span-7 space-y-1.5">
          {displayedHotspots.map((hotspot) => {
            const isSelected = activeHotspotId === hotspot.id;
            const isDispatched = dispatchedHotspots[hotspot.id];

            return (
              <div
                key={hotspot.id}
                onClick={() => setActiveHotspotId(hotspot.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Day Badge */}
                  <div
                    className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 font-mono text-[9px] font-bold border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span>D+{hotspot.dayOffset}</span>
                    <span className="text-[7.5px] uppercase font-sans text-slate-400">Day</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate">
                        {hotspot.region}
                      </h4>
                      <span className="text-[9px] font-mono text-cyan-400 shrink-0 font-semibold">
                        {hotspot.city}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span>Stream: {hotspot.primaryStream}</span>
                    </div>
                  </div>
                </div>

                {/* Right Metrics in Item */}
                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <div>
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      {hotspot.projectedWeightTonnes} T
                    </div>
                    <div className="text-[9px] font-mono text-amber-400 font-semibold">
                      +{hotspot.surgePct}% surge
                    </div>
                  </div>

                  {isDispatched ? (
                    <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>ALLOCATED</span>
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] font-mono border border-slate-800">
                      {hotspot.confidenceScorePct}% ML
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Hotspot Deep-Dive & Action Card */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5 text-xs">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Hotspot Intelligence • {activeHotspot.dayLabel}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {activeHotspot.region}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Jurisdiction: {activeHotspot.state}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                {activeHotspot.confidenceScorePct}% CONFIDENCE
              </span>
            </div>
          </div>

          {/* Quick Metrics 3-Col */}
          <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 font-sans block">Projected Volume</span>
              <strong className="text-xs text-white">{activeHotspot.projectedWeightTonnes} Tonnes</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 font-sans block">Historical Surge</span>
              <strong className="text-xs text-amber-400">+{activeHotspot.surgePct}%</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] text-slate-400 font-sans block">Fleet Needed</span>
              <strong className="text-xs text-cyan-400">{activeHotspot.recommendedFleetUnits} Vehicles</strong>
            </div>
          </div>

          {/* Material Category Breakdown */}
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300">Primary E-Waste Category:</span>
              <span className="font-mono text-emerald-300">{activeHotspot.primaryStream}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300">Hazardous Auxiliary:</span>
              <span className="font-mono text-amber-300">{activeHotspot.secondaryStream}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300">Peak Handover Window:</span>
              <span className="font-mono text-slate-400">{activeHotspot.peakHours}</span>
            </div>
          </div>

          {/* Pre-Allocation CTA */}
          <div className="pt-1">
            <button
              onClick={() => handlePreAllocateFleet(activeHotspot)}
              disabled={dispatchedHotspots[activeHotspot.id]}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-md ${
                dispatchedHotspots[activeHotspot.id]
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 transform hover:scale-[1.01]'
              }`}
            >
              {dispatchedHotspots[activeHotspot.id] ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fleet Pre-Allocation Scheduled</span>
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5" />
                  <span>Pre-Allocate {activeHotspot.recommendedFleetUnits} Vehicles to {activeHotspot.city}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
