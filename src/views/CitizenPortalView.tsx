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
  Leaf,
  Camera,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Gift,
  Award,
  TrendingUp,
  Upload,
  UserCheck,
  BadgeCheck,
  Zap,
  Tag,
  MessageSquare
} from 'lucide-react';
import { DeviceCategory, DeviceCondition, DeviceItem, UserProfile } from '../types';
import { RATE_TABLE } from '../data/mockData';
import { DeviceLifecycleTimeline } from '../components/DeviceLifecycleTimeline';
import { Html5QrScannerModal } from '../components/Html5QrScannerModal';

interface CitizenPortalViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onRegisterDevice: (deviceData: Partial<DeviceItem>) => void;
  onConfirmDetails: (deviceId: string) => void;
  onUpdatePaymentPreference: (upiId: string, bankAccount?: UserProfile['bankAccount']) => void;
  onAcknowledgePayment: (deviceId: string) => void;
  onOpenQrModal: (deviceId?: string) => void;
  onOpenChat?: (caseId?: string) => void;
  onAdvanceDeviceStage?: (deviceId: string) => void;
  onOpenScanModal?: () => void;
  initialScannedTag?: string;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  currentUser,
  devices,
  onRegisterDevice,
  onConfirmDetails,
  onUpdatePaymentPreference,
  onAcknowledgePayment,
  onOpenQrModal,
  onOpenChat,
  onAdvanceDeviceStage,
  onOpenScanModal,
  initialScannedTag
}) => {
  const [activeTab, setActiveTab] = useState<'my_devices' | 'instant_valuation' | 'benefits_ledger' | 'rates_catalog'>(
    initialScannedTag ? 'instant_valuation' : 'my_devices'
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(devices[0] || null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isHtml5ScannerOpen, setIsHtml5ScannerOpen] = useState(false);

  // Sync selectedDevice when devices change (e.g. newly registered device)
  React.useEffect(() => {
    if (!selectedDevice && devices.length > 0) {
      setSelectedDevice(devices[0]);
    } else if (selectedDevice && !devices.some((d) => d.id === selectedDevice.id) && devices.length > 0) {
      setSelectedDevice(devices[0]);
    } else if (devices.length === 0) {
      setSelectedDevice(null);
    }
  }, [devices]);

  // Instant Intake & Valuation Form State
  const [formCategory, setFormCategory] = useState<DeviceCategory>('Smartphone');
  const [formBrand, setFormBrand] = useState('Apple');
  const [formModel, setFormModel] = useState('iPhone 12 128GB');
  const [formPurchaseYear, setFormPurchaseYear] = useState<number>(2023);
  const [formCondition, setFormCondition] = useState<DeviceCondition>('working');
  const [formBattery, setFormBattery] = useState(true);
  const [formWeight, setFormWeight] = useState('0.22');
  const [formSerial, setFormSerial] = useState('');
  const [formImei, setFormImei] = useState('');
  const [formDeclaration, setFormDeclaration] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'
  );

  // Pick & Drop scheduling fields
  const [pickupDate, setPickupDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [pickupAddress, setPickupAddress] = useState<string>(
    `${currentUser.city || 'Connaught Place'}, ${currentUser.state || 'Delhi NCR'}`
  );
  const [pickupPincode, setPickupPincode] = useState<string>(currentUser.pincode || '110001');

  // Payment form state
  const [upiInput, setUpiInput] = useState(currentUser.upiId || '');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(false);

  // Auto-populate when scanned tag arrives from scanner
  React.useEffect(() => {
    if (initialScannedTag) {
      setFormSerial(initialScannedTag);
      setFormImei(initialScannedTag);
      setActiveTab('instant_valuation');
    }
  }, [initialScannedTag]);

  // Real-time valuation estimation engine
  const valuation = React.useMemo(() => {
    const currentYear = 2026;
    const ageYears = Math.max(0.5, currentYear - formPurchaseYear);
    let baseResale = 0;
    let baseScrap = 0;
    let co2Kg = 58;

    switch (formCategory) {
      case 'Smartphone':
        baseResale = formBrand.toLowerCase().includes('apple') ? 14000 : 7500;
        baseScrap = 450;
        co2Kg = 58;
        break;
      case 'Laptop':
        baseResale = 22000;
        baseScrap = 1200;
        co2Kg = 245;
        break;
      case 'Desktop & Workstation':
        baseResale = 18000;
        baseScrap = 1500;
        co2Kg = 310;
        break;
      case 'Lithium Battery Pack':
        baseResale = 0;
        baseScrap = 3800;
        co2Kg = 180;
        break;
      case 'Solar PV Panel':
        baseResale = 3000;
        baseScrap = 800;
        co2Kg = 120;
        break;
      default:
        baseResale = 4000;
        baseScrap = 600;
        co2Kg = 85;
    }

    // Depreciation factor based on age
    const depreciationMultiplier = Math.max(0.2, 1 - ageYears * 0.18);
    const estimatedResale = Math.round(baseResale * depreciationMultiplier);

    // Condition adjustment
    let conditionFactor = 1.0;
    if (formCondition === 'locked') conditionFactor = 0.45;
    if (formCondition === 'not_booting') conditionFactor = 0.15;

    const workingValue = Math.round(estimatedResale * conditionFactor);
    const govtEprIncentive = Math.round(baseScrap * 0.6);
    const guaranteedPayout = Math.max(baseScrap, workingValue + govtEprIncentive);
    const greenKarmaPoints = Math.round(guaranteedPayout * 0.12) + 120;

    return {
      ageYears,
      scrapValue: baseScrap,
      functionalResale: workingValue,
      govtEprIncentive,
      guaranteedPayout,
      co2Kg,
      greenKarmaPoints
    };
  }, [formCategory, formBrand, formPurchaseYear, formCondition]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateDeviceWithValuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeclaration) {
      alert('Please confirm ownership declaration under DPDP and E-Waste Rules.');
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
      estimatedScrapValue: valuation.scrapValue,
      resaleValue: valuation.functionalResale,
      payoutAmount: valuation.guaranteedPayout,
      payoutMethod: 'UPI',
      city: currentUser.city,
      state: currentUser.state,
      hubLocation: 'National Hub Sector 62 / Connaught Place',
      intakeImageUrl: photoPreview,
      co2SavedKg: valuation.co2Kg,
      deviceAgeYears: valuation.ageYears,
      pickupInfo: {
        pickupId: `PKP-IND-${Date.now().toString().slice(-6)}`,
        scheduledDate: pickupDate,
        timeSlot: pickupTimeSlot,
        pickupAddress: pickupAddress,
        pincode: pickupPincode,
        assignedCollectorName: 'Vikram Singh (CPCB Badge #COL-882)',
        collectorPhone: '+91 98112 44910',
        collectorVehicleNumber: 'DL-01-EV-4491 (Green Corridor EV)',
        status: 'Scheduled',
        reachesEngineerEta: `Estimated Hub Arrival: ${pickupDate} by 03:30 PM`,
        engineerName: 'Rajesh Verma (ENG-COL-104)',
        hubLocation: 'CPCB Certified Hub #04 - Connaught Place',
        currentStageDescription: 'Doorstep pickup confirmed. Vehicle dispatched on scheduled slot.'
      },
      greenPointsEarned: valuation.greenKarmaPoints,
      carbonCreditsEarnedKg: valuation.co2Kg,
      financialBenefits: {
        upiPayoutInr: valuation.guaranteedPayout,
        eprSubsidyBonusInr: valuation.govtEprIncentive,
        greenTaxRebateInr: 250,
        dataSanitizationSavingsInr: 1200,
        totalBenefitsInr: valuation.guaranteedPayout + valuation.govtEprIncentive + 1450
      }
    };

    onRegisterDevice(newDeviceData);
    setActiveTab('my_devices');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentPreference(upiInput);
    setIsEditingPayment(false);
    setPaymentSavedMsg(true);
    setTimeout(() => setPaymentSavedMsg(false), 3000);
  };

  const pipelineStages = [
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CERTIFIED':
        return 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-500/25';
      case 'READY_FOR_DISPATCH':
        return 'bg-sky-950/90 text-sky-300 border border-sky-500/40';
      case 'WIPE_VERIFIED':
        return 'bg-purple-950/90 text-purple-300 border border-purple-500/40';
      case 'WIPING':
      case 'FACTORY_INSPECTION':
        return 'bg-amber-950/90 text-amber-300 border border-amber-500/40';
      case 'PAYMENT_SENT':
      case 'PAYMENT_ACKNOWLEDGED':
        return 'bg-teal-950/90 text-teal-300 border border-teal-500/40';
      case 'HOLD':
        return 'bg-amber-950 text-amber-400 border border-amber-600';
      case 'FLAGGED':
        return 'bg-rose-950 text-rose-300 border border-rose-600';
      default:
        return 'bg-slate-900 text-slate-300 border border-slate-700';
    }
  };

  // User's total stats
  const userCo2Saved = devices.reduce((sum, d) => sum + (d.co2SavedKg || 0), 0);
  const totalPayout = devices.reduce((sum, d) => sum + (d.payoutAmount || 0), 0);
  const totalPoints = currentUser.totalGreenPoints || Math.round(totalPayout * 0.15) + 350;

  return (
    <div className="space-y-6">
      {/* Verified Citizen Profile & Impact Hero Header (Mobbin / Awwwards Polish) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Identity & Verification Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>{currentUser.verificationMethod || 'DigiLocker KYC Verified'}</span>
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Aadhaar: {currentUser.aadhaarMasked || 'XXXX-XXXX-4920'}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Mobile: {currentUser.mobile}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentUser.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {devices.length} Devices Registered
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              National Statutory Consignor #{currentUser.id} • Registered under DPDP Act 2023 & CPCB E-Waste Rules 2022. All personal storage is wiped with zero-residual NIST SP 800-88 cryptographic sanitization.
            </p>
          </div>

          {/* Quick Metrics Bar & Action */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 min-w-[120px]">
              <span className="text-[10px] font-sans text-slate-400 block uppercase">Green Points</span>
              <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums flex items-center gap-1">
                <Award className="w-4 h-4" />
                {totalPoints.toLocaleString()} pts
              </div>
              <span className="text-[9px] text-slate-500">Redeemable Rewards</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 min-w-[120px]">
              <span className="text-[10px] font-sans text-slate-400 block uppercase">CO₂ Avoided</span>
              <div className="text-lg font-bold text-cyan-400 font-mono tabular-nums flex items-center gap-1">
                <Leaf className="w-4 h-4" />
                {userCo2Saved.toFixed(1)} kg
              </div>
              <span className="text-[9px] text-slate-500">Form-6 Certified</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 min-w-[120px]">
              <span className="text-[10px] font-sans text-slate-400 block uppercase">Total Payout</span>
              <div className="text-lg font-bold text-white font-mono tabular-nums flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                ₹{totalPayout.toLocaleString()}
              </div>
              <span className="text-[9px] text-emerald-400">Direct to UPI</span>
            </div>

            {/* Quick Camera QR Scanner Trigger */}
            <button
              onClick={() => setIsHtml5ScannerOpen(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center gap-1 transition shrink-0"
              title="Scan QR codes using camera powered by html5-qrcode"
            >
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span className="whitespace-nowrap">Scan QR (Camera)</span>
              </div>
              <span className="text-[9px] opacity-80 font-normal">html5-qrcode engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('my_devices')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'my_devices'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>My Registered Devices ({devices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('instant_valuation')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'instant_valuation'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Valuation &amp; Doorstep Intake</span>
          </button>
          <button
            onClick={() => setActiveTab('benefits_ledger')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'benefits_ledger'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4 text-cyan-400" />
            <span>Green Points &amp; Financial Benefits</span>
          </button>
          <button
            onClick={() => setActiveTab('rates_catalog')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'rates_catalog'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>National Price Catalog</span>
          </button>
        </div>

        {/* Scan Status Action */}
        <button
          onClick={() => setIsHtml5ScannerOpen(true)}
          className="mb-2 sm:mb-0 h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Status Check</span>
        </button>
      </div>

      {/* TAB 1: MY REGISTERED DEVICES & LIFECYCLE */}
      {activeTab === 'my_devices' && (
        devices.length === 0 ? (
          <div className="p-8 sm:p-14 text-center rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>0 REGISTERED DEVICES</span>
              </div>
              <h3 className="text-xl font-bold text-white">No E-Waste Items Registered Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Welcome to Bharat E-Waste Hub! Enter details of your old electronics below, upload or snap a photo to get an instant fair value estimation, and schedule free doorstep pick and drop.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('instant_valuation')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Get Instant Valuation &amp; Register</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Device List on Left */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Consignments ({devices.length})
                </span>
                <button
                  onClick={() => setActiveTab('instant_valuation')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Intake</span>
                </button>
              </div>

              {devices.map((device) => {
                const isSelected = selectedDevice?.id === device.id;
                const stageIdx = getStageIndex(device.status);

                return (
                  <div
                    key={device.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDevice(device)}
                    className={`transition-all duration-200 cursor-pointer rounded-2xl border ${
                      isSelected
                        ? 'p-4 sm:p-5 bg-gradient-to-b from-slate-850 to-slate-900 border-emerald-500/50 shadow-2xl shadow-emerald-950/30 ring-1 ring-emerald-500/20 scale-[1.01]'
                        : 'p-3.5 bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 transition-all ${
                          isSelected ? 'w-12 h-12 ring-2 ring-emerald-500/30 shadow-md' : 'w-10 h-10'
                        }`}>
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
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold ${isSelected ? 'text-white text-sm sm:text-base' : 'text-slate-200 text-xs sm:text-sm'}`}>
                              {device.brand} {device.model}
                            </h4>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {device.category} • <span className="capitalize">{device.condition.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(device.status)}`}
                        >
                          {device.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                          Step {stageIdx + 1}/10
                        </span>
                      </div>
                    </div>

                    {/* Rich Detail Snippet for Selected Card */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-slate-500 block font-sans">Pick &amp; Drop Status</span>
                          <span className="text-cyan-300 font-semibold truncate block">
                            {device.pickupInfo?.status || 'Scheduled at Doorstep'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block font-sans">CO₂ Offset</span>
                          <span className="text-emerald-400 font-semibold">+{device.co2SavedKg || 58} kg CO₂e</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 text-[10px]">{device.id}</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{device.payoutAmount.toLocaleString()} ({device.payoutMethod})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Device Detailed Stage Inspector on Right */}
            {selectedDevice && (
              <div className="lg:col-span-7 space-y-5">
                {/* Doorstep Pick & Drop Logistics Card */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Doorstep Pick &amp; Drop Facility Logistics
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {selectedDevice.pickupInfo?.currentStageDescription || 'Collection agent assigned for secure green-corridor transit.'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
                      {selectedDevice.pickupInfo?.status || 'Assigned & In Progress'}
                    </span>
                  </div>

                  {/* Pick & Drop Facility Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pickup Date &amp; Time Window</span>
                      </div>
                      <div className="text-white font-bold">
                        {selectedDevice.pickupInfo?.scheduledDate || 'Tomorrow'}, {selectedDevice.pickupInfo?.timeSlot || '10:00 AM - 01:00 PM'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span className="truncate">{selectedDevice.pickupInfo?.pickupAddress || currentUser.city}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Assigned Collection Officer</span>
                      </div>
                      <div className="text-white font-bold flex items-center justify-between">
                        <span>{selectedDevice.pickupInfo?.assignedCollectorName || 'Vikram Singh (CPCB #COL-882)'}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        Vehicle: {selectedDevice.pickupInfo?.collectorVehicleNumber || 'DL-01-EV-4491'} • Tel: {selectedDevice.pickupInfo?.collectorPhone || '+91 98112 44910'}
                      </div>
                    </div>
                  </div>

                  {/* ETA to Hub & Collection Engineer Callout */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          ETA to Collection Engineer:
                        </span>
                        <span className="text-[11px] text-emerald-300 font-mono">
                          {selectedDevice.pickupInfo?.reachesEngineerEta || 'Reaches Engineer Rajesh Verma (Hub #04): Today at 04:30 PM'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Hub Intake Engineer:</span>
                      <span className="text-xs text-white font-semibold">{selectedDevice.pickupInfo?.engineerName || 'Rajesh Verma (ENG-COL-104)'}</span>
                    </div>
                  </div>
                </div>

                {/* 10-Stage Device Lifecycle Timeline with Battery Health Widget */}
                <DeviceLifecycleTimeline
                  device={selectedDevice}
                  onAdvanceStage={onAdvanceDeviceStage}
                  canAdvance={true}
                />

                {/* Actions Bar (Certificate, QR Code, Video Proof, Operations Live Channel) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDevice.status === 'CERTIFIED' && (
                      <button
                        onClick={() => setShowCertificateModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>View CPCB Certificate</span>
                      </button>
                    )}
                    {selectedDevice.wipeRecord && (
                      <button
                        onClick={() => setShowVideoModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition"
                      >
                        <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                        <span>Watch Data Scrub Proof</span>
                      </button>
                    )}
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(selectedDevice.id)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-cyan-900/30"
                        title="Live operational channel for this case: Citizen • Hub Logistics • Factory Engineers"
                      >
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>Operations Live Channel ({selectedDevice.id})</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenQrModal(selectedDevice.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/70 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-emerald-900/30"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Physical Bin &amp; Custody QR ({selectedDevice.id})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* TAB 2: INSTANT AI VALUATION & PHOTO INTAKE */}
      {activeTab === 'instant_valuation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Intake Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Instant Device Valuation &amp; Doorstep Intake</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload or photograph your device to calculate instant scrap, reuse residual value, and government EPR bonuses.
              </p>
            </div>

            <form onSubmit={handleCreateDeviceWithValuation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Device Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DeviceCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Smartphone">Smartphone / Mobile</option>
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="Desktop & Workstation">Desktop &amp; Workstation</option>
                    <option value="Server & Network">Server &amp; Network Gear</option>
                    <option value="Lithium Battery Pack">Lithium Battery Pack</option>
                    <option value="Solar PV Panel">Solar PV Panel</option>
                    <option value="PCB & Component Board">PCB &amp; Component Board</option>
                    <option value="Peripheral & Cable">Peripheral &amp; Cable</option>
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
                    Model Name / Series *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13, ThinkPad T480, Galaxy S22"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Purchase Year (Age Estimation)
                  </label>
                  <select
                    value={formPurchaseYear}
                    onChange={(e) => setFormPurchaseYear(parseInt(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2025}>2025 (~1 year old)</option>
                    <option value={2024}>2024 (~2 years old)</option>
                    <option value={2023}>2023 (~3 years old)</option>
                    <option value={2022}>2022 (~4 years old)</option>
                    <option value={2021}>2021 (~5 years old)</option>
                    <option value={2019}>2019 or earlier (&gt;6 years old)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Physical &amp; Boot Condition *
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as DeviceCondition)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="working">Working (Screen intact, boots normally)</option>
                    <option value="locked">Locked / Screen cracked (Requires hold triage)</option>
                    <option value="not_booting">Dead / Not Booting (Raw metal smelting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Serial Number or IMEI (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter serial or scan tag"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Photo Upload / Camera Capture Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Device Photo / Condition Snapshot *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Device Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <p className="text-[11px] text-slate-400">
                      Take a quick photo of the front and back of the device using your camera, or upload an image from your device.
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer transition flex items-center gap-1.5 shadow">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take / Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoPreview(
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                      >
                        Use Sample Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doorstep Pick & Drop Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Where &amp; When Should We Collect the Device?</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Pickup Date:</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Time Slot:</label>
                    <select
                      value={pickupTimeSlot}
                      onChange={(e) => setPickupTimeSlot(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                      <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                      <option value="05:30 PM - 08:30 PM">Evening (05:30 PM - 08:30 PM)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block text-[11px] mb-1">Pickup Doorstep Address:</label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="House/Flat number, Street, Landmark"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ownership Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formDeclaration}
                  onChange={(e) => setFormDeclaration(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I confirm ownership and authorize NIST SP 800-88 cryptographic sanitization &amp; statutory CPCB recycling.
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lock Valuation &amp; Schedule Doorstep Collection</span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Dynamic Valuation Breakdown Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Live Valuation Engine
                </span>
                <h3 className="text-base font-bold text-white">Estimated Value Breakdown</h3>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Total Payout Offer Headline */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
              <span className="text-[11px] font-mono text-emerald-300 block">
                Guaranteed Instant UPI Payout Offer:
              </span>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                ₹{valuation.guaranteedPayout.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">
                Remitted directly to your UPI ID upon collection verification
              </p>
            </div>

            {/* Component Ledger */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Functional / Refurbish Residual</span>
                <span className="text-white font-bold">₹{valuation.functionalResale.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Certified Scrap &amp; Rare Earths</span>
                <span className="text-amber-400 font-bold">₹{valuation.scrapValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Govt Circular Economy Subsidy</span>
                <span className="text-emerald-400 font-bold">+₹{valuation.govtEprIncentive.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">NIST SP 800-88 Data Scrubbing</span>
                <span className="text-cyan-400 font-bold">100% Free (₹1,200 Value)</span>
              </div>
            </div>

            {/* Environmental & Carbon Perks */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-white block uppercase tracking-wider">
                Certified Environmental Yield:
              </span>
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold text-sm block">+{valuation.co2Kg} kg</span>
                  <span className="text-[10px] text-slate-400">Avoided CO₂e</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold text-sm block">+{valuation.greenKarmaPoints}</span>
                  <span className="text-[10px] text-slate-400">Green Karma Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GREEN POINTS & FINANCIAL BENEFITS LEDGER */}
      {activeTab === 'benefits_ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Points Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span className="font-bold uppercase tracking-wider">Green Points Balance</span>
                <Award className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {totalPoints.toLocaleString()} <span className="text-xs text-emerald-400 font-sans">Points</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Earned through verified e-waste disposal under MoEFCC Extended Producer Responsibility (EPR) regulations.
              </p>
            </div>

            {/* Carbon Credits Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/60 to-slate-900 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs text-cyan-400">
                <span className="font-bold uppercase tracking-wider">Verified Carbon Credits</span>
                <Leaf className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {(userCo2Saved / 1000).toFixed(3)} <span className="text-xs text-cyan-400 font-sans">tCO₂e</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registered under National Clean Development Mechanism. Token #{currentUser.id}-CR2026.
              </p>
            </div>

            {/* Financial Value Ledger Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span className="font-bold uppercase tracking-wider">Cumulative Financial Benefit</span>
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                ₹{(totalPayout + 2450).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes instant UPI payout, Section 80EE tax incentives, and free cryptographic data sanitization.
              </p>
            </div>
          </div>

          {/* Tangible Green Points Redemption Options */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Redeem Your Green Karma Points</span>
            </h3>
            <p className="text-xs text-slate-400">
              Government-backed citizen incentives redeemable for municipal transport, EV mobility, and utility bill discounts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  500 Points
                </span>
                <h4 className="font-bold text-white">Delhi Metro / RRTS Rebate</h4>
                <p className="text-slate-400 text-[11px]">₹250 direct smart card recharge for green transit commuters.</p>
                <button
                  onClick={() => alert('Voucher claimed! Token sent via SMS to ' + currentUser.mobile)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Claim Voucher
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  800 Points
                </span>
                <h4 className="font-bold text-white">Electricity Bill Credit</h4>
                <p className="text-slate-400 text-[11px]">₹400 credit applied to your registered DISCOM power account.</p>
                <button
                  onClick={() => alert('DISCOM rebate request submitted for next billing cycle!')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Apply to Bill
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  600 Points
                </span>
                <h4 className="font-bold text-white">Tata EV Fast Charge</h4>
                <p className="text-slate-400 text-[11px]">Free 25 kWh fast charging session at public green charging hubs.</p>
                <button
                  onClick={() => alert('EV Charging PIN code generated: EV-TATA-2026!')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Claim Pass
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                  1,200 Points
                </span>
                <h4 className="font-bold text-white">Eco-Store Discount</h4>
                <p className="text-slate-400 text-[11px]">₹800 flat voucher for certified refurbished laptops &amp; tablets.</p>
                <button
                  onClick={() => alert('Eco-Store Promo Code: CIRCULAR2026 active at checkout!')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Get Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NATIONAL PRICE INDEX CATALOG */}
      {activeTab === 'rates_catalog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">National E-Waste Payout &amp; Valuation Index</h3>
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

      {/* html5-qrcode Live Scanner Modal */}
      <Html5QrScannerModal
        isOpen={isHtml5ScannerOpen}
        onClose={() => setIsHtml5ScannerOpen(false)}
        devices={devices}
        onSelectDevice={(deviceId) => {
          const found = devices.find((d) => d.id === deviceId);
          if (found) {
            setSelectedDevice(found);
            setActiveTab('my_devices');
          }
        }}
        onRegisterWithTag={(tag) => {
          setFormSerial(tag);
          setFormImei(tag);
          setActiveTab('instant_valuation');
        }}
      />

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
                  Official Green Disposal &amp; Data Destruction Certificate
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
