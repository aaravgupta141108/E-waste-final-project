import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Sparkles,
  Smartphone,
  Laptop,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { DeviceCategory, DeviceCondition } from '../types';

export interface ScannedDevicePayload {
  serialNumber: string;
  imei?: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  intakeWeightKg: number;
  condition: DeviceCondition;
  scannedRawText: string;
}

interface DeviceBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceScanned: (payload: ScannedDevicePayload) => void;
}

// Realistic Sample Barcode Labels found on e-waste items
const SAMPLE_DEVICE_BARCODES = [
  {
    label: 'Apple iPhone 13 (Retail Box & Chassis Sticker)',
    raw: 'S/N: F2LZD043MD6R IMEI: 864920048192837 MODEL: A2633 iPhone 13 128GB Midnight',
    category: 'Smartphone' as DeviceCategory,
    brand: 'Apple',
    model: 'iPhone 13 128GB',
    serial: 'F2LZD043MD6R',
    imei: '864920048192837',
    weight: 0.174
  },
  {
    label: 'Samsung Galaxy S22 Ultra (Rating Plate Barcode)',
    raw: 'MODEL: SM-S908B S/N: R5CT30XYZ89 IMEI: 358920119283741 Samsung Galaxy S22 Ultra',
    category: 'Smartphone' as DeviceCategory,
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra',
    serial: 'R5CT30XYZ89',
    imei: '358920119283741',
    weight: 0.228
  },
  {
    label: 'Lenovo ThinkPad T480 (Bottom Asset Barcode)',
    raw: 'TYPE: 20L5-001RUS S/N: PF19XY82 Lenovo ThinkPad T480 Intel i5 16GB',
    category: 'Laptop' as DeviceCategory,
    brand: 'Lenovo',
    model: 'ThinkPad T480 Business',
    serial: 'PF19XY82',
    weight: 1.65
  },
  {
    label: 'Dell OptiPlex 7090 Desktop (Service Tag Barcode)',
    raw: 'SERVICE TAG: 8FG3KL2 S/N: CN-08FG3K-70161 Dell OptiPlex 7090 Tower',
    category: 'Desktop & Workstation' as DeviceCategory,
    brand: 'Dell',
    model: 'OptiPlex 7090 Tower',
    serial: '8FG3KL2',
    weight: 5.4
  },
  {
    label: 'Exide Li-Power 48V Storage Battery (Hazard Barcode)',
    raw: 'EXIDE-LI-48V-100AH S/N: EX-BATT-2024-8841 UN3480 Class 9 Lithium Ion',
    category: 'Lithium Battery Pack' as DeviceCategory,
    brand: 'Exide',
    model: 'Li-Power 48V 100Ah Storage Unit',
    serial: 'EX-BATT-2024-8841',
    weight: 24.5
  },
  {
    label: 'Cisco Catalyst 3850 Network Switch (Rack Barcode)',
    raw: 'PID: WS-C3850-24T-L S/N: FOC1829Z012 Cisco Catalyst 3850 Enterprise Switch',
    category: 'Server & Network' as DeviceCategory,
    brand: 'Cisco',
    model: 'Catalyst 3850 Gigabit Switch',
    serial: 'FOC1829Z012',
    weight: 7.2
  }
];

export const DeviceBarcodeScannerModal: React.FC<DeviceBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDeviceScanned
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedPayload, setDetectedPayload] = useState<ScannedDevicePayload | null>(null);
  const [fileScanLoading, setFileScanLoading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'device-barcode-scanner-viewfinder';

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setDetectedPayload(null);
      setScannerError(null);
      return;
    }

    const timer = setTimeout(() => {
      startScanner();
    }, 250);

    return () => {
      clearTimeout(timer);
      stopScanning();
    };
  }, [isOpen, facingMode]);

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error clearing barcode scanner:', err);
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  // Parsing heuristic for raw scanned strings
  const parseScannedText = (rawText: string): ScannedDevicePayload => {
    const text = rawText.trim();
    let serial = '';
    let imei = '';
    let category: DeviceCategory = 'Smartphone';
    let brand = 'Generic';
    let model = 'Electronics Item';
    let weight = 0.35;

    // 1. Check for 15-digit IMEI
    const imeiMatch = text.match(/\b\d{15}\b/);
    if (imeiMatch) {
      imei = imeiMatch[0];
      category = 'Smartphone';
      weight = 0.2;
    }

    // 2. Check for Serial Number keywords (S/N:, SN:, SERVICE TAG:, SERIAL:)
    const snMatch = text.match(/(?:S\/N|SN|SERIAL|SERVICE\s*TAG)[:\s]+([A-Z0-9_-]+)/i);
    if (snMatch) {
      serial = snMatch[1];
    } else {
      // If code looks like an alphanumeric serial or barcode
      const firstToken = text.split(/[\s,;]+/)[0];
      serial = firstToken.length >= 6 ? firstToken : `SN-${Date.now().toString().slice(-6)}`;
    }

    // 3. Brand & Model detection heuristics
    const lower = text.toLowerCase();
    if (lower.includes('apple') || lower.includes('iphone') || lower.includes('macbook')) {
      brand = 'Apple';
      if (lower.includes('macbook')) {
        category = 'Laptop';
        model = 'MacBook Pro 13-inch';
        weight = 1.4;
      } else {
        category = 'Smartphone';
        model = lower.includes('13') ? 'iPhone 13 128GB' : lower.includes('12') ? 'iPhone 12' : 'iPhone';
        weight = 0.18;
      }
    } else if (lower.includes('samsung') || lower.includes('galaxy')) {
      brand = 'Samsung';
      category = 'Smartphone';
      model = lower.includes('ultra') ? 'Galaxy S22 Ultra' : 'Galaxy S-Series';
      weight = 0.22;
    } else if (lower.includes('lenovo') || lower.includes('thinkpad')) {
      brand = 'Lenovo';
      category = 'Laptop';
      model = 'ThinkPad T480';
      weight = 1.65;
    } else if (lower.includes('dell') || lower.includes('optiplex') || lower.includes('latitude')) {
      brand = 'Dell';
      if (lower.includes('optiplex') || lower.includes('tower')) {
        category = 'Desktop & Workstation';
        model = 'OptiPlex 7090 Desktop';
        weight = 5.4;
      } else {
        category = 'Laptop';
        model = 'Latitude 5420 Laptop';
        weight = 1.5;
      }
    } else if (lower.includes('hp') || lower.includes('elitebook')) {
      brand = 'HP';
      category = 'Laptop';
      model = 'EliteBook 840 G6';
      weight = 1.48;
    } else if (lower.includes('battery') || lower.includes('exide') || lower.includes('un3480')) {
      brand = lower.includes('exide') ? 'Exide' : 'Lithium Energy';
      category = 'Lithium Battery Pack';
      model = 'Li-Ion 48V Storage Battery Module';
      weight = 24.0;
    } else if (lower.includes('cisco') || lower.includes('switch') || lower.includes('server')) {
      brand = 'Cisco';
      category = 'Server & Network';
      model = 'Catalyst 3850 Enterprise';
      weight = 6.8;
    }

    return {
      serialNumber: serial,
      imei: imei || undefined,
      category,
      brand,
      model,
      intakeWeightKg: weight,
      condition: 'working',
      scannedRawText: text
    };
  };

  const handleScanSuccess = (decodedText: string) => {
    const payload = parseScannedText(decodedText);
    setDetectedPayload(payload);

    if (html5QrCodeRef.current?.isScanning) {
      try {
        html5QrCodeRef.current.pause(true);
      } catch {
        // ignore
      }
    }
  };

  const startScanner = async () => {
    setScannerError(null);
    try {
      await stopScanning();

      const element = document.getElementById(readerElementId);
      if (!element) return;

      const html5QrCode = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 14,
        qrbox: { width: 280, height: 180 }, // Wide box optimized for 1D Barcodes + QR
        aspectRatio: 1.33
      };

      await html5QrCode.start(
        { facingMode },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // scanner tick
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Barcode camera start error:', err);
      setIsScanning(false);
      setScannerError(
        err.message || 'Camera video feed could not be opened. You can click any sample label sticker below or upload an image.'
      );
    }
  };

  const handleToggleFacing = async () => {
    await stopScanning();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanLoading(true);
    setScannerError(null);

    try {
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(readerElementId);
        html5QrCodeRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setScannerError('No recognizable barcode, QR, or serial code detected in this photo.');
    } finally {
      setFileScanLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyPayload = (payload: ScannedDevicePayload) => {
    onDeviceScanned(payload);
    onClose();
  };

  const handleSelectSample = (sample: typeof SAMPLE_DEVICE_BARCODES[0]) => {
    const payload: ScannedDevicePayload = {
      serialNumber: sample.serial,
      imei: sample.imei,
      category: sample.category,
      brand: sample.brand,
      model: sample.model,
      intakeWeightKg: sample.weight,
      condition: 'working',
      scannedRawText: sample.raw
    };
    setDetectedPayload(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Item Serial &amp; Barcode Camera Scanner</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  AUTOPILOT INTAKE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Point camera at the barcode or serial sticker on your e-waste item
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="relative rounded-2xl bg-black border border-slate-800 overflow-hidden min-h-[220px] flex items-center justify-center">
            {/* Target element where html5-qrcode attaches its video feed */}
            <div id={readerElementId} className="w-full max-w-sm overflow-hidden rounded-xl" />

            {/* Error or Notice Overlay */}
            {scannerError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center space-y-2 z-20">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Camera Notice</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs">{scannerError}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={startScanner}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Sticker Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={handleToggleFacing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera: {facingMode === 'environment' ? 'Rear / Main' : 'Front'}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={fileScanLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{fileScanLoading ? 'Decoding...' : 'Upload Sticker Image'}</span>
            </button>
          </div>

          {/* Detected Scanned Payload Card */}
          {detectedPayload && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-3 animate-in fade-in shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Barcode &amp; Serial Tag Successfully Identified</span>
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {detectedPayload.brand} {detectedPayload.model}
                  </h4>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Serial Number:</span>
                  <span className="text-white font-bold">{detectedPayload.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Category:</span>
                  <span className="text-cyan-300 font-bold">{detectedPayload.category}</span>
                </div>
                {detectedPayload.imei && (
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">IMEI Number:</span>
                    <span className="text-emerald-400 font-bold">{detectedPayload.imei}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Estimated Weight:</span>
                  <span className="text-amber-300 font-bold">{detectedPayload.intakeWeightKg} kg</span>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => handleApplyPayload(detectedPayload)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <span>Auto-Populate Registration Form &amp; Lock Value</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDetectedPayload(null);
                    if (html5QrCodeRef.current) {
                      try {
                        html5QrCodeRef.current.resume();
                      } catch {
                        startScanner();
                      }
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Rescan
                </button>
              </div>
            </div>
          )}

          {/* Test Sample Device Barcode Stickers */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Camera Scan with Sample E-Waste Stickers:</span>
              </span>
              <span className="text-[10px] text-slate-500">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {SAMPLE_DEVICE_BARCODES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 text-left transition space-y-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] group-hover:text-emerald-400 transition">
                      {sample.brand} {sample.model}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                      {sample.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    SN: {sample.serial} {sample.imei ? `• IMEI: ${sample.imei}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
