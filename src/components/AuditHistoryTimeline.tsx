import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Lock,
  Building2,
  FileText,
  Scale,
  Hash,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Search,
  Printer,
  Sparkles,
  ExternalLink,
  Award,
  Info,
  X,
  Shield,
  HelpCircle
} from 'lucide-react';

export interface AuditTimelineEvent {
  id: string;
  quarter: string;
  title: string;
  date: string;
  time: string;
  category: 'statutory_return' | 'nabl_calibration' | 'ceir_clearance' | 'physical_inspection';
  status: 'VERIFIED_COMPLIANT' | 'CONDITIONAL_APPROVAL' | 'RESOLVED_REMEDIATION';
  leadAuditor: string;
  auditorId: string;
  authority: string;
  auditedTonnageMT: number;
  devicesAuditedCount: number;
  passRatePct: number;
  merkleBlockHash: string;
  blockHeight: number;
  nablCertificate: string;
  summaryNotes: string;
  statutoryRule: string;
  findings: string[];
}

export const CPCB_AUDIT_TIMELINE_EVENTS: AuditTimelineEvent[] = [
  {
    id: 'AUD-EVT-2026-Q3-01',
    quarter: 'Q3 FY 2025-26',
    title: 'MoEFCC National EPR Compliance & Merkle Anchor Verification',
    date: '28 October 2026',
    time: '14:30 IST',
    category: 'statutory_return',
    status: 'VERIFIED_COMPLIANT',
    leadAuditor: 'Priya Iyer',
    auditorId: 'AUD-CPCB-77',
    authority: 'Central Pollution Control Board (CPCB), Parivesh Bhawan',
    auditedTonnageMT: 490.5,
    devicesAuditedCount: 4280,
    passRatePct: 90.6,
    merkleBlockHash: 'sha256:4d8a1c90f23b7e61a4910dc823fa971e50849204819d0a7f6c3182b84920ab01',
    blockHeight: 894120,
    nablCertificate: 'NABL-CPCB-2026-DEL-9912',
    summaryNotes: 'Full quarterly compliance return audited across all 22 authorized State Logistics Depots. Form 3 statutory filing validated with zero unverified weight variance.',
    statutoryRule: 'Rule 13(1)(vii) & Rule 19, E-Waste Rules 2022',
    findings: [
      '100% of collected consignment pallets mapped to verified CPCB recycling facilities.',
      'Cryptographic NIST SP 800-88 erasure validated for 3,420 flash storage media.',
      'Zero hazardous leachate detected across Tier-1 transit hubs.'
    ]
  },
  {
    id: 'AUD-EVT-2026-Q3-02',
    quarter: 'Q3 FY 2025-26',
    title: 'NABL IoT Scale Calibration & Tare Offset Audit',
    date: '19 October 2026',
    time: '11:15 IST',
    category: 'nabl_calibration',
    status: 'VERIFIED_COMPLIANT',
    leadAuditor: 'Dr. V. K. Sharma',
    auditorId: 'AUD-CPCB-12',
    authority: 'National Accreditation Board for Testing and Calibration Laboratories',
    auditedTonnageMT: 380.0,
    devicesAuditedCount: 3120,
    passRatePct: 98.4,
    merkleBlockHash: 'sha256:b14a9082ec4f1079ab5c8892019481bc204910ea582910fa782b1920ac391024',
    blockHeight: 893540,
    nablCertificate: 'NABL-CAL-DEL-8821',
    summaryNotes: 'Annual recalibration audit of electronic weighbridge load cells across Northern Corridor hubs. Verified accuracy tolerance within ±0.05%.',
    statutoryRule: 'Weights & Measures Act / SPCB CTO Rule 9',
    findings: [
      'NABL certificate re-issued for Connaught Place & Okhla Ingress scales.',
      'Tare zero-point drift corrected via automated firmware flash.',
      'Direct cloud telemetry hook verified with Parivesh statutory API.'
    ]
  },
  {
    id: 'AUD-EVT-2026-Q2-03',
    quarter: 'Q2 FY 2025-26',
    title: 'Department of Telecommunications CEIR Sanchar Saathi Audit',
    date: '14 September 2026',
    time: '16:45 IST',
    category: 'ceir_clearance',
    status: 'CONDITIONAL_APPROVAL',
    leadAuditor: 'Rajesh Verma',
    auditorId: 'ENG-COL-104',
    authority: 'Telecom Regulatory & Security Bureau / DoT CEIR Gateway',
    auditedTonnageMT: 450.2,
    devicesAuditedCount: 3950,
    passRatePct: 86.7,
    merkleBlockHash: 'sha256:9f401928bc710293847102938471920384719203847192038471920384719203',
    blockHeight: 891080,
    nablCertificate: 'DOT-CEIR-AUD-2026-08',
    summaryNotes: 'Comprehensive cross-check of 3,950 intake IMEI numbers against the National Lost / Stolen handset database. Discrepancy flags resolved via legal consignor declarations.',
    statutoryRule: 'Telecommunications Act 2023 & DoT Circular 18-A',
    findings: [
      '3,882 genuine mobile devices cleared for refurbishment & battery harvesting.',
      '68 flagged handsets isolated in high-security evidence locker.',
      'Automated DoT NOC generated for international reverse logistics.'
    ]
  },
  {
    id: 'AUD-EVT-2026-Q2-04',
    quarter: 'Q2 FY 2025-26',
    title: 'Regional Refinery Demanufacturing & Material Recovery Audit',
    date: '22 August 2026',
    time: '10:00 IST',
    category: 'physical_inspection',
    status: 'VERIFIED_COMPLIANT',
    leadAuditor: 'Dr. Suresh Nair',
    auditorId: 'ENG-FAC-302',
    authority: 'Maharashtra Pollution Control Board (MPCB) Joint Taskforce',
    auditedTonnageMT: 435.0,
    devicesAuditedCount: 3820,
    passRatePct: 89.3,
    merkleBlockHash: 'sha256:7192837491029384710293847102938471029384710293847102938471029384',
    blockHeight: 888490,
    nablCertificate: 'MPCB-HW-2026-REC-0319',
    summaryNotes: 'On-site physical inspection of Taloja MIDC Urban Mining & Refinery plant. Hydrometallurgical gold and lithium recovery efficiency certified at 95.5%.',
    statutoryRule: 'CPCB Guidelines on Demanufacturing & Precious Metal Recovery',
    findings: [
      'Pure 24k Gold leaching certified at 99.8% forensic assay standard.',
      'Zero Liquid Discharge (ZLD) effluent plant operating within ambient SPCB limits.',
      'Class 9 fire-retardant safety cages verified for lithium pouch cells.'
    ]
  },
  {
    id: 'AUD-EVT-2026-Q1-05',
    quarter: 'Q1 FY 2025-26',
    title: 'Statutory Annual Compliance Return & CPCB Form 6 Closure',
    date: '10 June 2026',
    time: '15:20 IST',
    category: 'statutory_return',
    status: 'RESOLVED_REMEDIATION',
    leadAuditor: 'Vikramaditya Sen',
    auditorId: 'ADM-NATIONAL-01',
    authority: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    auditedTonnageMT: 395.0,
    devicesAuditedCount: 3410,
    passRatePct: 88.0,
    merkleBlockHash: 'sha256:3819203847192038471920384719203847192038471920384719203847192038',
    blockHeight: 885100,
    nablCertificate: 'MOEF-CPCB-ANNUAL-2025-26',
    summaryNotes: 'Formal parliamentary submission of Annual National E-Waste Circular Economy Dossier. 14.15 L MT generated e-waste accounted for across state pollution boards.',
    statutoryRule: 'Section 15, Environment (Protection) Act 1986',
    findings: [
      'National landfill diversion achieved 69.2% (exceeding MoEFCC target of 65%).',
      '₹18.4 Crore direct buyback incentive disbursed to verified citizen consignors.',
      'Cryptographic ledger immutable block committed to National Data Center.'
    ]
  }
];

export const AuditHistoryTimeline: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>(CPCB_AUDIT_TIMELINE_EVENTS[0].id);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Micro-interaction detail pop-over state
  const [activePopOverEvent, setActivePopOverEvent] = useState<AuditTimelineEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return CPCB_AUDIT_TIMELINE_EVENTS.filter((evt) => {
      const matchCat = filterCategory === 'all' || evt.category === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        evt.title.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q) ||
        evt.leadAuditor.toLowerCase().includes(q) ||
        evt.quarter.toLowerCase().includes(q) ||
        evt.authority.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [filterCategory, searchQuery]);

  const activeEvent = useMemo(() => {
    return (
      filteredEvents.find((e) => e.id === selectedEventId) ||
      filteredEvents[0] ||
      CPCB_AUDIT_TIMELINE_EVENTS[0]
    );
  }, [filteredEvents, selectedEventId]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Helper function to return statutory status explanation metadata
  const getStatusExplanation = (status: AuditTimelineEvent['status']) => {
    switch (status) {
      case 'VERIFIED_COMPLIANT':
        return {
          title: 'VERIFIED COMPLIANT (CPCB Rule 19)',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
          accentColor: 'text-emerald-400',
          statutoryMeaning:
            'Full Statutory Clearance. All collected and demanufactured e-waste tonnages match 100% against calibrated NABL load-cell records and authorized recycler processing manifests.',
          legalSafeguards:
            'Grants complete immunity under Section 15 of Environment (Protection) Act, 1986. Validates EPR target fulfillment with zero penalty exposure.',
          eprCreditStatus:
            '100% of verified material mass is approved for tradable CPCB EPR Certificate generation.',
          nextAction: 'No immediate action required. Routine quarterly return scheduled in 90 days.'
        };
      case 'CONDITIONAL_APPROVAL':
        return {
          title: 'CONDITIONAL APPROVAL (Provisional)',
          badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
          accentColor: 'text-amber-400',
          statutoryMeaning:
            'Provisional Audit Attestation granted. The primary collection targets are met, but pending secondary documentation or minor tare offset recalibration certificates remain outstanding.',
          legalSafeguards:
            'Provides a mandatory 30-day statutory cure window before show-cause notices are registered on the CPCB Parivesh portal.',
          eprCreditStatus:
            '75% of EPR credits released for trading; remaining 25% placed in statutory escrow pending final clearance.',
          nextAction: 'Upload updated NABL laboratory assay within 14 calendar days.'
        };
      case 'RESOLVED_REMEDIATION':
        return {
          title: 'RESOLVED REMEDIATION (Reconciled)',
          badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/50',
          accentColor: 'text-indigo-400',
          statutoryMeaning:
            'Formal Discrepancy Resolution. An identified gross-tare variance or CEIR query hold has been successfully resolved through verified inspectorate review and legal consignor declarations.',
          legalSafeguards:
            'Quarantine status lifted and committed immutably to the SHA-256 Merkle root ledger. Full legal compliance restored.',
          eprCreditStatus:
            '100% restored. Escrowed EPR credits released for quarterly market trading.',
          nextAction: 'Maintain on-site physical logbooks for annual parliamentary audit review.'
        };
      default:
        return {
          title: 'STATUTORY AUDIT STATUS',
          badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
          accentColor: 'text-slate-300',
          statutoryMeaning: 'Audit record recorded under CPCB E-Waste Management Rules 2022.',
          legalSafeguards: 'Monitored by State Pollution Control Board inspectors.',
          eprCreditStatus: 'Standard regulatory cycle.',
          nextAction: 'Review verification dossier.'
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-5 h-5 text-purple-400" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              CPCB Statutory Audit History Timeline
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              IMMUTABLE TIMELINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Chronological step-by-step verification history under CPCB Rule 19 and MoEFCC Schedule III. Tap any audit step to inspect full dossiers, or tap the status badge to view the statutory explanation pop-over.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter timeline..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48"
            />
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium min-h-[32px] ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterCategory('statutory_return')}
              className={`px-3 py-1.5 rounded-lg transition font-medium min-h-[32px] ${
                filterCategory === 'statutory_return'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Statutory
            </button>
            <button
              onClick={() => setFilterCategory('nabl_calibration')}
              className={`px-3 py-1.5 rounded-lg transition font-medium min-h-[32px] ${
                filterCategory === 'nabl_calibration'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NABL
            </button>
            <button
              onClick={() => setFilterCategory('ceir_clearance')}
              className={`px-3 py-1.5 rounded-lg transition font-medium min-h-[32px] ${
                filterCategory === 'ceir_clearance'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CEIR
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Layout: Vertical Step Timeline (Left) & Event Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Steps Timeline with Large Touch Targets (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span>CHRONOLOGICAL AUDIT STEPS ({filteredEvents.length})</span>
            <span className="text-[11px] text-purple-300">Tap item to inspect • Tap status for explanation</span>
          </div>

          <div className="relative pl-7 sm:pl-9 space-y-4">
            {/* Vertical connecting line aligned with center of larger nodes */}
            <div className="absolute left-[20px] sm:left-[22px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-emerald-500 opacity-40 pointer-events-none" />

            {filteredEvents.map((evt, idx) => {
              const isSelected = activeEvent?.id === evt.id;
              const isCompliant = evt.status === 'VERIFIED_COMPLIANT';
              const isConditional = evt.status === 'CONDITIONAL_APPROVAL';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEventId(evt.id);
                    }
                  }}
                  className={`group relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all border min-h-[114px] touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-[0.99] ${
                    isSelected
                      ? 'bg-slate-950 border-purple-500 shadow-xl shadow-purple-950/50 ring-1 ring-purple-500/60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                  }`}
                >
                  {/* Step Node Dot with generous hit size */}
                  <div
                    className={`absolute -left-[36px] sm:-left-[40px] top-4 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border-2 flex items-center justify-center font-mono text-xs font-black transition-transform duration-200 shadow-md ${
                      isSelected
                        ? 'bg-purple-600 border-white text-white shadow-purple-600/60 scale-110 ring-4 ring-purple-500/20'
                        : isCompliant
                        ? 'bg-slate-900 border-emerald-500/80 text-emerald-400 group-hover:scale-105'
                        : isConditional
                        ? 'bg-slate-900 border-amber-500/80 text-amber-400 group-hover:scale-105'
                        : 'bg-slate-900 border-indigo-500/80 text-indigo-400 group-hover:scale-105'
                    }`}
                  >
                    <span>0{idx + 1}</span>
                  </div>

                  <div className="space-y-2">
                    {/* Header Strip with interactive touch-friendly status badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-800/80 font-bold">
                          {evt.quarter}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{evt.date}</span>
                        </span>
                      </div>

                      {/* Micro-Interaction Status Pop-over Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopOverEvent(evt);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all border shadow-sm touch-manipulation hover:scale-105 active:scale-95 ${
                          isCompliant
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                            : isConditional
                            ? 'bg-amber-950/90 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                            : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50 hover:bg-indigo-900'
                        }`}
                        title="Tap to view statutory status explanation pop-over"
                      >
                        <span className={`w-2 h-2 rounded-full ${isCompliant ? 'bg-emerald-400 animate-pulse' : isConditional ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                        <span>{evt.status.replace('_', ' ')}</span>
                        <Info className="w-3 h-3 text-slate-400 hover:text-white ml-0.5" />
                      </button>
                    </div>

                    {/* Event Title */}
                    <h4
                      className={`text-sm sm:text-base font-bold tracking-tight transition ${
                        isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {evt.title}
                    </h4>

                    {/* Metadata Sub-strip */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-slate-900">
                      <span className="truncate max-w-[220px] text-slate-300">
                        {evt.leadAuditor} ({evt.auditorId})
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-300 font-bold">{evt.auditedTonnageMT} MT</span>
                        <span className="text-emerald-400 font-bold">{evt.passRatePct}% Pass</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Event Dossier Card (Col 6) */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Dossier Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  {activeEvent.id}
                </span>

                {/* Status chip with Pop-Over trigger */}
                <button
                  type="button"
                  onClick={() => setActivePopOverEvent(activeEvent)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition-colors shadow"
                  title="Click to explain statutory status"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeEvent.status}</span>
                  <HelpCircle className="w-3 h-3 text-emerald-400" />
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mt-1.5">
                {activeEvent.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeEvent.authority}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition shadow"
              title="Print statutory verification certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono relative z-10">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-sans">Audited Mass</span>
              <strong className="text-base text-cyan-300 font-bold block mt-0.5">
                {activeEvent.auditedTonnageMT} MT
              </strong>
              <span className="text-[9px] text-slate-400">NABL Verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-sans">Assets Checked</span>
              <strong className="text-base text-white font-bold block mt-0.5">
                {activeEvent.devicesAuditedCount.toLocaleString()}
              </strong>
              <span className="text-[9px] text-slate-400">Pallet Groups</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-sans">Pass Rate</span>
              <strong className="text-base text-emerald-400 font-bold block mt-0.5">
                {activeEvent.passRatePct}%
              </strong>
              <span className="text-[9px] text-emerald-400/80">CPCB Quota</span>
            </div>
          </div>

          {/* Key Findings List */}
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-bold text-slate-300 block">
              Official Inspectorate Findings &amp; Statutory Directives:
            </span>
            <div className="space-y-2 text-xs">
              {activeEvent.findings.map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Proof & Block Height */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 font-mono text-xs relative z-10">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-sans">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Merkle Forensic Root:</span>
              </span>
              <span className="text-cyan-400 font-bold">Block #{activeEvent.blockHeight}</span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
              <span className="truncate text-slate-300" title={activeEvent.merkleBlockHash}>
                {activeEvent.merkleBlockHash}
              </span>
              <button
                onClick={() => handleCopyHash(activeEvent.merkleBlockHash)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                title="Copy SHA-256 Hash"
              >
                {copiedHash === activeEvent.merkleBlockHash ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-400">
              <div>
                <span className="font-sans text-slate-500">NABL Scale Cert:</span>{' '}
                <span className="text-white font-semibold">{activeEvent.nablCertificate}</span>
              </div>
              <div>
                <span className="font-sans text-slate-500">Lead Signatory:</span>{' '}
                <span className="text-emerald-400 font-semibold">{activeEvent.leadAuditor}</span>
              </div>
            </div>
          </div>

          {/* Footer Statutory Mandate Strip */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span>Mandate: {activeEvent.statutoryRule}</span>
            <span className="font-mono text-emerald-400 font-bold">STATUS: SEALED &amp; VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Micro-Interaction Status Detail Pop-over Modal */}
      {activePopOverEvent && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActivePopOverEvent(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-purple-500 to-cyan-400" />

            {/* Pop-over Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>CPCB Compliance Status Explained</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Statutory interpretation for: <span className="font-mono text-purple-300 font-bold">{activePopOverEvent.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePopOverEvent(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                aria-label="Close Pop-over"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Highlight Banner */}
            {(() => {
              const info = getStatusExplanation(activePopOverEvent.status);
              return (
                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${info.badgeColor} space-y-1.5 shadow-inner`}>
                    <div className="flex items-center gap-2 font-mono font-bold text-sm tracking-wide">
                      <Award className="w-4 h-4" />
                      <span>{info.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-200">
                      {info.statutoryMeaning}
                    </p>
                  </div>

                  {/* 3 Detail Blocks */}
                  <div className="space-y-3 font-sans">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        1. Legal &amp; Statutory Safeguards:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {info.legalSafeguards}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block font-mono">
                        2. CPCB EPR Credit Trading Status:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {info.eprCreditStatus}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block font-mono">
                        3. Auditor Protocol &amp; Next Action:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {info.nextAction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pop-over Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-500">
                Rule 19, E-Waste (Management) Rules 2022
              </span>
              <button
                onClick={() => setActivePopOverEvent(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30"
              >
                Understood &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
