import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  FileWarning,
  Flame,
  HardDrive,
  Tv,
  Cpu,
  Layers,
  ArrowRight,
  Download,
  Filter,
  CheckCheck,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { DeviceItem } from '../types';

export interface HighRiskCategory {
  id: string;
  categoryName: string;
  riskScore: number; // 0 - 100
  riskTier: 'critical' | 'high' | 'moderate';
  icon: 'flame' | 'hard-drive' | 'tv' | 'cpu';
  affectedVolumeMT: number;
  flaggedCount: number;
  anomalyDrivers: string[];
  statutoryExposure: string;
  remediationRecommendation: string;
  cpcbRuleReference: string;
}

export interface FilingInconsistency {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'warning';
  affectedCorridor: string;
  detectedDiscrepancy: string;
  statutoryRule: string;
  recurrenceCount: number;
  remediationAction: string;
  financialPenaltyExposure: string;
}

interface AuditInsightsCardProps {
  devices?: DeviceItem[];
  onFilterFlaggedDevices?: () => void;
}

export const AuditInsightsCard: React.FC<AuditInsightsCardProps> = ({
  devices = [],
  onFilterFlaggedDevices
}) => {
  const [activeTab, setActiveTab] = useState<'high_risk' | 'filing_inconsistencies'>('high_risk');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'moderate'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedTime, setLastScannedTime] = useState<string>('Just now');
  const [issuedDirectiveId, setIssuedDirectiveId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Mock analytic model high-risk device categories
  const highRiskCategories: HighRiskCategory[] = [
    {
      id: 'CAT-LITHIUM-CELLS',
      categoryName: 'Lithium-Ion Battery Packs & EV Energy Modules',
      riskScore: 92,
      riskTier: 'critical',
      icon: 'flame',
      affectedVolumeMT: 48.6,
      flaggedCount: 18,
      anomalyDrivers: [
        '18.4% thermal degradation index detected on uncertified second-life packs',
        'Informal cobalt & nickel leaching diversion in secondary urban scrapyards',
        'Missing certified vacuum pyrolysis extraction logs prior to shredder intake'
      ],
      statutoryExposure: 'High fire propagation risk & heavy metal bioaccumulation hazard',
      remediationRecommendation: 'Mandate hermetic argon-purged containers during transit & deploy automated IR thermal scanning at hub reception.',
      cpcbRuleReference: 'CPCB E-Waste Rules 2022 Schedule I(v) & Battery Waste Management Rules 2022'
    },
    {
      id: 'CAT-ENTERPRISE-MEDIA',
      categoryName: 'Enterprise Servers, Laptops & Solid-State Media',
      riskScore: 86,
      riskTier: 'high',
      icon: 'hard-drive',
      affectedVolumeMT: 34.2,
      flaggedCount: 14,
      anomalyDrivers: [
        '14.2% missing NIST SP 800-88 Rev. 2 cryptographic wipe certificates before demanufacturing',
        'NVMe controller firmware sanitization unverified in corporate asset retirement batches',
        'Potential data residue on decommissioned banking and healthcare drives'
      ],
      statutoryExposure: 'Data Protection DPDP Act 2023 breach liability & corporate EPR non-compliance',
      remediationRecommendation: 'Impose dual-key cryptographic clearance lock preventing mechanical shearing until SHA-256 wipe hash is anchored.',
      cpcbRuleReference: 'DPDP Act 2023 Section 8(7) & CPCB E-Waste Guidelines Section 4.3'
    },
    {
      id: 'CAT-CRT-LEAD-GLASS',
      categoryName: 'Cathode Ray Tube (CRT) & Lead-Glass Displays',
      riskScore: 81,
      riskTier: 'high',
      icon: 'tv',
      affectedVolumeMT: 62.8,
      flaggedCount: 12,
      anomalyDrivers: [
        '6.8 MT leaded glass cullet unaccounted for between dismantler and ceramic smelting kiln',
        'Phosphor coating sludge chemical analysis missing in 4 regional shipment manifests',
        'Weight-to-recovery yield variance exceeding allowable 5% CPCB baseline'
      ],
      statutoryExposure: 'Hazardous leachable lead (Pb) release exceeding 5.0 mg/L TCLP ceiling',
      remediationRecommendation: 'Order mandatory mass-balance reconciliation audit of authorized lead smelter downstream partners.',
      cpcbRuleReference: 'CPCB Hazardous Waste Rules Schedule II & E-Waste Schedule I(b)'
    },
    {
      id: 'CAT-PCB-ASSEMBLIES',
      categoryName: 'Printed Circuit Boards & Telecom Base Stations',
      riskScore: 73,
      riskTier: 'moderate',
      icon: 'cpu',
      affectedVolumeMT: 94.1,
      flaggedCount: 8,
      anomalyDrivers: [
        'Informal acid-leaching gold stripping diversion suspected in Northern scrap corridor',
        'Discrepancy between declared precious metal assay yields and verified refinery outputs',
        'Delayed CTO (Consent to Operate) renewal for 2 secondary hydrometallurgy facilities'
      ],
      statutoryExposure: 'Toxic cyanide and aqua regia effluent discharge risks in unregulated clusters',
      remediationRecommendation: 'Require accredited third-party NABL lab assay certificate before releasing transferable EPR credits.',
      cpcbRuleReference: 'Water & Air Pollution Acts Section 25 & CPCB EPR Protocol Rule 13'
    }
  ];

  // Mock analytic model recurring regulatory filing inconsistencies
  const filingInconsistencies: FilingInconsistency[] = [
    {
      id: 'INC-SCALE-DRIFT',
      title: 'Gross Weighbridge Intake vs Schedule-I Consignor Declaration Drift',
      severity: 'critical',
      affectedCorridor: 'Delhi NCR — Haryana & UP Inter-State Transit Corridors',
      detectedDiscrepancy: '13.4% average weight shortfall between consignor gate dispatch manifest and recycling weighbridge scale logs across 8 consecutive bulk dispatches.',
      statutoryRule: 'CPCB Form 6 Transit Manifest Rule 13(1)(ix)',
      recurrenceCount: 8,
      remediationAction: 'Enforce calibrated digital tamper seals with GPS geofence tracking on all inter-hub fleet trailers.',
      financialPenaltyExposure: '₹42,00,000 potential environmental compensation levy under Rule 22'
    },
    {
      id: 'INC-EPR-DUAL-CLAIM',
      title: 'Dual-State EPR Credit Overlap in SPCB Parivesh Portals',
      severity: 'high',
      affectedCorridor: 'Maharashtra — Karnataka SPCB Inter-State EPR Registry',
      detectedDiscrepancy: '3 authorized recyclers filed overlapping device batch serial numbers, claiming duplicate credits amounting to 45 Metric Tonnes.',
      statutoryRule: 'MoEFCC Amendment G.S.R. 699(E) & CPCB Centralized EPR Portal Mandate',
      recurrenceCount: 3,
      remediationAction: 'Freeze provisional credit exchange tokens until multi-state cryptographic hash cross-reconciliation completes.',
      financialPenaltyExposure: 'Revocation of Recycler Authorization & ₹65,00,000 forfeiture bond'
    },
    {
      id: 'INC-NIST-INCOMPLETE',
      title: 'Cryptographic NIST SP 800-88 Data Sanitization Proof Void',
      severity: 'high',
      affectedCorridor: 'Bengaluru Tech Corridor & Hyderabad Cyber Hub',
      detectedDiscrepancy: '19 enterprise IT consignments marked as "Wiped" in manifest but missing tamper-proof SHA-256 verification hash and engineer digital signature.',
      statutoryRule: 'Digital Personal Data Protection (DPDP) Act 2023 & CPCB Safe Processing Protocol',
      recurrenceCount: 19,
      remediationAction: 'Lock demanufacturing workflow. Automatically route non-anchored devices to physical degaussing quarantine.',
      financialPenaltyExposure: 'Regulatory non-compliance citation + mandatory re-audit cost'
    },
    {
      id: 'INC-STORAGE-CEILING',
      title: '180-Day Statutory Hazardous Slag & Residue Storage Limit Exceeded',
      severity: 'warning',
      affectedCorridor: 'Sanand Industrial Cluster (Gujarat) & Ambattur (Tamil Nadu)',
      detectedDiscrepancy: '2 secondary processing hubs holding crushed lithium cell slag and CRT lead glass beyond the 180-day statutory threshold (current age: 194 days).',
      statutoryRule: 'E-Waste (Management) Rules 2022 Rule 15 Storage Ceiling',
      recurrenceCount: 2,
      remediationAction: 'Issue immediate 48-hour evacuation directive to authorized Treatment, Storage and Disposal Facilities (TSDF).',
      financialPenaltyExposure: '₹12,50,000 SPCB storage non-compliance fine per day of excess'
    }
  ];

  const handleRunDiagnosticSweep = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScannedTime('Just now');
    }, 1200);
  };

  const handleIssueDirective = (id: string) => {
    setIssuedDirectiveId(id);
    setTimeout(() => setIssuedDirectiveId(null), 4000);
  };

  const handleDownloadDossier = () => {
    const reportData = {
      reportTitle: 'CPCB Regulatory Audit Insights & Risk Analytics Dossier',
      timestamp: new Date().toISOString(),
      analyticModelVersion: 'MoEFCC Parivesh Compliance Sentinel v4.2',
      compositeRiskScore: 78,
      status: 'ELEVATED STATUTORY EXPOSURE',
      highRiskCategories,
      filingInconsistencies,
      totalFlaggedDevices: devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Audit_Insights_Risk_Dossier_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const filteredCategories = highRiskCategories.filter((c) => {
    if (severityFilter === 'all') return true;
    return c.riskTier === severityFilter;
  });

  const filteredInconsistencies = filingInconsistencies.filter((i) => {
    if (severityFilter === 'all') return true;
    return i.severity === severityFilter;
  });

  return (
    <div className="bg-slate-900 border border-purple-900/40 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Analytic Model Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>CPCB ANALYTIC MODEL v4.2</span>
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model Confidence: 99.4% (Calibrated on 42,000+ Filings)</span>
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span>Audit Insights &amp; Regulatory Risk Intelligence</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
            Autonomous multi-vector compliance analysis. Identifies hazardous device material streams vulnerable to informal diversion and pinpoints recurring statutory filing discrepancies across Schedule-I declarations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRunDiagnosticSweep}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2 shadow"
            title="Re-run predictive algorithm against latest intake ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing Ledger...' : 'Run Anomaly Sweep'}</span>
          </button>

          <button
            onClick={handleDownloadDossier}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Risk Dossier</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Statutory Audit Insights Dossier downloaded successfully for offline regulatory review.</span>
        </div>
      )}

      {/* Primary Analytic Risk Gauge Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Composite Risk Index</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            78 <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-rose-400/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Elevated Statutory Exposure</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>High-Risk Stream Vol.</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            239.7 <span className="text-xs font-normal text-slate-400">MT</span>
          </div>
          <div className="text-[10px] text-slate-400">
            4 Priority E-Waste Categories
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Recurring Filing Gaps</span>
            <FileWarning className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            4 <span className="text-xs font-normal text-slate-400">Patterns</span>
          </div>
          <div className="text-[10px] text-slate-400">
            32 Cross-State Inconsistencies
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Penalty Exposure</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ₹1.84 <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <div className="text-[10px] text-rose-400/80">
            E-Waste Rule 22 Liability
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('high_risk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'high_risk'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>High-Risk Device Categories ({highRiskCategories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('filing_inconsistencies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'filing_inconsistencies'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5 text-rose-400" />
            <span>Filing Inconsistencies ({filingInconsistencies.length})</span>
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Risk Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Risk Tiers</option>
            <option value="critical">🚨 Critical Risk</option>
            <option value="high">⚠️ High Risk</option>
            <option value="moderate">ℹ️ Moderate Risk</option>
          </select>
        </div>
      </div>

      {/* Tab 1: High-Risk Device Categories */}
      {activeTab === 'high_risk' && (
        <div className="space-y-3.5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                cat.riskTier === 'critical'
                  ? 'bg-rose-950/20 border-rose-600/40'
                  : cat.riskTier === 'high'
                  ? 'bg-amber-950/20 border-amber-600/40'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      cat.riskTier === 'critical'
                        ? 'bg-rose-600 text-white'
                        : cat.riskTier === 'high'
                        ? 'bg-amber-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {cat.icon === 'flame' && <Flame className="w-5 h-5" />}
                    {cat.icon === 'hard-drive' && <HardDrive className="w-5 h-5" />}
                    {cat.icon === 'tv' && <Tv className="w-5 h-5" />}
                    {cat.icon === 'cpu' && <Cpu className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {cat.categoryName}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          cat.riskTier === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : cat.riskTier === 'high'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        Risk Score: {cat.riskScore}/100 ({cat.riskTier.toUpperCase()})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {cat.affectedVolumeMT} MT Vol. • {cat.flaggedCount} Units Held
                      </span>
                    </div>

                    {/* Anomaly Drivers List */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-semibold text-slate-300 block">
                        Surface Anomaly Drivers:
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-slate-400 text-xs">
                        {cat.anomalyDrivers.map((driver, dIdx) => (
                          <li key={dIdx} className="leading-snug">{driver}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Statutory Recommendation */}
                    <div className="pt-2 text-xs flex items-start gap-2 text-slate-300">
                      <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-purple-300">Remediation Protocol: </span>
                        <span>{cat.remediationRecommendation}</span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          Statutory Authority: {cat.cpcbRuleReference}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Directive Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleIssueDirective(cat.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Issue SPCB Directive</span>
                  </button>
                  {onFilterFlaggedDevices && (
                    <button
                      onClick={onFilterFlaggedDevices}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>Filter Registry</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {issuedDirectiveId === cat.id && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Emergency Regulatory Directive dispatched for <strong>{cat.categoryName}</strong>. Tracking ref: #CPCB-DIR-{Date.now().toString().slice(-6)}.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Recurring Regulatory Filing Inconsistencies */}
      {activeTab === 'filing_inconsistencies' && (
        <div className="space-y-3.5">
          {filteredInconsistencies.map((inc) => (
            <div
              key={inc.id}
              className={`p-4 rounded-xl border transition-all ${
                inc.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-600/40'
                  : inc.severity === 'high'
                  ? 'bg-amber-950/20 border-amber-600/40'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        inc.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : inc.severity === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {inc.severity.toUpperCase()} INCONSISTENCY
                    </span>
                    <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      Recurrence: {inc.recurrenceCount} Cases
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Corridor: {inc.affectedCorridor}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {inc.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-rose-400">Discrepancy: </span>
                    {inc.detectedDiscrepancy}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Prescribed Statutory Remediation:</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {inc.statutoryRule}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      {inc.remediationAction}
                    </p>
                    <div className="text-[11px] text-amber-400 font-mono pt-1">
                      Statutory Penalty Exposure: {inc.financialPenaltyExposure}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleIssueDirective(inc.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Issue Rectification Notice</span>
                  </button>
                </div>
              </div>

              {issuedDirectiveId === inc.id && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Statutory Rectification Notice served under Rule 14. Rectification docket ID: #RECT-2026-{Date.now().toString().slice(-5)}.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>Model Last Updated: {lastScannedTime}</span>
          <span>•</span>
          <span>Algorithms: K-Means Anomaly Cluster &amp; Random Forest Classifier</span>
        </div>
        <span className="font-mono text-purple-400">
          MoEFCC Rule 13(1) Automated Compliance Engine
        </span>
      </div>
    </div>
  );
};
