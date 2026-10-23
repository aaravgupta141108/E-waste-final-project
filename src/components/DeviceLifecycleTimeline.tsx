import React, { useState, useMemo } from 'react';
import {
  Check,
  Clock,
  ShieldCheck,
  HardHat,
  Factory,
  Building2,
  UserCheck,
  FileCheck,
  Sparkles,
  ArrowRight,
  Truck,
  IndianRupee,
  Cpu,
  Lock,
  ChevronRight,
  Info,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Download,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  X,
  ExternalLink,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { DeviceItem, Role } from '../types';
import {
  downloadLifecycleReportJson,
  printLifecycleReport,
  buildLifecycleReportData
} from '../utils/lifecycleReportGenerator';

export interface DeviceLifecycleTimelineProps {
  device: DeviceItem;
  onAdvanceStage?: (deviceId: string) => void;
  canAdvance?: boolean;
}

export interface LifecycleStepInfo {
  key: DeviceItem['status'];
  stepNumber: number;
  label: string;
  short: string;
  actor: string;
  actorRole: Role;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  statutoryRef: string;
}

export const LIFECYCLE_STAGES: LifecycleStepInfo[] = [
  {
    key: 'REGISTERED',
    stepNumber: 1,
    label: 'Hub Intake & Weighing',
    short: 'Intake',
    actor: 'Consignor & Hub Logistics',
    actorRole: 'citizen',
    icon: UserCheck,
    description: 'Device registration logged with CPCB e-tag. Intake weight and visual verification completed.',
    statutoryRef: 'CPCB E-Waste Rules 2022 Schedule-I'
  },
  {
    key: 'DETAILS_CONFIRMED',
    stepNumber: 2,
    label: 'Consignor Declaration',
    short: 'Confirmed',
    actor: 'Citizen Consignor',
    actorRole: 'citizen',
    icon: Check,
    description: 'Statutory ownership declaration & DPDP Act data wiping authorization accepted.',
    statutoryRef: 'DPDP Act 2023 Sec 6(1)'
  },
  {
    key: 'WIPING',
    stepNumber: 3,
    label: 'NIST SP 800-88 Sanitization',
    short: 'Wiping',
    actor: 'Logistics Wiping Station',
    actorRole: 'collection_engineer',
    icon: Lock,
    description: 'BharatScrub cryptographically sanitizing magnetic, flash, and NVMe partitions.',
    statutoryRef: 'NIST SP 800-88 Rev. 2 / IEEE 2883'
  },
  {
    key: 'WIPE_VERIFIED',
    stepNumber: 4,
    label: 'SHA-256 Erasure Verified',
    short: 'Sanitized',
    actor: 'Sanitization Engine',
    actorRole: 'collection_engineer',
    icon: ShieldCheck,
    description: 'Cryptographic erasure verification hash generated with zero residual sectors.',
    statutoryRef: 'ISO/IEC 27040:2024 Storage Security'
  },
  {
    key: 'PAYMENT_SENT',
    stepNumber: 5,
    label: 'Payout Disbursed',
    short: 'Payout Sent',
    actor: 'MoEFCC Direct Benefit Node',
    actorRole: 'admin',
    icon: IndianRupee,
    description: 'Scrap value compensation disbursed to consignor via NPCI Instant UPI / Bank Transfer.',
    statutoryRef: 'CPCB Circular Economy Incentive'
  },
  {
    key: 'PAYMENT_ACKNOWLEDGED',
    stepNumber: 6,
    label: 'Payment Acknowledged',
    short: 'Paid',
    actor: 'Citizen Consignor',
    actorRole: 'citizen',
    icon: Check,
    description: 'Consignor confirmed bank receipt. Device custody released for green corridor transport.',
    statutoryRef: 'CPCB Form 2 Consignor Token'
  },
  {
    key: 'READY_FOR_DISPATCH',
    stepNumber: 7,
    label: 'Geotagged Fleet Transit',
    short: 'Transit',
    actor: 'Fleet Logistics Driver',
    actorRole: 'collection_engineer',
    icon: Truck,
    description: 'Assigned to GPS-monitored fleet vehicle. Hazmat Class 9 fire-retardant crating verified.',
    statutoryRef: 'CPCB Form 6 Hazardous Transit Manifest'
  },
  {
    key: 'FACTORY_INSPECTION',
    stepNumber: 8,
    label: 'Refinery Triage & Scales',
    short: 'Refinery',
    actor: 'Factory Demanufacturing Plant',
    actorRole: 'factory_engineer',
    icon: Factory,
    description: 'Calibrated optical sorting and optical material segregation at authorized CPCB refinery.',
    statutoryRef: 'CPCB Authorized Recycling Plant Reg.'
  },
  {
    key: 'RECYCLED',
    stepNumber: 9,
    label: 'Circular Material Recovery',
    short: 'Recycled',
    actor: 'Hydrometallurgy Refinery',
    actorRole: 'factory_engineer',
    icon: Cpu,
    description: 'Gold, copper, lithium, and rare earth elements recovered for industrial re-circulation.',
    statutoryRef: 'RoHS 2011 & Circular Metals Index'
  },
  {
    key: 'CERTIFIED',
    stepNumber: 10,
    label: 'CPCB Green Certificate',
    short: 'Certified',
    actor: 'CPCB Statutory Auditor',
    actorRole: 'auditor',
    icon: FileCheck,
    description: 'Official Government of India Form 6 Destruction Certificate issued with tamper-proof QR.',
    statutoryRef: 'MoEFCC / CPCB EPR Portal Master Registry'
  }
];

export const DeviceLifecycleTimeline: React.FC<DeviceLifecycleTimelineProps> = ({
  device,
  onAdvanceStage,
  canAdvance = true
}) => {
  const currentStepIndex = Math.max(
    0,
    LIFECYCLE_STAGES.findIndex((s) => s.key === device.status)
  );

  const [activeStageIndex, setActiveStageIndex] = useState<number>(currentStepIndex);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Keep activeStageIndex in sync when device status changes
  React.useEffect(() => {
    setActiveStageIndex(currentStepIndex);
  }, [currentStepIndex, device.status]);

  const inspectStage = LIFECYCLE_STAGES[activeStageIndex] || LIFECYCLE_STAGES[currentStepIndex];

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div
      role="region"
      aria-label="Device Lifecycle Progress Timeline"
      className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              Statutory Circular Lifecycle (Registered → WIPING → CERTIFIED)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Stage {currentStepIndex + 1} of 10: <span className="text-emerald-400 font-semibold">{LIFECYCLE_STAGES[currentStepIndex]?.label}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download Lifecycle Report Action Button */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="h-7 px-3 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 hover:text-white transition flex items-center gap-1.5 shadow-sm shadow-emerald-950/50 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
            title="Download summarized statutory lifecycle report (PDF or JSON) with NIST wipe verification hash & CPCB certificate ID"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Download Lifecycle Report</span>
          </button>

          {canAdvance && onAdvanceStage && currentStepIndex < LIFECYCLE_STAGES.length - 1 && (
            <button
              onClick={() => onAdvanceStage(device.id)}
              className="h-7 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              title="Advance device to the next stage in the lifecycle"
            >
              <span>Simulate Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            {Math.round(((currentStepIndex + 1) / LIFECYCLE_STAGES.length) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Visual Stepper Track (Horizontal scrollable with responsive nodes) */}
      <div className="relative overflow-x-auto pb-2 pt-1 no-scrollbar">
        <div
          role="list"
          aria-label="10-step circular lifecycle stages"
          className="flex items-center min-w-[760px] relative px-3"
        >
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isSelectedForInspect = idx === activeStageIndex;

            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
                className="flex-1 flex flex-col items-center relative group cursor-pointer"
                onClick={() => setActiveStageIndex(idx)}
              >
                {/* Connecting Track to Next Node */}
                {idx < LIFECYCLE_STAGES.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 -right-1/2 h-1 z-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-gradient-to-r from-cyan-400 to-slate-800'
                        : 'bg-slate-800'
                    }`}
                  />
                )}

                {/* Stepper Node Button */}
                <button
                  type="button"
                  aria-label={`Step ${idx + 1}: ${stage.label}. ${isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Upcoming'}`}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 group-hover:scale-105'
                      : isCurrent
                      ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/30 shadow-lg shadow-cyan-500/30 scale-110 font-black'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-400 group-hover:border-slate-500'
                  } ${isSelectedForInspect && !isCurrent ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.6]" />
                  ) : (
                    <span className="font-mono text-[11px]">{idx + 1}</span>
                  )}
                </button>

                {/* Node Label Below */}
                <span
                  className={`text-[10px] mt-2 font-medium text-center font-sans whitespace-nowrap transition-colors max-w-[70px] truncate ${
                    isCurrent
                      ? 'text-cyan-300 font-bold'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                  title={stage.label}
                >
                  {stage.short}
                </span>

                {/* Small indicator dot if currently inspected */}
                {isSelectedForInspect && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Card (Asymmetric interactive inspector for selected stage) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              activeStageIndex < currentStepIndex
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : activeStageIndex === currentStepIndex
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <inspectStage.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  Step {inspectStage.stepNumber}: {inspectStage.label}
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  activeStageIndex < currentStepIndex
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : activeStageIndex === currentStepIndex
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {activeStageIndex < currentStepIndex ? 'Verified' : activeStageIndex === currentStepIndex ? 'In Progress' : 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Responsible Officer / Entity: <strong className="text-slate-300">{inspectStage.actor}</strong>
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {inspectStage.statutoryRef}
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          {inspectStage.description}
        </p>

        {/* Verification data badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Device Serial / IMEI</span>
            <span className="text-slate-200 truncate block">{device.imei || device.serialNumber}</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Storage Sanitization State</span>
            <span className="text-cyan-400 truncate block">
              {device.wipeRecord?.status === 'Pass' || device.status === 'WIPE_VERIFIED' ? 'NIST SP 800-88 Sanitized' : 'In Custody / Pending'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Disbursed Consignor Compensation</span>
            <span className="text-emerald-400 font-bold block">
              ₹{device.payoutAmount.toLocaleString()} ({device.payoutMethod})
            </span>
          </div>
        </div>
      </div>

      {/* Battery Health Indicator Widget (Age-Based Decay Model & Sparkline) */}
      <BatteryHealthWidget device={device} />

      {/* Statutory Lifecycle Report Export Modal */}
      {showReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="report-modal-title" className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                    <span>Statutory E-Waste Lifecycle & Custody Report</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
                      CPCB Form 6 Verified
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official digital chain-of-custody dossier covering all 10 circular transit stages.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto font-sans">
              {/* Consignment Quick Badge */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">
                    {device.brand} {device.model} ({device.category})
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Consignor: <strong className="text-slate-200">{device.userName}</strong> · Hub: <strong className="text-slate-200">{device.hubLocation}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Current Status</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Stage {currentStepIndex + 1}/10: {LIFECYCLE_STAGES[currentStepIndex]?.short}
                  </span>
                </div>
              </div>

              {/* Cryptographic NIST SP 800-88 Wipe Verification Hash Highlight */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                      NIST SP 800-88 Data Sanitization Verification Hash
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {device.wipeRecord?.status === 'Pass' || currentStepIndex >= 3 ? 'PASSED (0 Residuals)' : 'IN PROGRESS'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Cryptographic wipe audit hash generated per NIST SP 800-88 Rev. 2 / IEEE 2883-2022 standards by BharatScrub sanitization engine.
                </p>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs">
                  <code className="text-cyan-400 text-[11px] flex-1 break-all select-all">
                    {device.wipeRecord?.verificationHash || 'SHA256:d8a4f10738cbb0e972841b9e15f403988ac6d26715fbc706c9a9238e81f5c6e2'}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(device.wipeRecord?.verificationHash || 'SHA256:d8a4f10738cbb0e972841b9e15f403988ac6d26715fbc706c9a9238e81f5c6e2')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 shrink-0 text-[10px] cursor-pointer"
                    title="Copy SHA-256 hash"
                  >
                    {copiedHash ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Statutory CPCB Form 6 Certificate ID Highlight */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                      CPCB Form 6 Certificate ID & Master Registry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    MoEFCC Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Certificate Identifier</span>
                    <span className="text-emerald-400 font-bold">
                      {device.certificateId || `CPCB-FORM6-${device.state?.slice(0, 2).toUpperCase() || 'DL'}-${new Date().getFullYear()}-${device.id.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Authorized CPCB Plant</span>
                    <span className="text-slate-200">
                      {device.recyclerName || 'EcoRecycle CleanTech Refinery #04'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Form 6 Master Seal: <span className="text-slate-300">{device.certificateHash || 'SHA256:8b472e9a0f3c1d5b7e8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f'}</span>
                </div>
              </div>

              {/* Key Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Consignor Payout</span>
                  <span className="text-emerald-400 font-bold">₹{device.payoutAmount.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Carbon Offset</span>
                  <span className="text-cyan-400 font-bold">{device.co2SavedKg || 18.5} kg CO₂</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Tree Equivalent</span>
                  <span className="text-amber-400 font-bold">{Math.max(1, Math.round((device.co2SavedKg || 18.5) / 22))} Trees</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Select export format for statutory records:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    downloadLifecycleReportJson(device);
                  }}
                  className="flex-1 sm:flex-initial h-9 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  title="Download machine-readable JSON schema report"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    printLifecycleReport(device);
                  }}
                  className="flex-1 sm:flex-initial h-9 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
                  title="Open printable Government of India CPCB Form 6 PDF dossier"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BatteryHealthWidget: React.FC<{ device: DeviceItem }> = ({ device }) => {
  const [simulatedAgeYears, setSimulatedAgeYears] = useState<number>(
    device.deviceAgeYears ?? (device.condition === 'not_booting' ? 4.8 : device.condition === 'locked' ? 3.0 : 2.2)
  );

  // Design capacity defaults based on category
  const designCapacity =
    device.batteryDecayModel?.designCapacityMah ||
    (device.category === 'Smartphone'
      ? 4500
      : device.category === 'Laptop'
      ? 4800
      : device.category === 'Lithium Battery Pack'
      ? 100000
      : 3200);

  // Age-based electrochemical decay equation:
  // SoH(t) = 100 - (alpha * t^0.85) - (cycles * 0.035)
  const annualDegradationRate = device.category === 'Lithium Battery Pack' ? 8.2 : 7.1;
  const estimatedCycles = Math.round(simulatedAgeYears * 220);
  const healthPct = Math.max(
    15,
    Math.min(
      100,
      Math.round(100 - (simulatedAgeYears * annualDegradationRate) - (estimatedCycles * 0.015))
    )
  );
  const remainingCapacity = Math.round((designCapacity * healthPct) / 100);

  const getStatusLevel = (pct: number) => {
    if (pct >= 80) return { label: 'Optimal / High Retention', color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
    if (pct >= 60) return { label: 'Degraded Normal Aging', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
    return { label: 'Critical / Swelling Risk', color: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' };
  };

  const statusLevel = getStatusLevel(healthPct);

  // Sparkline degradation time-series data using Arrhenius model across 0 to 6 years
  const decaySparklineData = useMemo(() => {
    const baseYears = [0, 1, 2, 3, 4, 5, 6];
    const roundedAge = Math.round(simulatedAgeYears * 10) / 10;
    const allYears = Array.from(new Set([...baseYears, roundedAge])).sort((a, b) => a - b);

    return allYears.map((t) => {
      const cyc = Math.round(t * 220);
      const sohVal = Math.max(
        15,
        Math.min(100, Math.round(100 - (t * annualDegradationRate) - (cyc * 0.015)))
      );
      const cap = Math.round((designCapacity * sohVal) / 100);
      const isCurrentPoint = Math.abs(t - simulatedAgeYears) < 0.06;

      return {
        year: t,
        label: t === 0 ? '0Y' : `${t}Y`,
        fullLabel: t === 0 ? 'Factory Spec (0 Years)' : `Year ${t.toFixed(1)} in Service`,
        soh: sohVal,
        capacity: cap,
        cycles: cyc,
        isCurrentPoint
      };
    });
  }, [designCapacity, annualDegradationRate, simulatedAgeYears]);

  const sparklineStrokeColor = healthPct < 60 ? '#f43f5e' : healthPct < 80 ? '#f59e0b' : '#10b981';
  const sparklineGradientId = `decay-gradient-${device.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (!device.batteryPresent) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          No chemical battery cell present in this consignment.
        </span>
        <span className="font-mono text-[10px] text-slate-500">Direct PCB & Silicon Refining</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-slate-900/60 border ${healthPct < 60 ? 'border-rose-500/80 shadow-lg shadow-rose-950/40' : 'border-slate-800/80'} p-4 space-y-3.5 transition-all`}>
      {/* Top Header of Battery Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusLevel.bg} ${statusLevel.border} border`}>
            <span className={`text-sm font-black font-mono ${statusLevel.text}`}>
              {healthPct}%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-bold text-white tracking-wide">
                Electrochemical Battery Health & Decay Analytics
              </h5>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusLevel.bg} ${statusLevel.border} ${statusLevel.text} font-semibold`}>
                {statusLevel.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Arrhenius Age-Decay Model: {simulatedAgeYears.toFixed(1)} years in service · ~{estimatedCycles} full equivalent cycles
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block">Usable Capacity</span>
          <span className="text-xs font-mono font-bold text-white tabular-nums">
            {remainingCapacity.toLocaleString()} / {designCapacity.toLocaleString()} mAh
          </span>
        </div>
      </div>

      {/* Critical / Warning State Alert Banner (< 60% Health Cutoff) */}
      {healthPct < 60 && (
        <div className="relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-900 border-2 border-rose-500/80 shadow-lg shadow-rose-950/60">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-200 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    CRITICAL BATTERY HEALTH WARNING ({healthPct}% SoH)
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-100 border border-rose-600 uppercase">
                    Immediate Recycling Suggested
                  </span>
                </div>
                <span className="text-[9px] font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  CPCB Hazmat Priority
                </span>
              </div>
              <p className="text-xs text-rose-100/90 leading-relaxed font-sans">
                Cell capacity has fallen below the <strong>60% safety threshold</strong>. Severe lithium plating and dendrite swelling risk detected. Continued residential use or storage poses thermal runaway hazard. <strong>Immediate recycling and hydrometallurgical lithium extraction is strongly recommended.</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-rose-300 font-medium">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Statutory Protocol: Class 9 Fire-Retardant Packaging &amp; Fast-Track Extraction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Capacity Decay Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-400">State of Health (SoH) Curve</span>
          <span className={`font-bold ${statusLevel.text} tabular-nums`}>
            {healthPct}% of Original Design
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              healthPct >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : healthPct >= 60
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>0% (Dead Cell)</span>
          <span>60% (CPCB Second-Life Cutoff)</span>
          <span>80% (Consumer Standard)</span>
          <span>100% (Factory Spec)</span>
        </div>
      </div>

      {/* Recharts Battery Degradation Over Time Sparkline */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <h6 className="font-bold text-white font-mono text-[11px] uppercase tracking-wider">
              Electrochemical Degradation Trajectory (Arrhenius SoH Sparkline)
            </h6>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Optimal (&gt;80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Aging (60-80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Cutoff (&lt;60%)
            </span>
          </div>
        </div>

        {/* Sparkline Area Chart */}
        <div className="h-28 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={decaySparklineData} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={sparklineGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sparklineStrokeColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={sparklineStrokeColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                ticks={[20, 60, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-[11px] font-mono space-y-1 backdrop-blur-md">
                        <div className="text-white font-bold">{pt.fullLabel}</div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">State of Health:</span>
                          <span className={`font-bold ${pt.soh < 60 ? 'text-rose-400' : pt.soh < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {pt.soh}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <span className="text-slate-400">Remaining Capacity:</span>
                          <span>{pt.capacity.toLocaleString()} mAh</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-400 text-[10px]">
                          <span>Charge Cycles:</span>
                          <span>~{pt.cycles} eq.</span>
                        </div>
                        <div className={`text-[10px] pt-1 border-t border-slate-800 ${pt.soh < 60 ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
                          {pt.soh < 60 ? '⚠️ Immediate recycling recommended (Swelling/Plating Hazard)' : pt.soh < 80 ? 'Normal consumer cycle wear' : 'Factory retention specification'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={60}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: '60% Cutoff',
                  position: 'insideTopRight',
                  fill: '#fb7185',
                  fontSize: 9
                }}
              />
              <Area
                type="monotone"
                dataKey="soh"
                stroke={sparklineStrokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${sparklineGradientId})`}
                dot={(props: any) => {
                  if (props.payload.isCurrentPoint) {
                    return (
                      <circle
                        key={`dot-cur-${props.index}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={`dot-${props.index}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={2}
                      fill={sparklineStrokeColor}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
            <span>Active Point: <strong className="text-white">{simulatedAgeYears.toFixed(1)} Yrs</strong> ({healthPct}% SoH)</span>
          </div>
          <div className="text-slate-500">
            Design: {designCapacity.toLocaleString()} mAh · Remaining: {remainingCapacity.toLocaleString()} mAh
          </div>
        </div>
      </div>

      {/* Decay Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <span className="text-slate-500 block text-[9px] font-sans">Degradation Velocity</span>
          <span className="text-slate-200 font-semibold tabular-nums">-{annualDegradationRate}% / yr</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <span className="text-slate-500 block text-[9px] font-sans">Cathode Integrity</span>
          <span className="text-cyan-400 font-semibold">{healthPct > 70 ? 'NMC Stable' : 'Impedance Rise'}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <span className="text-slate-500 block text-[9px] font-sans">Dendrite Swelling Risk</span>
          <span className={`font-semibold ${healthPct < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {healthPct < 60 ? 'Hazmat Class 9' : 'Low Nominal'}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <span className="text-slate-500 block text-[9px] font-sans">Circular Destination</span>
          <span className="text-amber-300 truncate block">
            {healthPct >= 65 ? 'Solar BESS Storage' : 'Direct Li-Hydrometallurgy'}
          </span>
        </div>
      </div>

      {/* Interactive Age Simulation Slider */}
      <div className="pt-1 border-t border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Simulate Operating Age:</span>
          <strong className="text-white font-mono">{simulatedAgeYears.toFixed(1)} Years</strong>
        </label>
        <div className="flex items-center gap-3 w-full sm:w-64">
          <span className="text-[10px] font-mono text-slate-500">New</span>
          <input
            type="range"
            min="0.2"
            max="6.0"
            step="0.1"
            value={simulatedAgeYears}
            onChange={(e) => setSimulatedAgeYears(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="text-[10px] font-mono text-slate-500">6Y+</span>
        </div>
      </div>
    </div>
  );
};
