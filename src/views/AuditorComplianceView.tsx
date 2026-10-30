import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Lock,
  Search,
  Check,
  TrendingUp,
  Scale,
  Sparkles,
  ExternalLink,
  Bell,
  Copy,
  CheckCheck,
  Hash,
  ArrowDownToLine,
  Filter,
  Layers,
  Database,
  ArrowRight,
  Smartphone,
  Zap,
  BellRing
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AUDIT_LOGS, CPCB_RECYCLERS, NATIONAL_STATS } from '../data/mockData';
import { ComplianceDeadlineReminder, AuditLogEntry, DeviceItem, UserProfile } from '../types';
import { ComplianceCalendar } from '../components/ComplianceCalendar';
import { ComplianceHistoryLog } from '../components/ComplianceHistoryLog';
import { ComplianceHeatmap, STATE_COMPLIANCE_DATA, getGradientScaleColor, StateComplianceData } from '../components/ComplianceHeatmap';
import { AuditInsightsCard } from '../components/AuditInsightsCard';
import { StateComplianceDetailModal } from '../components/StateComplianceDetailModal';
import { AnnualComplianceReportModal } from '../components/AnnualComplianceReportModal';
import { ImeiDeviceLookupCard } from '../components/ImeiDeviceLookupCard';
import { RegionalSparklineChart } from '../components/RegionalSparklineChart';
import { AnnualAuditHistoryTable } from '../components/AnnualAuditHistoryTable';
import { CpcbForm6AuditReportModal } from '../components/CpcbForm6AuditReportModal';
import { DigitalAuditTrailModal, getStoredOverrides, saveStoredOverride, AuditorOverrideRecord } from '../components/DigitalAuditTrailModal';
import { NationalHubRiskMap } from '../components/NationalHubRiskMap';
import { ComplianceAiInsightPanel } from '../components/ComplianceAiInsightPanel';
import { BulkNotifyHubsModal } from '../components/BulkNotifyHubsModal';
import { QuarterlySummaryModal } from '../components/QuarterlySummaryModal';
import { MapPin } from 'lucide-react';

export interface DeviceLifecycleEvent {
  id: string;
  timestamp: string;
  deviceId: string;
  category: string;
  makeModel: string;
  actionCode: string;
  actionLabel: string;
  actionCategory: 'intake' | 'ceir' | 'wipe' | 'scale' | 'payout' | 'intervention' | 'audit';
  actorName: string;
  actorRole: string;
  stationNode: string;
  cryptographicHash: string;
  blockAnchor: string;
  status: 'VERIFIED IMMUTABLE' | 'BLOCK ANCHORED' | 'SEALED';
  details: string;
}

interface AuditorComplianceViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onResolveFlag?: (deviceId: string) => void;
  onClearAllFlags?: () => void;
  reminders?: ComplianceDeadlineReminder[];
  onAddReminder?: (reminder: ComplianceDeadlineReminder) => void;
  onDeleteReminder?: (id: string) => void;
  onTriggerPushNotification?: (reminder: ComplianceDeadlineReminder) => void;
}

export const AuditorComplianceView: React.FC<AuditorComplianceViewProps> = ({
  currentUser,
  devices,
  onResolveFlag,
  onClearAllFlags,
  reminders = [],
  onAddReminder = () => {},
  onDeleteReminder = () => {},
  onTriggerPushNotification = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'national_map' | 'audit_history' | 'imei_terminal' | 'compliance_logs' | 'history' | 'calendar' | 'cpcb_targets' | 'heatmap' | 'audit_trail' | 'recycler_directory'>('scorecard');
  const [searchLog, setSearchLog] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [showForm6Modal, setShowForm6Modal] = useState(false);
  const [showDigitalAuditTrailModal, setShowDigitalAuditTrailModal] = useState(false);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [showQuarterlySummaryModal, setShowQuarterlySummaryModal] = useState(false);
  const [quickActionToast, setQuickActionToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [storedOverridesCount, setStoredOverridesCount] = useState<number>(() => getStoredOverrides().length);
  const [selectedHeatmapState, setSelectedHeatmapState] = useState<StateComplianceData | null>(null);
  const [selectedSparklineState, setSelectedSparklineState] = useState<StateComplianceData>(STATE_COMPLIANCE_DATA[0]);
  const [complianceSearch, setComplianceSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'intake' | 'ceir' | 'wipe' | 'scale' | 'payout' | 'intervention' | 'audit'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Quick Action: Clear All Pending Quarantined Flags
  const handleClearAllFlagsClick = () => {
    const pendingFlags = devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD');
    if (pendingFlags.length === 0) {
      setQuickActionToast({
        message: 'No pending flagged or quarantined units in the central queue.',
        type: 'info'
      });
      setTimeout(() => setQuickActionToast(null), 3000);
      return;
    }

    if (onClearAllFlags) {
      onClearAllFlags();
    }

    const hexChars = '0123456789abcdef';
    let randHash = '';
    for (let i = 0; i < 64; i++) {
      randHash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }

    saveStoredOverride({
      id: `OVR-BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      deviceId: `BATCH (${pendingFlags.length} Units)`,
      makeModel: `${pendingFlags.length} Quarantined Units`,
      previousStatus: 'FLAGGED',
      newStatus: 'CLEARED',
      reasonCategory: 'Directorial Discretion Clearance',
      justificationNotes: `Batch clearance executed via Quick Audit Actions toolbar. All ${pendingFlags.length} pending discrepancies reviewed and cleared under supervisory authority.`,
      auditorId: currentUser.id,
      auditorName: currentUser.name,
      auditorRole: currentUser.role,
      stationNode: 'CPCB Central Regulatory Node',
      cryptographicHash: randHash,
      blockHeight: 892150,
      auditStatus: 'COMMITTED_IMMUTABLE'
    });

    setStoredOverridesCount((prev) => prev + 1);

    setQuickActionToast({
      message: `Cleared all ${pendingFlags.length} pending quarantine flags and recorded to Digital Audit Trail!`,
      type: 'success'
    });
    setTimeout(() => setQuickActionToast(null), 4000);
  };

  // Synthesize complete, immutable device lifecycle events across the registry
  const lifecycleEvents: DeviceLifecycleEvent[] = useMemo(() => {
    const list: DeviceLifecycleEvent[] = [];

    // 1. Events derived from devices
    devices.forEach((device) => {
      const cleanId = device.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      // Intake Registration Event
      list.push({
        id: `EVT-INTAKE-${device.id}`,
        timestamp: device.registeredAt || '2026-10-15 09:30:00 IST',
        deviceId: device.id,
        category: device.category,
        makeModel: `${device.brand} ${device.model}`,
        actionCode: 'STATUTORY_INTAKE_DECLARED',
        actionLabel: 'Physical Intake & Verification',
        actionCategory: 'intake',
        actorName: device.userName || 'Citizen Consignor',
        actorRole: 'citizen',
        stationNode: device.hubLocation || 'CPCB Certified Hub #04 - Connaught Place',
        cryptographicHash: `sha256:7f${cleanId}b8109d71fae881023c94812a`,
        blockAnchor: `BLK #${51200 + (cleanId.charCodeAt(cleanId.length - 1) || 9) * 17}`,
        status: 'VERIFIED IMMUTABLE',
        details: `Consignment intake recorded at ${device.intakeWeightKg || 0.25} kg. Serial: ${device.serialNumber || 'N/A'}. IMEI: ${device.imei || 'N/A'}. Payout benchmark: ₹${device.payoutAmount || device.estimatedScrapValue || 800}.`
      });

      // Sanchar Saathi CEIR Verification
      if (device.category === 'Smartphone' || device.imei) {
        list.push({
          id: `EVT-CEIR-${device.id}`,
          timestamp: device.registeredAt ? `${device.registeredAt.split(' ')[0]} 10:12:00 IST` : '2026-10-15 10:12:00 IST',
          deviceId: device.id,
          category: device.category,
          makeModel: `${device.brand} ${device.model}`,
          actionCode: 'SANCHAR_SAATHI_CEIR_CLEARED',
          actionLabel: 'Sanchar Saathi DoT Query',
          actionCategory: 'ceir',
          actorName: 'DoT Central Identity Engine',
          actorRole: 'cpcb_auditor',
          stationNode: 'National CEIR Equipment Gateway',
          cryptographicHash: `sha256:3a${cleanId}90412849cf884f1a90c428`,
          blockAnchor: `BLK #${51225 + (cleanId.charCodeAt(cleanId.length - 1) || 9) * 17}`,
          status: 'VERIFIED IMMUTABLE',
          details: `IMEI ${device.imei || '864920048192837'} validated against national lost/stolen database. Status: CLEAN & GENUINE. Approved for EPR compliance cascade.`
        });
      }

      // NIST SP 800-88 / IEEE 2883 Data Wipe Event
      if (device.wipeRecord) {
        list.push({
          id: `EVT-WIPE-${device.id}`,
          timestamp: device.wipeRecord.endTime || '2026-10-16 14:28:00 IST',
          deviceId: device.id,
          category: device.category,
          makeModel: `${device.brand} ${device.model}`,
          actionCode: 'NIST_SP_800_88_DATA_PURGED',
          actionLabel: 'NIST / IEEE Data Sanitization',
          actionCategory: 'wipe',
          actorName: device.wipeRecord.engineerName || 'Rajesh Verma (ENG-COL-104)',
          actorRole: 'collection_engineer',
          stationNode: device.hubLocation || 'CPCB Sanitization Dock Node',
          cryptographicHash: device.wipeRecord.verificationHash.startsWith('sha256:')
            ? device.wipeRecord.verificationHash
            : `sha256:${device.wipeRecord.verificationHash}`,
          blockAnchor: `BLK #${51260 + (cleanId.charCodeAt(cleanId.length - 1) || 9) * 17}`,
          status: 'VERIFIED IMMUTABLE',
          details: `${device.wipeRecord.standard} • ${device.wipeRecord.method}. Recovery sample check: ${device.wipeRecord.recoverySampleTest}. Energy consumed: ${device.wipeRecord.energyKwh} kWh.`
        });
      }

      // Calibrated Scale Dispatch Event
      list.push({
        id: `EVT-SCALE-${device.id}`,
        timestamp: device.updatedAt || '2026-10-17 11:45:00 IST',
        deviceId: device.id,
        category: device.category,
        makeModel: `${device.brand} ${device.model}`,
        actionCode: 'CALIBRATED_SCALE_DISPATCH_SEALED',
        actionLabel: 'Calibrated Scale Transit Dispatch',
        actionCategory: 'scale',
        actorName: 'Logistics Officer (ENG-COL-104)',
        actorRole: 'collection_engineer',
        stationNode: device.hubLocation || 'Hub Logistics Weighbridge',
        cryptographicHash: `sha256:8b${cleanId}c1209ea90c42817bf44d82`,
        blockAnchor: `BLK #${51295 + (cleanId.charCodeAt(cleanId.length - 1) || 9) * 17}`,
        status: 'SEALED',
        details: `Digital scale gross weight calibrated at ${device.intakeWeightKg || 0.25} kg. Tamper-evident Seal: SEAL-CPCB-${device.id.slice(-4)}-2026. Batch: ${device.batchId || 'BATCH-DEL-2026-W43'}.`
      });

      // DBT Payout Event
      if (device.payoutAmount || device.payoutSentAt) {
        list.push({
          id: `EVT-PAYOUT-${device.id}`,
          timestamp: device.payoutSentAt || '2026-10-18 11:20:00 IST',
          deviceId: device.id,
          category: device.category,
          makeModel: `${device.brand} ${device.model}`,
          actionCode: 'DIRECT_BENEFIT_PAYOUT_SETTLED',
          actionLabel: 'Direct Benefit Transfer (DBT)',
          actionCategory: 'payout',
          actorName: 'Escrow Settlement Gateway',
          actorRole: 'admin',
          stationNode: 'NPCI UPI / RTGS National Gateway',
          cryptographicHash: `sha256:1a${cleanId}e049184b227777d4dd1fc`,
          blockAnchor: `BLK #${51320 + (cleanId.charCodeAt(cleanId.length - 1) || 9) * 17}`,
          status: 'VERIFIED IMMUTABLE',
          details: `₹${(device.payoutAmount || 800).toLocaleString()} disbursed via ${device.payoutMethod || 'UPI'}. Reference: ${device.payoutTxnRef || 'UPI/329482910481/HDFC'}. Citizen acknowledged.`
        });
      }

      // Factory Interventions (Hazard Extraction, Dismantling)
      if (device.interventions && device.interventions.length > 0) {
        device.interventions.forEach((intv, idx) => {
          list.push({
            id: `EVT-INTV-${device.id}-${idx}`,
            timestamp: intv.timestamp,
            deviceId: device.id,
            category: device.category,
            makeModel: `${device.brand} ${device.model}`,
            actionCode: 'HAZMAT_EXTRACTION_LOGGED',
            actionLabel: 'Hazard Isolation & Demanufacturing',
            actionCategory: 'intervention',
            actorName: intv.operatorName,
            actorRole: 'factory_engineer',
            stationNode: intv.station,
            cryptographicHash: `sha256:5c${cleanId}idx${idx}c72b81094ea120349b`,
            blockAnchor: `BLK #${51350 + idx * 8}`,
            status: 'VERIFIED IMMUTABLE',
            details: `${intv.actionType}: ${intv.notes} (Hazard: ${intv.hazardType || 'Isolated safe'})`
          });
        });
      }
    });

    // 2. Append general system AUDIT_LOGS
    AUDIT_LOGS.forEach((log) => {
      list.push({
        id: log.id,
        timestamp: log.timestamp,
        deviceId: log.entityId.startsWith('BHW') ? log.entityId : 'SYSTEM-NODE',
        category: 'System Regulatory Event',
        makeModel: log.entityType,
        actionCode: log.action,
        actionLabel: log.action.replace(/_/g, ' '),
        actionCategory: 'audit',
        actorName: log.actorName,
        actorRole: log.actorRole,
        stationNode: log.ipAddress,
        cryptographicHash: log.tamperProofHash.startsWith('sha256:')
          ? log.tamperProofHash
          : `sha256:${log.tamperProofHash}`,
        blockAnchor: `BLK #${49900 + (parseInt(log.id.replace(/\D/g, ''), 10) % 1000 || 120)}`,
        status: 'BLOCK ANCHORED',
        details: log.details
      });
    });

    // Sort descending by timestamp / ID
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [devices]);

  // Filtered compliance logs for the tab
  const filteredComplianceLogs = useMemo(() => {
    return lifecycleEvents.filter((item) => {
      const matchesStage = stageFilter === 'all' || item.actionCategory === stageFilter;
      const q = complianceSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.deviceId.toLowerCase().includes(q) ||
        item.makeModel.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.actionCode.toLowerCase().includes(q) ||
        item.actionLabel.toLowerCase().includes(q) ||
        item.actorName.toLowerCase().includes(q) ||
        item.stationNode.toLowerCase().includes(q) ||
        item.cryptographicHash.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q);
      return matchesStage && matchesSearch;
    });
  }, [lifecycleEvents, complianceSearch, stageFilter]);

  // Trigger secure CSV download of the complete device lifecycle audit history
  const handleExportAllAuditLogs = () => {
    const headers = [
      'Log Event ID',
      'Timestamp (IST)',
      'Action Code',
      'Action Label',
      'Stage Category',
      'Target Device ID',
      'Device Category',
      'Make and Model',
      'Actor Name',
      'Actor Role',
      'Station / Network Node',
      'Tamper-Proof Cryptographic Hash (SHA-256)',
      'Block Anchor Height',
      'Ledger Status',
      'Regulatory Audit Narrative'
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = lifecycleEvents.map((ev) => [
      escapeCsv(ev.id),
      escapeCsv(ev.timestamp),
      escapeCsv(ev.actionCode),
      escapeCsv(ev.actionLabel),
      escapeCsv(ev.actionCategory),
      escapeCsv(ev.deviceId),
      escapeCsv(ev.category),
      escapeCsv(ev.makeModel),
      escapeCsv(ev.actorName),
      escapeCsv(ev.actorRole),
      escapeCsv(ev.stationNode),
      escapeCsv(ev.cryptographicHash),
      escapeCsv(ev.blockAnchor),
      escapeCsv(ev.status),
      escapeCsv(ev.details)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `CPCB_Device_Lifecycle_Compliance_Logs_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // CPCB Quarterly Targets vs Actuals
  const quarterlyComplianceData = [
    { quarter: 'Q1 (Apr-Jun)', statutoryTargetMT: 240, actualRecycledMT: 248, compliancePct: 103.3 },
    { quarter: 'Q2 (Jul-Sep)', statutoryTargetMT: 260, actualRecycledMT: 254, compliancePct: 97.7 },
    { quarter: 'Q3 (Oct-Dec)', statutoryTargetMT: 280, actualRecycledMT: 264, compliancePct: 94.2 },
    { quarter: 'Q4 (Jan-Mar)', statutoryTargetMT: 300, actualRecycledMT: 0, compliancePct: 0.0 }
  ];

  const filteredLogs = AUDIT_LOGS.filter(
    (log) =>
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="auditor-header-banner p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Pollution Control Board (CPCB) • Statutory Audit Node</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Regulatory Compliance, Targets & Chain of Custody Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Statutory oversight under E-Waste (Management) Rules 2022 & Amendment G.S.R. 699(E). Automated verification of EPR obligations, immutable lifecycle logs, and tamper-proof SHA-256 cryptographic ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Quick Audit Actions Toolbar next to export button */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-purple-500/30 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-amber-400 px-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Quick Actions:</span>
            </span>

            <button
              onClick={handleClearAllFlagsClick}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Batch clear all pending quarantined flags across registry"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear All Pending Flags</span>
            </button>

            <button
              onClick={() => setShowBulkNotifyModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Broadcast filing directives to all 22 state hubs"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Bulk Notify Hubs</span>
            </button>

            <button
              onClick={() => setShowQuarterlySummaryModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Generate quarterly executive summary with print & export"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Quarterly Summary</span>
            </button>
          </div>

          <button
            onClick={() => setShowDigitalAuditTrailModal(true)}
            className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-xs font-bold text-purple-200 hover:text-white transition shadow flex items-center gap-2 border border-purple-600/50"
            title="Inspect persistent digital audit trail of manual status overrides and flag resolutions"
          >
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Digital Audit Trail ({storedOverridesCount})</span>
          </button>

          <button
            onClick={() => setShowForm6Modal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 border border-purple-500/50"
            title="Export formal CPCB Form-6 regulatory transit manifest & audit report (Rule 19)"
          >
            <Printer className="w-4 h-4" />
            <span>Export Audit Report (Form-6)</span>
          </button>

          <button
            onClick={() => setShowAnnualReportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 border border-indigo-500/40"
            title="Download print-friendly CPCB annual compliance dossier"
          >
            <FileText className="w-4 h-4" />
            <span>Download Annual Report</span>
          </button>

          <button
            onClick={handleExportAllAuditLogs}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-2 shadow"
            title="Download full tamper-proof CSV of all device lifecycle events and audit trails"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Action Notification Toast */}
      {quickActionToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{quickActionToast.message}</span>
          </div>
          <button
            onClick={() => setQuickActionToast(null)}
            className="text-emerald-400 hover:text-white font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'scorecard'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditor Scorecard &amp; Flags</span>
        </button>

        {/* National Geography Hub Risk Map Tab */}
        <button
          onClick={() => setActiveTab('national_map')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'national_map'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>National Hub Risk Map</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono">
            High-Risk vs Certified
          </span>
        </button>

        {/* Annual Audit History Tab */}
        <button
          onClick={() => setActiveTab('audit_history')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'audit_history'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Annual Audit History</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
            10 State Hubs
          </span>
        </button>

        {/* Primary New Compliance Logs Tab */}
        <button
          onClick={() => setActiveTab('compliance_logs')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'compliance_logs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Compliance Logs</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold font-mono">
            {lifecycleEvents.length} Events
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'history'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Device Compliance History</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            Provenance
          </span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'calendar'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Compliance Deadline Calendar</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            Alert
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cpcb_targets')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'cpcb_targets'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Quarterly EPR Targets vs Actuals</span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'heatmap'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Regional Targets &amp; District Heatmap</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            Underperforming Districts
          </span>
        </button>
        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'audit_trail'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Legacy Audit Trail ({AUDIT_LOGS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('recycler_directory')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'recycler_directory'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Authorized Recyclers Directory</span>
        </button>
      </div>

      {/* Tab 1: Auditor Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {/* AI-Powered Compliance Insight & Regional Risk Overview */}
          <ComplianceAiInsightPanel
            devices={devices}
            onInspectFlagged={() => {
              const el = document.getElementById('quarantine-queue-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectState={(stateData) => {
              setSelectedHeatmapState(stateData);
              setSelectedSparklineState(stateData);
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Total Registered Units</span>
              <div className="text-xl font-bold text-white mt-1">
                {NATIONAL_STATS.platformRegisteredDevices.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400">100% Chain-of-Custody</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Gross Collected Weight</span>
              <div className="text-xl font-bold text-white mt-1">
                {NATIONAL_STATS.platformTotalKgCollected.toLocaleString()} kg
              </div>
              <span className="text-[10px] text-slate-400">Calibrated Scale Logs</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Wipe Success Rate</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">99.8%</div>
              <span className="text-[10px] text-slate-400">NIST SP 800-88 Purge</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Open Flags & Discrepancies</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length} Cases
              </div>
              <span className="text-[10px] text-rose-400/80">Pending Admin Action</span>
            </div>
          </div>

          {/* National Geography Hub Risk Heatmap (High-Risk vs Certified Hubs) */}
          <NationalHubRiskMap
            devices={devices}
            onSelectState={(stateData) => {
              setSelectedHeatmapState(stateData);
              setSelectedSparklineState(stateData);
            }}
          />

          {/* Audit Insights Card powered by mock analytic model */}
          <AuditInsightsCard
            devices={devices}
            onFilterFlaggedDevices={() => {
              const el = document.getElementById('quarantine-queue-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Regional Compliance Heatmap & Adherence Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Regional E-Waste Collection &amp; Statutory Adherence Heatmap
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                    CPCB RULE 13(1)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual gradient scale tracking state collection quotas, regulatory filings, and weight verification compliance across India.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('heatmap')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              >
                <span>Full Interactive Heatmap Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gradient Scale Visualization */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Continuous Performance &amp; Adherence Gradient Scale</span>
                <span className="text-[10px] font-mono text-slate-400">Target Range: 0% to 110%+</span>
              </div>
              <div
                className="h-5 w-full rounded-lg overflow-hidden shadow-inner border border-slate-700/60 relative"
                style={{
                  background: 'linear-gradient(to right, #e11d48 0%, #f97316 25%, #f59e0b 50%, #06b6d4 75%, #10b981 100%)'
                }}
              >
                <div className="absolute inset-0 flex justify-between px-2 text-[9px] font-mono font-bold text-white drop-shadow items-center select-none">
                  <span>&lt;70% Critical Shortfall</span>
                  <span>70-79% Severe</span>
                  <span>80-89% Warning</span>
                  <span>90-94% Near</span>
                  <span>≥95%+ Surplus Compliant</span>
                </div>
              </div>
            </div>

            {/* State Performance Cards Grid (Clickable to open Regional Risk Dossier Modal) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>State Attainment Cards:</span>
                <span className="text-purple-400 font-mono flex items-center gap-1">
                  Click any state card to open detailed performance &amp; risk modal ➔
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {STATE_COMPLIANCE_DATA.slice(0, 12).map((d) => {
                  const color = getGradientScaleColor(d.collectionPerformancePct);
                  return (
                    <button
                      key={d.state}
                      onClick={() => {
                        setSelectedHeatmapState(d);
                        setSelectedSparklineState(d);
                      }}
                      className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 relative overflow-hidden text-left cursor-pointer transition hover:scale-[1.02] group"
                      title={`Click to inspect 6-month sparkline trend & category risk dossier for ${d.state}`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: color }} />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-white block truncate group-hover:text-purple-300" title={d.state}>
                          {d.state}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-purple-400 shrink-0 opacity-60 group-hover:opacity-100" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Zone: {d.zone}</span>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-base font-bold font-mono" style={{ color }}>
                          {d.collectionPerformancePct.toFixed(1)}%
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">Attained</span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Adherence:</span>
                        <span className="font-bold text-slate-300">{d.regulatoryAdherenceScore.toFixed(0)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6-Month Historical Regional E-Waste Collection Performance Sparkline */}
          <RegionalSparklineChart
            selectedState={selectedSparklineState}
            allStates={STATE_COMPLIANCE_DATA}
            onSelectState={(st) => setSelectedSparklineState(st)}
          />

          {/* Sanchar Saathi CEIR & Device IMEI Verification Terminal */}
          <ImeiDeviceLookupCard devices={devices} />

          {/* Statutory Filing Countdown & Push Reminder Banner */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    Impending MoEFCC Filing: Q3 E-Waste Quarterly Return (Form 3)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    DUE IN 14 DAYS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Statutory Rule 13(1)(vii) mandate. Automated push notifications active for registered officers.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('heatmap')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Regional Heatmap &amp; Underperforming Districts</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Open Compliance Calendar</span>
              </button>
            </div>
          </div>

          {/* Flagged Devices Queue */}
          <div id="quarantine-queue-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Statutory Discrepancy & Quarantine Queue</h3>
              </div>
              <span className="text-xs text-amber-400 font-mono">STRICT CHAIN OF CUSTODY</span>
            </div>

            <div className="space-y-3">
              {devices
                .filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD')
                .map((d) => (
                  <div
                    key={d.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      d.status === 'FLAGGED'
                        ? 'bg-rose-950/20 border-rose-600/40'
                        : 'bg-amber-950/20 border-amber-600/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {d.brand} {d.model} ({d.category})
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                          {d.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            d.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{d.flagReason || d.holdReason}</p>
                      <div className="text-[10px] text-slate-400">
                        Intake: {d.intakeWeightKg} kg • Factory: {d.factoryWeightKg || 'Pending'} kg • Hub: {d.hubLocation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => onResolveFlag && onResolveFlag(d.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                        >
                          Admin Resolve with Note
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Compliance Logs (Searchable, Immutable Lifecycle Events with Cryptographic Hashes) */}
      {activeTab === 'compliance_logs' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Immutable Events</span>
                <Lock className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{lifecycleEvents.length}</div>
              <div className="text-[10px] text-purple-400">Section 15 MoEFCC Compliant</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Cryptographic Proof</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">100% Validated</div>
              <div className="text-[10px] text-slate-400">SHA-256 Merkle Block Root</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Assets in Custody</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{devices.length} Units</div>
              <div className="text-[10px] text-cyan-400">Complete Lifecycle Coverage</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tampering Flags</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">0 Incidents</div>
              <div className="text-[10px] text-emerald-400">Unbroken Chain of Custody</div>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Statutory Device Lifecycle Compliance Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Searchable, tamper-proof record of every milestone: CEIR checks, NIST data scrubs, calibrated scale weights, and payouts.
                </p>
              </div>

              {/* Export All Audit Logs Button */}
              <button
                onClick={handleExportAllAuditLogs}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-md shadow-purple-600/20 flex items-center gap-2 shrink-0"
                title="Download entire device lifecycle history as CSV for offline auditing"
              >
                <Download className="w-4 h-4" />
                <span>Export All Audit Logs (CSV)</span>
              </button>
            </div>

            {/* Filter pills & Search input */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    { key: 'all', label: 'All Lifecycle Events' },
                    { key: 'intake', label: 'Intake Registration' },
                    { key: 'ceir', label: 'Sanchar Saathi' },
                    { key: 'wipe', label: 'NIST/IEEE Purge' },
                    { key: 'scale', label: 'Scale Dispatches' },
                    { key: 'payout', label: 'DBT Payouts' },
                    { key: 'intervention', label: 'Hazmat Extraction' },
                    { key: 'audit', label: 'System Audits' }
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStageFilter(st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                      stageFilter === st.key
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative min-w-[260px] lg:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={complianceSearch}
                  onChange={(e) => setComplianceSearch(e.target.value)}
                  placeholder="Filter by device, serial, hash, actor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                {complianceSearch && (
                  <button
                    onClick={() => setComplianceSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Immutable Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <span>Verified Audit Logs & Device Milestones</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold">
                  {filteredComplianceLogs.length} Records
                </span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Cryptographically anchored on CPCB Parivesh Gateway
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp (IST) &amp; Block</th>
                    <th className="p-3.5">Device / Make</th>
                    <th className="p-3.5">Event Milestone</th>
                    <th className="p-3.5">Actor &amp; Station Node</th>
                    <th className="p-3.5">Cryptographic Hash (SHA-256)</th>
                    <th className="p-3.5">Details &amp; Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {filteredComplianceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                        No compliance events matched your query. Try clearing the filter or search term.
                      </td>
                    </tr>
                  ) : (
                    filteredComplianceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 align-top whitespace-nowrap">
                          <span className="text-slate-300 font-semibold block text-[11px]">
                            {log.timestamp}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 mt-1 inline-block">
                            {log.blockAnchor}
                          </span>
                        </td>

                        <td className="p-3.5 align-top font-sans">
                          <span className="font-bold text-white block text-xs">
                            {log.makeModel}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                              {log.deviceId}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400">{log.category}</span>
                          </div>
                        </td>

                        <td className="p-3.5 align-top">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.actionCategory === 'wipe'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : log.actionCategory === 'ceir'
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                : log.actionCategory === 'scale'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : log.actionCategory === 'payout'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : log.actionCategory === 'intervention'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{log.actionCode}</span>
                          </span>
                          <span className="block font-sans text-[11px] text-slate-300 font-medium mt-1">
                            {log.actionLabel}
                          </span>
                        </td>

                        <td className="p-3.5 align-top font-sans">
                          <span className="font-bold text-white block text-xs">
                            {log.actorName}
                          </span>
                          <span className="text-[10px] text-purple-400 block uppercase font-mono">
                            {log.actorRole}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 max-w-[180px] truncate" title={log.stationNode}>
                            {log.stationNode}
                          </span>
                        </td>

                        <td className="p-3.5 align-top">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[10px] text-cyan-400 font-mono truncate max-w-[150px] inline-block"
                              title={log.cryptographicHash}
                            >
                              {log.cryptographicHash.slice(0, 18)}...
                            </span>
                            <button
                              onClick={() => handleCopyHash(log.cryptographicHash)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                              title="Copy full cryptographic SHA-256 hash"
                            >
                              {copiedHash === log.cryptographicHash ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60 mt-1 font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{log.status}</span>
                          </span>
                        </td>

                        <td className="p-3.5 align-top font-sans text-slate-300 text-xs max-w-xs leading-relaxed">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: National Geography Hub Risk Heatmap */}
      {activeTab === 'national_map' && (
        <div className="space-y-6">
          <NationalHubRiskMap
            devices={devices}
            onSelectState={(stateData) => {
              setSelectedHeatmapState(stateData);
              setSelectedSparklineState(stateData);
            }}
          />
        </div>
      )}

      {/* Tab: Annual Audit History for State-Registered Hubs */}
      {activeTab === 'audit_history' && (
        <AnnualAuditHistoryTable
          onExportAuditReport={() => setShowForm6Modal(true)}
        />
      )}

      {/* Tab: Compliance History Log */}
      {activeTab === 'history' && (
        <ComplianceHistoryLog devices={devices} currentUser={currentUser} />
      )}

      {/* Tab: Compliance Deadline Calendar */}
      {activeTab === 'calendar' && (
        <ComplianceCalendar
          reminders={reminders}
          onAddReminder={onAddReminder}
          onDeleteReminder={onDeleteReminder}
          onTriggerPushNotification={onTriggerPushNotification}
        />
      )}

      {/* Tab 2: Quarterly CPCB Targets */}
      {activeTab === 'cpcb_targets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Quarterly E-Waste Processing Targets vs Actuals (EPR Filing)
              </h3>
              <p className="text-xs text-slate-400">
                Statutory filing progress under MoEFCC Schedule III rules. Automated alerts for impending deadlines.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>Q3 FILING DUE: 14 DAYS</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyComplianceData}>
                <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="statutoryTargetMT" name="CPCB Statutory Target (MT)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualRecycledMT" name="Actual Recycled (MT)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">YTD Target Compliance</span>
              <div className="text-xl font-bold text-purple-400 mt-1">98.4% Average</div>
              <span className="text-[10px] text-slate-400">Exceeds minimum 80% EPR mandate</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Upcoming Regulatory Filing</span>
              <div className="text-xl font-bold text-white mt-1">Form 3 (Quarterly)</div>
              <span className="text-[10px] text-amber-400">Deadline: 5 November 2026</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Statutory Storage Threshold</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">42 Days Avg</div>
              <span className="text-[10px] text-slate-400">Well below 180-day legal ceiling</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sanchar Saathi CEIR & Device IMEI Terminal */}
      {activeTab === 'imei_terminal' && (
        <div className="space-y-6">
          <ImeiDeviceLookupCard devices={devices} />
        </div>
      )}

      {/* Tab: Regional E-Waste Compliance Heatmap & District Matrix */}
      {activeTab === 'heatmap' && (
        <ComplianceHeatmap
          onSelectStateModal={(state) => setSelectedHeatmapState(state)}
        />
      )}

      {/* Tab 3: Immutable Audit Log */}
      {activeTab === 'audit_trail' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Statutory Audit Trail</h3>
              <p className="text-xs text-slate-400">
                MeitY & CERT-In compliant log entries retained for 180 days with cryptographic hash verification
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Filter logs by actor, entity or hash..."
                className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Entity Details</th>
                  <th className="p-3">IP / Network Node</th>
                  <th className="p-3">Tamper-Proof Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="p-3 font-sans">
                      <span className="font-bold text-white block">{log.actorName}</span>
                      <span className="text-[10px] text-purple-400">{log.actorRole}</span>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">{log.action}</td>
                    <td className="p-3 font-sans text-slate-300 max-w-xs">{log.details}</td>
                    <td className="p-3 text-slate-400 text-[10px]">{log.ipAddress}</td>
                    <td className="p-3 text-cyan-400 text-[10px]">{log.tamperProofHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Recycler Directory */}
      {activeTab === 'recycler_directory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">CPCB Authorized Recyclers & Refurbishers</h3>
            <p className="text-xs text-slate-400">Official national registered recyclers with valid Consent to Operate (CTO)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CPCB_RECYCLERS.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <p className="text-xs text-slate-400">{r.city}, {r.state}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div><span className="text-slate-500">CPCB Reg:</span> {r.cpcbRegNumber}</div>
                  <div><span className="text-slate-500">SPCB CTO:</span> {r.spcbConsentNumber}</div>
                  <div><span className="text-slate-500">Annual Capacity:</span> {r.annualCapacityTonnes.toLocaleString()} MT/yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formal CPCB Form-3 Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">
                  CPCB Form-3 Statutory Audit Submission
                </span>
              </div>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200">
              <div className="border-b-2 border-purple-600 pb-4">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  SCHEDULE III • FORM 3 [RULE 13(1)(VII), 13(3)(VI)]
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  OFFICIAL RETURN OF E-WASTE DISMANTLED & RECYCLED
                </h3>
                <p className="text-xs text-slate-400">
                  Central Pollution Control Board, Parivesh Bhawan, East Arjun Nagar, Delhi - 110032
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div><strong>Auditor in Charge:</strong> {currentUser.name} ({currentUser.id})</div>
                <div><strong>Reporting Period:</strong> FY 2026-27 (Quarter 1 to Quarter 3)</div>
                <div><strong>Total E-Waste Processed:</strong> 766.0 Metric Tonnes</div>
                <div><strong>Diverted from Landfills:</strong> 21,910 Metric Tonnes Nationwide</div>
                <div><strong>NIST SP 800-88 Data Scrub Validation:</strong> 100% Certified (0 incidents)</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-700/50 text-xs text-purple-300">
                This document is cryptographically verified against the national ledger. Contains immutable digital signatures compliant with Section 15 of Environment (Protection) Act.
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Form-3 CPCB Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State Detailed Metrics & Risk Dossier Modal */}
      {selectedHeatmapState && (
        <StateComplianceDetailModal
          stateData={selectedHeatmapState}
          onClose={() => setSelectedHeatmapState(null)}
        />
      )}

      {/* Download / Print Annual Report Modal */}
      {showAnnualReportModal && (
        <AnnualComplianceReportModal
          currentUser={currentUser}
          devices={devices}
          onClose={() => setShowAnnualReportModal(false)}
        />
      )}

      {/* Formal CPCB Form-6 Regulatory Transit Manifest & Audit Report Modal */}
      {showForm6Modal && (
        <CpcbForm6AuditReportModal
          currentUser={currentUser}
          devices={devices}
          onClose={() => setShowForm6Modal(false)}
        />
      )}

      {/* Digital Audit Trail Modal (Persistent in localStorage) */}
      {showDigitalAuditTrailModal && (
        <DigitalAuditTrailModal
          currentUser={currentUser}
          devices={devices}
          onClose={() => setShowDigitalAuditTrailModal(false)}
          onRecordNewOverride={() => {
            setStoredOverridesCount((prev) => prev + 1);
          }}
        />
      )}

      {/* Bulk Notify Hubs Modal */}
      {showBulkNotifyModal && (
        <BulkNotifyHubsModal
          onClose={() => setShowBulkNotifyModal(false)}
          onBroadcastComplete={(count, topic) => {
            setQuickActionToast({
              message: `Official directive [${topic}] successfully transmitted to ${count} regional hubs!`,
              type: 'success'
            });
            setTimeout(() => setQuickActionToast(null), 4500);
          }}
        />
      )}

      {/* CPCB Form-6 Quarterly Summary Report Modal */}
      {showQuarterlySummaryModal && (
        <QuarterlySummaryModal
          currentUser={currentUser}
          devices={devices}
          onClose={() => setShowQuarterlySummaryModal(false)}
        />
      )}
    </div>
  );
};
