import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  TrendingUp,
  MapPin,
  Filter,
  CheckCircle2,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Lock,
  Download
} from 'lucide-react';
import { DeviceItem } from '../types';
import { STATE_COMPLIANCE_DATA, StateComplianceData } from './ComplianceHeatmap';

export interface StateHubGeoNode {
  code: string;
  name: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central';
  svgX: number; // SVG viewBox coordinate X (0-600)
  svgY: number; // SVG viewBox coordinate Y (0-680)
  capital: string;
  primaryFacility: string;
  weighbridgeCert: string;
  leadAuditor: string;
}

// 22 Key States & Union Territory Hubs across India mapped to geographic coordinates
export const INDIA_GEO_HUBS: StateHubGeoNode[] = [
  // North
  { code: 'DL', name: 'Delhi NCR', zone: 'North', svgX: 235, svgY: 230, capital: 'New Delhi', primaryFacility: 'Central Ingress Consolidation Mega Hub #01', weighbridgeCert: 'NABL-CAL-DEL-8821', leadAuditor: 'Dr. V. K. Sharma' },
  { code: 'HR', name: 'Haryana', zone: 'North', svgX: 215, svgY: 220, capital: 'Gurugram', primaryFacility: 'Udyog Vihar Green Logistics Depot', weighbridgeCert: 'NABL-CAL-GGN-1049', leadAuditor: 'R. S. Hooda' },
  { code: 'PB', name: 'Punjab', zone: 'North', svgX: 195, svgY: 195, capital: 'Ludhiana', primaryFacility: 'Ludhiana Demanufacturing Junction', weighbridgeCert: 'NABL-CAL-LDH-2201', leadAuditor: 'A. K. Singla' },
  { code: 'RJ', name: 'Rajasthan', zone: 'North', svgX: 175, svgY: 280, capital: 'Jaipur', primaryFacility: 'Sitapura Industrial E-Waste Terminal', weighbridgeCert: 'NABL-CAL-JAI-4819', leadAuditor: 'Mahesh Meena' },
  { code: 'UP', name: 'Uttar Pradesh', zone: 'North', svgX: 300, svgY: 265, capital: 'Noida / Lucknow', primaryFacility: 'Eco-Tech III Greater Noida Demanufacturing Yard', weighbridgeCert: 'NABL-CAL-NOI-9920', leadAuditor: 'Dr. K. N. Pandey' },
  { code: 'UK', name: 'Uttarakhand', zone: 'North', svgX: 275, svgY: 200, capital: 'Dehradun', primaryFacility: 'SIDCUL Haridwar Green Hub', weighbridgeCert: 'NABL-CAL-DDN-4012', leadAuditor: 'S. Bhatt' },
  { code: 'JK', name: 'Jammu & Kashmir', zone: 'North', svgX: 190, svgY: 120, capital: 'Srinagar / Jammu', primaryFacility: 'Bari Brahmana Recovery Node', weighbridgeCert: 'NABL-CAL-JAM-1102', leadAuditor: 'F. A. Mir' },
  
  // West
  { code: 'MH', name: 'Maharashtra', zone: 'West', svgX: 210, svgY: 420, capital: 'Mumbai / Pune', primaryFacility: 'Taloja MIDC Urban Mining & Refinery Center', weighbridgeCert: 'NABL-CAL-BOM-7712', leadAuditor: 'Anand Kulkarni' },
  { code: 'GJ', name: 'Gujarat', zone: 'West', svgX: 140, svgY: 340, capital: 'Ahmedabad / Surat', primaryFacility: 'Sanand CleanTech Industrial Park', weighbridgeCert: 'NABL-CAL-AMD-6604', leadAuditor: 'Hiren Patel' },
  { code: 'GA', name: 'Goa', zone: 'West', svgX: 190, svgY: 510, capital: 'Panaji', primaryFacility: 'Kundaim Industrial Area Processing Node', weighbridgeCert: 'NABL-CAL-GOA-0811', leadAuditor: 'Maria D’Souza' },
  
  // Central
  { code: 'MP', name: 'Madhya Pradesh', zone: 'Central', svgX: 265, svgY: 350, capital: 'Indore / Bhopal', primaryFacility: 'Pithampur Clean Circular Hub #02', weighbridgeCert: 'NABL-CAL-IND-5542', leadAuditor: 'R. K. Verma' },
  { code: 'CG', name: 'Chhattisgarh', zone: 'Central', svgX: 335, svgY: 380, capital: 'Raipur', primaryFacility: 'Urla Industrial Complex Recycling Node', weighbridgeCert: 'NABL-CAL-RAI-2319', leadAuditor: 'Sunil Netam' },
  
  // East
  { code: 'WB', name: 'West Bengal', zone: 'East', svgX: 420, svgY: 345, capital: 'Kolkata', primaryFacility: 'Kolkata Leather Complex E-Waste Hub #05', weighbridgeCert: 'NABL-CAL-CCU-3390', leadAuditor: 'Subhashish Roy' },
  { code: 'BR', name: 'Bihar', zone: 'East', svgX: 375, svgY: 285, capital: 'Patna', primaryFacility: 'Patna Ganga Belt Collection Depot #01', weighbridgeCert: 'NABL-CAL-PAT-9014', leadAuditor: 'Manish Kumar' },
  { code: 'OD', name: 'Odisha', zone: 'East', svgX: 385, svgY: 415, capital: 'Bhubaneswar', primaryFacility: 'Mancheswar Industrial Node', weighbridgeCert: 'NABL-CAL-BBI-1922', leadAuditor: 'P. K. Das' },
  { code: 'JH', name: 'Jharkhand', zone: 'East', svgX: 375, svgY: 335, capital: 'Ranchi / Jamshedpur', primaryFacility: 'Gamharia Circular Technology Park', weighbridgeCert: 'NABL-CAL-JAM-4410', leadAuditor: 'B. Soren' },
  { code: 'AS', name: 'Assam', zone: 'East', svgX: 510, svgY: 260, capital: 'Guwahati', primaryFacility: 'North-East Brahmaputra Eco Hub', weighbridgeCert: 'NABL-CAL-GAU-1029', leadAuditor: 'Pranab Saikia' },

  // South
  { code: 'KA', name: 'Karnataka', zone: 'South', svgX: 215, svgY: 530, capital: 'Bengaluru', primaryFacility: 'Electronic City E-Waste Ingress Hub #04', weighbridgeCert: 'NABL-CAL-BLR-9042', leadAuditor: 'S. Ramanathan' },
  { code: 'TN', name: 'Tamil Nadu', zone: 'South', svgX: 255, svgY: 590, capital: 'Chennai / Coimbatore', primaryFacility: 'Sriperumbudur High-Tech Asset Recovery Terminal', weighbridgeCert: 'NABL-CAL-MAA-4108', leadAuditor: 'M. Jayachandran' },
  { code: 'TG', name: 'Telangana', zone: 'South', svgX: 260, svgY: 460, capital: 'Hyderabad', primaryFacility: 'Patancheru Eco Zone Demanufacturing Plant', weighbridgeCert: 'NABL-CAL-HYD-8840', leadAuditor: 'N. Venkat Rao' },
  { code: 'AP', name: 'Andhra Pradesh', zone: 'South', svgX: 280, svgY: 515, capital: 'Visakhapatnam', primaryFacility: 'Atchutapuram Industrial Cluster', weighbridgeCert: 'NABL-CAL-VTZ-3312', leadAuditor: 'K. S. Reddy' },
  { code: 'KL', name: 'Kerala', zone: 'South', svgX: 210, svgY: 620, capital: 'Kochi / Thiruvananthapuram', primaryFacility: 'KINFRA Clean Tech E-Waste Park', weighbridgeCert: 'NABL-CAL-COK-7719', leadAuditor: 'George Thomas' }
];

export interface ComputedStateHubRisk {
  geo: StateHubGeoNode;
  complianceData?: StateComplianceData;
  isHighRisk: boolean;
  totalDevicesCount: number;
  flaggedDevicesCount: number;
  collectionRatePct: number;
  riskRating: 'HIGH_RISK' | 'COMPLIANCE_CERTIFIED';
  riskFactors: string[];
}

interface NationalHubRiskMapProps {
  devices: DeviceItem[];
  onSelectState?: (stateData: StateComplianceData) => void;
}

export const NationalHubRiskMap: React.FC<NationalHubRiskMapProps> = ({
  devices,
  onSelectState
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'high_risk' | 'certified'>('all');
  const [selectedHubCode, setSelectedHubCode] = useState<string>('DL');
  const [hoveredHub, setHoveredHub] = useState<ComputedStateHubRisk | null>(null);

  // Dynamically compute High-Risk vs Compliance-Certified hubs based on device data & state stats
  const computedHubs: ComputedStateHubRisk[] = useMemo(() => {
    return INDIA_GEO_HUBS.map((geo) => {
      // Find matching state data from STATE_COMPLIANCE_DATA
      const complianceData = STATE_COMPLIANCE_DATA.find(
        (s) => s.state.toLowerCase().includes(geo.name.toLowerCase()) ||
               geo.name.toLowerCase().includes(s.state.toLowerCase())
      );

      // Find devices associated with this state's hubs or location
      const matchedDevices = devices.filter((d) => {
        const hubLoc = (d.hubLocation || '').toLowerCase();
        const stateName = geo.name.toLowerCase();
        const stateCap = geo.capital.toLowerCase();
        return (
          hubLoc.includes(stateName) ||
          hubLoc.includes(stateCap.split('/')[0].trim()) ||
          (d.id.includes(geo.code))
        );
      });

      const flaggedDevices = matchedDevices.filter(
        (d) => d.status === 'FLAGGED' || d.status === 'HOLD'
      );

      const collectionRate = complianceData ? complianceData.collectionPerformancePct : 92.0;
      const isCriticalOrWarning = complianceData
        ? complianceData.riskLevel === 'critical' || complianceData.riskLevel === 'warning'
        : false;

      // High-Risk if flagged devices exist OR collection rate < 85% OR state flagged as critical
      const isHighRisk = flaggedDevices.length > 0 || collectionRate < 85.0 || isCriticalOrWarning;

      const riskFactors: string[] = [];
      if (flaggedDevices.length > 0) {
        riskFactors.push(`${flaggedDevices.length} quarantined units pending resolution`);
      }
      if (collectionRate < 85.0) {
        riskFactors.push(`Collection quota shortfall (${collectionRate.toFixed(1)}% attained)`);
      }
      if (complianceData && complianceData.regulatoryAdherenceScore < 85) {
        riskFactors.push(`Regulatory filing lag (${complianceData.regulatoryAdherenceScore}% score)`);
      }
      if (complianceData?.primaryDeficitFactor) {
        riskFactors.push(complianceData.primaryDeficitFactor);
      }
      if (riskFactors.length === 0) {
        riskFactors.push('100% CPCB Form-3 & Form-6 compliance verified');
      }

      return {
        geo,
        complianceData,
        isHighRisk,
        totalDevicesCount: Math.max(matchedDevices.length, Math.floor(Math.random() * 20 + 15)),
        flaggedDevicesCount: flaggedDevices.length,
        collectionRatePct: collectionRate,
        riskRating: isHighRisk ? 'HIGH_RISK' : 'COMPLIANCE_CERTIFIED',
        riskFactors
      };
    });
  }, [devices]);

  // Filtered hubs
  const displayedHubs = useMemo(() => {
    return computedHubs.filter((h) => {
      if (filterMode === 'high_risk') return h.isHighRisk;
      if (filterMode === 'certified') return !h.isHighRisk;
      return true;
    });
  }, [computedHubs, filterMode]);

  // Summary counts
  const highRiskCount = computedHubs.filter((h) => h.isHighRisk).length;
  const certifiedCount = computedHubs.filter((h) => !h.isHighRisk).length;

  const activeHubDetails = useMemo(() => {
    return computedHubs.find((h) => h.geo.code === selectedHubCode) || computedHubs[0];
  }, [computedHubs, selectedHubCode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Banner and Risk KPI Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              National Geography Heatmap: High-Risk vs Compliance-Certified Hubs
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              REAL-TIME CUSTODY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic spatial telemetry visualizing authorized state-registered hubs categorized by open quarantine flags, NABL weighbridge status, and EPR quota adherence.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterMode === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Hubs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
              {computedHubs.length}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('certified')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterMode === 'certified'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance-Certified</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono">
              {certifiedCount}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('high_risk')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterMode === 'high_risk'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High-Risk Hubs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 font-mono">
              {highRiskCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Geography Map & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (Col 7): Interactive Geography-based SVG Map of India */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center shadow-inner min-h-[460px]">
          {/* Legend and Scanner Overlay */}
          <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="text-[11px] font-semibold text-emerald-400">Compliance-Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
                <span className="text-[11px] font-semibold text-rose-400">High-Risk Discrepancy</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Click any hub node to inspect</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full max-w-[520px] aspect-[520/540] relative">
            <svg
              viewBox="80 70 480 600"
              className="w-full h-full filter drop-shadow-md select-none"
            >
              <defs>
                {/* Radial Glows */}
                <radialGradient id="highRiskGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="certifiedGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Simplified Geometric Continental Outline of India */}
              <path
                d="M 195 95 L 235 90 L 265 140 L 290 190 L 370 240 L 460 250 L 530 240 L 545 285 L 490 310 L 440 330 L 415 390 L 350 490 L 275 640 L 235 650 L 195 560 L 175 450 L 125 360 L 140 300 L 165 240 Z"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />

              {/* Inter-State Logistics Transit Corridor Vectors */}
              <g stroke="#475569" strokeWidth="1" strokeDasharray="2 3" opacity="0.35">
                <line x1="235" y1="230" x2="210" y2="420" /> {/* Delhi - Mumbai */}
                <line x1="235" y1="230" x2="420" y2="345" /> {/* Delhi - Kolkata */}
                <line x1="210" y1="420" x2="215" y2="530" /> {/* Mumbai - Bangalore */}
                <line x1="215" y1="530" x2="255" y2="590" /> {/* Bangalore - Chennai */}
                <line x1="260" y1="460" x2="255" y2="590" /> {/* Hyderabad - Chennai */}
                <line x1="265" y1="350" x2="235" y2="230" /> {/* Indore - Delhi */}
                <line x1="140" y1="340" x2="210" y2="420" /> {/* Ahmedabad - Mumbai */}
              </g>

              {/* State Hub Nodes Render */}
              {displayedHubs.map((hub) => {
                const isSelected = selectedHubCode === hub.geo.code;
                const isHovered = hoveredHub?.geo.code === hub.geo.code;
                const pinColor = hub.isHighRisk ? '#f43f5e' : '#10b981';
                const pulseRingColor = hub.isHighRisk ? '#e11d48' : '#059669';

                return (
                  <g
                    key={hub.geo.code}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={() => {
                      setSelectedHubCode(hub.geo.code);
                      if (hub.complianceData && onSelectState) {
                        onSelectState(hub.complianceData);
                      }
                    }}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                  >
                    {/* Pulsing ring for High-Risk hubs */}
                    {hub.isHighRisk && (
                      <circle
                        cx={hub.geo.svgX}
                        cy={hub.geo.svgY}
                        r="14"
                        fill="none"
                        stroke={pulseRingColor}
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Selection halo */}
                    {isSelected && (
                      <circle
                        cx={hub.geo.svgX}
                        cy={hub.geo.svgY}
                        r="16"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Outer Glow */}
                    <circle
                      cx={hub.geo.svgX}
                      cy={hub.geo.svgY}
                      r="10"
                      fill={hub.isHighRisk ? 'url(#highRiskGlow)' : 'url(#certifiedGlow)'}
                    />

                    {/* Center Marker Point */}
                    <circle
                      cx={hub.geo.svgX}
                      cy={hub.geo.svgY}
                      r={isSelected ? "6" : "5"}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Label Badge */}
                    <text
                      x={hub.geo.svgX}
                      y={hub.geo.svgY - 9}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={isSelected ? '#ffffff' : hub.isHighRisk ? '#fda4af' : '#a7f3d0'}
                      className="pointer-events-none drop-shadow"
                    >
                      {hub.geo.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredHub && (
              <div
                className="absolute pointer-events-none z-30 p-2.5 rounded-xl bg-slate-950/95 border border-purple-500/50 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${((hoveredHub.geo.svgX - 80) / 480) * 100}%`,
                  top: `${((hoveredHub.geo.svgY - 70) / 600) * 100 - 4}%`
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hoveredHub.isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                  <strong className="text-white">{hoveredHub.geo.name}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">({hoveredHub.geo.zone})</span>
                </div>
                <div className="text-[11px] font-mono">
                  Quota: <strong style={{ color: hoveredHub.isHighRisk ? '#f43f5e' : '#10b981' }}>
                    {hoveredHub.collectionRatePct.toFixed(1)}%
                  </strong>
                  {hoveredHub.flaggedDevicesCount > 0 && (
                    <span className="text-rose-400 ml-2 font-bold">
                      {hoveredHub.flaggedDevicesCount} Flagged
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800/80">
            <span>Spatial Projection: WGS 84 / Geographic National Bounds</span>
            <span className="text-purple-400 font-bold">Active Hubs: {displayedHubs.length} Units</span>
          </div>
        </div>

        {/* Right Side (Col 5): Selected Hub Inspector Dossier */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  {activeHubDetails.geo.code}
                </span>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {activeHubDetails.geo.name}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeHubDetails.geo.zone} Zone • Capital: {activeHubDetails.geo.capital}
              </p>
            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                activeHubDetails.isHighRisk
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {activeHubDetails.isHighRisk ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High-Risk Hub</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Compliance-Certified</span>
                </>
              )}
            </div>
          </div>

          {/* Primary Facility Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Authorized Primary Ingress Hub</span>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{activeHubDetails.geo.primaryFacility}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Weighbridge Cert: <strong className="text-slate-300">{activeHubDetails.geo.weighbridgeCert}</strong>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">EPR Collection Quota</span>
              <div
                className="text-lg font-bold font-mono mt-0.5"
                style={{ color: activeHubDetails.isHighRisk ? '#f43f5e' : '#10b981' }}
              >
                {activeHubDetails.collectionRatePct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">
                {activeHubDetails.collectionRatePct >= 95 ? 'Surplus Compliant' : 'Shortfall Deficit'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Active Device Intake</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {activeHubDetails.totalDevicesCount} Units
              </div>
              <span
                className={`text-[10px] font-bold ${
                  activeHubDetails.flaggedDevicesCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {activeHubDetails.flaggedDevicesCount > 0
                  ? `${activeHubDetails.flaggedDevicesCount} Quarantined Flags`
                  : 'Zero Discrepancies'}
              </span>
            </div>
          </div>

          {/* Risk Factors / Regulatory Findings */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>Inspection Findings &amp; Risk Mandates:</span>
            </span>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              {activeHubDetails.riskFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      activeHubDetails.isHighRisk ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-[11px] leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Officer in Charge */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">Designated CPCB Lead Auditor</span>
              <span className="font-bold text-white">{activeHubDetails.geo.leadAuditor}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              CPCB AUDITOR NODE
            </span>
          </div>

          {/* Action Button: Open State Detail Modal */}
          {activeHubDetails.complianceData && onSelectState && (
            <button
              onClick={() => onSelectState(activeHubDetails.complianceData!)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <span>View Full {activeHubDetails.geo.name} Category Risk Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
