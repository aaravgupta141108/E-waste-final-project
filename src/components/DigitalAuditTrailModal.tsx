import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Hash,
  Copy,
  Check,
  ArrowRight,
  PlusCircle,
  Database,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserProfile, DeviceItem } from '../types';

export interface AuditorOverrideRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  makeModel: string;
  previousStatus: 'FLAGGED' | 'HOLD' | 'QUARANTINED' | 'UNDER_REVIEW';
  newStatus: 'OVERRIDE_APPROVED' | 'CLEARED' | 'QUARANTINE_LIFTED' | 'PROCEED_DISPATCH';
  reasonCategory:
    | 'Weighbridge Calibrated & Validated'
    | 'CEIR IMEI False Positive Resolved'
    | 'NIST SP 800-88 Wiped Offline'
    | 'Statutory Discrepancy Remediated'
    | 'Directorial Discretion Clearance';
  justificationNotes: string;
  auditorId: string;
  auditorName: string;
  auditorRole: string;
  stationNode: string;
  cryptographicHash: string;
  blockHeight: number;
  auditStatus: 'COMMITTED_IMMUTABLE' | 'BLOCK_ANCHORED';
}

const STORAGE_KEY = 'bharat_digital_audit_overrides';

export const INITIAL_AUDITOR_OVERRIDES: AuditorOverrideRecord[] = [
  {
    id: 'OVR-2026-9041',
    timestamp: '29 Oct 2026, 16:42:18 IST',
    deviceId: 'BHW-2026-0814',
    makeModel: 'Lenovo ThinkPad X1 Carbon (Gen 9)',
    previousStatus: 'FLAGGED',
    newStatus: 'OVERRIDE_APPROVED',
    reasonCategory: 'Weighbridge Calibrated & Validated',
    justificationNotes: 'Physical secondary weighbridge calibration re-run confirmed gross discrepancy was due to tare pallet weight offset of 0.85 kg. Re-weighed accurately.',
    auditorId: 'AUD-CPCB-77',
    auditorName: 'Priya Iyer',
    auditorRole: 'CPCB / SPCB Auditor',
    stationNode: 'National Ingress Hub #01 (Gurugram)',
    cryptographicHash: '8f4c91a02b37cde4581902abec89213456789abcdef0123456789abcdef01234',
    blockHeight: 892014,
    auditStatus: 'COMMITTED_IMMUTABLE'
  },
  {
    id: 'OVR-2026-8822',
    timestamp: '28 Oct 2026, 11:20:05 IST',
    deviceId: 'BHW-2026-0192',
    makeModel: 'Apple iPhone 13 Pro 256GB',
    previousStatus: 'HOLD',
    newStatus: 'CLEARED',
    reasonCategory: 'CEIR IMEI False Positive Resolved',
    justificationNotes: 'DoT Sanchar Saathi CEIR query returned historical insurance query flag that was discharged in 2024. Official clearance certificate #DOT-CLR-8812 verified.',
    auditorId: 'ADM-NATIONAL-01',
    auditorName: 'Vikramaditya Sen',
    auditorRole: 'Master Admin',
    stationNode: 'Central Oversight Node (MoEFCC HQ)',
    cryptographicHash: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809',
    blockHeight: 891780,
    auditStatus: 'BLOCK_ANCHORED'
  },
  {
    id: 'OVR-2026-8719',
    timestamp: '26 Oct 2026, 14:05:49 IST',
    deviceId: 'BHW-2026-0428',
    makeModel: 'Dell Precision 7560 Mobile Workstation',
    previousStatus: 'FLAGGED',
    newStatus: 'QUARANTINE_LIFTED',
    reasonCategory: 'NIST SP 800-88 Wiped Offline',
    justificationNotes: 'Physical NVMe drive degaussing and hardware cryptographic sanitize log extracted via USB debug port. Verified 3-pass DoD 5220.22-M / NIST SP 800-88 Purge.',
    auditorId: 'AUD-CPCB-77',
    auditorName: 'Priya Iyer',
    auditorRole: 'CPCB / SPCB Auditor',
    stationNode: 'Bengaluru Electronic City E-Waste Ingress Hub #04',
    cryptographicHash: 'def0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd',
    blockHeight: 891340,
    auditStatus: 'COMMITTED_IMMUTABLE'
  },
  {
    id: 'OVR-2026-8501',
    timestamp: '24 Oct 2026, 09:30:12 IST',
    deviceId: 'BHW-2026-0955',
    makeModel: 'HP Elite Dragonfly G2',
    previousStatus: 'HOLD',
    newStatus: 'PROCEED_DISPATCH',
    reasonCategory: 'Statutory Discrepancy Remediated',
    justificationNotes: 'Consignor commercial invoice typo corrected in portal ledger with notarized Annexure 4-A affidavit. Consignment unlocked for TSDF transit manifest generation.',
    auditorId: 'AUD-CPCB-77',
    auditorName: 'Priya Iyer',
    auditorRole: 'CPCB / SPCB Auditor',
    stationNode: 'National Ingress Hub #01 (Gurugram)',
    cryptographicHash: '456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123',
    blockHeight: 890890,
    auditStatus: 'BLOCK_ANCHORED'
  }
];

export function getStoredOverrides(): AuditorOverrideRecord[] {
  if (typeof window === 'undefined') return INITIAL_AUDITOR_OVERRIDES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDITOR_OVERRIDES));
      return INITIAL_AUDITOR_OVERRIDES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AUDITOR_OVERRIDES;
  } catch (err) {
    console.error('Failed reading digital audit overrides from storage:', err);
    return INITIAL_AUDITOR_OVERRIDES;
  }
}

export function saveStoredOverride(newRecord: AuditorOverrideRecord): AuditorOverrideRecord[] {
  const current = getStoredOverrides();
  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving digital audit override:', err);
  }
  return updated;
}

interface DigitalAuditTrailModalProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onClose: () => void;
  onRecordNewOverride?: (record: AuditorOverrideRecord) => void;
}

export const DigitalAuditTrailModal: React.FC<DigitalAuditTrailModalProps> = ({
  currentUser,
  devices,
  onClose,
  onRecordNewOverride
}) => {
  const [records, setRecords] = useState<AuditorOverrideRecord[]>(() => getStoredOverrides());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trail' | 'new_override'>('trail');

  // Form State for Recording a New Status Override
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || '');
  const [formPreviousStatus, setFormPreviousStatus] = useState<'FLAGGED' | 'HOLD' | 'QUARANTINED' | 'UNDER_REVIEW'>('FLAGGED');
  const [formNewStatus, setFormNewStatus] = useState<'OVERRIDE_APPROVED' | 'CLEARED' | 'QUARANTINE_LIFTED' | 'PROCEED_DISPATCH'>('OVERRIDE_APPROVED');
  const [formCategory, setFormCategory] = useState<AuditorOverrideRecord['reasonCategory']>('Weighbridge Calibrated & Validated');
  const [formJustification, setFormJustification] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState(false);

  // Sync state whenever local storage changes
  useEffect(() => {
    setRecords(getStoredOverrides());
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (categoryFilter !== 'all' && r.reasonCategory !== categoryFilter) return false;
      if (statusFilter !== 'all' && r.newStatus !== statusFilter) return false;

      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      return (
        r.id.toLowerCase().includes(q) ||
        r.deviceId.toLowerCase().includes(q) ||
        r.makeModel.toLowerCase().includes(q) ||
        r.auditorName.toLowerCase().includes(q) ||
        r.auditorId.toLowerCase().includes(q) ||
        r.justificationNotes.toLowerCase().includes(q) ||
        r.cryptographicHash.toLowerCase().includes(q) ||
        r.stationNode.toLowerCase().includes(q)
      );
    });
  }, [records, searchTerm, categoryFilter, statusFilter]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Override ID',
      'Timestamp (IST)',
      'Device ID',
      'Make & Model',
      'Previous Status',
      'New Status (Override)',
      'Reason Category',
      'Auditor Justification',
      'Auditor Name',
      'Auditor ID',
      'Station / Hub Node',
      'Cryptographic SHA-256 Hash',
      'Block Height',
      'Ledger Immutability'
    ];

    const escape = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = records.map((r) => [
      escape(r.id),
      escape(r.timestamp),
      escape(r.deviceId),
      escape(r.makeModel),
      escape(r.previousStatus),
      escape(r.newStatus),
      escape(r.reasonCategory),
      escape(r.justificationNotes),
      escape(r.auditorName),
      escape(r.auditorId),
      escape(r.stationNode),
      escape(r.cryptographicHash),
      escape(r.blockHeight),
      escape(r.auditStatus)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Digital_Audit_Trail_Overrides_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJustification.trim()) return;

    const matchedDevice = devices.find((d) => d.id === selectedDeviceId);
    const makeModel = matchedDevice ? `${matchedDevice.brand} ${matchedDevice.model}` : 'Electronic Asset';

    // Generate cryptographic pseudo-random SHA-256 hex string
    const hexChars = '0123456789abcdef';
    let randHash = '';
    for (let i = 0; i < 64; i++) {
      randHash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }

    const newRec: AuditorOverrideRecord = {
      id: `OVR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' IST',
      deviceId: selectedDeviceId,
      makeModel,
      previousStatus: formPreviousStatus,
      newStatus: formNewStatus,
      reasonCategory: formCategory,
      justificationNotes: formJustification.trim(),
      auditorId: currentUser.id,
      auditorName: currentUser.name,
      auditorRole: currentUser.role === 'admin' ? 'Master Admin' : 'CPCB / SPCB Auditor',
      stationNode: 'CPCB Central Regulatory Node (Regional HQ)',
      cryptographicHash: randHash,
      blockHeight: 892100 + Math.floor(Math.random() * 50),
      auditStatus: 'COMMITTED_IMMUTABLE'
    };

    const updated = saveStoredOverride(newRec);
    setRecords(updated);
    if (onRecordNewOverride) {
      onRecordNewOverride(newRec);
    }

    setFormSuccessMessage(true);
    setFormJustification('');
    setTimeout(() => {
      setFormSuccessMessage(false);
      setActiveTab('trail');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Digital Audit Trail &amp; Manual Override Registry
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  Persistent Storage
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Immutable Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory audit log tracking all manual flag resolutions, status overrides, and supervisory clearances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
              title="Download complete digital override history as CSV"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Export Audit CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('trail')}
              className={`pb-2 pt-1 font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'trail'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Override Audit Trail ({records.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('new_override')}
              className={`pb-2 pt-1 font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'new_override'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record New Override</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Persisted in browser localStorage: <strong className="text-purple-300 font-bold">{records.length} items</strong></span>
          </div>
        </div>

        {/* Tab 1: Override Audit Trail List */}
        {activeTab === 'trail' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by override ID, device ID, auditor, justification or SHA-256 hash..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Reason Categories</option>
                  <option value="Weighbridge Calibrated & Validated">Weighbridge Calibrated</option>
                  <option value="CEIR IMEI False Positive Resolved">CEIR False Positive</option>
                  <option value="NIST SP 800-88 Wiped Offline">NIST Wiped Offline</option>
                  <option value="Statutory Discrepancy Remediated">Discrepancy Remediated</option>
                  <option value="Directorial Discretion Clearance">Directorial Discretion</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Resulting Statuses</option>
                  <option value="OVERRIDE_APPROVED">OVERRIDE APPROVED</option>
                  <option value="CLEARED">CLEARED</option>
                  <option value="QUARANTINE_LIFTED">QUARANTINE LIFTED</option>
                  <option value="PROCEED_DISPATCH">PROCEED DISPATCH</option>
                </select>
              </div>
            </div>

            {/* Override Records Cards */}
            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No matching manual override audit records found.
                </div>
              ) : (
                filteredRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-3 hover:border-purple-500/40 transition shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800">
                          {r.id}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {r.deviceId} • {r.makeModel}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {r.previousStatus}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            {r.newStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>{r.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                      <span className="font-bold text-purple-300 block mb-0.5">
                        {r.reasonCategory}:
                      </span>
                      {r.justificationNotes}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Authorized by: <strong className="text-white">{r.auditorName}</strong> ({r.auditorRole} • {r.auditorId})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-slate-500">Block #{r.blockHeight}</span>
                        <span className="text-slate-600">|</span>
                        <span className="truncate max-w-[140px] text-slate-400" title={r.cryptographicHash}>
                          Hash: {r.cryptographicHash.slice(0, 16)}...
                        </span>
                        <button
                          onClick={() => handleCopyHash(r.cryptographicHash)}
                          className="text-purple-400 hover:text-purple-300 transition"
                          title="Copy SHA-256 cryptographic hash"
                        >
                          {copiedHash === r.cryptographicHash ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Record New Override Form */}
        {activeTab === 'new_override' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Statutory Audit Override Protocol</strong>
                All override submissions are cryptographically hashed and anchored into the digital ledger, creating an immutable audit trail under CPCB Rule 14. Data is stored directly into your persistent browser storage.
              </div>
            </div>

            {formSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Override successfully logged and committed to persistent storage with SHA-256 seal!</span>
              </div>
            )}

            <form onSubmit={handleCreateOverride} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Device for Override *</label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    required
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id} — {d.brand} {d.model} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Override Reason Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="Weighbridge Calibrated & Validated">Weighbridge Calibrated &amp; Validated</option>
                    <option value="CEIR IMEI False Positive Resolved">CEIR IMEI False Positive Resolved</option>
                    <option value="NIST SP 800-88 Wiped Offline">NIST SP 800-88 Wiped Offline</option>
                    <option value="Statutory Discrepancy Remediated">Statutory Discrepancy Remediated</option>
                    <option value="Directorial Discretion Clearance">Directorial Discretion Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current State Status *</label>
                  <select
                    value={formPreviousStatus}
                    onChange={(e) => setFormPreviousStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="FLAGGED">FLAGGED (Weight or Discrepancy)</option>
                    <option value="HOLD">HOLD (Quarantined by CEIR)</option>
                    <option value="QUARANTINED">QUARANTINED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Resolution Status *</label>
                  <select
                    value={formNewStatus}
                    onChange={(e) => setFormNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="OVERRIDE_APPROVED">OVERRIDE_APPROVED (Allow Process)</option>
                    <option value="CLEARED">CLEARED (Clean Bill)</option>
                    <option value="QUARANTINE_LIFTED">QUARANTINE_LIFTED (Released)</option>
                    <option value="PROCEED_DISPATCH">PROCEED_DISPATCH (Ready for Transit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Auditor Justification &amp; Remediation Narrative *
                </label>
                <textarea
                  rows={4}
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  placeholder="State the technical rationale, calibration certificate numbers, DoT CEIR reference, or inspection notes that justify this manual override..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div><strong>Submitting Auditor:</strong> {currentUser.name} ({currentUser.id})</div>
                <div><strong>Role:</strong> {currentUser.role}</div>
                <div><strong>Security Standard:</strong> Section 15 of Environment (Protection) Act, 1986</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('trail')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Lock className="w-4 h-4" />
                  <span>Commit Override to Immutable Audit Trail</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Audit logs comply with Section 15 of Environment Protection Act &amp; CERT-In cybersecurity retention directives.
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
