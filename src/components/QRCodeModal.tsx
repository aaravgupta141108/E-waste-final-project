import React, { useState } from 'react';
import { X, QrCode, Scan, ShieldCheck, Printer, Check, Copy, AlertCircle, ArrowRight } from 'lucide-react';
import { DeviceItem } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  onSelectDevice: (deviceId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  devices,
  onSelectDevice
}) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'scan'>('generate');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [binId, setBinId] = useState('BIN-DEL-CP-04');
  const [scannedResult, setScannedResult] = useState<DeviceItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const handleSimulateScan = (device: DeviceItem) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(device);
    }, 900);
  };

  const qrPayload = JSON.stringify({
    custodyId: currentDevice?.id,
    binId: binId,
    category: currentDevice?.category,
    brand: currentDevice?.brand,
    model: currentDevice?.model,
    hash: currentDevice?.wipeRecord?.verificationHash || 'CPCB-VERIFIED-CHAIN-2026',
    statutoryRegistry: 'CPCB-GOI-EWASTE-REGISTRY'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Physical Bin & Custody QR Linkage</h3>
              <p className="text-[11px] text-slate-400">
                Statutory digital chain of custody for collection bins & pallets
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
            <span>Generate Bin / Lot QR</span>
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
            <span>Auditor Field Scanner</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeMode === 'generate' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Device for Chain of Custody
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id} - {d.brand} {d.model} ({d.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Physical Bin / Pallet Identifier
                  </label>
                  <input
                    type="text"
                    value={binId}
                    onChange={(e) => setBinId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Printable QR Code Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                {/* Visual QR representation */}
                <div className="p-3 bg-white rounded-xl shadow-lg flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      qrPayload
                    )}`}
                    alt="Digital Chain of Custody QR"
                    className="w-36 h-36"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-900 mt-2">
                    {currentDevice?.id}
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-left w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      Official CPCB Chain of Custody
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {currentDevice?.brand} {currentDevice?.model}
                  </h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      <strong className="text-slate-300">Category:</strong> {currentDevice?.category}
                    </p>
                    <p>
                      <strong className="text-slate-300">Serial/IMEI:</strong>{' '}
                      {currentDevice?.imei || currentDevice?.serialNumber}
                    </p>
                    <p>
                      <strong className="text-slate-300">Current Bin:</strong> {binId} (
                      {currentDevice?.hubLocation})
                    </p>
                    <p>
                      <strong className="text-slate-300">Stage:</strong>{' '}
                      <span className="text-emerald-400 font-semibold">{currentDevice?.status}</span>
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
                      <span>{copied ? 'Copied Payload' : 'Copy Payload'}</span>
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
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-500/60 rounded-xl relative flex items-center justify-center bg-slate-900/50">
                  {isScanning ? (
                    <div className="space-y-2">
                      <Scan className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                      <p className="text-xs text-emerald-400 font-medium">Decoding CPCB Signature...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      <QrCode className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">Aim camera or click test devices below to simulate scan</p>
                    </div>
                  )}

                  {/* Scanning beam animation */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse-glow" />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Test Scan Pre-defined Batches in Facility:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {devices.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSimulateScan(d)}
                      className="text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                          {d.id}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {d.brand} {d.model} • {d.status}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>

              {scannedResult && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-700/50 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Verified National Chain of Custody Record
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      AUTHENTICATED
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400">Device ID:</span> {scannedResult.id}
                    </div>
                    <div>
                      <span className="text-slate-400">Category:</span> {scannedResult.category}
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span> {scannedResult.status}
                    </div>
                    <div>
                      <span className="text-slate-400">Hub:</span> {scannedResult.hubLocation}
                    </div>
                    <div>
                      <span className="text-slate-400">Wipe Hash:</span>{' '}
                      <span className="font-mono text-[10px] text-emerald-400">
                        {scannedResult.wipeRecord?.verificationHash.slice(0, 16)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">CO2 Saved:</span> {scannedResult.co2SavedKg} kg
                    </div>
                  </div>
                  <div className="pt-2 text-right">
                    <button
                      onClick={() => {
                        onSelectDevice(scannedResult.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition inline-flex items-center gap-1"
                    >
                      <span>Open in Demanufacturing Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
