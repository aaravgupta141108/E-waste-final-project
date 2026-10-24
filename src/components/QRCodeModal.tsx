import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Scan,
  ShieldCheck,
  Printer,
  Check,
  Copy,
  AlertCircle,
  ArrowRight,
  Package,
  Truck,
  Building,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { DeviceItem } from '../types';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  onSelectDevice: (deviceId: string) => void;
  targetDeviceId?: string | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  devices = [],
  onSelectDevice,
  targetDeviceId
}) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'printable_tag' | 'scan'>('generate');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    targetDeviceId || devices[0]?.id || ''
  );
  const [scannedResult, setScannedResult] = useState<DeviceItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize when targetDeviceId changes or modal opens
  useEffect(() => {
    if (targetDeviceId) {
      setSelectedDeviceId(targetDeviceId);
    } else if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [targetDeviceId, devices, isOpen]);

  if (!isOpen) return null;

  // Given case only
  const currentDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  if (!currentDevice) return null;

  // Case-specific bin and pallet identifiers
  const caseBinId = `BIN-${(currentDevice.city || 'DEL').slice(0, 3).toUpperCase()}-${currentDevice.id.slice(-4)}`;
  const casePalletId = `PALLET-${currentDevice.batchId || currentDevice.id.slice(-4)}`;
  const caseSealNumber = `SEAL-CPCB-${currentDevice.id.slice(-4)}-2026`;

  const qrPayload = JSON.stringify({
    statutoryRegistry: 'CPCB-GOI-EWASTE-REGISTRY',
    custodyCaseId: currentDevice.id,
    physicalBinId: caseBinId,
    palletLotId: casePalletId,
    securitySealNumber: caseSealNumber,
    deviceCategory: currentDevice.category,
    deviceBrand: currentDevice.brand,
    deviceModel: currentDevice.model,
    serialOrImei: currentDevice.imei || currentDevice.serialNumber,
    intakeWeightKg: currentDevice.intakeWeightKg,
    currentStage: currentDevice.status,
    consignorName: currentDevice.userName,
    hubLocation: currentDevice.hubLocation,
    sanitizationHash: currentDevice.wipeRecord?.verificationHash || 'CPCB-CHAIN-UNBROKEN'
  });

  const handleSimulateScan = (device: DeviceItem) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(device);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Physical Bin &amp; Custody QR Linkage</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Case {currentDevice.id} Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Statutory digital chain of custody for collection bins &amp; pallets of the given case
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab mode switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2">
          <button
            onClick={() => setActiveMode('generate')}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeMode === 'generate'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Custody Tag &amp; Bin QR</span>
          </button>
          <button
            onClick={() => setActiveMode('printable_tag')}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeMode === 'printable_tag'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printable QR Asset Tag (Physical Label)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
              Label
            </span>
          </button>
          <button
            onClick={() => setActiveMode('scan')}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeMode === 'scan'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Field Custody Auditor Scanner</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeMode === 'generate' ? (
            <div className="space-y-4">
              {/* Scoped Case Banner */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Target Case Custody Lock:
                  </span>
                  <div className="font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-emerald-400">{currentDevice.id}</span>
                    <span>•</span>
                    <span>{currentDevice.brand} {currentDevice.model}</span>
                  </div>
                </div>

                {/* Case selector if multiple cases exist */}
                {devices.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Switch Case:</span>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    >
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.id} ({d.brand})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Physical Bin & Pallet Identification Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[10px] font-sans">Physical Bin Identifier</span>
                  <div className="text-cyan-300 font-bold truncate">{caseBinId}</div>
                  <span className="text-[9px] text-slate-400 font-sans">Fire-Retardant Seal</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[10px] font-sans">Pallet Lot Group</span>
                  <div className="text-amber-300 font-bold truncate">{casePalletId}</div>
                  <span className="text-[9px] text-slate-400 font-sans">Geotagged Fleet Crate</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[10px] font-sans">Tamper-Proof Seal #</span>
                  <div className="text-emerald-400 font-bold truncate">{caseSealNumber}</div>
                  <span className="text-[9px] text-slate-400 font-sans">CPCB Class-9 Verified</span>
                </div>
              </div>

              {/* Printable QR Code & Statutory Linkage Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row items-center gap-6">
                {/* Visual QR representation */}
                <div className="p-3.5 bg-white rounded-xl shadow-xl flex flex-col items-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      qrPayload
                    )}`}
                    alt="Digital Chain of Custody QR"
                    className="w-36 h-36"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-900 mt-2">
                    {currentDevice.id}
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-left w-full text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      Official CPCB Custody Linkage
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {currentDevice.brand} {currentDevice.model}
                  </h4>

                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <p>
                      <strong className="text-slate-400 font-sans">Case ID:</strong> {currentDevice.id}
                    </p>
                    <p>
                      <strong className="text-slate-400 font-sans">Serial / IMEI:</strong>{' '}
                      {currentDevice.imei || currentDevice.serialNumber}
                    </p>
                    <p>
                      <strong className="text-slate-400 font-sans">Intake Scale Weight:</strong>{' '}
                      {currentDevice.intakeWeightKg} kg
                    </p>
                    <p>
                      <strong className="text-slate-400 font-sans">Current Stage:</strong>{' '}
                      <span className="text-emerald-400 font-bold">{currentDevice.status}</span>
                    </p>
                    <p>
                      <strong className="text-slate-400 font-sans">Custody Linkage Hash:</strong>{' '}
                      <span className="text-[10px] text-cyan-300 truncate block">
                        {currentDevice.wipeRecord?.verificationHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrPayload);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Token' : 'Copy Custody Token'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium flex items-center gap-1.5 transition shadow"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Bin Label</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custody Chain Milestones for this given case only */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Statutory Custody Flow of Case {currentDevice.id}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block text-[9px]">1. Origin Consignor</span>
                    <strong className="text-white block truncate">{currentDevice.userName}</strong>
                    <span className="text-slate-400 text-[10px]">{currentDevice.city}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block text-[9px]">2. Hub Custody Station</span>
                    <strong className="text-emerald-400 block truncate">{currentDevice.hubLocation}</strong>
                    <span className="text-slate-400 text-[10px]">Bin {caseBinId}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block text-[9px]">3. Smelting Pallet Lot</span>
                    <strong className="text-cyan-400 block truncate">{currentDevice.recyclerName || 'EcoRecycle Apex Solutions'}</strong>
                    <span className="text-slate-400 text-[10px]">{casePalletId}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMode === 'printable_tag' ? (
            /* Physical Inventory Printable Asset Tag Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Ready-to-print industrial adhesive label for physical equipment chassis &amp; consignment crate.
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Physical Tag Now</span>
                </button>
              </div>

              {/* Physical Printable Label (White card styled for thermal/laser printers) */}
              <div className="bg-white text-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-400 shadow-2xl max-w-lg mx-auto font-sans relative overflow-hidden print-include">
                {/* Top Badge & CPCB Statutory Header */}
                <div className="border-b-2 border-slate-950 pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase block text-emerald-800">
                      GOVERNMENT OF INDIA • CPCB / MoEFCC
                    </span>
                    <h3 className="text-sm font-black tracking-tight text-slate-950">
                      NATIONAL E-WASTE INVENTORY ASSET TAG
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-white uppercase">
                      CLASS-9 HAZMAT
                    </span>
                    <div className="text-[10px] font-mono font-bold text-slate-800 mt-0.5">
                      FORM-6 COMPLIANT
                    </div>
                  </div>
                </div>

                {/* Main Label Body: QR + Key Parameters */}
                <div className="py-4 grid grid-cols-12 gap-4 items-center">
                  {/* Left: High-Contrast QR Code */}
                  <div className="col-span-5 flex flex-col items-center border-r-2 border-slate-200 pr-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        qrPayload
                      )}`}
                      alt="Physical Asset Tag QR"
                      className="w-32 h-32 border-2 border-slate-950 p-1 rounded"
                    />
                    <span className="text-[10px] font-mono font-black mt-1 text-slate-950">
                      {currentDevice.id}
                    </span>
                  </div>

                  {/* Right: Technical Intake Specs */}
                  <div className="col-span-7 space-y-1 text-[11px] leading-tight">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Equipment Model</span>
                      <strong className="text-xs font-black text-slate-950">
                        {currentDevice.brand} {currentDevice.model}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[10px]">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block font-sans">Category</span>
                        <span className="font-bold text-slate-900">{currentDevice.category}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase block font-sans">Scale Weight</span>
                        <span className="font-bold text-slate-900">{currentDevice.intakeWeightKg} kg</span>
                      </div>
                    </div>

                    <div className="pt-1 font-mono text-[10px]">
                      <span className="text-[8px] text-slate-500 uppercase block font-sans">Serial / IMEI</span>
                      <span className="font-bold text-slate-900 truncate block">
                        {currentDevice.imei || currentDevice.serialNumber}
                      </span>
                    </div>

                    <div className="pt-1 grid grid-cols-2 gap-1 font-mono text-[9px] border-t border-slate-200">
                      <div>
                        <span className="text-[8px] text-slate-500 font-sans">Bin:</span>
                        <span className="font-bold text-slate-900">{caseBinId}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 font-sans">Lot:</span>
                        <span className="font-bold text-slate-900">{casePalletId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode Banner */}
                <div className="border-t-2 border-slate-950 pt-2 text-center space-y-1">
                  <div className="flex justify-center items-center gap-[2px] h-8 overflow-hidden bg-slate-100 p-1 rounded">
                    {[12, 4, 8, 2, 10, 6, 14, 4, 2, 8, 12, 6, 4, 10, 8, 4, 12, 2, 6, 14, 8, 4, 2, 10, 12, 6, 8, 4, 10, 6, 14, 8, 4, 2, 12].map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 inline-block h-full"
                        style={{ width: `${(w % 4) + 1.5}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-mono tracking-widest font-black text-slate-950">
                    *CPCB-{currentDevice.id}-TAG*
                  </div>
                </div>

                {/* Tamper Warning Bottom Strip */}
                <div className="mt-2 pt-1 border-t border-slate-300 text-[8px] font-mono text-slate-600 flex items-center justify-between">
                  <span>SEAL: {caseSealNumber}</span>
                  <span className="font-bold uppercase text-rose-800">TAMPERING VIOLATES EPA ACT 1986</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Laser / Thermal Tag (10cm x 15cm)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Field Scanner Mode */
            <div className="space-y-4">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-3">
                  <Scan className={`w-8 h-8 ${isScanning ? 'animate-pulse text-cyan-400' : ''}`} />
                </div>
                <h4 className="text-base font-bold text-white">Simulate Field Auditor Custody Scan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Click a registered case below to simulate an SPCB or CPCB inspector scanning a physical bin barcode in the field.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {devices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSimulateScan(d)}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700 transition"
                    >
                      Scan {d.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanned Custody Verification Result */}
              {scannedResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Chain of Custody Verified: Case {scannedResult.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                      {scannedResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block font-sans">Physical Bin:</span>
                      <span className="text-white">BIN-{scannedResult.city.slice(0, 3).toUpperCase()}-{scannedResult.id.slice(-4)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">Consignor:</span>
                      <span className="text-white">{scannedResult.userName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">Intake Weight:</span>
                      <span className="text-emerald-400">{scannedResult.intakeWeightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">CPCB Compliance:</span>
                      <span className="text-cyan-400">Schedule-I Cleared</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectDevice(scannedResult.id);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Inspect Case in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
