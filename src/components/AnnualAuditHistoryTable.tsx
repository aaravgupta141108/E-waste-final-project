import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  Download,
  ExternalLink,
  Hash,
  Scale,
  Sparkles,
  FileCheck,
  CheckCheck,
  Copy
} from 'lucide-react';

export interface HubAuditHistoryRecord {
  id: string;
  hubId: string;
  hubName: string;
  state: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central';
  auditDate: string;
  auditPeriod: string;
  cpcbVerificationId: string;
  complianceStatus: 'SURPLUS PERFORMANCE' | 'FULLY COMPLIANT' | 'MINOR REMEDIATION' | 'SHOW-CAUSE ISSUED';
  auditedIntakeMT: number;
  statutoryTargetMT: number;
  compliancePct: number;
  weighbridgeCert: string;
  leadAuditor: string;
  auditFindings: string;
}

export const MOCK_HUB_AUDIT_HISTORY: HubAuditHistoryRecord[] = [
  {
    id: 'AUD-HIST-DEL-01',
    hubId: 'HUB-DEL-01',
    hubName: 'Delhi NCR Central Consolidation Mega Hub #01',
    state: 'Delhi NCR',
    zone: 'North',
    auditDate: '22 Oct 2026',
    auditPeriod: 'Q3 FY 2026-27 (Statutory Regular)',
    cpcbVerificationId: 'CPCB-AUD-2026-DEL-0419',
    complianceStatus: 'SURPLUS PERFORMANCE',
    auditedIntakeMT: 448,
    statutoryTargetMT: 420,
    compliancePct: 106.7,
    weighbridgeCert: 'NABL-CAL-DEL-8821 (Valid to Dec 2027)',
    leadAuditor: 'Dr. V. K. Sharma (CPCB North)',
    auditFindings: 'IoT weighbridge calibration verified. 100% NIST SP 800-88 cryptographic hash compliance.'
  },
  {
    id: 'AUD-HIST-BLR-04',
    hubId: 'HUB-BLR-04',
    hubName: 'Bengaluru Electronic City E-Waste Ingress Hub #04',
    state: 'Karnataka',
    zone: 'South',
    auditDate: '19 Oct 2026',
    auditPeriod: 'Q3 FY 2026-27 (Statutory Regular)',
    cpcbVerificationId: 'CPCB-AUD-2026-KTK-1082',
    complianceStatus: 'SURPLUS PERFORMANCE',
    auditedIntakeMT: 474,
    statutoryTargetMT: 460,
    compliancePct: 103.0,
    weighbridgeCert: 'NABL-CAL-BLR-9042 (Valid to Nov 2027)',
    leadAuditor: 'S. Ramanathan (KSPCB Inspectorate)',
    auditFindings: 'Corporate bulk IT asset retirement streamlined. Zero hazardous leakage detected.'
  },
  {
    id: 'AUD-HIST-IND-01',
    hubId: 'HUB-IND-01',
    hubName: 'Indore Clean Smart City Ingress Hub #01',
    state: 'Madhya Pradesh',
    zone: 'Central',
    auditDate: '15 Oct 2026',
    auditPeriod: 'Q3 FY 2026-27 (Statutory Regular)',
    cpcbVerificationId: 'CPCB-AUD-2026-MP-0331',
    complianceStatus: 'SURPLUS PERFORMANCE',
    auditedIntakeMT: 196,
    statutoryTargetMT: 190,
    compliancePct: 103.2,
    weighbridgeCert: 'NABL-CAL-IND-7120 (Valid to Aug 2027)',
    leadAuditor: 'Pooja Tiwari (MPPCB Directorate)',
    auditFindings: 'Doorstep municipal segregation benchmark. Clean chain-of-custody logs.'
  },
  {
    id: 'AUD-HIST-MUM-02',
    hubId: 'HUB-MUM-02',
    hubName: 'Navi Mumbai Coastal Logistics & Transit Dock #02',
    state: 'Maharashtra',
    zone: 'West',
    auditDate: '11 Oct 2026',
    auditPeriod: 'Q3 FY 2026-27 (Statutory Regular)',
    cpcbVerificationId: 'CPCB-AUD-2026-MAH-0873',
    complianceStatus: 'FULLY COMPLIANT',
    auditedIntakeMT: 456,
    statutoryTargetMT: 480,
    compliancePct: 95.0,
    weighbridgeCert: 'NABL-CAL-MUM-6490 (Valid to Oct 2027)',
    leadAuditor: 'Anand Deshmukh (MPCB West)',
    auditFindings: 'Minor 5% weight shortfall observed in Kurla collection lane; within statutory tolerance.'
  },
  {
    id: 'AUD-HIST-HYD-03',
    hubId: 'HUB-HYD-03',
    hubName: 'Hyderabad Cyberabad Regional Ingress Hub #03',
    state: 'Telangana',
    zone: 'South',
    auditDate: '06 Oct 2026',
    auditPeriod: 'Q3 FY 2026-27 (Statutory Regular)',
    cpcbVerificationId: 'CPCB-AUD-2026-TS-0441',
    complianceStatus: 'MINOR REMEDIATION',
    auditedIntakeMT: 316,
    statutoryTargetMT: 340,
    compliancePct: 92.9,
    weighbridgeCert: 'NABL-CAL-HYD-5512 (Valid to Jan 2027)',
    leadAuditor: 'K. Srinivas Rao (TSPCB Central)',
    auditFindings: 'SME electronics turnover delay logged. Hub advised to increase mobile rapid van routes.'
  },
  {
    id: 'AUD-HIST-CHE-01',
    hubId: 'HUB-CHE-01',
    hubName: 'Chennai Guindy Seaport Consolidation Dock #01',
    state: 'Tamil Nadu',
    zone: 'South',
    auditDate: '28 Sep 2026',
    auditPeriod: 'Q2 FY 2026-27 (Mid-Year Review)',
    cpcbVerificationId: 'CPCB-AUD-2026-TN-0912',
    complianceStatus: 'SHOW-CAUSE ISSUED',
    auditedIntakeMT: 274,
    statutoryTargetMT: 360,
    compliancePct: 76.1,
    weighbridgeCert: 'NABL-CAL-CHE-3109 (Calibration Expired)',
    leadAuditor: 'M. Jayachandran (TNPCB Directorate)',
    auditFindings: 'Statutory Rule 14 Show-Cause Notice issued. 86 MT deficit and uncalibrated secondary scale.'
  },
  {
    id: 'AUD-HIST-AMD-02',
    hubId: 'HUB-AMD-02',
    hubName: 'Ahmedabad Sanand Industrial Recycling Hub #02',
    state: 'Gujarat',
    zone: 'West',
    auditDate: '24 Sep 2026',
    auditPeriod: 'Q2 FY 2026-27 (Mid-Year Review)',
    cpcbVerificationId: 'CPCB-AUD-2026-GJ-0635',
    complianceStatus: 'SHOW-CAUSE ISSUED',
    auditedIntakeMT: 215,
    statutoryTargetMT: 290,
    compliancePct: 74.1,
    weighbridgeCert: 'NABL-CAL-AMD-4018 (Valid to Jun 2027)',
    leadAuditor: 'Hitesh Patel (GPCB Regional Office)',
    auditFindings: 'Informal smelting diversion suspected in Sanand cluster. Notice served to plant manager.'
  },
  {
    id: 'AUD-HIST-KOL-01',
    hubId: 'HUB-KOL-01',
    hubName: 'Kolkata Howrah Scrap Demanufacturing Node #01',
    state: 'West Bengal',
    zone: 'East',
    auditDate: '18 Sep 2026',
    auditPeriod: 'Q2 FY 2026-27 (Mid-Year Review)',
    cpcbVerificationId: 'CPCB-AUD-2026-WB-0524',
    complianceStatus: 'SHOW-CAUSE ISSUED',
    auditedIntakeMT: 214,
    statutoryTargetMT: 320,
    compliancePct: 66.9,
    weighbridgeCert: 'NABL-CAL-KOL-2918 (Valid to Mar 2027)',
    leadAuditor: 'Debabrata Mukherjee (WBPCB)',
    auditFindings: 'Severe 106 MT shortfall. Lack of certified buyback centers in industrial belt.'
  },
  {
    id: 'AUD-HIST-LKO-03',
    hubId: 'HUB-LKO-03',
    hubName: 'Lucknow-Kanpur Clean Corridor Hub #03',
    state: 'Uttar Pradesh',
    zone: 'North',
    auditDate: '12 Sep 2026',
    auditPeriod: 'Q2 FY 2026-27 (Mid-Year Review)',
    cpcbVerificationId: 'CPCB-AUD-2026-UP-0811',
    complianceStatus: 'SHOW-CAUSE ISSUED',
    auditedIntakeMT: 169,
    statutoryTargetMT: 260,
    compliancePct: 65.0,
    weighbridgeCert: 'NABL-CAL-LKO-1194 (Valid to May 2027)',
    leadAuditor: 'Rajesh Mishra (UPPCB Kanpur)',
    auditFindings: 'Unregistered acid leaching informal units in Moradabad-Lucknow belt diverting raw PCBs.'
  },
  {
    id: 'AUD-HIST-DEL-02',
    hubId: 'HUB-DEL-02',
    hubName: 'Delhi Okhla Industrial Area Sub-Hub #02',
    state: 'Delhi NCR',
    zone: 'North',
    auditDate: '14 Jul 2026',
    auditPeriod: 'Q1 FY 2026-27 (Mandate Check)',
    cpcbVerificationId: 'CPCB-AUD-2026-DEL-0210',
    complianceStatus: 'FULLY COMPLIANT',
    auditedIntakeMT: 310,
    statutoryTargetMT: 300,
    compliancePct: 103.3,
    weighbridgeCert: 'NABL-CAL-DEL-8819 (Valid to Dec 2027)',
    leadAuditor: 'Dr. V. K. Sharma (CPCB North)',
    auditFindings: 'Regular intake logs verified. No hazardous storage beyond legal ceiling.'
  },
  {
    id: 'AUD-HIST-PAT-01',
    hubId: 'HUB-PAT-01',
    hubName: 'Patna Ganga Belt Collection Depot #01',
    state: 'Bihar',
    zone: 'East',
    auditDate: '04 Jul 2026',
    auditPeriod: 'Q1 FY 2026-27 (Mandate Check)',
    cpcbVerificationId: 'CPCB-AUD-2026-BIH-0192',
    complianceStatus: 'SHOW-CAUSE ISSUED',
    auditedIntakeMT: 128,
    statutoryTargetMT: 210,
    compliancePct: 61.0,
    weighbridgeCert: 'NABL-CAL-PAT-1049 (Valid to Aug 2027)',
    leadAuditor: 'Sanjay Kumar (BSPCB Directorate)',
    auditFindings: 'Zero certified lithium refining capacity within 300km. Transit delays to Kolkata refinery.'
  },
  {
    id: 'AUD-HIST-JAI-02',
    hubId: 'HUB-JAI-02',
    hubName: 'Jaipur Pink City Solar & E-Waste Depot #02',
    state: 'Rajasthan',
    zone: 'North',
    auditDate: '26 Jun 2026',
    auditPeriod: 'Q1 FY 2026-27 (Mandate Check)',
    cpcbVerificationId: 'CPCB-AUD-2026-RAJ-0348',
    complianceStatus: 'MINOR REMEDIATION',
    auditedIntakeMT: 289,
    statutoryTargetMT: 340,
    compliancePct: 85.0,
    weighbridgeCert: 'NABL-CAL-JAI-4819 (Valid to Nov 2027)',
    leadAuditor: 'Mahesh Meena (RSPCB Inspectorate)',
    auditFindings: 'Dispersed rural collection hubs causing logistics lag. Remedial transit van deployed.'
  }
];

export interface AnnualAuditHistoryTableProps {
  onExportAuditReport?: () => void;
}

export const AnnualAuditHistoryTable: React.FC<AnnualAuditHistoryTableProps> = ({
  onExportAuditReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return MOCK_HUB_AUDIT_HISTORY.filter((rec) => {
      if (statusFilter !== 'all' && rec.complianceStatus !== statusFilter) return false;
      if (zoneFilter !== 'all' && rec.zone !== zoneFilter) return false;

      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      return (
        rec.hubName.toLowerCase().includes(q) ||
        rec.hubId.toLowerCase().includes(q) ||
        rec.state.toLowerCase().includes(q) ||
        rec.cpcbVerificationId.toLowerCase().includes(q) ||
        rec.leadAuditor.toLowerCase().includes(q) ||
        rec.auditFindings.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, statusFilter, zoneFilter]);

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Hub ID',
      'Hub Name',
      'State',
      'Zone',
      'Audit Date',
      'Audit Period',
      'CPCB Verification ID',
      'Compliance Status',
      'Audited Intake (MT)',
      'Statutory Target (MT)',
      'Attainment Rate (%)',
      'Weighbridge Certification',
      'Lead Auditor',
      'Audit Findings / Remediation'
    ];

    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = filteredHistory.map((r) => [
      escape(r.hubId),
      escape(r.hubName),
      escape(r.state),
      escape(r.zone),
      escape(r.auditDate),
      escape(r.auditPeriod),
      escape(r.cpcbVerificationId),
      escape(r.complianceStatus),
      r.auditedIntakeMT,
      r.statutoryTargetMT,
      r.compliancePct,
      escape(r.weighbridgeCert),
      escape(r.leadAuditor),
      escape(r.auditFindings)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Annual_Audit_History_Hub_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: HubAuditHistoryRecord['complianceStatus']) => {
    switch (status) {
      case 'SURPLUS PERFORMANCE':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'FULLY COMPLIANT':
        return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
      case 'MINOR REMEDIATION':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'SHOW-CAUSE ISSUED':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Annual Audit History &amp; State-Registered Hub Registry
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              CPCB RULE 13 / 14
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official immutable inspection ledger logging historical compliance status, audit dates, and CPCB verification IDs for each state-authorized e-waste collection hub.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onExportAuditReport && (
            <button
              onClick={onExportAuditReport}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
              title="Export formal CPCB Form-6 regulatory report"
            >
              <FileCheck className="w-4 h-4" />
              <span>Export Form-6 Report</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-2 shadow"
            title="Export audit history dataset as CSV"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by hub name, state, verification ID, or auditor..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Compliance Statuses</option>
              <option value="SURPLUS PERFORMANCE">Surplus (&gt;100%)</option>
              <option value="FULLY COMPLIANT">Fully Compliant (95-100%)</option>
              <option value="MINOR REMEDIATION">Minor Remediation (80-94%)</option>
              <option value="SHOW-CAUSE ISSUED">Show-Cause Notice (&lt;80%)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Zone:</span>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All National Zones</option>
              <option value="North">North Zone</option>
              <option value="South">South Zone</option>
              <option value="West">West Zone</option>
              <option value="East">East Zone</option>
              <option value="Central">Central Zone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950/60 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-3.5">Hub Details &amp; State</th>
                <th className="py-3 px-3">Audit Date &amp; Cycle</th>
                <th className="py-3 px-3">CPCB Verification ID</th>
                <th className="py-3 px-3">Compliance Status</th>
                <th className="py-3 px-3">Audited Volume (MT)</th>
                <th className="py-3 px-3">Weighbridge Certificate</th>
                <th className="py-3 px-3.5">Lead Auditor &amp; Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No hub audit history records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((rec, idx) => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, delay: Math.min(idx * 0.025, 0.35), ease: [0.16, 1, 0.3, 1] }}
                      className="hover:bg-slate-800/40 transition"
                    >
                      {/* Hub Details */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="font-bold text-white text-xs">{rec.hubName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-purple-400 font-semibold">{rec.hubId}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[11px] text-slate-400">{rec.state} ({rec.zone})</span>
                        </div>
                      </td>

                      {/* Audit Date & Cycle */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{rec.auditDate}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{rec.auditPeriod}</span>
                      </td>

                      {/* CPCB Verification ID */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-cyan-400">
                          <span>{rec.cpcbVerificationId}</span>
                          <button
                            onClick={() => handleCopyId(rec.cpcbVerificationId)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition"
                            title="Copy CPCB Verification ID"
                          >
                            {copiedId === rec.cpcbVerificationId ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60 inline-block mt-0.5 font-bold">
                          CPCB PARIVESH SEALED
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${getStatusBadge(rec.complianceStatus)}`}>
                          {rec.complianceStatus === 'SHOW-CAUSE ISSUED' ? (
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          <span>{rec.complianceStatus}</span>
                        </span>
                        <div className="mt-1 font-mono tabular-nums text-[11px] font-bold text-slate-300">
                          {rec.compliancePct.toFixed(1)}% Attainment
                        </div>
                      </td>

                      {/* Audited Volume */}
                      <td className="py-3.5 px-3 align-top font-mono tabular-nums text-xs">
                        <div className="font-bold text-emerald-400">
                          {rec.auditedIntakeMT} MT
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Target: {rec.statutoryTargetMT} MT
                        </span>
                      </td>

                      {/* Weighbridge Cert */}
                      <td className="py-3.5 px-3 align-top text-xs font-mono">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={rec.weighbridgeCert}>
                            {rec.weighbridgeCert}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">IoT Calibrated</span>
                      </td>

                      {/* Lead Auditor & Findings */}
                      <td className="py-3.5 px-3.5 align-top text-xs font-sans max-w-xs">
                        <div className="font-bold text-white text-xs">{rec.leadAuditor}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {rec.auditFindings}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
