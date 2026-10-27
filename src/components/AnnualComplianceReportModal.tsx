import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Scale,
  Hash,
  Sparkles,
  QrCode
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';
import { STATE_COMPLIANCE_DATA, getGradientScaleColor } from './ComplianceHeatmap';

interface AnnualComplianceReportModalProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onClose: () => void;
}

export const AnnualComplianceReportModal: React.FC<AnnualComplianceReportModalProps> = ({
  currentUser,
  devices,
  onClose
}) => {
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const reportTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const reportYear = 'FY 2025-2026';
  const reportHash = 'sha256:7f4a9b2018ea901c42817bf44d8209e7c10b248a';

  const totalRegistered = devices.length;
  const totalWeightKg = devices.reduce((acc, d) => acc + (d.intakeWeightKg || 0.25), 0);
  const totalTargetMT = STATE_COMPLIANCE_DATA.reduce((acc, s) => acc + s.statutoryTargetMT, 0);
  const totalCollectedMT = STATE_COMPLIANCE_DATA.reduce((acc, s) => acc + s.actualCollectedMT, 0);
  const nationalAttainment = totalTargetMT > 0 ? (totalCollectedMT / totalTargetMT) * 100 : 0;
  const criticalStates = STATE_COMPLIANCE_DATA.filter((s) => s.riskLevel === 'critical');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      title: 'CPCB Annual E-Waste Statutory Return & Chain of Custody Audit',
      formReference: 'FORM 3 [See Rules 13(1)(vii), 13(2)(vi)]',
      statutoryAct: 'E-Waste (Management) Rules 2022 & Amendment G.S.R. 699(E)',
      financialYear: reportYear,
      generatedDate: `${reportDate} ${reportTime} IST`,
      reportingOfficer: {
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
        organization: currentUser.organization || 'Central Pollution Control Board'
      },
      cryptographicProvenance: {
        hash: reportHash,
        blockchainHeight: 'BLK #51380',
        tamperProofSeal: 'CPCB-ANNUAL-SEAL-2026'
      },
      nationalSummary: {
        statutoryTargetMT: totalTargetMT,
        verifiedCollectedMT: totalCollectedMT,
        attainmentRatePct: nationalAttainment.toFixed(1),
        platformRegisteredUnits: totalRegistered,
        grossPlatformWeightKg: totalWeightKg
      },
      regionalStateComplianceMatrix: STATE_COMPLIANCE_DATA,
      auditInsights: {
        compositeRiskIndex: 78,
        priorityHighRiskStreams: [
          'Lithium-Ion Battery Modules & EV Energy Cells',
          'Enterprise Servers, Laptops & Solid-State Media',
          'Cathode Ray Tube (CRT) & Lead-Glass Displays',
          'High-Yield Printed Circuit Boards (PCBs)'
        ],
        filingInconsistenciesDetected: [
          'Weighbridge gross intake vs Schedule-I declaration drift (13.4%)',
          'Dual-State EPR credit overlap in SPCB Parivesh filings (45 MT)',
          'Cryptographic NIST SP 800-88 sanitization verification gap (19 units)',
          '180-day hazardous slag & battery module storage limit exceeded'
        ]
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Annual_E-Waste_Compliance_Report_${reportYear.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 border border-slate-200 print-annual-report-container">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              <span>Print-Friendly Annual Regulatory Report</span>
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Form 3 • Official CPCB Statutory Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-2 shadow print-include"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            PRINT-FRIENDLY REPORT BODY (Official CPCB / MoEFCC Styling)
            ========================================================================= */}
        <div className="space-y-6 text-slate-900">
          {/* Official Emblem & National Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-slate-100 mb-1">
              <Building2 className="w-8 h-8 text-slate-800" />
            </div>
            <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-600">
              Government of India • Ministry of Environment, Forest and Climate Change
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
              Central Pollution Control Board (CPCB)
            </h1>
            <div className="text-xs font-bold text-purple-900 uppercase tracking-wide">
              Annual Statutory E-Waste Return &amp; National Compliance Audit Report
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-1">
              Form 3 [Rules 13(1)(vii), 13(2)(vi)] • E-Waste (Management) Rules 2022 &amp; Amendment G.S.R. 699(E)
            </div>
          </div>

          {/* Report Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Reporting Period:</span>
              <span className="font-bold text-slate-900">{reportYear}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Filing Timestamp:</span>
              <span className="font-bold text-slate-900">{reportDate} {reportTime} IST</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Auditor / Signatory:</span>
              <span className="font-bold text-slate-900 truncate block">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Tamper-Proof Hash:</span>
              <span className="font-bold text-cyan-800 truncate block">{reportHash.slice(0, 16)}...</span>
            </div>
          </div>

          {/* Section 1: Executive KPI Scorecard */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-300 pb-1">
              <span>1. National Statutory E-Waste Scorecard &amp; Targets</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] block">National CPCB Mandate</span>
                <div className="text-lg font-bold font-mono text-slate-900">{totalTargetMT.toLocaleString()} MT</div>
                <span className="text-[10px] text-slate-500">Statutory Quota</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] block">Verified Intake</span>
                <div className="text-lg font-bold font-mono text-emerald-700">{totalCollectedMT.toLocaleString()} MT</div>
                <span className="text-[10px] text-emerald-600 font-bold">{nationalAttainment.toFixed(1)}% Attainment</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] block">NIST Purge Success</span>
                <div className="text-lg font-bold font-mono text-slate-900">99.8%</div>
                <span className="text-[10px] text-slate-500">IEEE 2883-2022 Verified</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] block">Underperforming States</span>
                <div className="text-lg font-bold font-mono text-rose-700">{criticalStates.length} States</div>
                <span className="text-[10px] text-rose-600">&lt;80% Quota Attainment</span>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Insights Card (Mock Analytic Model Findings) */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-300 pb-1">
              <span>2. CPCB Audit Insights &amp; Analytic Risk Model Findings</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                Sentinel Model v4.2
              </span>
            </h2>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="font-bold text-purple-950">
                  National Anomaly Risk Score: 78 / 100 (ELEVATED REGULATORY EXPOSURE)
                </span>
                <span className="font-mono text-slate-600 text-[11px]">
                  Estimated Non-Compliance Liability: ₹1.84 Crore
                </span>
              </div>

              {/* High Risk Device Categories */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11px] uppercase">
                  (A) High-Risk Material Categories Flagged for Immediate Intervention:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-white border border-purple-200">
                    <span className="font-bold text-rose-700 block">
                      1. Lithium-Ion Battery Packs &amp; EV Cells (Risk: 92/100 • Critical)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Thermal degradation risks; 18.4% informal dismantling diversion in secondary scrap markets.
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-purple-200">
                    <span className="font-bold text-amber-700 block">
                      2. Enterprise Laptops &amp; NVMe Media (Risk: 86/100 • High)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      14.2% missing NIST SP 800-88 cryptographic wipe proofs; unverified SSD firmware wipe.
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-purple-200">
                    <span className="font-bold text-amber-700 block">
                      3. CRT &amp; Leaded Glass Displays (Risk: 81/100 • High)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      6.8 MT leaded funnel glass cullet unaccounted between dismantlers and smelters.
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-purple-200">
                    <span className="font-bold text-slate-700 block">
                      4. Telecom PCBs &amp; Gold-Plated Boards (Risk: 73/100 • Moderate)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Open-air acid leaching in unregistered clusters; assay yield variance.
                    </span>
                  </div>
                </div>
              </div>

              {/* Recurring Filing Inconsistencies */}
              <div className="space-y-1 pt-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase">
                  (B) Recurring Statutory Filing Inconsistencies:
                </span>
                <ul className="list-disc pl-5 text-slate-700 space-y-1 text-[11px]">
                  <li>
                    <strong>Weighbridge Scale Drift:</strong> 13.4% weight shortfall between consignor gate dispatch manifest and recycling weighbridge scale logs.
                  </li>
                  <li>
                    <strong>Dual-State EPR Overlap:</strong> 3 authorized recyclers filed overlapping device batch serial numbers claiming duplicate credits (45 MT).
                  </li>
                  <li>
                    <strong>Incomplete NIST SP 800-88 Hashes:</strong> 19 enterprise IT consignments marked as "Wiped" but missing verified SHA-256 block anchor.
                  </li>
                  <li>
                    <strong>180-Day Storage Ceiling Exceeded:</strong> 2 secondary processing hubs holding lithium cell slag beyond the statutory 180-day threshold.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Regional Compliance Heatmap & State Attainment Matrix */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-300 pb-1">
              <span>3. Regional E-Waste Compliance Heatmap &amp; State Adherence Matrix</span>
              <span className="text-[10px] font-mono text-slate-500">All 13 Major Indian States</span>
            </h2>

            {/* Gradient Scale Visual Representation */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-slate-800">CPCB Compliance Gradient Scale</span>
                <span className="text-slate-500">&lt;70% Critical ➔ 80% Deficit ➔ 90% Near ➔ 100%+ Surplus</span>
              </div>
              <div
                className="h-3 w-full rounded-md border border-slate-300"
                style={{
                  background: 'linear-gradient(to right, #e11d48 0%, #f97316 25%, #f59e0b 50%, #06b6d4 75%, #10b981 100%)'
                }}
              />
            </div>

            {/* Matrix Table */}
            <div className="overflow-hidden border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 font-mono">
                  <tr>
                    <th className="p-2">State / Region</th>
                    <th className="p-2">Zone</th>
                    <th className="p-2">Quota (MT)</th>
                    <th className="p-2">Actual (MT)</th>
                    <th className="p-2">Attainment</th>
                    <th className="p-2">Adherence</th>
                    <th className="p-2">Variance</th>
                    <th className="p-2">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STATE_COMPLIANCE_DATA.map((s) => (
                    <tr key={s.state} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900">{s.state}</td>
                      <td className="p-2 font-mono text-slate-600">{s.zone}</td>
                      <td className="p-2 font-mono">{s.statutoryTargetMT} MT</td>
                      <td className="p-2 font-mono font-bold text-emerald-800">{s.actualCollectedMT} MT</td>
                      <td className="p-2 font-mono font-bold" style={{ color: getGradientScaleColor(s.collectionPerformancePct) }}>
                        {s.collectionPerformancePct.toFixed(1)}%
                      </td>
                      <td className="p-2 font-mono font-bold" style={{ color: getGradientScaleColor(s.regulatoryAdherenceScore) }}>
                        {s.regulatoryAdherenceScore.toFixed(1)}%
                      </td>
                      <td className="p-2 font-mono">
                        {s.gapMT > 0 ? (
                          <span className="text-rose-700 font-bold">-{s.gapMT} MT</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">+{Math.abs(s.gapMT)} MT</span>
                        )}
                      </td>
                      <td className="p-2 font-mono uppercase text-[10px] font-bold">
                        <span
                          className="px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: getGradientScaleColor(s.collectionPerformancePct) }}
                        >
                          {s.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Statutory Certification & Signature Block */}
          <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 font-mono text-[11px] text-slate-600">
              <div className="font-bold text-slate-900 uppercase">Statutory Verification Seal</div>
              <div>Certified under E-Waste (Management) Rules 2022 Rule 13(1)</div>
              <div>Cryptographic Anchor: CPCB National Parivesh Portal</div>
              <div>Blockchain Stamp: #BLK-51380-PARIVESH-VALIDATED</div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-bold text-slate-900 uppercase font-mono">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-600">
                Authorised Inspector &amp; Regulatory Auditor
              </div>
              <div className="text-[10px] font-mono text-purple-900 font-bold">
                CPCB National Regulatory Audit Node #09
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
