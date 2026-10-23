import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  RefreshCw,
  Flashlight,
  FlashlightOff,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { DeviceItem } from '../types';

export interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  onSelectDevice: (deviceId: string) => void;
  onRegisterWithTag?: (scannedTag: string) => void;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  devices,
  onSelectDevice,
  onRegisterWithTag
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [matchedDevice, setMatchedDevice] = useState<DeviceItem | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [manualTagInput, setManualTagInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedTag(null);
      setMatchedDevice(null);
      setIsRegistered(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    setHasCameraPermission(null);

    // Check if mediaDevices is supported
    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setCameraError('Camera API (getUserMedia) not supported in this browser environment.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Check torch support
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
        setIsTorchSupported(!!capabilities.torch);
      }

      // Start BarcodeDetector loop if supported
      startFrameScanning();
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCameraPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access permission was denied. Please allow camera permissions in your browser or use the quick-scan buttons below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera device was detected on your system. You can test with the sample CPCB tags below.');
      } else {
        setCameraError('Could not start video stream: ' + (err.message || 'Unknown camera error'));
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const newTorchState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: newTorchState }]
      });
      setIsTorchOn(newTorchState);
    } catch {
      setIsTorchSupported(false);
    }
  };

  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Video Frame Scanner (Uses browser BarcodeDetector API if available)
  const startFrameScanning = () => {
    if (typeof window === 'undefined') return;

    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (!BarcodeDetectorClass) return;

    try {
      const detector = new BarcodeDetectorClass({ formats: ['qr_code', 'code_128', 'data_matrix'] });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || !isScanning) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleProcessScannedCode(rawValue);
          }
        } catch {
          // Frame decode skip
        }
      }, 500);
    } catch {
      // Detector init failed
    }
  };

  // Process any scanned string (from camera, simulated tag, or manual entry)
  const handleProcessScannedCode = (codeStr: string) => {
    if (!codeStr || !codeStr.trim()) return;

    const trimmed = codeStr.trim();
    setIsScanning(false);
    setScannedTag(trimmed);

    // Parse JSON payload if QR contains encoded object
    let lookupKey = trimmed;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.custodyId) lookupKey = parsed.custodyId;
      else if (parsed.serialNumber) lookupKey = parsed.serialNumber;
      else if (parsed.imei) lookupKey = parsed.imei;
    } catch {
      // Plain string tag
    }

    // Attempt lookup in current devices registry
    const found = devices.find(
      (d) =>
        d.id.toLowerCase() === lookupKey.toLowerCase() ||
        (d.imei && d.imei.toLowerCase() === lookupKey.toLowerCase()) ||
        (d.serialNumber && d.serialNumber.toLowerCase() === lookupKey.toLowerCase())
    );

    if (found) {
      setMatchedDevice(found);
      setIsRegistered(true);
    } else {
      setMatchedDevice(null);
      setIsRegistered(false);
    }
  };

  const handleResetScan = () => {
    setScannedTag(null);
    setMatchedDevice(null);
    setIsRegistered(null);
    setIsScanning(true);
  };

  const handleConfirmLookup = () => {
    if (matchedDevice) {
      onSelectDevice(matchedDevice.id);
      onClose();
    }
  };

  const handleConfirmRegistration = () => {
    if (scannedTag) {
      if (onRegisterWithTag) {
        onRegisterWithTag(scannedTag);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="qr-scanner-title" className="text-sm font-bold text-white font-sans flex items-center gap-2">
                CPCB Optical Tag Scanner
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Live Camera
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Point device camera at any CPCB QR / Barcode tag for automatic lookup or intake
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Camera Viewport Container */}
          <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${hasCameraPermission === false ? 'hidden' : 'block'}`}
            />

            {/* Target Reticle Overlay */}
            {hasCameraPermission && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 4 Corner brackets */}
                <div className="relative w-56 h-56 border-2 border-emerald-400/30 rounded-2xl">
                  {/* Top-left */}
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  {/* Top-right */}
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  {/* Bottom-left */}
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  {/* Bottom-right */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                  {/* Animated Scanning Laser Line */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-sm shadow-emerald-400/80 animate-scan-laser" />
                  )}
                </div>
              </div>
            )}

            {/* Camera Permission Denied or Unavailable State */}
            {hasCameraPermission === false && (
              <div className="p-6 text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cameraError || 'Unable to access video stream.'}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Camera Requesting Permission Spinner */}
            {hasCameraPermission === null && (
              <div className="text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Requesting camera permissions...</p>
              </div>
            )}

            {/* Camera Control Badges (Flip / Torch) */}
            {hasCameraPermission && (
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFacingMode}
                    className="h-7 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white text-[11px] font-semibold backdrop-blur-sm border border-slate-700/80 flex items-center gap-1.5 transition"
                    title="Switch between front and back camera"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>Flip</span>
                  </button>

                  {isTorchSupported && (
                    <button
                      onClick={toggleTorch}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold backdrop-blur-sm border flex items-center gap-1.5 transition ${
                        isTorchOn
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/80'
                      }`}
                      title="Toggle flashlight"
                    >
                      {isTorchOn ? <Flashlight className="w-3 h-3" /> : <FlashlightOff className="w-3 h-3" />}
                      <span>{isTorchOn ? 'Torch On' : 'Torch Off'}</span>
                    </button>
                  )}
                </div>

                <div className="px-2.5 py-1 rounded-md bg-slate-950/80 text-[10px] font-mono text-emerald-400 border border-emerald-900/50 backdrop-blur-sm">
                  Active Viewfinder
                </div>
              </div>
            )}
          </div>

          {/* Scanned Tag Result Card */}
          {scannedTag && (
            <div className={`p-4 rounded-xl border transition-all ${
              isRegistered
                ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-200'
                : 'bg-cyan-950/40 border-cyan-500/50 text-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  {isRegistered ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {isRegistered ? 'Registered Asset Matched' : 'Unregistered CPCB Tag Scanned'}
                  </span>
                </div>
                <button
                  onClick={handleResetScan}
                  className="text-[11px] text-slate-400 hover:text-white underline font-sans"
                >
                  Scan Again
                </button>
              </div>

              {/* Tag information */}
              <div className="py-2 space-y-1">
                <div className="text-[11px] text-slate-400 font-mono">
                  CPCB Identifier: <span className="text-white font-bold">{scannedTag}</span>
                </div>

                {matchedDevice ? (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Model & Brand</span>
                      <span className="text-white font-semibold">{matchedDevice.brand} {matchedDevice.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Current Status</span>
                      <span className="text-emerald-400 font-semibold">{matchedDevice.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Hub Location</span>
                      <span className="text-slate-300">{matchedDevice.hubLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CO2 Saved</span>
                      <span className="text-emerald-400 font-semibold">+{matchedDevice.co2SavedKg || 58} kg</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-cyan-200 mt-1">
                    This CPCB custody tag is ready for intake registration! Click below to auto-populate the registration form with this tag.
                  </p>
                )}
              </div>

              {/* Action button */}
              <div className="pt-2">
                {isRegistered && matchedDevice ? (
                  <button
                    onClick={handleConfirmLookup}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Search className="w-4 h-4" />
                    <span>Open Device Details & Lifecycle</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmRegistration}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Auto-Fill & Register Device with Tag {scannedTag}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick-Scan Test Tags (Allows instant verification on any device) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                Quick-Trigger Sample CPCB Tags:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {devices.slice(0, 3).map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleProcessScannedCode(d.id)}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 block group-hover:text-emerald-300">
                      {d.id}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {d.brand} {d.model} ({d.status})
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}

              {/* Sample New Unregistered Tag */}
              <button
                onClick={() => handleProcessScannedCode(`CPCB-EPR-2026-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 block group-hover:text-cyan-300">
                    + CPCB-EPR-NEW
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    Unregistered Hardware Tag
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
              </button>
            </div>

            {/* Manual Tag Entry */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or type CPCB Tag / IMEI / Serial..."
                value={manualTagInput}
                onChange={(e) => setManualTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleProcessScannedCode(manualTagInput);
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleProcessScannedCode(manualTagInput)}
                disabled={!manualTagInput.trim()}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
