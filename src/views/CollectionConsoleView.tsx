import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Search,
  Camera,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  IndianRupee,
  MapPin,
  Scale,
  Video,
  Play,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  Database,
  Check,
  Clock,
  PlusCircle,
  CheckCheck,
  Trash2,
  X
} from 'lucide-react';
import { DeviceCategory, DeviceCondition, DeviceItem, UserProfile, WipeRecord } from '../types';
import {
  saveOfflineDeviceLog,
  getPendingOfflineDeviceLogs,
  clearAllOfflineDeviceLogs,
  deleteOfflineDeviceLog,
  OfflineDeviceRecord
} from '../utils/offlineDb';

interface CollectionConsoleViewProps {
  devices: DeviceItem[];
  currentUser: UserProfile;
  onUpdateDeviceStatus: (deviceId: string, newStatus: DeviceItem['status'], extraData?: Partial<DeviceItem>) => void;
  onBulkImportDevices: (imported: Partial<DeviceItem>[]) => void;
}

export const CollectionConsoleView: React.FC<CollectionConsoleViewProps> = ({
  devices,
  currentUser,
  onUpdateDeviceStatus,
  onBulkImportDevices
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'intake' | 'cv_sorter' | 'wipe_station' | 'dispatch_geo' | 'bulk_import' | 'field_offline'>('intake');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');

  // Offline Field Intake & IndexedDB Queue State
  const [pendingOfflineLogs, setPendingOfflineLogs] = useState<OfflineDeviceRecord[]>([]);
  const [isFieldIntakeModalOpen, setIsFieldIntakeModalOpen] = useState(false);
  const [isSimulatingLowConnectivity, setIsSimulatingLowConnectivity] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Field intake modal inputs
  const [fieldCategory, setFieldCategory] = useState<DeviceCategory>('Smartphone');
  const [fieldBrand, setFieldBrand] = useState('Samsung');
  const [fieldModel, setFieldModel] = useState('Galaxy M31 Enterprise');
  const [fieldSerial, setFieldSerial] = useState(`SN-${Date.now().toString().slice(-6)}`);
  const [fieldImei, setFieldImei] = useState('864920048192837');
  const [fieldWeight, setFieldWeight] = useState('0.19');
  const [fieldCondition, setFieldCondition] = useState<DeviceCondition>('working');
  const [fieldCitizenName, setFieldCitizenName] = useState('Field Camp Consignor');
  const [fieldCitizenPhone, setFieldCitizenPhone] = useState('+91 98765 43210');
  const [fieldNotes, setFieldNotes] = useState('Collected via remote rural camp in low-connectivity zone');

  // Load offline records from IndexedDB
  const loadPendingLogs = async () => {
    try {
      const logs = await getPendingOfflineDeviceLogs();
      setPendingOfflineLogs(logs);
    } catch (e) {
      console.warn('Failed to load pending offline logs:', e);
    }
  };

  useEffect(() => {
    loadPendingLogs();
    const handleUpdate = () => loadPendingLogs();
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);

    window.addEventListener('offline-db-updated', handleUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline-db-updated', handleUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveFieldIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOffline = !isOnlineState || isSimulatingLowConnectivity;
    const weightNum = parseFloat(fieldWeight) || 0.25;

    if (effectiveOffline) {
      await saveOfflineDeviceLog({
        category: fieldCategory,
        brand: fieldBrand,
        model: fieldModel,
        serialNumber: fieldSerial,
        imei: fieldImei,
        condition: fieldCondition,
        intakeWeightKg: weightNum,
        hubLocation: currentUser.organization || 'Field Mobile Unit',
        engineerId: currentUser.id,
        engineerName: currentUser.name,
        notes: fieldNotes
      });
      alert(`[OFFLINE SAVED] Consignment stored in IndexedDB. Will sync automatically once online.`);
    } else {
      onBulkImportDevices([{
        category: fieldCategory,
        brand: fieldBrand,
        model: fieldModel,
        serialNumber: fieldSerial,
        imei: fieldImei,
        condition: fieldCondition,
        intakeWeightKg: weightNum,
        userName: fieldCitizenName,
        userPhone: fieldCitizenPhone,
        hubLocation: currentUser.organization,
        notes: fieldNotes
      }]);
      alert(`Consignment onboarded and synchronized directly to central registry!`);
    }

    setIsFieldIntakeModalOpen(false);
    loadPendingLogs();
  };

  const handleSyncLocalLogs = async () => {
    if (pendingOfflineLogs.length === 0) return;
    setIsSyncing(true);
    try {
      const itemsToImport: Partial<DeviceItem>[] = pendingOfflineLogs.map(log => ({
        category: log.category as DeviceCategory,
        brand: log.brand,
        model: log.model,
        serialNumber: log.serialNumber,
        imei: log.imei,
        condition: log.condition,
        intakeWeightKg: log.intakeWeightKg,
        userName: 'Field Camp Consignor (Synced)',
        hubLocation: log.hubLocation,
        notes: log.notes
      }));

      onBulkImportDevices(itemsToImport);
      await clearAllOfflineDeviceLogs();
      await loadPendingLogs();
      alert(`Synced ${itemsToImport.length} buffered consignments to the national registry!`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteSingleOffline = async (id: string) => {
    await deleteOfflineDeviceLog(id);
    await loadPendingLogs();
  };

  // AI CV Sorter State
  const [cvImage, setCvImage] = useState<string | null>(null);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvResult, setCvResult] = useState<{
    category: string;
    brand: string;
    conditionGrade: string;
    batteryRisk: string;
    confidence: number;
    estimatedWeightKg: number;
    suggestedScrapValue: number;
    suggestedBuybackValue: number;
  } | null>(null);

  // Sanchar Saathi IMEI State
  const [imeiInput, setImeiInput] = useState('864920048192837');
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiResult, setImeiResult] = useState<{
    status: 'CLEAN & GENUINE' | 'BLACKLISTED / STOLEN' | 'DUPLICATE IMEI';
    model: string;
    ceirStatus: string;
    actionRequired: string;
  } | null>(null);

  // Data Wipe Form State
  const [wipeMethod, setWipeMethod] = useState('ATA Secure Erase / Cryptographic Erase (Purge)');
  const [wipeStandard, setWipeStandard] = useState<'NIST SP 800-88 Rev. 2' | 'IEEE 2883-2022' | 'DoD 5220.22-M'>('NIST SP 800-88 Rev. 2');
  const [wipeTool, setWipeTool] = useState('BharatScrub Enterprise CLI v4.2');
  const [wipeEnergyKwh, setWipeEnergyKwh] = useState('0.065');
  const [wipeRecoverySample, setWipeRecoverySample] = useState<'Passed (0 sectors recoverable)' | 'Failed (Residual data detected)'>('Passed (0 sectors recoverable)');
  const [wipeNotes, setWipeNotes] = useState('');

  // Payment State
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [txnRefInput, setTxnRefInput] = useState(`UPI/${Date.now().toString().slice(-8)}/SBI`);

  // Dispatch Scale & Geo State
  const [dispatchWeight, setDispatchWeight] = useState('1.68');
  const [dispatchQty, setDispatchQty] = useState('1');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 28.5355,
    lng: 77.391,
    accuracy: 12
  });
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [dispatchBatchId, setDispatchBatchId] = useState('BATCH-DEL-2026-W43');

  // Bulk CSV state
  const [csvContent, setCsvContent] = useState(
    `Category,Brand,Model,SerialNumber,Condition,WeightKg\nSmartphone,OnePlus,Nord 2,1N7892182,working,0.19\nLaptop,Dell,Latitude 5400,DL54008291,working,1.55\nPCB & Component Board,Intel,Server Board S2600,INTEL-S26-90,not_booting,2.10\nLithium Battery Pack,Amaron,Li-Ion 24V Pack,AMR24V-991,not_booting,4.50`
  );

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  // Trigger simulated AI Computer Vision scan
  const handleRunAiClassifier = (imageUrl?: string) => {
    setCvAnalyzing(true);
    setCvResult(null);
    if (imageUrl) setCvImage(imageUrl);

    setTimeout(() => {
      setCvAnalyzing(false);
      setCvResult({
        category: 'Laptop Computer',
        brand: 'Lenovo ThinkPad Series',
        conditionGrade: 'Grade B (Minor chassis scuffs, motherboard intact)',
        batteryRisk: 'Low Hazard - Li-Polymer intact without swelling',
        confidence: 96.4,
        estimatedWeightKg: 1.65,
        suggestedScrapValue: 1200,
        suggestedBuybackValue: 8500
      });
    }, 1200);
  };

  // Run Sanchar Saathi CEIR check
  const handleCheckImei = () => {
    if (!imeiInput) return;
    setImeiChecking(true);
    setImeiResult(null);

    setTimeout(() => {
      setImeiChecking(false);
      if (imeiInput.endsWith('999') || imeiInput.includes('7731')) {
        setImeiResult({
          status: 'BLACKLISTED / STOLEN',
          model: 'Apple iPhone 11',
          ceirStatus: 'Reported on Sanchar Saathi CEIR portal as stolen in Delhi Police FIR #8821/2026',
          actionRequired: 'MANDATORY HOLD: Confiscate device into evidence locker and notify local police station.'
        });
      } else {
        setImeiResult({
          status: 'CLEAN & GENUINE',
          model: 'Samsung Galaxy Series Mobile Device',
          ceirStatus: 'GSMA TAC registered; No lost/stolen notices in National CEIR database.',
          actionRequired: 'Approved for intake and NIST data erasure pipeline.'
        });
      }
    }, 800);
  };

  // Submit NIST Wipe
  const handleExecuteWipe = () => {
    if (!selectedDevice) return;
    const generatedHash = `sha256-${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`;

    const wipeData: WipeRecord = {
      id: `WIPE-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceId: selectedDevice.id,
      method: wipeMethod,
      standard: wipeStandard,
      toolName: wipeTool,
      toolVersion: 'v4.2.1-IND',
      startTime: new Date(Date.now() - 35 * 60000).toLocaleString(),
      endTime: new Date().toLocaleString(),
      status: wipeRecoverySample.includes('Passed') ? 'Pass' : 'Fail',
      verificationHash: generatedHash,
      recoverySampleTest: wipeRecoverySample,
      energyKwh: parseFloat(wipeEnergyKwh) || 0.05,
      videoProofUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyber-security-screen-with-binary-codes-40085-large.mp4',
      engineerName: currentUser.name,
      notes: wipeNotes || 'Standard wipe executed with zero residual sectors detected.'
    };

    onUpdateDeviceStatus(selectedDevice.id, 'WIPE_VERIFIED', { wipeRecord: wipeData });
    alert('NIST SP 800-88 Data Sanitization verified! Device is now ready for Payout & Dispatch.');
  };

  // Submit Payout
  const handleSendPayment = () => {
    if (!selectedDevice) return;
    onUpdateDeviceStatus(selectedDevice.id, 'PAYMENT_SENT', {
      payoutTxnRef: txnRefInput,
      payoutSentAt: new Date().toLocaleString()
    });
    alert(`₹${selectedDevice.payoutAmount} remitted to citizen via ${payoutMethod}! Awaiting user confirmation.`);
  };

  // Submit Geotagged scale evidence
  const handleCaptureGps = () => {
    setGpsCaptured(true);
    // simulated browser geolocation with high accuracy
    setGpsCoordinates({
      lat: 28.5355 + (Math.random() - 0.5) * 0.005,
      lng: 77.391 + (Math.random() - 0.5) * 0.005,
      accuracy: 8.5
    });
  };

  const handleDispatchDevice = () => {
    if (!gpsCaptured) {
      alert('Statutory Rule: Geotagged scale verification is mandatory prior to dispatch.');
      return;
    }

    onUpdateDeviceStatus(selectedDevice.id, 'READY_FOR_DISPATCH', {
      batchId: dispatchBatchId,
      intakeWeightKg: parseFloat(dispatchWeight) || selectedDevice.intakeWeightKg
    });
    alert(`Device assigned to outgoing transit lot ${dispatchBatchId} for CPCB authorized factory demanufacturing!`);
  };

  // Bulk CSV parser
  const handleBulkParse = () => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV must contain a header and at least one data row.');
      return;
    }

    const items: Partial<DeviceItem>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 6) {
        items.push({
          id: `BHW-BULK-${Date.now().toString().slice(-4)}-${i}`,
          category: parts[0].trim() as DeviceCategory,
          brand: parts[1].trim(),
          model: parts[2].trim(),
          serialNumber: parts[3].trim(),
          condition: parts[4].trim() as DeviceCondition,
          intakeWeightKg: parseFloat(parts[5].trim()) || 1.0,
          status: 'REGISTERED',
          estimatedScrapValue: 800,
          resaleValue: parts[4].trim() === 'working' ? 4000 : 0,
          payoutAmount: parts[4].trim() === 'working' ? 2600 : 800,
          payoutMethod: 'Bank Transfer',
          city: currentUser.city,
          state: currentUser.state,
          hubLocation: currentUser.organization || 'Central E-Waste Hub',
          userId: 'USR-ENTERPRISE-BULK',
          userName: 'Enterprise Tech Consignor',
          userPhone: '+91 99999 11223',
          co2SavedKg: 150
        });
      }
    }

    onBulkImportDevices(items);
    alert(`Successfully parsed and onboarded ${items.length} bulk enterprise IT assets into national registry!`);
    setActiveSubTab('intake');
  };

  return (
    <div className="space-y-6" role="region" aria-label="Collection and Field Operations Hub">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/50 border border-amber-800/50 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <HardHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Collection & Logistics Console</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase">
                Field Operations
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Operator: {currentUser.name} • Assigned Station: {currentUser.organization}
            </p>
          </div>
        </div>

        {/* Offline Buffer & Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Low-connectivity simulation / field mode toggle */}
          <button
            onClick={() => setIsSimulatingLowConnectivity(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
              isSimulatingLowConnectivity || !isOnlineState
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Simulate low-connectivity or remote field operation without cell coverage"
            aria-label="Toggle low-connectivity field mode"
          >
            {isSimulatingLowConnectivity || !isOnlineState ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>
              {isSimulatingLowConnectivity
                ? 'Field Low-Signal Mode (Active)'
                : !isOnlineState
                ? 'Offline Mode'
                : 'Live Cloud Connected'}
            </span>
          </button>

          {/* Pending IndexedDB records indicator / sync button */}
          {pendingOfflineLogs.length > 0 && (
            <button
              onClick={handleSyncLocalLogs}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition animate-pulse"
              aria-label={`Sync ${pendingOfflineLogs.length} pending consignments stored in IndexedDB`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isSyncing ? 'Syncing...' : `Sync Offline Buffer (${pendingOfflineLogs.length})`}
              </span>
            </button>
          )}

          {/* Direct Field Consignment Button */}
          <button
            onClick={() => setIsFieldIntakeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
            aria-label="Log new field consignment"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Field Consignment Intake</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-xs text-slate-400">Pool:</span>
            <span className="text-sm font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/80 font-mono">
              {devices.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar" role="tablist" aria-label="Collection console subtabs">
        <button
          role="tab"
          aria-selected={activeSubTab === 'intake'}
          onClick={() => setActiveSubTab('intake')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'intake'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Device Intake & IMEI Check</span>
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'field_offline'}
          onClick={() => setActiveSubTab('field_offline')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'field_offline'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Field Offline Hub</span>
          {pendingOfflineLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-slate-950 font-extrabold">
              {pendingOfflineLogs.length}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'cv_sorter'}
          onClick={() => setActiveSubTab('cv_sorter')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'cv_sorter'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>AI Computer Vision Sorter</span>
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'wipe_station'}
          onClick={() => setActiveSubTab('wipe_station')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'wipe_station'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>NIST Data Wiping Station</span>
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'dispatch_geo'}
          onClick={() => setActiveSubTab('dispatch_geo')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'dispatch_geo'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Live Geotagged Scale Dispatch</span>
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'bulk_import'}
          onClick={() => setActiveSubTab('bulk_import')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeSubTab === 'bulk_import'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk CSV Data Intake</span>
        </button>
      </div>

      {/* SubTab 1: Device Intake & IMEI Check */}
      {activeSubTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Device Selector */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Incoming Queue for Verification
            </span>

            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedDevice?.id === device.id
                    ? 'bg-slate-800/90 border-amber-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {device.brand} {device.model}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {device.category} • {device.condition}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-950 text-amber-400 border border-slate-800">
                    {device.status}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>ID: {device.id}</span>
                  <span className="text-slate-300">{device.userName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sanchar Saathi & Triage Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Statutory Sanchar Saathi (CEIR) Verification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official DoT portal check to block stolen, blacklisted, or cloned mobile hardware before payout.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                placeholder="Enter 15-digit IMEI number"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleCheckImei}
                disabled={imeiChecking}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs font-semibold text-white transition flex items-center gap-1.5"
              >
                {imeiChecking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Check CEIR</span>
              </button>
            </div>

            {imeiResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                  imeiResult.status.includes('BLACKLISTED')
                    ? 'bg-rose-950/30 border-rose-600/50 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {imeiResult.status.includes('BLACKLISTED') ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {imeiResult.status}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-white">
                    {imeiResult.model}
                  </span>
                </div>
                <p className="text-xs">{imeiResult.ceirStatus}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-medium">
                  {imeiResult.actionRequired}
                </div>

                {imeiResult.status.includes('BLACKLISTED') && selectedDevice && (
                  <button
                    onClick={() =>
                      onUpdateDeviceStatus(selectedDevice.id, 'HOLD', {
                        holdReason: 'Sanchar Saathi CEIR Blacklist: Reported Stolen/Blocked'
                      })
                    }
                    className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold transition"
                  >
                    Move Device to HOLD Lockdown
                  </button>
                )}
              </div>
            )}

            {/* Quick action: Move to WIPING */}
            {selectedDevice && selectedDevice.status === 'DETAILS_CONFIRMED' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Ready for Data Scrub</div>
                  <div className="text-[11px] text-slate-400">
                    Citizen confirmed details. Proceed to NIST SP 800-88 sanitization.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onUpdateDeviceStatus(selectedDevice.id, 'WIPING');
                    setActiveSubTab('wipe_station');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  <span>Mount at Wiping Dock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 2: AI Computer Vision Intake Sorter */}
      {activeSubTab === 'cv_sorter' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Computer Vision Intake Classification & Hazard Detector</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Neural vision model trained on Schedule I CPCB categories. Identifies product type, structural casing integrity, and swollen battery combustion risks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Image Preview & Upload */}
            <div className="lg:col-span-6 space-y-3">
              <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {cvImage ? (
                  <img src={cvImage} alt="CV Inspection" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      Upload device photo or pick sample below to test AI model
                    </p>
                  </div>
                )}

                {cvAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <p className="text-xs font-bold text-amber-400">Running Multi-Spectral Classification...</p>
                    <span className="text-[10px] text-slate-400 font-mono">TensorFlow Edge Inference</span>
                  </div>
                )}
              </div>

              {/* Sample Photo Pickers */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Quick Test Samples:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleRunAiClassifier(
                        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700 text-center"
                  >
                    Laptop PC
                  </button>
                  <button
                    onClick={() =>
                      handleRunAiClassifier(
                        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700 text-center"
                  >
                    Smartphone
                  </button>
                  <button
                    onClick={() =>
                      handleRunAiClassifier(
                        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700 text-center"
                  >
                    Server Motherboard
                  </button>
                </div>
              </div>
            </div>

            {/* Neural Output Card */}
            <div className="lg:col-span-6 space-y-4">
              {cvResult ? (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                        Inference Completed • {cvResult.confidence}% Confidence
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{cvResult.brand}</h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {cvResult.category}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Triage Condition Grade:</span>
                      <span className="text-white font-medium">{cvResult.conditionGrade}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Hazard & Thermal Safety Check:</span>
                      <span className="text-emerald-400 font-semibold">{cvResult.batteryRisk}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Estimated Raw Scrap:</span>
                        <span className="text-white font-bold">₹{cvResult.suggestedScrapValue}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Reuse Buyback Potential:</span>
                        <span className="text-emerald-400 font-bold">₹{cvResult.suggestedBuybackValue}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    AI classification mapped to Schedule I Item Code #106. Operator must physically confirm battery state before racking.
                  </p>
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Click a test sample to evaluate neural vision detector</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: NIST Data Wiping Station */}
      {activeSubTab === 'wipe_station' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>NIST SP 800-88 Rev. 2 & IEEE 2883-2022 Data Sanitization Dock</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select device to execute cryptographic block purge, energy logging, and generate immutable SHA-256 wipe certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Mounted Device
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} - {d.brand} {d.model} ({d.storageType || 'Flash'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sanitization Standard
              </label>
              <select
                value={wipeStandard}
                onChange={(e) => setWipeStandard(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="NIST SP 800-88 Rev. 2">NIST SP 800-88 Rev. 2 (Mandatory Statutory)</option>
                <option value="IEEE 2883-2022">IEEE 2883-2022 (Modern NVMe / Solid-State Standard)</option>
                <option value="DoD 5220.22-M">DoD 5220.22-M (Triple Pass Overwrite)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sanitization Method (Tied to Storage Media)
              </label>
              <select
                value={wipeMethod}
                onChange={(e) => setWipeMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ATA Secure Erase / Cryptographic Erase (Purge)">
                  NVMe/SATA Cryptographic Purge (Block Erase)
                </option>
                <option value="OEM Secure Enclave Cryptographic Reset (Clear/Purge)">
                  Smartphone OEM Key Revocation & Cryptographic Zeroing
                </option>
                <option value="Multi-Pass Zero Overwrite (Clear)">
                  HDD Multi-Pass Sector Overwrite (Clear)
                </option>
                <option value="Physical Storage Component Destruction">
                  Dead Media Mechanical Cross-cut Shredding
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Energy Meter Reading (Measured kWh)
              </label>
              <input
                type="number"
                step="0.001"
                value={wipeEnergyKwh}
                onChange={(e) => setWipeEnergyKwh(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sampled Forensic Recovery Test Result
              </label>
              <select
                value={wipeRecoverySample}
                onChange={(e) => setWipeRecoverySample(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Passed (0 sectors recoverable)">Passed (0 sectors recoverable)</option>
                <option value="Failed (Residual data detected)">Failed (Residual data detected)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Erasure Tool & Version
              </label>
              <input
                type="text"
                value={wipeTool}
                onChange={(e) => setWipeTool(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleExecuteWipe}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign Off & Issue NIST Wipe Certificate</span>
            </button>
          </div>

          {/* Payment Section for Wiped Devices */}
          {selectedDevice && selectedDevice.status === 'WIPE_VERIFIED' && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span>Disburse Buyback Payout to Owner</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data verified scrubbed. Statutory rule: Offer = max(S, a × R) − H
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Payout:</div>
                  <div className="text-lg font-bold text-emerald-400">
                    ₹{selectedDevice.payoutAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payout Rail
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="UPI">Instant UPI (NPCI Verified)</option>
                    <option value="Bank Transfer">IMPS / NEFT Direct Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Gateway Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={txnRefInput}
                    onChange={(e) => setTxnRefInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={handleSendPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow"
                >
                  Disburse ₹{selectedDevice.payoutAmount} & Notify Citizen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 4: Live Geotagged Scale Dispatch */}
      {activeSubTab === 'dispatch_geo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Live Geotagged Scale Weighing & Factory Dispatch Proof</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Statutory verification requirement: Device weight recorded on calibrated scale with live browser GPS coordinate verification (&lt;100m accuracy) to eliminate phantom recycling claims.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Paid Device for Dispatch
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {devices
                  .filter((d) => d.status === 'PAYMENT_ACKNOWLEDGED' || d.status === 'READY_FOR_DISPATCH')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} - {d.brand} {d.model} ({d.status})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Outgoing Transit Batch ID
              </label>
              <input
                type="text"
                value={dispatchBatchId}
                onChange={(e) => setDispatchBatchId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scale Digital Weight Reading (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={dispatchWeight}
                onChange={(e) => setDispatchWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit Count (Quantity)
              </label>
              <input
                type="number"
                value={dispatchQty}
                onChange={(e) => setDispatchQty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Live Geotag Capture Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Live Browser GPS Coordinates Lock</span>
              </span>
              <button
                onClick={handleCaptureGps}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Acquire High-Accuracy Geotag</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Latitude:</span>
                <span className="text-white">{gpsCoordinates.lat.toFixed(5)}° N</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Longitude:</span>
                <span className="text-white">{gpsCoordinates.lng.toFixed(5)}° E</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Accuracy:</span>
                <span className="text-emerald-400 font-bold">±{gpsCoordinates.accuracy}m (Passed)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleDispatchDevice}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition shadow-lg shadow-amber-600/20 flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>Seal Scale Record & Stage for Recycler Transit</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 5: Bulk CSV Data Intake */}
      {activeSubTab === 'bulk_import' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <span>Bulk Institutional & Corporate E-Waste CSV Intake</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fast-track intake for universities, corporate IT parks, and government ministries decommissioning hundreds of end-of-life devices.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              CSV Manifest (Comma-separated values with headers)
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">
              Format: Category, Brand, Model, SerialNumber, Condition (working/locked/not_booting), WeightKg
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleBulkParse}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition shadow-lg shadow-amber-600/20 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Parse & Ingest Bulk Manifest</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 6: Field Offline Hub & IndexedDB Storage Buffer */}
      {activeSubTab === 'field_offline' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <span>Field Offline Hub & IndexedDB Buffer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Local offline storage engine for collection engineers operating in remote villages, collection vans, and low-connectivity basements without cellular data.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFieldIntakeModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Field Intake</span>
                </button>

                {pendingOfflineLogs.length > 0 && (
                  <button
                    onClick={handleSyncLocalLogs}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All ({pendingOfflineLogs.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Offline Status Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Buffered Field Consignments</span>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {pendingOfflineLogs.length} Units
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Stored in BharatEwasteHub_OfflineDB
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Buffer Total Weight</span>
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                  {pendingOfflineLogs.reduce((sum, item) => sum + item.intakeWeightKg, 0).toFixed(2)} kg
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Physical payload waiting for sync
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Connection Engine</span>
                  {isSimulatingLowConnectivity || !isOnlineState ? (
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {isSimulatingLowConnectivity
                    ? 'Simulated Low-Connectivity'
                    : !isOnlineState
                    ? 'Browser Offline'
                    : 'Online & Sync Ready'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ServiceWorker Cache Active
                </div>
              </div>
            </div>
          </div>

          {/* Queued Records Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                IndexedDB Local Queue ({pendingOfflineLogs.length})
              </span>
              {pendingOfflineLogs.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Clear all locally buffered records without syncing?')) {
                      await clearAllOfflineDeviceLogs();
                      await loadPendingLogs();
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Local Buffer</span>
                </button>
              )}
            </div>

            {pendingOfflineLogs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Local Buffer is In Sync</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are no unsynced consignments in browser storage. Any items you log while working offline will be safely queued here until connectivity returns.
                </p>
                <button
                  onClick={() => setIsFieldIntakeModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                >
                  Log a Field Consignment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pendingOfflineLogs.map((log) => (
                  <div
                    key={log.offlineId}
                    className="p-4 rounded-xl bg-slate-900/90 border border-amber-800/40 hover:border-amber-600/60 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {log.brand} {log.model}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            LOCAL BUFFER
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {log.category} • Condition: {log.condition}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSingleOffline(log.offlineId)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete from local buffer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">WEIGHT</span>
                        <span className="text-white font-semibold">{log.intakeWeightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">IMEI / SERIAL</span>
                        <span className="text-slate-300 truncate block">{log.imei || log.serialNumber}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.loggedAt}
                        </span>
                        <span className="text-amber-400">{log.engineerName}</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Field Consignment Intake */}
      {isFieldIntakeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="field-intake-title"
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 id="field-intake-title" className="text-sm font-bold text-white">
                    Field Consignment Intake
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isSimulatingLowConnectivity || !isOnlineState
                      ? 'Offline Mode Active: Saving to local IndexedDB'
                      : 'Online: Direct Central Registry Sync'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFieldIntakeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFieldIntake} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={fieldCategory}
                    onChange={(e) => setFieldCategory(e.target.value as DeviceCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="PCB & Component Board">PCB & Component Board</option>
                    <option value="Lithium Battery Pack">Lithium Battery Pack</option>
                    <option value="CRT/LED Display Panel">CRT/LED Display Panel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Condition Grade *
                  </label>
                  <select
                    value={fieldCondition}
                    onChange={(e) => setFieldCondition(e.target.value as DeviceCondition)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="working">Working / Bootable</option>
                    <option value="locked">Software Locked / BIOS Locked</option>
                    <option value="not_booting">Not Booting / Hardware Damaged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldBrand}
                    onChange={(e) => setFieldBrand(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldModel}
                    onChange={(e) => setFieldModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={fieldSerial}
                    onChange={(e) => setFieldSerial(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    IMEI (If cellular)
                  </label>
                  <input
                    type="text"
                    value={fieldImei}
                    onChange={(e) => setFieldImei(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Digital Scale Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fieldWeight}
                    onChange={(e) => setFieldWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Consignor Contact Mobile
                  </label>
                  <input
                    type="text"
                    value={fieldCitizenPhone}
                    onChange={(e) => setFieldCitizenPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Field Notes & Location Tag
                </label>
                <input
                  type="text"
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center gap-2">
                {isSimulatingLowConnectivity || !isOnlineState ? (
                  <>
                    <Database className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-300">
                      Record will be saved to IndexedDB storage. You can continue collecting devices even without 4G/5G signal.
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">
                      Live connection detected: Record will be sent directly to central registry and mirrored offline.
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFieldIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>
                    {isSimulatingLowConnectivity || !isOnlineState
                      ? 'Save to Offline Buffer'
                      : 'Record & Synchronize'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

