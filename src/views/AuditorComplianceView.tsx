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
  BellRing,
  Laptop,
  Cpu,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Shield,
  MapPin,
  QrCode,
  XCircle,
  Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { AuditorSignedDeviceListPdfModal } from '../components/AuditorSignedDeviceListPdfModal';
import { DigitalAuditTrailModal, getStoredOverrides, saveStoredOverride, AuditorOverrideRecord } from '../components/DigitalAuditTrailModal';
import { NationalHubRiskMap } from '../components/NationalHubRiskMap';
import { ComplianceAiInsightPanel } from '../components/ComplianceAiInsightPanel';
import { BulkNotifyHubsModal } from '../components/BulkNotifyHubsModal';
import { QuarterlySummaryModal } from '../components/QuarterlySummaryModal';
import { BulkManifestQrModal } from '../components/BulkManifestQrModal';
import { AuditPassFailTrendChart } from '../components/AuditPassFailTrendChart';
import { AuditHistoryTimeline, ComplianceEventStatus } from '../components/AuditHistoryTimeline';

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
  const [showSignedDeviceListModal, setShowSignedDeviceListModal] = useState(false);
  const [showDigitalAuditTrailModal, setShowDigitalAuditTrailModal] = useState(false);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [showQuarterlySummaryModal, setShowQuarterlySummaryModal] = useState(false);
  const [showBulkManifestQrModal, setShowBulkManifestQrModal] = useState(false);
  const [quickActionToast, setQuickActionToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [storedOverridesCount, setStoredOverridesCount] = useState<number>(() => getStoredOverrides().length);
  const [selectedHeatmapState, setSelectedHeatmapState] = useState<StateComplianceData | null>(null);
  const [selectedSparklineState, setSelectedSparklineState] = useState<StateComplianceData>(STATE_COMPLIANCE_DATA[0]);
  const [complianceSearch, setComplianceSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'intake' | 'ceir' | 'wipe' | 'scale' | 'payout' | 'intervention' | 'audit'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Compliance Events Timeline Status Filter
  const [timelineStatusFilter, setTimelineStatusFilter] = useState<'ALL' | ComplianceEventStatus>('ALL');

  // Dedicated Device Status & Chain-of-Custody Table State
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<'ALL' | 'FLAGGED' | 'HOLD' | 'PURGED_NIST' | 'INTAKE' | 'TRANSIT' | 'CERTIFIED'>('ALL');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [deviceCategoryFilter, setDeviceCategoryFilter] = useState('ALL');
  const [deviceSortField, setDeviceSortField] = useState<'id' | 'weight' | 'co2' | 'status'>('id');
  const [deviceSortOrder, setDeviceSortOrder] = useState<'asc' | 'desc'>('desc');
  const [inspectingDevice, setInspectingDevice] = useState<DeviceItem | null>(null);
  const [copiedDeviceId, setCopiedDeviceId] = useState<string | null>(null);

  const deviceCategories = useMemo(() => {
    return Array.from(new Set(devices.map((d) => d.category)));
  }, [devices]);

  const filteredAuditorDevices = useMemo(() => {
    return devices
      .filter((device) => {
        // Status filter
        if (deviceStatusFilter === 'FLAGGED' && device.status !== 'FLAGGED') return false;
        if (deviceStatusFilter === 'HOLD' && device.status !== 'HOLD') return false;
        if (deviceStatusFilter === 'PURGED_NIST' && device.status !== 'WIPE_VERIFIED' && !device.wipeRecord) return false;
        if (deviceStatusFilter === 'INTAKE' && device.status !== 'REGISTERED' && device.status !== 'DETAILS_CONFIRMED' && device.status !== 'ACCEPTED') return false;
        if (deviceStatusFilter === 'TRANSIT' && device.status !== 'READY_FOR_DISPATCH' && device.status !== 'FACTORY_INSPECTION') return false;
        if (deviceStatusFilter === 'CERTIFIED' && device.status !== 'CERTIFIED' && device.status !== 'RECYCLED') return false;

        // Category filter
        if (deviceCategoryFilter !== 'ALL' && device.category !== deviceCategoryFilter) return false;

        // Search query
        if (deviceSearchTerm.trim()) {
          const q = deviceSearchTerm.toLowerCase();
          const matches =
            device.id.toLowerCase().includes(q) ||
            device.brand.toLowerCase().includes(q) ||
            device.model.toLowerCase().includes(q) ||
            (device.serialNumber && device.serialNumber.toLowerCase().includes(q)) ||
            (device.imei && device.imei.toLowerCase().includes(q)) ||
            (device.userName && device.userName.toLowerCase().includes(q)) ||
            (device.hubLocation && device.hubLocation.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (deviceSortField === 'weight') {
          return deviceSortOrder === 'asc' ? a.intakeWeightKg - b.intakeWeightKg : b.intakeWeightKg - a.intakeWeightKg;
        }
        if (deviceSortField === 'co2') {
          return deviceSortOrder === 'asc' ? (a.co2SavedKg || 0) - (b.co2SavedKg || 0) : (b.co2SavedKg || 0) - (a.co2SavedKg || 0);
        }
        if (deviceSortField === 'status') {
          return deviceSortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        }
        return deviceSortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      });
  }, [devices, deviceStatusFilter, deviceCategoryFilter, deviceSearchTerm, deviceSortField, deviceSortOrder]);

  const getDeviceStatusBadge = (status: DeviceItem['status']) => {
    switch (status) {
      case 'CERTIFIED':
      case 'RECYCLED':
        return {
          label: status === 'CERTIFIED' ? 'CPCB Certified' : 'Recycled Final',
          className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        };
      case 'WIPE_VERIFIED':
        return {
          label: 'NIST Purged',
          className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        };
      case 'WIPING':
        return {
          label: 'Wiping in Progress',
          className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        };
      case 'FLAGGED':
        return {
          label: 'Quarantined',
          className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        };
      case 'HOLD':
        return {
          label: 'Audit Hold',
          className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        };
      case 'READY_FOR_DISPATCH':
      case 'FACTORY_INSPECTION':
        return {
          label: status === 'READY_FOR_DISPATCH' ? 'Ready Dispatch' : 'Factory Inspection',
          className: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
        };
      case 'ACCEPTED':
      case 'DETAILS_CONFIRMED':
        return {
          label: 'Intake Verified',
          className: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
        };
      case 'PAYMENT_SENT':
      case 'PAYMENT_ACKNOWLEDGED':
        return {
          label: 'Settled',
          className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        };
      default:
        return {
          label: 'Registered',
          className: 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
        };
    }
  };

  const handleCopyDeviceId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedDeviceId(id);
    setTimeout(() => setCopiedDeviceId(null), 2000);
  };

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
      {/* Executive Statutory Header Banner */}
      <div className="auditor-header-banner p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-indigo-950/70 border border-purple-700/40 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/30 backdrop-blur-sm">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Central Pollution Control Board (CPCB) • Statutory Audit Node</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Regulatory Compliance, Targets &amp; Chain-of-Custody Audit
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Statutory oversight under E-Waste (Management) Rules 2022 &amp; Amendment G.S.R. 699(E). Automated verification of EPR obligations, immutable lifecycle logs, and tamper-proof SHA-256 cryptographic ledgers.
            </p>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center p-1.5 rounded-xl bg-slate-950/80 border border-purple-500/30 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-amber-400 px-2 flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Actions:</span>
            </span>

            <button
              onClick={handleClearAllFlagsClick}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Batch clear all pending quarantined flags across registry"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear All Flags</span>
            </button>

            <button
              onClick={() => setShowBulkNotifyModal(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Broadcast filing directives to all 22 state hubs"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Notify Hubs</span>
            </button>

            <button
              onClick={() => setShowQuarterlySummaryModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              title="Generate quarterly executive summary with print & export"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quarterly Summary</span>
            </button>
          </div>
        </div>

        {/* Regulatory Export Toolbars */}
        <div className="pt-3 border-t border-purple-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>DPDP Act 2023 &amp; NIST SP 800-88 Immutable Audit Trail Node</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBulkManifestQrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 border border-purple-400/50"
              title="Generate CPCB bulk manifest QR aggregating pending audit summary for digital verification"
            >
              <QrCode className="w-3.5 h-3.5 text-white" />
              <span>Bulk Manifest QR</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
                Rule 19
              </span>
            </button>

            <button
              onClick={() => setShowDigitalAuditTrailModal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900/90 text-xs font-semibold text-purple-200 hover:text-white transition shadow flex items-center gap-2 border border-purple-600/50"
              title="Inspect persistent digital audit trail of manual status overrides and flag resolutions"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Digital Audit Trail ({storedOverridesCount})</span>
            </button>

            <button
              onClick={() => setShowForm6Modal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 border border-purple-500/50"
              title="Export formal CPCB Form-6 regulatory audit report & manifest (Rule 19)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Audit Report</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
                CPCB Form-6
              </span>
            </button>

            <button
              onClick={() => setShowSignedDeviceListModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 border border-emerald-500/50"
              title="Export complete itemized device list as signed PDF for CPCB filing requirements"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Signed Device List (PDF)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-800 font-bold">
                Filing
              </span>
            </button>

            <button
              onClick={() => setShowAnnualReportModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 border border-indigo-500/40"
              title="Download print-friendly CPCB annual compliance dossier"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Annual Dossier</span>
            </button>

            <button
              onClick={handleExportAllAuditLogs}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-2 shadow"
              title="Download full tamper-proof CSV of all device lifecycle events and audit trails"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export CSV</span>
            </button>
          </div>
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

      {/* Sub Tabs Navigation */}
      <div className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-inner">
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'scorecard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditor Scorecard &amp; Registry</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'scorecard' ? 'bg-white/20 text-white' : 'bg-slate-800 text-purple-300'
          }`}>
            {devices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('national_map')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'national_map'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>National Hub Risk Map</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono">
            High-Risk vs Certified
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit_history')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'audit_history'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Annual Audit History</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
            10 State Hubs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('imei_terminal')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'imei_terminal'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>CEIR Sanchar Saathi</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance_logs')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'compliance_logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Device Provenance</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'calendar'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Deadline Calendar</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            Alert
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cpcb_targets')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'cpcb_targets'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Quarterly EPR Targets</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'heatmap'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>District Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'audit_trail'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Legacy Audit Trail ({AUDIT_LOGS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recycler_directory')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'recycler_directory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Authorized Recyclers</span>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 border-t-2 border-t-purple-500 shadow-lg space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Registered Units</span>
              <div className="text-2xl font-black text-white tracking-tight font-mono tabular-nums">
                {NATIONAL_STATS.platformRegisteredDevices.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Chain-of-Custody</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 border-t-2 border-t-cyan-500 shadow-lg space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Gross Collected Weight</span>
              <div className="text-2xl font-black text-white tracking-tight font-mono tabular-nums">
                {NATIONAL_STATS.platformTotalKgCollected.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-sans">
                <Scale className="w-3 h-3" />
                <span>NABL Calibrated Scale Logs</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 border-t-2 border-t-emerald-500 shadow-lg space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Data Erasure Rate</span>
              <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono tabular-nums">99.8%</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>NIST SP 800-88 Purged</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 border-t-2 border-t-rose-500 shadow-lg space-y-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Open Flags &amp; Holds</span>
              <div className="text-2xl font-black text-rose-400 tracking-tight font-mono tabular-nums">
                {devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length} <span className="text-sm font-normal text-rose-300">Cases</span>
              </div>
              <div className="text-[11px] text-rose-400/90 flex items-center gap-1 font-sans">
                <AlertTriangle className="w-3 h-3" />
                <span>Statutory Queue Active</span>
              </div>
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

          {/* Flagged Devices Queue with Motion Entry */}
          <div id="quarantine-queue-section" className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Statutory Discrepancy &amp; Quarantine Queue</h3>
              </div>
              <span className="text-xs text-amber-400 font-mono">STRICT CHAIN OF CUSTODY</span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {devices
                  .filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD')
                  .map((d, idx) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        d.status === 'FLAGGED'
                          ? 'bg-rose-950/20 border-rose-600/40'
                          : 'bg-amber-950/20 border-amber-600/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {d.brand} {d.model} ({d.category})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {d.id}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                              d.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{d.flagReason || d.holdReason}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Intake: {d.intakeWeightKg} kg • Plant: {d.factoryWeightKg ? `${d.factoryWeightKg} kg` : 'Pending'} • Hub: {d.hubLocation}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setInspectingDevice(d)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>Inspect</span>
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => onResolveFlag && onResolveFlag(d.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
                          >
                            Admin Resolve
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Dedicated Real-Time Device Status & Chain-of-Custody Table with Framer Motion entry animations */}
          <div id="device-status-table-section" className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Real-Time Registered Device Status &amp; Chain-of-Custody</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        CPCB Form 3 / Rule 13
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live inspection of registered consumer and enterprise e-waste consignments across all collection hubs and refineries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowSignedDeviceListModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  title="Export current registered device list as a signed CPCB statutory filing PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Signed PDF</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-purple-400 text-xs">
                  {filteredAuditorDevices.length} of {devices.length} Units
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3">
              {/* Segmented Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { key: 'ALL', label: 'All Registered', count: devices.length },
                  { key: 'FLAGGED', label: 'Quarantined', count: devices.filter(d => d.status === 'FLAGGED').length },
                  { key: 'HOLD', label: 'Audit Hold', count: devices.filter(d => d.status === 'HOLD').length },
                  { key: 'PURGED_NIST', label: 'NIST Scrubbed', count: devices.filter(d => d.status === 'WIPE_VERIFIED' || !!d.wipeRecord).length },
                  { key: 'TRANSIT', label: 'In Transit', count: devices.filter(d => d.status === 'READY_FOR_DISPATCH' || d.status === 'FACTORY_INSPECTION').length },
                  { key: 'CERTIFIED', label: 'Certified / Recycled', count: devices.filter(d => d.status === 'CERTIFIED' || d.status === 'RECYCLED').length },
                  { key: 'INTAKE', label: 'Ingress Intake', count: devices.filter(d => d.status === 'REGISTERED' || d.status === 'DETAILS_CONFIRMED' || d.status === 'ACCEPTED').length },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setDeviceStatusFilter(st.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      deviceStatusFilter === st.key
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      deviceStatusFilter === st.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search, Category & Sorting */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={deviceSearchTerm}
                    onChange={(e) => setDeviceSearchTerm(e.target.value)}
                    placeholder="Filter by device ID, brand, model, serial, IMEI, or consignor..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                  />
                  {deviceSearchTerm && (
                    <button
                      onClick={() => setDeviceSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={deviceCategoryFilter}
                    onChange={(e) => setDeviceCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">All Categories ({deviceCategories.length})</option>
                    {deviceCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={deviceSortField}
                    onChange={(e) => setDeviceSortField(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="id">Sort by Date / ID</option>
                    <option value="weight">Sort by Scale Weight</option>
                    <option value="co2">Sort by CO₂ Abated</option>
                    <option value="status">Sort by Status</option>
                  </select>

                  {(deviceSearchTerm || deviceStatusFilter !== 'ALL' || deviceCategoryFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setDeviceSearchTerm('');
                        setDeviceStatusFilter('ALL');
                        setDeviceCategoryFilter('ALL');
                      }}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1 border border-slate-700"
                      title="Reset filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Device Status Table with Framer Motion entry transitions */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 shadow-inner">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5">Device ID &amp; Timestamp</th>
                    <th className="py-3 px-3">Hardware Profile</th>
                    <th className="py-3 px-3">IMEI / Serial</th>
                    <th className="py-3 px-3">Statutory Status</th>
                    <th className="py-3 px-3">Scale Weight</th>
                    <th className="py-3 px-3">NIST Erasure &amp; Hash</th>
                    <th className="py-3 px-3 text-right">CO₂ &amp; Value</th>
                    <th className="py-3 px-3.5 text-right">Auditor Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <AnimatePresence mode="popLayout">
                    {filteredAuditorDevices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                          <div className="max-w-sm mx-auto space-y-2">
                            <Search className="w-6 h-6 text-slate-600 mx-auto" />
                            <p className="text-sm font-semibold text-slate-400">No registered devices matched your filter criteria</p>
                            <p className="text-xs text-slate-500">Try adjusting your search terms, status filters, or selected category.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAuditorDevices.map((device, idx) => {
                        const badge = getDeviceStatusBadge(device.status);
                        return (
                          <motion.tr
                            key={device.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                              duration: 0.28,
                              delay: Math.min(idx * 0.035, 0.35),
                              ease: [0.16, 1, 0.3, 1]
                            }}
                            className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60 font-mono text-xs group"
                          >
                            {/* Device ID */}
                            <td className="py-3.5 px-3.5 align-top">
                              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                                <span>{device.id}</span>
                                <button
                                  onClick={() => handleCopyDeviceId(device.id)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition"
                                  title="Copy Device ID"
                                >
                                  {copiedDeviceId === device.id ? (
                                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
                                {device.registeredAt}
                              </span>
                              <span className="text-[9px] text-slate-400 block truncate max-w-[170px]" title={device.hubLocation}>
                                {device.hubLocation}
                              </span>
                            </td>

                            {/* Make & Category */}
                            <td className="py-3.5 px-3 align-top font-sans">
                              <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                                {device.category === 'Smartphone' ? (
                                  <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                ) : device.category === 'Laptop' ? (
                                  <Laptop className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                ) : (
                                  <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                )}
                                <span>{device.brand} {device.model}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                <span>{device.category}</span>
                                <span>•</span>
                                <span className="capitalize">{device.condition}</span>
                              </div>
                            </td>

                            {/* Identification */}
                            <td className="py-3.5 px-3 align-top font-mono text-[11px]">
                              {device.imei ? (
                                <div className="space-y-0.5">
                                  <span className="text-cyan-400 font-semibold block">IMEI: {device.imei}</span>
                                  <span className="text-[9px] text-emerald-400 font-sans flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>DoT Saathi Clean</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="text-slate-300 block">SN: {device.serialNumber || 'N/A'}</span>
                                  <span className="text-[10px] text-slate-500">UEFI: {device.uefiVersion || 'Standard'}</span>
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3 align-top whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${badge.className}`}>
                                {device.status === 'FLAGGED' ? (
                                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                ) : device.status === 'HOLD' ? (
                                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                )}
                                <span>{badge.label}</span>
                              </span>
                              {device.flagReason && (
                                <span className="text-[10px] text-rose-400/90 block mt-1 max-w-[140px] truncate font-sans" title={device.flagReason}>
                                  {device.flagReason}
                                </span>
                              )}
                            </td>

                            {/* Scale Weight */}
                            <td className="py-3.5 px-3 align-top font-mono text-xs">
                              <div className="flex items-center justify-between gap-1 text-slate-200">
                                <span className="text-slate-500 text-[10px]">Intake:</span>
                                <span className="font-bold">{device.intakeWeightKg} kg</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-slate-500 text-[10px]">Plant:</span>
                                <span>{device.factoryWeightKg ? `${device.factoryWeightKg} kg` : 'Pending'}</span>
                              </div>
                              {device.weightDiscrepancyPct !== undefined && device.weightDiscrepancyPct !== 0 && (
                                <span className={`text-[10px] font-bold block mt-0.5 ${Math.abs(device.weightDiscrepancyPct) > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  Δ {device.weightDiscrepancyPct > 0 ? `+${device.weightDiscrepancyPct}` : device.weightDiscrepancyPct}%
                                </span>
                              )}
                            </td>

                            {/* NIST Erasure */}
                            <td className="py-3.5 px-3 align-top">
                              {device.wipeRecord ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 font-bold">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>NIST PURGED</span>
                                  </span>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[110px]" title={device.wipeRecord.verificationHash}>
                                      {device.wipeRecord.verificationHash.slice(0, 14)}...
                                    </span>
                                    <button
                                      onClick={() => handleCopyDeviceId(device.wipeRecord!.verificationHash)}
                                      className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                                      title="Copy Forensic Hash"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-sans">
                                  Standard Zeroing
                                </span>
                              )}
                            </td>

                            {/* CO2 & Payout */}
                            <td className="py-3.5 px-3 align-top text-right font-mono text-xs">
                              <span className="font-bold text-emerald-400 block">{device.co2SavedKg} kg CO₂</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                                ₹{device.payoutAmount?.toLocaleString() || '1,500'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3.5 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingDevice(device)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-200 hover:text-purple-200 border border-slate-700/80 transition flex items-center gap-1 text-xs font-semibold"
                                  title="Inspect full cryptographic lifecycle provenance dossier"
                                >
                                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Dossier</span>
                                </button>

                                {(device.status === 'FLAGGED' || device.status === 'HOLD') && onResolveFlag && (
                                  <button
                                    onClick={() => onResolveFlag(device.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                                    title="Statutory clearance of this discrepancy flag"
                                  >
                                    Resolve
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
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
                  <AnimatePresence mode="popLayout">
                    {filteredComplianceLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                          No compliance events matched your query. Try clearing the filter or search term.
                        </td>
                      </tr>
                    ) : (
                      filteredComplianceLogs.map((log, idx) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.24, delay: Math.min(idx * 0.025, 0.35) }}
                          className="hover:bg-slate-800/40 transition"
                        >
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
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
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

      {/* Tab: Annual Audit History, 12-Month Pass/Fail Trend & Step Timeline */}
      {activeTab === 'audit_history' && (
        <div className="space-y-6">
          {/* Recharts Bar Chart Visualizing Audit Pass/Fail Trend over last 12 months */}
          <AuditPassFailTrendChart />

          {/* Dedicated Executive Filter Bar for Compliance Events Timeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/25 to-slate-950 border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Filter className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Compliance Events Timeline Status Filter
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60 font-bold">
                  Rule 19 Live Audit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Filter historical CPCB verification events by statutory outcome: Pass, Fail, Flagged, or Pending.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { key: 'ALL', label: 'All Events', count: 10, icon: Sparkles, color: 'purple' },
                  { key: 'Pass', label: 'Pass', count: 4, icon: CheckCircle2, color: 'emerald' },
                  { key: 'Fail', label: 'Fail', count: 2, icon: XCircle, color: 'rose' },
                  { key: 'Flagged', label: 'Flagged', count: 2, icon: AlertTriangle, color: 'amber' },
                  { key: 'Pending', label: 'Pending', count: 2, icon: Hourglass, color: 'cyan' }
                ] as const
              ).map((f) => {
                const isSelected = timelineStatusFilter === f.key;
                const IconComponent = f.icon;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTimelineStatusFilter(f.key as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-sm ${
                      isSelected
                        ? f.color === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                          : f.color === 'rose'
                          ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/30 ring-2 ring-rose-500/40'
                          : f.color === 'amber'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-amber-600/30 ring-2 ring-amber-500/40'
                          : f.color === 'cyan'
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-600/30 ring-2 ring-cyan-500/40'
                          : 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30 ring-2 ring-purple-500/40'
                        : f.color === 'emerald'
                        ? 'bg-slate-900/90 text-emerald-300 hover:bg-emerald-950/60 border-slate-800 hover:border-emerald-700/60'
                        : f.color === 'rose'
                        ? 'bg-slate-900/90 text-rose-300 hover:bg-rose-950/60 border-slate-800 hover:border-rose-700/60'
                        : f.color === 'amber'
                        ? 'bg-slate-900/90 text-amber-300 hover:bg-amber-950/60 border-slate-800 hover:border-amber-700/60'
                        : f.color === 'cyan'
                        ? 'bg-slate-900/90 text-cyan-300 hover:bg-cyan-950/60 border-slate-800 hover:border-cyan-700/60'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-950 text-slate-400'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}

              {timelineStatusFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setTimelineStatusFilter('ALL')}
                  className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-800 transition flex items-center gap-1"
                  title="Reset to All Events"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Vertical Step Timeline for Past CPCB Verification Events */}
          <AuditHistoryTimeline
            statusFilter={timelineStatusFilter}
            onStatusFilterChange={setTimelineStatusFilter}
          />

          {/* Annual Audit History Table for State-Registered Hubs */}
          <AnnualAuditHistoryTable
            onExportAuditReport={() => setShowForm6Modal(true)}
          />
        </div>
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
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log, idx) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, delay: Math.min(idx * 0.025, 0.35) }}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="p-3 font-sans">
                        <span className="font-bold text-white block">{log.actorName}</span>
                        <span className="text-[10px] text-purple-400">{log.actorRole}</span>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">{log.action}</td>
                      <td className="p-3 font-sans text-slate-300 max-w-xs">{log.details}</td>
                      <td className="p-3 text-slate-400 text-[10px]">{log.ipAddress}</td>
                      <td className="p-3 text-cyan-400 text-[10px]">{log.tamperProofHash}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
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

      {/* CPCB Bulk Manifest QR Generation Modal for Digital Verification */}
      {showBulkManifestQrModal && (
        <BulkManifestQrModal
          isOpen={showBulkManifestQrModal}
          onClose={() => setShowBulkManifestQrModal(false)}
          devices={devices}
          currentUser={currentUser}
        />
      )}

      {/* Signed Device List PDF Report Modal for CPCB Statutory Filing */}
      {showSignedDeviceListModal && (
        <AuditorSignedDeviceListPdfModal
          isOpen={showSignedDeviceListModal}
          onClose={() => setShowSignedDeviceListModal(false)}
          currentUser={currentUser}
          devices={devices}
        />
      )}

      {/* Quick Device Provenance & Regulatory Lifecycle Dossier Modal */}
      {inspectingDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{inspectingDevice.brand} {inspectingDevice.model}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {inspectingDevice.id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Statutory Lifecycle Provenance &amp; Verification Dossier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingDevice(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                  <span className="text-white font-bold">{inspectingDevice.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Scale Weight</span>
                  <span className="text-cyan-400 font-bold">{inspectingDevice.intakeWeightKg} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">CO₂ Abated</span>
                  <span className="text-emerald-400 font-bold">{inspectingDevice.co2SavedKg} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Buyback Payout</span>
                  <span className="text-purple-400 font-bold">₹{inspectingDevice.payoutAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Hardware Profile & Sanchar Saathi */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block text-sm">Regulatory Hardware Specifications</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                  <div><span className="text-slate-500">Serial Number:</span> {inspectingDevice.serialNumber || 'N/A'}</div>
                  <div><span className="text-slate-500">Category:</span> {inspectingDevice.category}</div>
                  <div><span className="text-slate-500">IMEI (DoT):</span> {inspectingDevice.imei || 'Not applicable'}</div>
                  <div><span className="text-slate-500">UEFI Version:</span> {inspectingDevice.uefiVersion || 'Embedded standard'}</div>
                  <div><span className="text-slate-500">Consignor:</span> {inspectingDevice.userName}</div>
                  <div><span className="text-slate-500">Collection Node:</span> {inspectingDevice.hubLocation}</div>
                </div>
              </div>

              {/* NIST SP 800-88 Data Scrub Evidence */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>NIST SP 800-88 Rev. 2 Sanitization Record</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    PASSED
                  </span>
                </div>
                {inspectingDevice.wipeRecord ? (
                  <div className="space-y-1.5 font-mono text-[11px] text-slate-300 pt-1">
                    <div><span className="text-slate-400">Method:</span> {inspectingDevice.wipeRecord.method}</div>
                    <div><span className="text-slate-400">Sanitization Tool:</span> {inspectingDevice.wipeRecord.toolName} {inspectingDevice.wipeRecord.toolVersion}</div>
                    <div><span className="text-slate-400">Certifying Engineer:</span> {inspectingDevice.wipeRecord.engineerName}</div>
                    <div className="p-2 rounded bg-slate-950 border border-emerald-500/20 break-all text-emerald-400 text-[10px]">
                      Cryptographic Hash: {inspectingDevice.wipeRecord.verificationHash}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">
                    Standard cryptographic factory erasure performed upon ingress triage.
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    handleCopyDeviceId(inspectingDevice.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Device ID</span>
                </button>

                <div className="flex items-center gap-2">
                  {(inspectingDevice.status === 'FLAGGED' || inspectingDevice.status === 'HOLD') && onResolveFlag && (
                    <button
                      onClick={() => {
                        onResolveFlag(inspectingDevice.id);
                        setInspectingDevice(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                    >
                      Clear Discrepancy Flag
                    </button>
                  )}
                  <button
                    onClick={() => setInspectingDevice(null)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
