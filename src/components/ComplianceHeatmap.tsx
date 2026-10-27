import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  MapPin,
  Filter,
  FileSpreadsheet,
  ShieldAlert,
  Send,
  Building,
  ArrowRight,
  Info,
  Layers,
  Scale,
  Sparkles,
  Download,
  ExternalLink
} from 'lucide-react';
import { StateComplianceDetailModal } from './StateComplianceDetailModal';

export interface RegionCategoryRisk {
  category: string;
  riskRating: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  score: number;
  volumeMT: number;
  unverifiedLeakagePct: number;
  primaryAnomaly: string;
  remedialMandate: string;
}

export interface StateComplianceData {
  state: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central';
  statutoryTargetMT: number;
  actualCollectedMT: number;
  collectionPerformancePct: number;
  regulatoryAdherenceScore: number; // 0 - 100% compliance with Form 3/6 filings & audits
  gapMT: number; // shortfall if positive, surplus if negative
  riskLevel: 'critical' | 'warning' | 'compliant' | 'overperforming';
  registeredHubsCount: number;
  activeEprRecyclers: number;
  primaryDeficitFactor: string;
  filingStatus: 'CURRENT' | 'PENDING' | 'OVERDUE' | 'AUDITED';
  categoryRisks?: RegionCategoryRisk[];
}

export const STATE_COMPLIANCE_DATA: StateComplianceData[] = [
  {
    state: 'Delhi NCR',
    zone: 'North',
    statutoryTargetMT: 730,
    actualCollectedMT: 774,
    collectionPerformancePct: 106.0,
    regulatoryAdherenceScore: 98.2,
    gapMT: -44,
    riskLevel: 'overperforming',
    registeredHubsCount: 10,
    activeEprRecyclers: 16,
    primaryDeficitFactor: 'None - Surpassing CPCB Quota via Doorstep Transit & Corporate Buybacks',
    filingStatus: 'AUDITED',
    categoryRisks: [
      {
        category: 'Lithium-Ion Battery Modules & EV Cells',
        riskRating: 'HIGH',
        score: 82,
        volumeMT: 142,
        unverifiedLeakagePct: 7.4,
        primaryAnomaly: 'E-rickshaw battery repackaging in informal clusters',
        remedialMandate: 'Enforce hermetic collection bins across metro transit nodes'
      },
      {
        category: 'Telecom PCBs & Multi-Layer Motherboards',
        riskRating: 'CRITICAL',
        score: 89,
        volumeMT: 198,
        unverifiedLeakagePct: 18.2,
        primaryAnomaly: 'Informal acid leaching gold recovery in Seelampur corridor',
        remedialMandate: 'Direct all high-grade scrap to CPCB certified hydrometallurgy units'
      },
      {
        category: 'Enterprise Laptops & Solid-State Media',
        riskRating: 'MODERATE',
        score: 68,
        volumeMT: 240,
        unverifiedLeakagePct: 4.8,
        primaryAnomaly: 'Delayed decommissioning documentation from private sector IT parks',
        remedialMandate: 'Automate Form 2 API sync with corporate asset databases'
      }
    ]
  },
  {
    state: 'Karnataka',
    zone: 'South',
    statutoryTargetMT: 680,
    actualCollectedMT: 700,
    collectionPerformancePct: 102.9,
    regulatoryAdherenceScore: 97.5,
    gapMT: -20,
    riskLevel: 'overperforming',
    registeredHubsCount: 11,
    activeEprRecyclers: 17,
    primaryDeficitFactor: 'None - High Corporate IT Asset Retirement Compliance',
    filingStatus: 'CURRENT',
    categoryRisks: [
      {
        category: 'Enterprise Servers & NVMe Storage Blades',
        riskRating: 'HIGH',
        score: 79,
        volumeMT: 280,
        unverifiedLeakagePct: 6.2,
        primaryAnomaly: 'Unverified SSD firmware cryptographic wipe certificates',
        remedialMandate: 'Enforce NIST SP 800-88 Rev. 2 automated verification on dock intake'
      },
      {
        category: 'Lithium Battery Packs',
        riskRating: 'MODERATE',
        score: 68,
        volumeMT: 120,
        unverifiedLeakagePct: 5.0,
        primaryAnomaly: 'EV fleet test module end-of-life accumulation in Electronic City',
        remedialMandate: 'Direct integration with state battery recycling registry'
      }
    ]
  },
  {
    state: 'Madhya Pradesh',
    zone: 'Central',
    statutoryTargetMT: 390,
    actualCollectedMT: 402,
    collectionPerformancePct: 103.1,
    regulatoryAdherenceScore: 96.0,
    gapMT: -12,
    riskLevel: 'overperforming',
    registeredHubsCount: 6,
    activeEprRecyclers: 7,
    primaryDeficitFactor: 'Strong Municipal Segregation & Doorstep Collection Alignment',
    filingStatus: 'CURRENT',
    categoryRisks: [
      {
        category: 'Consumer White Goods & Peripherals',
        riskRating: 'LOW',
        score: 48,
        volumeMT: 180,
        unverifiedLeakagePct: 3.1,
        primaryAnomaly: 'Occasional mixed scrap in municipal secondary collection',
        remedialMandate: 'Enhance automated optical sorting at Indore Clean Hub'
      }
    ]
  },
  {
    state: 'Haryana',
    zone: 'North',
    statutoryTargetMT: 420,
    actualCollectedMT: 422,
    collectionPerformancePct: 100.5,
    regulatoryAdherenceScore: 94.8,
    gapMT: -2,
    riskLevel: 'overperforming',
    registeredHubsCount: 6,
    activeEprRecyclers: 9,
    primaryDeficitFactor: 'Streamlined Cyber Corridor IT Take-back',
    filingStatus: 'CURRENT'
  },
  {
    state: 'Maharashtra',
    zone: 'West',
    statutoryTargetMT: 760,
    actualCollectedMT: 722,
    collectionPerformancePct: 95.0,
    regulatoryAdherenceScore: 92.4,
    gapMT: 38,
    riskLevel: 'compliant',
    registeredHubsCount: 12,
    activeEprRecyclers: 16,
    primaryDeficitFactor: 'Informal Kurla & Deonar scrap diversion (5% unaccounted gap)',
    filingStatus: 'CURRENT',
    categoryRisks: [
      {
        category: 'Cathode Ray Tubes (CRT) & Lead Glass',
        riskRating: 'HIGH',
        score: 84,
        volumeMT: 160,
        unverifiedLeakagePct: 14.5,
        primaryAnomaly: 'Informal breaking of leaded funnel glass in Navi Mumbai scrapyards',
        remedialMandate: 'Strict mass-balance reconciliation with secondary lead refineries'
      },
      {
        category: 'Enterprise Data Center Hard Drives & Media',
        riskRating: 'HIGH',
        score: 81,
        volumeMT: 230,
        unverifiedLeakagePct: 9.8,
        primaryAnomaly: 'De-gauzed disks missing SHA-256 block anchor verification',
        remedialMandate: 'Audit enterprise recycling handoffs under DPDP Act guidelines'
      }
    ]
  },
  {
    state: 'Telangana',
    zone: 'South',
    statutoryTargetMT: 520,
    actualCollectedMT: 483,
    collectionPerformancePct: 92.9,
    regulatoryAdherenceScore: 89.1,
    gapMT: 37,
    riskLevel: 'warning',
    registeredHubsCount: 8,
    activeEprRecyclers: 11,
    primaryDeficitFactor: 'Delayed institutional turnover from SME electronics hubs',
    filingStatus: 'PENDING'
  },
  {
    state: 'Rajasthan',
    zone: 'North',
    statutoryTargetMT: 340,
    actualCollectedMT: 289,
    collectionPerformancePct: 85.0,
    regulatoryAdherenceScore: 82.6,
    gapMT: 51,
    riskLevel: 'warning',
    registeredHubsCount: 5,
    activeEprRecyclers: 6,
    primaryDeficitFactor: 'Dispersed rural collection hubs and lack of certified logistics',
    filingStatus: 'PENDING'
  },
  {
    state: 'Kerala',
    zone: 'South',
    statutoryTargetMT: 310,
    actualCollectedMT: 257,
    collectionPerformancePct: 82.9,
    regulatoryAdherenceScore: 84.0,
    gapMT: 53,
    riskLevel: 'warning',
    registeredHubsCount: 5,
    activeEprRecyclers: 5,
    primaryDeficitFactor: 'High household e-waste hoarding rate in coastal districts',
    filingStatus: 'PENDING'
  },
  {
    state: 'Tamil Nadu',
    zone: 'South',
    statutoryTargetMT: 580,
    actualCollectedMT: 441,
    collectionPerformancePct: 76.0,
    regulatoryAdherenceScore: 71.3,
    gapMT: 139,
    riskLevel: 'critical',
    registeredHubsCount: 7,
    activeEprRecyclers: 9,
    primaryDeficitFactor: 'Unregulated seaport warehouse storage & informal salvaging',
    filingStatus: 'OVERDUE',
    categoryRisks: [
      {
        category: 'Port Electronic Scrap & Container Transit Lots',
        riskRating: 'CRITICAL',
        score: 94,
        volumeMT: 185,
        unverifiedLeakagePct: 24.2,
        primaryAnomaly: 'Imported electronic consignments diverted before SPCB weighbridge registration',
        remedialMandate: 'Issue joint customs & SPCB mandate for 100% bonded port-side e-waste scanning'
      },
      {
        category: 'Industrial Factory Control Panels & PLCs',
        riskRating: 'HIGH',
        score: 86,
        volumeMT: 120,
        unverifiedLeakagePct: 15.6,
        primaryAnomaly: 'Automotive assembly scrap diverted to uncertified local smelters',
        remedialMandate: 'Impose statutory Form 6 transit tracking on Ambattur manufacturing corridor'
      }
    ]
  },
  {
    state: 'Gujarat',
    zone: 'West',
    statutoryTargetMT: 540,
    actualCollectedMT: 400,
    collectionPerformancePct: 74.1,
    regulatoryAdherenceScore: 73.5,
    gapMT: 140,
    riskLevel: 'critical',
    registeredHubsCount: 6,
    activeEprRecyclers: 8,
    primaryDeficitFactor: 'Informal non-ferrous metal extraction and smelting workshops',
    filingStatus: 'OVERDUE',
    categoryRisks: [
      {
        category: 'Heavy Electronic Smelting Residue & Slag',
        riskRating: 'CRITICAL',
        score: 92,
        volumeMT: 150,
        unverifiedLeakagePct: 22.8,
        primaryAnomaly: 'Artisanal copper-gold smelting releasing lead fumes in Sanand industrial belt',
        remedialMandate: 'Seal unauthorized smelting crucibles and route slag to authorized TSDF'
      },
      {
        category: 'Solar PV Panels & Inverter Modules',
        riskRating: 'HIGH',
        score: 82,
        volumeMT: 95,
        unverifiedLeakagePct: 16.4,
        primaryAnomaly: 'Damaged solar modules stored without cadmium and lead leaching containment',
        remedialMandate: 'Establish dedicated solar PV hazardous handling protocol'
      }
    ]
  },
  {
    state: 'West Bengal',
    zone: 'East',
    statutoryTargetMT: 490,
    actualCollectedMT: 328,
    collectionPerformancePct: 66.9,
    regulatoryAdherenceScore: 64.2,
    gapMT: 162,
    riskLevel: 'critical',
    registeredHubsCount: 5,
    activeEprRecyclers: 6,
    primaryDeficitFactor: 'Severe informal market leakage & lack of certified buyback centers',
    filingStatus: 'OVERDUE',
    categoryRisks: [
      {
        category: 'Consumer Television & Monitor Displays',
        riskRating: 'CRITICAL',
        score: 93,
        volumeMT: 140,
        unverifiedLeakagePct: 26.0,
        primaryAnomaly: 'Phosphor coating and mercury tube smashings in Howrah scrap yards',
        remedialMandate: 'Deploy specialized closed-loop crushing van with HEPA carbon filtration'
      }
    ]
  },
  {
    state: 'Uttar Pradesh',
    zone: 'North',
    statutoryTargetMT: 590,
    actualCollectedMT: 384,
    collectionPerformancePct: 65.1,
    regulatoryAdherenceScore: 61.8,
    gapMT: 206,
    riskLevel: 'critical',
    registeredHubsCount: 6,
    activeEprRecyclers: 5,
    primaryDeficitFactor: 'Unregistered acid leaching informal units in Moradabad-Lucknow belt',
    filingStatus: 'OVERDUE',
    categoryRisks: [
      {
        category: 'Circuit Board Acid Leaching (PCB Salvage)',
        riskRating: 'CRITICAL',
        score: 97,
        volumeMT: 210,
        unverifiedLeakagePct: 32.5,
        primaryAnomaly: 'Open-air cyanide stripping of motherboards discharging into local watersheds',
        remedialMandate: 'Immediate inter-agency enforcement operation with State Pollution Control Board'
      },
      {
        category: 'Lithium & Lead-Acid Battery Batteries',
        riskRating: 'CRITICAL',
        score: 91,
        volumeMT: 110,
        unverifiedLeakagePct: 24.0,
        primaryAnomaly: 'Informal manual battery breaking without acid neutralization',
        remedialMandate: 'Subsidized buyback program through authorized CPCB collection nodes'
      }
    ]
  },
  {
    state: 'Bihar',
    zone: 'East',
    statutoryTargetMT: 360,
    actualCollectedMT: 220,
    collectionPerformancePct: 61.1,
    regulatoryAdherenceScore: 58.4,
    gapMT: 140,
    riskLevel: 'critical',
    registeredHubsCount: 3,
    activeEprRecyclers: 3,
    primaryDeficitFactor: 'Zero certified lithium refining capacity in 300km radius',
    filingStatus: 'OVERDUE',
    categoryRisks: [
      {
        category: 'Smartphone & Mobile Device Batteries',
        riskRating: 'CRITICAL',
        score: 95,
        volumeMT: 85,
        unverifiedLeakagePct: 29.2,
        primaryAnomaly: 'Absence of secondary lithium refining facilities leads to open dumping in Ganga belt',
        remedialMandate: 'Commission green corridor inter-state transit to authorized West Bengal refinery'
      }
    ]
  }
];

export const getGradientScaleColor = (pct: number): string => {
  if (pct >= 100) return '#10b981'; // Emerald 500 (Surplus / Target Surpassed)
  if (pct >= 95) return '#06b6d4';  // Cyan 500 (Compliant / On-Track)
  if (pct >= 85) return '#f59e0b';  // Amber 500 (Moderate Shortfall)
  if (pct >= 75) return '#f97316';  // Orange 500 (Severe Deficit)
  return '#e11d48';                 // Rose 600 (Critical Statutory Failure)
};

export const getGradientScaleBadge = (pct: number) => {
  if (pct >= 100) return { label: 'SURPLUS COMPLIANT', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (pct >= 95) return { label: 'ON TRACK (≥95%)', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  if (pct >= 85) return { label: 'MODERATE SHORTFALL', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  if (pct >= 75) return { label: 'SEVERE DEFICIT', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  return { label: 'CRITICAL FAILURE (<75%)', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
};

interface ComplianceHeatmapProps {
  isCompact?: boolean;
  onSelectFullView?: () => void;
  onSelectStateModal?: (state: StateComplianceData) => void;
}

export const ComplianceHeatmap: React.FC<ComplianceHeatmapProps> = ({
  isCompact = false,
  onSelectFullView,
  onSelectStateModal
}) => {
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'warning' | 'compliant'>('all');
  const [metricView, setMetricView] = useState<'performance' | 'adherence' | 'tonnes'>('performance');
  const [selectedState, setSelectedState] = useState<StateComplianceData | null>(
    STATE_COMPLIANCE_DATA.find((d) => d.riskLevel === 'critical') || STATE_COMPLIANCE_DATA[0]
  );
  const [modalState, setModalState] = useState<StateComplianceData | null>(null);
  const [enforcementAlertSent, setEnforcementAlertSent] = useState<string | null>(null);

  const filteredData = STATE_COMPLIANCE_DATA.filter((d) => {
    if (filterZone !== 'all' && d.zone !== filterZone) return false;
    if (filterRisk === 'critical' && d.riskLevel !== 'critical') return false;
    if (filterRisk === 'warning' && d.riskLevel !== 'warning') return false;
    if (filterRisk === 'compliant' && d.riskLevel !== 'compliant' && d.riskLevel !== 'overperforming') return false;
    return true;
  });

  const totalTargetMT = filteredData.reduce((acc, d) => acc + d.statutoryTargetMT, 0);
  const totalActualMT = filteredData.reduce((acc, d) => acc + d.actualCollectedMT, 0);
  const avgPerformance = totalTargetMT > 0 ? (totalActualMT / totalTargetMT) * 100 : 0;
  const criticalCount = STATE_COMPLIANCE_DATA.filter((d) => d.riskLevel === 'critical').length;
  const totalShortfallMT = STATE_COMPLIANCE_DATA.filter((d) => d.gapMT > 0).reduce((acc, d) => acc + d.gapMT, 0);

  const handleStateClick = (state: StateComplianceData) => {
    setSelectedState(state);
    setModalState(state);
    if (onSelectStateModal) {
      onSelectStateModal(state);
    }
  };

  const handleIssueNotice = (stateName: string) => {
    setEnforcementAlertSent(stateName);
    setTimeout(() => setEnforcementAlertSent(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = [
      'State / Territory',
      'Geographic Zone',
      'CPCB Statutory Mandate (MT)',
      'Verified Collected (MT)',
      'Collection Performance (%)',
      'Regulatory Adherence Score (%)',
      'Shortfall / Surplus (MT)',
      'Risk Classification',
      'Active EPR Recyclers',
      'Authorized Hubs',
      'Filing Status',
      'Identified Bottleneck / Root Cause'
    ];

    const rows = filteredData.map((d) => [
      `"${d.state}"`,
      `"${d.zone}"`,
      d.statutoryTargetMT,
      d.actualCollectedMT,
      d.collectionPerformancePct.toFixed(1),
      d.regulatoryAdherenceScore.toFixed(1),
      d.gapMT,
      `"${d.riskLevel}"`,
      d.activeEprRecyclers,
      d.registeredHubsCount,
      `"${d.filingStatus}"`,
      `"${d.primaryDeficitFactor.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Regional_Compliance_Heatmap_Matrix_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">National Target (Q3 Mandate)</span>
          <div className="text-xl font-bold text-white mt-1">
            {totalTargetMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT</span>
          </div>
          <span className="text-[10px] text-slate-500">Statutory CPCB Quota</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">Actual Verified Collection</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {totalActualMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            {avgPerformance.toFixed(1)}% Attainment Rate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40">
          <span className="text-slate-400 text-xs">Critical Underperforming</span>
          <div className="text-xl font-bold text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>{criticalCount} States Risking Penalties</span>
          </div>
          <span className="text-[10px] text-rose-400/80">&lt;80% Quota Attainment</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40">
          <span className="text-slate-400 text-xs">Cumulative Statutory Shortfall</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {totalShortfallMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT Gap</span>
          </div>
          <span className="text-[10px] text-amber-400/80">EPR Penalty Exposure</span>
        </div>
      </div>

      {/* Main Heatmap Visualizer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Regional E-Waste Compliance Heatmap &amp; State Adherence Matrix
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                CPCB FORM 3 RULE 13(1)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click on any state card or bar below to open the <strong>Detailed Performance &amp; Device Category Risk Dossier Modal</strong>.
            </p>
          </div>

          {/* Controls: Metric Toggle, Risk Filter, Export */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setMetricView('performance')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  metricView === 'performance'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Collection Attainment (%)
              </button>
              <button
                onClick={() => setMetricView('adherence')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  metricView === 'adherence'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Adherence Index (%)
              </button>
              <button
                onClick={() => setMetricView('tonnes')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  metricView === 'tonnes'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tonnes (MT)
              </button>
            </div>

            {/* Filter by Risk */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">🚨 Critical Underperforming (&lt;80%)</option>
              <option value="warning">⚠️ Borderline / Warning (80-94%)</option>
              <option value="compliant">✅ Compliant / Surplus (≥95%)</option>
            </select>

            {/* Export Matrix CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shadow"
              title="Download regional compliance dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 🌟 VIVID CONTINUOUS GRADIENT SCALE BAR */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>CPCB Regulatory Compliance Gradient Scale</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Thresholds: &lt;70% (Critical) ➔ 80% (Deficit) ➔ 90% (Near) ➔ 100%+ (Surplus)
            </span>
          </div>

          {/* Smooth Linear Gradient Bar */}
          <div className="relative h-6 w-full rounded-lg overflow-hidden shadow-inner border border-slate-700/60"
            style={{
              background: 'linear-gradient(to right, #e11d48 0%, #f97316 25%, #f59e0b 50%, #06b6d4 75%, #10b981 100%)'
            }}
          >
            <div className="absolute inset-0 flex justify-between px-2 text-[9px] font-mono font-bold text-white drop-shadow items-center select-none">
              <span>0% - 69% CRITICAL</span>
              <span>70% - 79% SEVERE</span>
              <span>80% - 89% WARNING</span>
              <span>90% - 94% ON-TRACK</span>
              <span>≥95% - 100%+ SURPLUS</span>
            </div>
          </div>

          {/* Color Key Explanation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
              <span>&lt;70% Critical (Show-Cause)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span>70-79% Severe Deficit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span>80-89% Moderate Shortfall</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
              <span>90-94% Near Compliance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>≥95%+ Compliant / Surplus</span>
            </div>
          </div>
        </div>

        {/* State Performance Heatmap Grid (Visual Color Tiles) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              State-by-State Gradient Grid ({filteredData.length} States)
            </span>
            <span className="text-purple-400 flex items-center gap-1 font-medium">
              <span>Click any state card to open detailed performance &amp; risk modal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filteredData.map((d) => {
              const score = metricView === 'adherence' ? d.regulatoryAdherenceScore : d.collectionPerformancePct;
              const color = getGradientScaleColor(score);
              const isSelected = selectedState?.state === d.state;

              return (
                <button
                  key={d.state}
                  onClick={() => handleStateClick(d)}
                  style={{
                    borderColor: isSelected ? color : undefined,
                    boxShadow: isSelected ? `0 0 15px -3px ${color}55` : undefined
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group hover:scale-[1.02] cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 ring-2 ring-purple-500/50'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800'
                  }`}
                  title={`Click to open ${d.state} detailed collection metrics and category risk dossier`}
                >
                  {/* Top indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: color }}
                  />

                  <div className="pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-purple-300" title={d.state}>
                        {d.state}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 shrink-0 opacity-60 group-hover:opacity-100" />
                    </div>

                    <span className="text-[10px] text-slate-400 block font-mono">
                      Zone: {d.zone}
                    </span>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span
                        className="text-lg font-bold font-mono tracking-tight"
                        style={{ color }}
                      >
                        {score.toFixed(1)}%
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {metricView === 'adherence' ? 'Adherence' : 'Attainment'}
                      </span>
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400 truncate font-mono">
                      {d.actualCollectedMT} / {d.statutoryTargetMT} MT
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Bar / Attainment Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clicked = e.activePayload[0].payload as StateComplianceData;
                  handleStateClick(clicked);
                }
              }}
            >
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={10}
                domain={metricView === 'tonnes' ? [0, 850] : [0, 120]}
                unit={metricView === 'tonnes' ? ' MT' : '%'}
              />
              <YAxis
                type="category"
                dataKey="state"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                }}
                formatter={((val: any, name?: any) => {
                  if (metricView === 'performance') {
                    return [`${val}%`, 'Collection Attainment'];
                  }
                  if (metricView === 'adherence') {
                    return [`${val}%`, 'Regulatory Adherence Index'];
                  }
                  return [`${val} MT`, name === 'actualCollectedMT' ? 'Actual Collected' : 'Statutory Target'];
                }) as any}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {metricView === 'tonnes' ? (
                <>
                  <Bar
                    dataKey="statutoryTargetMT"
                    name="CPCB Statutory Mandate (MT)"
                    fill="#334155"
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                  />
                  <Bar
                    dataKey="actualCollectedMT"
                    name="Actual Verified Intake (MT)"
                    radius={[0, 6, 6, 0]}
                    barSize={14}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getGradientScaleColor(entry.collectionPerformancePct)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </>
              ) : metricView === 'adherence' ? (
                <>
                  <ReferenceLine
                    x={90}
                    stroke="#06b6d4"
                    strokeDasharray="3 3"
                    label={{ value: '90% Benchmark', fill: '#06b6d4', fontSize: 10, position: 'top' }}
                  />
                  <Bar
                    dataKey="regulatoryAdherenceScore"
                    name="Regulatory Adherence Score (%)"
                    radius={[0, 6, 6, 0]}
                    barSize={16}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-adh-${index}`}
                        fill={getGradientScaleColor(entry.regulatoryAdherenceScore)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </>
              ) : (
                <>
                  <ReferenceLine
                    x={100}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: '100% Target', fill: '#10b981', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    x={80}
                    stroke="#e11d48"
                    strokeDasharray="3 3"
                    label={{ value: '80% Critical Floor', fill: '#e11d48', fontSize: 10, position: 'bottom' }}
                  />
                  <Bar
                    dataKey="collectionPerformancePct"
                    name="Collection Attainment Rate (%)"
                    radius={[0, 6, 6, 0]}
                    barSize={16}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-perf-${index}`}
                        fill={getGradientScaleColor(entry.collectionPerformancePct)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected State Summary Bar with Button to Open Modal */}
      {selectedState && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                style={{ backgroundColor: getGradientScaleColor(selectedState.collectionPerformancePct) }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>State of {selectedState.state}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-white"
                    style={{ backgroundColor: getGradientScaleColor(selectedState.collectionPerformancePct) }}
                  >
                    {selectedState.riskLevel}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Zone: {selectedState.zone} • {selectedState.registeredHubsCount} Hubs • {selectedState.activeEprRecyclers} Recyclers
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalState(selectedState)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <span>Open Detailed Metrics &amp; Risk Dossier Modal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">CPCB Mandate (Quota)</span>
              <div className="text-base font-bold font-mono text-white">{selectedState.statutoryTargetMT} MT</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Verified Collected</span>
              <div className="text-base font-bold font-mono text-emerald-400">{selectedState.actualCollectedMT} MT</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Attainment Rate</span>
              <div
                className="text-base font-bold font-mono"
                style={{ color: getGradientScaleColor(selectedState.collectionPerformancePct) }}
              >
                {selectedState.collectionPerformancePct.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Regulatory Adherence</span>
              <div
                className="text-base font-bold font-mono"
                style={{ color: getGradientScaleColor(selectedState.regulatoryAdherenceScore) }}
              >
                {selectedState.regulatoryAdherenceScore.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State Compliance Table Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              State Attainment &amp; Regulatory Adherence Registry ({filteredData.length} States)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click 'Inspect' or Row to Open Full Risk Modal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">State &amp; Territory</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Quota (MT)</th>
                <th className="py-2.5 px-3">Actual (MT)</th>
                <th className="py-2.5 px-3">Attainment %</th>
                <th className="py-2.5 px-3">Adherence Score</th>
                <th className="py-2.5 px-3">Variance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.map((d) => {
                const perfColor = getGradientScaleColor(d.collectionPerformancePct);
                const isSelected = selectedState?.state === d.state;

                return (
                  <tr
                    key={d.state}
                    onClick={() => handleStateClick(d)}
                    className={`hover:bg-slate-800/40 transition cursor-pointer ${
                      isSelected ? 'bg-slate-800/60' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: perfColor }}
                        />
                        <span>{d.state}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{d.zone}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{d.statutoryTargetMT} MT</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{d.actualCollectedMT} MT</td>
                    <td className="py-3 px-3 font-mono font-bold" style={{ color: perfColor }}>
                      {d.collectionPerformancePct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold" style={{ color: getGradientScaleColor(d.regulatoryAdherenceScore) }}>
                      {d.regulatoryAdherenceScore.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {d.gapMT > 0 ? (
                        <span className="text-rose-400 font-bold">-{d.gapMT} MT</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">+{Math.abs(d.gapMT)} MT</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white"
                        style={{ backgroundColor: perfColor }}
                      >
                        {d.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStateClick(d);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition flex items-center gap-1 ml-auto"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Detailed Risk Modal */}
      {modalState && (
        <StateComplianceDetailModal
          stateData={modalState}
          onClose={() => setModalState(null)}
          onIssueShowCauseNotice={(name) => handleIssueNotice(name)}
        />
      )}
    </div>
  );
};
