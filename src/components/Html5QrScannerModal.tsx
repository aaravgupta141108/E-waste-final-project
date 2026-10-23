import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { DeviceItem } from '../types';

interface Html5QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  onSelectDevice: (deviceId: string) => void;
  onRegisterWithTag: (scannedTag: string) => void;
}

export const Html5QrScannerModal: React.FC<Html5QrScannerModalProps> = ({
  isOpen,
  onClose,
  devices,
  onSelectDevice,
  onRegisterWithTag
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [matchedDevice, setMatchedDevice] = useState<DeviceItem | null>(null);
  const [fileScanLoading, setFileScanLoading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'html5-qrcode-reader-citizen';

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setScannedResult(null);
      setMatchedDevice(null);
      setScannerError(null);
      return;
    }

    // Start scanner when opened
    const timer = setTimeout(() => {
      startCameraScanning();
    }, 200);

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
        console.warn('Error stopping html5-qrcode:', err);
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    const cleanTag = decodedText.trim();
    setScannedResult(cleanTag);

    // Search existing devices
    const found = devices.find(
      (d) =>
        d.id.toLowerCase() === cleanTag.toLowerCase() ||
        d.serialNumber.toLowerCase() === cleanTag.toLowerCase() ||
        (d.imei && d.imei.toLowerCase() === cleanTag.toLowerCase())
    );

    if (found) {
      setMatchedDevice(found);
    } else {
      setMatchedDevice(null);
    }

    // Temporarily pause scanner so user can choose action
    if (html5QrCodeRef.current?.isScanning) {
      html5QrCodeRef.current.pause(true);
    }
  };

  const startCameraScanning = async () => {
    setScannerError(null);
    try {
      await stopScanning();

      const element = document.getElementById(readerElementId);
      if (!element) return;

      const html5QrCode = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Normal frame scan tick without barcode, ignore
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('html5-qrcode camera start failed:', err);
      setIsScanning(false);
      setScannerError(
        err.message || 'Camera access could not be initialized. You can upload an image or enter a tag manually.'
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
      // Create temporary scanner instance for file scanning if needed
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(readerElementId);
        html5QrCodeRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setScannerError('Could not find a valid QR code or barcode in the uploaded image.');
    } finally {
      setFileScanLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetScan = () => {
    setScannedResult(null);
    setMatchedDevice(null);
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {
        startCameraScanning();
      }
    } else {
      startCameraScanning();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CPCB Device QR Code Scanner</h3>
              <p className="text-[11px] text-slate-400">Powered by html5-qrcode Optical Engine</p>
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

        {/* Viewfinder Area */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="relative rounded-2xl bg-black border border-slate-800 overflow-hidden min-h-[280px] flex items-center justify-center">
            {/* Target element where html5-qrcode attaches its video feed */}
            <div id={readerElementId} className="w-full max-w-xs overflow-hidden rounded-xl" />

            {/* Error Overlay */}
            {scannerError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Camera Notice</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{scannerError}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={startCameraScanning}
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
                    <span>Upload Photo</span>
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
              <span>Camera: {facingMode === 'environment' ? 'Rear (Env)' : 'Front (Selfie)'}</span>
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
              <span>{fileScanLoading ? 'Decoding...' : 'Scan from Photo'}</span>
            </button>
          </div>

          {/* Result Card when a QR code has been scanned */}
          {scannedResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    QR Tag Decoded
                  </span>
                  <div className="text-sm font-mono font-bold text-white break-all">
                    {scannedResult}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              </div>

              {matchedDevice ? (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {matchedDevice.brand} {matchedDevice.model}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold">
                      {matchedDevice.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Registered in National Registry. Tracking active on Stage {matchedDevice.status}.
                  </p>
                  <button
                    onClick={() => {
                      onSelectDevice(matchedDevice.id);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>View Lifecycle & Battery Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-300">
                    This tag is not yet attached to an active consignment in your registry.
                  </p>
                  <button
                    onClick={() => {
                      onRegisterWithTag(scannedResult);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Register New Device with Tag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={handleResetScan}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Scan Another QR Code
              </button>
            </div>
          )}

          {/* Sample test QR tags */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="block text-slate-500 font-medium">Test Sample National CPCB Tags:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              {devices.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleScanSuccess(d.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {d.id} ({d.brand})
                </button>
              ))}
              <button
                onClick={() => handleScanSuccess(`CPCB-TAG-${Math.floor(100000 + Math.random() * 900000)}`)}
                className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition"
              >
                + New Unregistered Tag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
