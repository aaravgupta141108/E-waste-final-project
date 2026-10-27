import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Flame,
  HardDrive,
  Cpu,
  Tv,
  FileText,
  Building,
  CheckCheck,
  Scale,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StateComplianceData, getGradientScaleColor, getGradientScaleBadge } from './ComplianceHeatmap';

interface StateComplianceDetailModalProps {
  stateData: StateComplianceData | null;
  onClose: () => void;
  onIssueShowCauseNotice?: (stateName: string) => void;
  onDeployRapidFleet?: (stateName: string) => void;
}

export const StateComplianceDetailModal: React.FC<StateComplianceDetailModalProps> = ({
  stateData,
  onClose,
  onIssueShowCauseNotice,
  onDeployRapidFleet
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'category_risks' | 'hubs'>('metrics');
  const [noticeSent, setNoticeSent] = useState(false);
  const [fleetDeployed, setFleetDeployed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!stateData) return null;

  const color = getGradientScaleColor(stateData.collectionPerformancePct);
  const badge = getGradientScaleBadge(stateData.collectionPerformancePct);

  // Mock regional category risks for this specific state
  const categoryRisks = stateData.categoryRisks || [
    {
      category: 'Lithium-Ion Battery Modules & Packs',
      riskRating: stateData.riskLevel === 'critical' ? 'CRITICAL' : 'HIGH',
      score: stateData.riskLevel === 'critical' ? 92 : 78,
      volumeMT: Math.round(stateData.actualCollectedMT * 0.22),
      unverifiedLeakagePct: stateData.riskLevel === 'critical' ? 19.4 : 8.2,
      primaryAnomaly: 'Thermal runaway vulnerability & informal cell re-potting in unregulated workshops',
      remedialMandate: 'Deploy hermetic nitrogen transit cells and certified vacuum hydrometallurgy reclamation'
    },
    {
      category: 'Enterprise Storage & Servers',
      riskRating: stateData.collectionPerformancePct < 85 ? 'HIGH' : 'MODERATE',
      score: stateData.collectionPerformancePct < 85 ? 84 : 64,
      volumeMT: Math.round(stateData.actualCollectedMT * 0.31),
      unverifiedLeakagePct: stateData.collectionPerformancePct < 85 ? 14.8 : 5.1,
      primaryAnomaly: 'Missing cryptographic NIST SP 800-88 wipe signatures prior to mechanical shearing',
      remedialMandate: 'Enforce dual-key cryptographic lock on demanufacturing dock'
    },
    {
      category: 'Cathode Ray Tubes (CRT) & Leaded Glass',
      riskRating: stateData.riskLevel === 'critical' ? 'HIGH' : 'MODERATE',
      score: stateData.riskLevel === 'critical' ? 79 : 58,
      volumeMT: Math.round(stateData.actualCollectedMT * 0.18),
      unverifiedLeakagePct: stateData.riskLevel === 'critical' ? 16.2 : 6.0,
      primaryAnomaly: 'Leaded glass cullet diversion to unauthorized ceramic tile and glaze manufacturers',
      remedialMandate: 'Mandatory mass-balance chain-of-custody tracking with primary smelters'
    },
    {
      category: 'High-Yield Printed Circuit Boards (PCBs)',
      riskRating: stateData.riskLevel === 'critical' ? 'CRITICAL' : 'MODERATE',
      score: stateData.riskLevel === 'critical' ? 88 : 66,
      volumeMT: Math.round(stateData.actualCollectedMT * 0.29),
      unverifiedLeakagePct: stateData.riskLevel === 'critical' ? 21.0 : 7.4,
      primaryAnomaly: 'Artisanal cyanide and aqua-regia acid leaching in informal urban clusters',
      remedialMandate: 'Impound illegal leaching crucibles and redirect raw boards to CPCB R-Series recyclers'
    }
  ];

  const handleSendNotice = () => {
    setNoticeSent(true);
    if (onIssueShowCauseNotice) {
      onIssueShowCauseNotice(stateData.state);
    }
    setTimeout(() => setNoticeSent(false), 4500);
  };

  const handleDeployFleet = () => {
    setFleetDeployed(true);
    if (onDeployRapidFleet) {
      onDeployRapidFleet(stateData.state);
    }
    setTimeout(() => setFleetDeployed(false), 4500);
  };

  const handleDownloadDossier = () => {
    const dossierData = {
      state: stateData.state,
      zone: stateData.zone,
      dossierGeneratedAt: new Date().toISOString(),
      statutoryAuthority: 'Central Pollution Control Board (CPCB) • Rule 13 / 14',
      collectionPerformance: {
        statutoryTargetMT: stateData.statutoryTargetMT,
        actualCollectedMT: stateData.actualCollectedMT,
        attainmentRatePct: stateData.collectionPerformancePct,
        varianceGapMT: stateData.gapMT,
        regulatoryAdherenceScorePct: stateData.regulatoryAdherenceScore,
        filingStatus: stateData.filingStatus
      },
      infrastructure: {
        registeredHubsCount: stateData.registeredHubsCount,
        activeEprRecyclers: stateData.activeEprRecyclers
      },
      rootCauseDeficitFactor: stateData.primaryDeficitFactor,
      regionalCategoryRisks: categoryRisks
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_State_Audit_Dossier_${stateData.state.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top color indicator bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl"
          style={{ backgroundColor: color }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 pt-1">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shrink-0"
              style={{ backgroundColor: color }}
            >
              <MapPin className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white"
                  style={{ backgroundColor: color }}
                >
                  {stateData.riskLevel.toUpperCase()} RISK TIER
                </span>
                <span className="text-[11px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/80 font-bold">
                  ZONE: {stateData.zone.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  FORM 3: {stateData.filingStatus}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>{stateData.state} E-Waste Audit &amp; Performance Dossier</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory CPCB Form 3 Monitoring • {stateData.registeredHubsCount} Certified Hubs • {stateData.activeEprRecyclers} Authorized Recyclers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
            title="Close Dossier Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback banners */}
        {noticeSent && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Official <strong>Statutory Rule 14 Show-Cause Notice</strong> issued to SPCB Secretariat for {stateData.state}. Notice Reference: #CPCB-SCN-{Date.now().toString().slice(-6)}.
            </span>
          </div>
        )}

        {fleetDeployed && (
          <div className="p-3.5 rounded-xl bg-purple-950/80 border border-purple-600/70 text-purple-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Rapid Mobile E-Waste Collection Fleet dispatched to high-density hubs across <strong>{stateData.state}</strong>. Fleet telemetry linked to live GIS grid.
            </span>
          </div>
        )}

        {downloadSuccess && (
          <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-600/70 text-cyan-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Regional Audit Dossier JSON downloaded successfully for offline statutory reporting.</span>
          </div>
        )}

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Collection Performance Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab('category_risks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'category_risks'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Regional Category Risks ({categoryRisks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hubs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'hubs'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Infrastructure &amp; Recyclers</span>
          </button>
        </div>

        {/* Tab 1: Collection Performance Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Statutory Quota (Mandate)</span>
                <div className="text-xl font-bold font-mono text-white">
                  {stateData.statutoryTargetMT} MT
                </div>
                <span className="text-[10px] text-slate-500">CPCB Assigned Target</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Verified Intake</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {stateData.actualCollectedMT} MT
                </div>
                <span className="text-[10px] text-slate-500">Scale-Weighed Intake</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Attainment Rate</span>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color }}
                >
                  {stateData.collectionPerformancePct.toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-500">
                  {stateData.collectionPerformancePct >= 100 ? 'Quota Surpassed' : 'Statutory Deficit'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Regulatory Adherence</span>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color: getGradientScaleColor(stateData.regulatoryAdherenceScore) }}
                >
                  {stateData.regulatoryAdherenceScore.toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-500">Form 3 / 6 Purity</span>
              </div>
            </div>

            {/* Progress Visualizer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Statutory Attainment against CPCB Baseline (100% Floor)
                </span>
                <span className="font-mono font-bold" style={{ color }}>
                  {stateData.collectionPerformancePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(stateData.collectionPerformancePct, 100)}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                <span>0 MT Verified</span>
                <span>Target: {stateData.statutoryTargetMT} MT</span>
                <span>
                  {stateData.gapMT > 0 ? `Deficit: ${stateData.gapMT} MT` : `Surplus: +${Math.abs(stateData.gapMT)} MT`}
                </span>
              </div>
            </div>

            {/* Identified Bottleneck & Root Cause Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Primary Regional Deficit Factor &amp; Leakage Bottleneck:
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {stateData.primaryDeficitFactor}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Statutory Authority: SPCB Regional Directorate &amp; MoEFCC Taskforce</span>
                <span className="font-mono text-purple-400">Rule 14 Enforcement Priority</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Regional Category Risks */}
        {activeTab === 'category_risks' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Machine-audited risk profiling of material streams across {stateData.state}. Isolates hazardous categories susceptible to informal diversion and unverified processing.
            </div>

            {categoryRisks.map((cr, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  cr.riskRating === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-600/40'
                    : cr.riskRating === 'HIGH'
                    ? 'bg-amber-950/20 border-amber-600/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {cr.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          cr.riskRating === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : cr.riskRating === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        Risk: {cr.score}/100 ({cr.riskRating})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {cr.volumeMT} MT Active • {cr.unverifiedLeakagePct}% Est. Leakage
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-rose-400">Regional Anomaly: </span>
                      <span>{cr.primaryAnomaly}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-start gap-1.5 pt-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-purple-300">Remedial Mandate: </span>
                        <span>{cr.remedialMandate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Infrastructure & Recyclers */}
        {activeTab === 'hubs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-purple-400" />
                    <span>Authorized Hubs ({stateData.registeredHubsCount})</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">100% OPERATIONAL</span>
                </div>
                <p className="text-slate-400 text-xs">
                  CPCB certified collection &amp; weighing nodes equipped with IoT weighbridges, tamper seals, and barcode tagging.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                  <div>• Primary Hub #01 ({stateData.state} Central Hub)</div>
                  <div>• Secondary Hub #02 (Transit Consolidation Dock)</div>
                  <div>• Rapid Collection Van Node #03 (Mobile Unit)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>EPR Recyclers ({stateData.activeEprRecyclers})</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">VALID CTO ACTIVE</span>
                </div>
                <p className="text-slate-400 text-xs">
                  State Pollution Control Board registered recycling and demanufacturing refineries authorized for Schedule-I items.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                  <div>• CPCB Registered EPR Refinery Alpha (Capacity: 120 MT/mo)</div>
                  <div>• Certified Pyrolysis &amp; Metal Recovery Hub Beta</div>
                  <div>• NABL Accredited Hazardous Slag Extraction Unit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadDossier}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download State Dossier (JSON)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendNotice}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Issue Rule 14 Notice</span>
            </button>

            <button
              onClick={handleDeployFleet}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Deploy Rapid Fleet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
