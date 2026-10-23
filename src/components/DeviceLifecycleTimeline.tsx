import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { DeviceItem, Role } from '../types';

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

  // Keep activeStageIndex in sync when device status changes
  React.useEffect(() => {
    setActiveStageIndex(currentStepIndex);
  }, [currentStepIndex, device.status]);

  const inspectStage = LIFECYCLE_STAGES[activeStageIndex] || LIFECYCLE_STAGES[currentStepIndex];

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

        <div className="flex items-center gap-2">
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
              {device.wipeRecord?.status === 'VERIFIED' ? 'NIST SP 800-88 Sanitized' : 'In Custody / Pending'}
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
    </div>
  );
};
