import React, { useState } from 'react';
import {
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  FileCheck,
  Download,
  Check,
  Smartphone,
  Laptop,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  IndianRupee,
  Leaf
} from 'lucide-react';
import { DeviceCategory, DeviceCondition, DeviceItem, UserProfile } from '../types';
import { RATE_TABLE } from '../data/mockData';

interface CitizenPortalViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onRegisterDevice: (deviceData: Partial<DeviceItem>) => void;
  onConfirmDetails: (deviceId: string) => void;
  onUpdatePaymentPreference: (upiId: string, bankAccount?: UserProfile['bankAccount']) => void;
  onAcknowledgePayment: (deviceId: string) => void;
  onOpenQrModal: () => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  currentUser,
  devices,
  onRegisterDevice,
  onConfirmDetails,
  onUpdatePaymentPreference,
  onAcknowledgePayment,
  onOpenQrModal
}) => {
  const [activeTab, setActiveTab] = useState<'my_devices' | 'register_new' | 'rates_catalog'>('my_devices');
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(devices[0] || null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // New Device Form state
  const [formCategory, setFormCategory] = useState<DeviceCategory>('Smartphone');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formImei, setFormImei] = useState('');
  const [formCondition, setFormCondition] = useState<DeviceCondition>('working');
  const [formBattery, setFormBattery] = useState(true);
  const [formWeight, setFormWeight] = useState('0.25');
  const [formDeclaration, setFormDeclaration] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Payment form state
  const [upiInput, setUpiInput] = useState(currentUser.upiId || '');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(false);

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeclaration) {
      alert('You must accept the statutory ownership declaration under DPDP & E-Waste Rules.');
      return;
    }

    const newDeviceData: Partial<DeviceItem> = {
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.mobile,
      category: formCategory,
      brand: formBrand || 'Generic',
      model: formModel || 'Standard Unit',
      serialNumber: formSerial || `SR-${Math.floor(100000 + Math.random() * 900000)}`,
      imei: formImei || (formCategory === 'Smartphone' ? '864920048192800' : undefined),
      condition: formCondition,
      batteryPresent: formBattery,
      intakeWeightKg: parseFloat(formWeight) || 0.3,
      status: 'REGISTERED',
      estimatedScrapValue: 450,
      resaleValue: formCondition === 'working' ? 3500 : 0,
      payoutAmount: formCondition === 'working' ? 2450 : 450,
      payoutMethod: 'UPI',
      city: currentUser.city,
      state: currentUser.state,
      hubLocation: 'National Hub Sector 62 / Connaught Place',
      intakeImageUrl:
        formImageUrl ||
        (formCategory === 'Smartphone'
          ? 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'),
      co2SavedKg: formCategory === 'Smartphone' ? 58 : formCategory === 'Laptop' ? 245 : 120
    };

    onRegisterDevice(newDeviceData);
    setActiveTab('my_devices');
    alert('Device registered successfully! Scheduled for CPCB-verified intake.');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentPreference(upiInput);
    setIsEditingPayment(false);
    setPaymentSavedMsg(true);
    setTimeout(() => setPaymentSavedMsg(false), 3000);
  };

  const pipelineStages: { key: string; label: string; short: string }[] = [
    { key: 'REGISTERED', label: '1. Registered at Hub', short: 'Intake' },
    { key: 'DETAILS_CONFIRMED', label: '2. Owner Confirmed', short: 'Confirmed' },
    { key: 'WIPING', label: '3. NIST Data Wiping', short: 'Wiping' },
    { key: 'WIPE_VERIFIED', label: '4. Data Sanitized', short: 'Wiped' },
    { key: 'PAYMENT_SENT', label: '5. Payout Disbursed', short: 'Paid' },
    { key: 'PAYMENT_ACKNOWLEDGED', label: '6. Payment Confirmed', short: 'Payment OK' },
    { key: 'READY_FOR_DISPATCH', label: '7. Geotagged Dispatch', short: 'Dispatched' },
    { key: 'FACTORY_INSPECTION', label: '8. Factory Triage', short: 'Demanufacturing' },
    { key: 'RECYCLED', label: '9. Materials Extracted', short: 'Recycled' },
    { key: 'CERTIFIED', label: '10. CPCB Certificate', short: 'Certified' }
  ];

  const getStageIndex = (status: string) => {
    const idx = pipelineStages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  // User's total CO2
  const userCo2Saved = devices.reduce((sum, d) => sum + (d.co2SavedKg || 0), 0);
  const treesEquiv = Math.round(userCo2Saved / 22);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Personal Carbon Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Citizen Circular Guardian • DPDP & CPCB Verified</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Your registered e-waste items are processed exclusively through authorized CPCB recyclers. All personal data on media devices is scrubbed to NIST SP 800-88 cryptographic purge standards.
          </p>
        </div>

        {/* User Stats Card */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Personal Impact</div>
            <div className="text-lg font-bold text-white">{userCo2Saved.toFixed(1)} kg CO₂ Saved</div>
            <div className="text-[10px] text-emerald-400 font-medium">≈ {treesEquiv} Urban Trees Equivalent</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('my_devices')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'my_devices'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>My Registered Devices ({devices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register_new')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'register_new'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Register New E-Waste</span>
        </button>
        <button
          onClick={() => setActiveTab('rates_catalog')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'rates_catalog'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>National Price Index & Categories</span>
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'my_devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Device List on Left */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Device to View Stage
              </span>
              <button
                onClick={() => setActiveTab('register_new')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Device</span>
              </button>
            </div>

            {devices.map((device) => {
              const isSelected = selectedDevice?.id === device.id;
              const isHold = device.status === 'HOLD';
              const isFlagged = device.status === 'FLAGGED';

              return (
                <div
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {device.intakeImageUrl ? (
                          <img
                            src={device.intakeImageUrl}
                            alt={device.model}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Smartphone className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {device.brand} {device.model}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {device.category} • {device.condition}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isHold
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : isFlagged
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : device.status === 'CERTIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">{device.id}</span>
                    <span className="text-emerald-400 font-semibold">
                      ₹{device.payoutAmount.toLocaleString()} ({device.payoutMethod})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Device Detailed Stage Inspector on Right */}
          {selectedDevice && (
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {selectedDevice.brand} {selectedDevice.model}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedDevice.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned Hub: {selectedDevice.hubLocation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDevice.status === 'CERTIFIED' && (
                    <button
                      onClick={() => setShowCertificateModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View CPCB Certificate</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenQrModal}
                    title="View Chain of Custody QR"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Status Banner for HOLD or FLAGGED */}
              {selectedDevice.status === 'HOLD' && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Device Kept in Secure Quarantine (HOLD Status)</span>
                  </div>
                  <p>{selectedDevice.holdReason}</p>
                  <p className="text-[11px] text-amber-300/80">
                    Payment is suspended until ownership or activation lock is unlocked by the verified owner.
                  </p>
                </div>
              )}

              {selectedDevice.status === 'FLAGGED' && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-600/40 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Discrepancy Detected (FLAGGED Status)</span>
                  </div>
                  <p>{selectedDevice.flagReason}</p>
                  <p className="text-[11px] text-rose-300/80">
                    Our Factory Demanufacturing Auditor and Master Admin are reviewing this case.
                  </p>
                </div>
              )}

              {/* 10-Stage Horizontal Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Statutory Chain of Custody Lifecycle
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Current: {selectedDevice.status}
                  </span>
                </div>

                <div className="relative pt-2 pb-4 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 min-w-[680px]">
                    {pipelineStages.map((stage, idx) => {
                      const currentIdx = getStageIndex(selectedDevice.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950'
                                : isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-2 font-medium text-center ${
                              isCurrent
                                ? 'text-emerald-400 font-bold'
                                : isCompleted
                                ? 'text-slate-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage.short}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hardware Specifications Read by Hub Engineer */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Physical Triage & Hardware Profile
                  </span>
                  <span className="text-[11px] text-slate-400">Read & verified by Collection Engineer</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Storage Type & Size:</span>
                    <span className="text-white font-medium">
                      {selectedDevice.storageType || 'None'}{' '}
                      {selectedDevice.storageSizeGb ? `(${selectedDevice.storageSizeGb} GB)` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Serial / IMEI:</span>
                    <span className="text-white font-mono text-[11px]">
                      {selectedDevice.imei || selectedDevice.serialNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">UEFI Firmware:</span>
                    <span className="text-white font-mono text-[11px]">
                      {selectedDevice.uefiVersion || 'Standard Embedded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Battery Condition:</span>
                    <span
                      className={`font-semibold ${
                        selectedDevice.batteryHealth === 'Swollen Hazard'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedDevice.batteryHealth || 'No Battery'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Intake Scale Weight:</span>
                    <span className="text-white font-medium">{selectedDevice.intakeWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Condition State:</span>
                    <span className="text-emerald-400 font-semibold capitalize">
                      {selectedDevice.condition}
                    </span>
                  </div>
                </div>

                {/* Step 2 Owner Confirmation Action */}
                {selectedDevice.status === 'REGISTERED' && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-xs text-amber-300">
                      Please verify that the hardware specs entered by the engineer match your item.
                    </p>
                    <button
                      onClick={() => onConfirmDetails(selectedDevice.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>These Details Are Correct</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Data Sanitization Proof & Video Viewer */}
              {selectedDevice.wipeRecord && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        NIST SP 800-88 Data Erasure Proof
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {selectedDevice.wipeRecord.recoverySampleTest}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sanitization Standard:</span>
                      <span className="text-white font-medium">
                        {selectedDevice.wipeRecord.standard} ({selectedDevice.wipeRecord.method})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Software Tool & Version:</span>
                      <span className="text-white font-mono text-[11px]">
                        {selectedDevice.wipeRecord.toolName} {selectedDevice.wipeRecord.toolVersion}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Cryptographic SHA-256 Hash:</span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-slate-900 px-2 py-1 rounded block overflow-hidden text-ellipsis">
                        {selectedDevice.wipeRecord.verificationHash}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                      <span>Watch Data Scrub Video Proof</span>
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Operator: {selectedDevice.wipeRecord.engineerName}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment & Payout Preference */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Payout & Remittance Status
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">
                    ₹{selectedDevice.payoutAmount.toLocaleString()} ({selectedDevice.payoutMethod})
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Disbursement Account:</span>
                    {isEditingPayment ? (
                      <form onSubmit={handleSavePayment} className="flex gap-2">
                        <input
                          type="text"
                          value={upiInput}
                          onChange={(e) => setUpiInput(e.target.value)}
                          placeholder="UPI ID (e.g. user@okhdfcbank)"
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-xs"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400">
                          {currentUser.upiId || 'No UPI ID Set'}
                        </span>
                        {selectedDevice.status === 'REGISTERED' || selectedDevice.status === 'DETAILS_CONFIRMED' ? (
                          <button
                            onClick={() => setIsEditingPayment(true)}
                            className="text-[10px] text-slate-400 hover:text-white underline"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {paymentSavedMsg && (
                    <p className="text-[11px] text-emerald-400">Payout destination updated successfully.</p>
                  )}

                  {selectedDevice.payoutTxnRef && (
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Bank Txn Ref:</span>
                      <span className="text-white">{selectedDevice.payoutTxnRef}</span>
                    </div>
                  )}

                  {/* Payment Acknowledgment button */}
                  {selectedDevice.status === 'PAYMENT_SENT' && (
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-600/40 flex items-center justify-between mt-2">
                      <span className="text-xs text-emerald-300">
                        Payout has been remitted to your UPI ID. Please confirm receipt.
                      </span>
                      <button
                        onClick={() => onAcknowledgePayment(selectedDevice.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow"
                      >
                        I Received the Payment
                      </button>
                    </div>
                  )}

                  {selectedDevice.payoutAcknowledgedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Payment received and acknowledged on {selectedDevice.payoutAcknowledgedAt}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register New Device View */}
      {activeTab === 'register_new' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Register E-Waste Device for Green Recovery</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter hardware specifics. Devices are picked up by authorized state collection agents.
            </p>
          </div>

          <form onSubmit={handleCreateDevice} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as DeviceCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Smartphone">Smartphone / Mobile</option>
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="Desktop & Workstation">Desktop & Workstation</option>
                  <option value="Server & Network">Server & Network Gear</option>
                  <option value="Lithium Battery Pack">Lithium Battery Pack</option>
                  <option value="Solar PV Panel">Solar PV Panel</option>
                  <option value="PCB & Component Board">PCB & Motherboard</option>
                  <option value="Peripheral & Cable">Peripheral & Cable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand / Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Dell, Lenovo, HP, Samsung"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Model Name / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ThinkPad T480, iPhone 12, Galaxy S21"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Serial Number or IMEI
                </label>
                <input
                  type="text"
                  placeholder="IMEI (15-digit) or Serial Number"
                  value={formCategory === 'Smartphone' ? formImei : formSerial}
                  onChange={(e) =>
                    formCategory === 'Smartphone'
                      ? setFormImei(e.target.value)
                      : setFormSerial(e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Device Functional State *
                </label>
                <select
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value as DeviceCondition)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="working">Working (Eligible for Refurbishment / Reuse Payout)</option>
                  <option value="locked">Locked / Forgotten Password (Requires Hold Triage)</option>
                  <option value="not_booting">Dead / Not Booting (Raw Material Smelting)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Photo URL of Device (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg (or leave blank for catalog preview)"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Statutory Ownership & DPDP Consent Checkbox */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formDeclaration}
                  onChange={(e) => setFormDeclaration(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I solemnly declare that I am the legal owner of this device. I authorize Bharat E-Waste Hub and its CPCB-registered partners to perform irrevocable NIST SP 800-88 cryptographic data erasure and compliant material recycling under the E-Waste (Management) Rules 2022.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('my_devices')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Submit for Intake</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* National Rates Catalog */}
      {activeTab === 'rates_catalog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">National E-Waste Payout & Valuation Index</h3>
              <p className="text-xs text-slate-400">
                Official benchmark rates under statutory pricing rule: Offer = max(S, a × R) − H
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              UPDATED: OCTOBER 2026 BENCHMARK
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Working Buyback (Reuse)</th>
                  <th className="p-3">Locked Scrap (Hold)</th>
                  <th className="p-3">Dead Scrap (Refinery)</th>
                  <th className="p-3">Critical Element Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {RATE_TABLE.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-sans font-bold text-white">{item.category}</td>
                    <td className="p-3 text-emerald-400 font-semibold">{item.workingBuyback}</td>
                    <td className="p-3 text-amber-300">{item.lockedScrap}</td>
                    <td className="p-3 text-slate-400">{item.notBootingScrap}</td>
                    <td className="p-3 font-sans text-cyan-400 text-[11px]">
                      {item.recoveryPotential}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Proof Modal */}
      {showVideoModal && selectedDevice?.wipeRecord && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Data Sanitization Video Verification Proof
                </span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  src={selectedDevice.wipeRecord.videoProofUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong className="text-white">Device:</strong> {selectedDevice.brand}{' '}
                  {selectedDevice.model} ({selectedDevice.id})
                </p>
                <p>
                  <strong className="text-white">Erasure Method:</strong>{' '}
                  {selectedDevice.wipeRecord.method} per {selectedDevice.wipeRecord.standard}
                </p>
                <p>
                  <strong className="text-white">Verification SHA-256:</strong>{' '}
                  <span className="font-mono text-[10px] text-emerald-400">
                    {selectedDevice.wipeRecord.verificationHash}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Official Green Disposal & Data Destruction Certificate
                </span>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Government of India • CPCB Certified
                </span>
                <h4 className="text-xl font-extrabold text-white mt-1">
                  Certificate of Compliant Demanufacturing
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Certificate ID: {selectedDevice.certificateId}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-2 text-slate-300">
                <p>
                  <strong>Owner / Consignor:</strong> {selectedDevice.userName}
                </p>
                <p>
                  <strong>Asset:</strong> {selectedDevice.brand} {selectedDevice.model} (S/N:{' '}
                  {selectedDevice.serialNumber || selectedDevice.imei})
                </p>
                <p>
                  <strong>Data Sanitization:</strong> NIST SP 800-88 Rev. 2 Verified
                </p>
                <p>
                  <strong>Recycler Facility:</strong> {selectedDevice.recyclerName}
                </p>
                <p>
                  <strong>Calculated Carbon Offset:</strong> {selectedDevice.co2SavedKg} kg CO₂
                </p>
                <p className="font-mono text-[10px] text-slate-400 pt-1">
                  Digital Fingerprint: {selectedDevice.certificateHash}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
