import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Scale,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Copy,
  Check,
  Calendar
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';
import { NATIONAL_STATS } from '../data/mockData';
import { STATE_COMPLIANCE_DATA } from './ComplianceHeatmap';

interface QuarterlySummaryModalProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onClose: () => void;
}

export const QuarterlySummaryModal: React.FC<QuarterlySummaryModalProps> = ({
  currentUser,
  devices,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const flaggedCount = devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length;
  const resolvedCount = devices.filter((d) => d.status === 'ACCEPTED' || d.status === 'CERTIFIED' || d.status === 'RECYCLED' || d.status === 'WIPE_VERIFIED').length;

  const topStates = STATE_COMPLIANCE_DATA.slice(0, 4);
  const laggingStates = STATE_COMPLIANCE_DATA.filter((s) => s.collectionPerformancePct < 85).slice(0, 3);

  const summaryText = `CENTRAL POLLUTION CONTROL BOARD (CPCB)
MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE
QUARTERLY E-WASTE AUDIT & EPR OVERSIGHT SUMMARY — Q3 FY 2026-27

Reporting Officer: ${currentUser.name} (${currentUser.id} • ${currentUser.role})
Date of Issue: ${new Date().toLocaleDateString('en-GB')} | Statutory Rule: 13(1)(vii) / 14

1. NATIONAL VOLUMES & CAPACITY:
- Total Registered Units Tracked: ${NATIONAL_STATS.platformRegisteredDevices.toLocaleString()} Units
- Total Gross Weight Processed: 766.0 Metric Tonnes (Q1-Q3 YTD)
- National Landfill Diversion Rate: 69.2% (21,910 MT redirected to registered TSDFs)
- NIST SP 800-88 Rev. 2 Sanitization: 100% Certified Data Purge Rate (Zero Data Breaches)

2. CPCB STATUTORY TARGET VS ACTUALS:
- Q3 Target Quota: 280.0 MT | Actual Demanufactured: 264.0 MT (94.2% Attainment)
- YTD Statutory Realization: 98.4% Average Across All 22 State Nodes

3. DISCREPANCY & QUARANTINE LEDGER:
- Current Open Flagged Cases: ${flaggedCount} Cases (Quarantined under CEIR / Tare audit)
- Resolved / Discharged Units: ${resolvedCount} Units (100% Cryptographically Anchored)

4. REGIONAL PERFORMANCE HIGHLIGHTS:
- Surplus Performing Hubs: ${topStates.map((s) => `${s.state} (${s.collectionPerformancePct.toFixed(1)}%)`).join(', ')}
- High-Risk Lagging Hubs: ${laggingStates.map((s) => `${s.state} (${s.collectionPerformancePct.toFixed(1)}%)`).join(', ')}

Certified Immutable under Rule 14 of E-Waste (Management) Rules, 2022.`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['CPCB EXECUTIVE QUARTERLY E-WASTE AUDIT SUMMARY', 'Q3 FY 2026-27'],
      ['Auditor In Charge', `${currentUser.name} (${currentUser.id})`],
      ['Timestamp', new Date().toISOString()],
      [],
      ['Metric Name', 'Metric Value', 'Regulatory Benchmark'],
      ['Total Units Ingressed', devices.length.toString(), '100% Chain-of-Custody'],
      ['Q3 Target Recycling (MT)', '280.0', 'CPCB Statutory Obligation'],
      ['Q3 Actual Recycled (MT)', '264.0', '94.2% Realized'],
      ['National Landfill Diversion', '21,910 MT', 'Exceeds Minimum 60% Mandate'],
      ['Wipe Success Rate', '99.8%', 'NIST SP 800-88 Purge'],
      ['Open Flags / Discrepancies', flaggedCount.toString(), 'Under Remediation'],
      [],
      ['State Hub', 'Zone', 'Attainment %', 'Status', 'Risk Factor'],
      ...STATE_COMPLIANCE_DATA.map((s) => [
        s.state,
        s.zone,
        s.collectionPerformancePct.toFixed(1) + '%',
        s.riskLevel,
        s.primaryDeficitFactor || 'Compliant'
      ])
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Quarterly_Audit_Summary_Q3_2026.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Screen-only Header */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Executive Quarterly Compliance Summary (Q3 FY 2026-27)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Rule 13(1) Form 3 Aligned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official statutory performance dossier compiled for Ministry of Environment, Forest &amp; Climate Change.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Brief'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900 text-slate-200 space-y-6 print:p-0 print:bg-white print:text-black">
          {/* Formal CPCB Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
              <span>CENTRAL POLLUTION CONTROL BOARD • MOEFCC</span>
              <span>STATUTORY AUDIT DOSSIER #CPCB-Q3-2026-9042</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Quarterly E-Waste Governance &amp; EPR Target Verification
            </h2>
            <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-1 font-mono">
              <span>Auditor: <strong className="text-white">{currentUser.name}</strong></span>
              <span>Reporting Quarter: <strong>Q3 (Oct–Dec 2026)</strong></span>
              <span>Filing Deadline: <strong>5 Nov 2026 (14 Days)</strong></span>
            </div>
          </div>

          {/* 4 KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">Q3 Recycling Realized</span>
              <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">264.0 MT</span>
              <span className="text-[10px] text-emerald-400 font-semibold">94.2% of 280 MT Target</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">Landfill Diversion</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">21,910 MT</span>
              <span className="text-[10px] text-emerald-400 font-semibold">69.2% National Rate</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">NIST SP 800-88 Wipes</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">99.8%</span>
              <span className="text-[10px] text-slate-400">Zero Forensic Leakage</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">Open Quarantine Flags</span>
              <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{flaggedCount} Cases</span>
              <span className="text-[10px] text-slate-400">{resolvedCount} Units Verified</span>
            </div>
          </div>

          {/* Regional Attainment Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-950 p-3 border-b border-slate-800 font-bold text-white flex items-center justify-between">
              <span>State Hub Performance &amp; Quota Attainment Summary</span>
              <span className="text-[10px] font-mono text-purple-300">22 State Hubs Active</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-2.5">State &amp; Zone</th>
                  <th className="p-2.5">Target (MT)</th>
                  <th className="p-2.5">Collected (MT)</th>
                  <th className="p-2.5">Attainment %</th>
                  <th className="p-2.5">Adherence Score</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {STATE_COMPLIANCE_DATA.slice(0, 8).map((s) => (
                  <tr key={s.state} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold font-sans text-white">
                      {s.state} <span className="text-[10px] text-slate-500 font-mono">({s.zone})</span>
                    </td>
                    <td className="p-2.5 text-slate-300">{s.statutoryTargetMT}</td>
                    <td className="p-2.5 text-white font-bold">{s.actualCollectedMT}</td>
                    <td className="p-2.5">
                      <span
                        className={`font-bold ${
                          s.collectionPerformancePct >= 95
                            ? 'text-emerald-400'
                            : s.collectionPerformancePct >= 85
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {s.collectionPerformancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300">{s.regulatoryAdherenceScore}%</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                          s.riskLevel === 'overperforming' || s.riskLevel === 'compliant'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : s.riskLevel === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {s.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statutory Declaration */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
            <div><strong>Statutory Attestation:</strong> Prepared under Rule 13(1)(vii) and Schedule III of E-Waste (Management) Rules 2022.</div>
            <div><strong>Cryptographic Merkle Root:</strong> 0x77fa2b9810cd04791a562ce849201948194b301c</div>
            <div><strong>Supervisory Validation:</strong> Signed by {currentUser.name} ({currentUser.id})</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-400">
            Form 3 Quarterly Dossier ready for regulatory submission.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
