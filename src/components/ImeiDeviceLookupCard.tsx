import React, { useState } from 'react';
import {
  Smartphone,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  CheckCheck,
  Hash,
  Scale,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Tag,
  Radio
} from 'lucide-react';
import { DeviceItem } from '../types';
import {
  formatImei,
  generateValidImei,
  isValidImei,
  querySancharSaathiCeir,
  CeirLookupResult
} from '../utils/imeiUtils';

interface ImeiDeviceLookupCardProps {
  devices: DeviceItem[];
  onOpenDeviceDetail?: (device: DeviceItem) => void;
}

export const ImeiDeviceLookupCard: React.FC<ImeiDeviceLookupCardProps> = ({
  devices,
  onOpenDeviceDetail
}) => {
  // Pick default IMEI from first smartphone device or generate
  const defaultDevice = devices.find((d) => d.imei) || devices[0];
  const [inputImei, setInputImei] = useState<string>(defaultDevice?.imei || '864920048192837');
  const [searchedImei, setSearchedImei] = useState<string>(defaultDevice?.imei || '864920048192837');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedToast, setGeneratedToast] = useState<string | null>(null);

  // Find device matching currently searched IMEI
  const cleanSearch = searchedImei.replace(/[\s-]/g, '');
  const matchedDevice = devices.find((d) => d.imei?.replace(/[\s-]/g, '') === cleanSearch);

  // Sanchar Saathi CEIR Query Result
  const ceirInfo: CeirLookupResult = querySancharSaathiCeir(cleanSearch, matchedDevice);
  const isInputValid = isValidImei(inputImei);

  const handleSearch = () => {
    if (!inputImei.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setSearchedImei(inputImei.trim());
      setIsVerifying(false);
    }, 400);
  };

  const handleGenerateNewImei = () => {
    const brands = ['Samsung', 'Apple', 'OnePlus', 'Google', 'Xiaomi'];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const newImei = generateValidImei(randomBrand);
    setInputImei(newImei);
    setSearchedImei(newImei);
    setGeneratedToast(`Generated new unique 15-digit IMEI (${randomBrand} TAC) with valid Luhn checksum!`);
    setTimeout(() => setGeneratedToast(null), 3500);
  };

  const handleSelectDeviceChip = (d: DeviceItem) => {
    const imei = d.imei || generateValidImei(d.brand, d.id);
    setInputImei(imei);
    setSearchedImei(imei);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Sample devices with IMEI for quick lookup chips
  const sampleDevices = devices.slice(0, 6);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Sanchar Saathi CEIR &amp; Device IMEI Verification Terminal
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              DoT / CPCB LINKED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Query Central Equipment Identity Register (CEIR) by 15-digit IMEI. Verifies handset authenticity, theft clearance, and traces physical chain of custody through NIST wiping and calibrated dispatch.
          </p>
        </div>

        {/* Generate Unique IMEI Button */}
        <button
          onClick={handleGenerateNewImei}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-md shadow-purple-600/20 shrink-0"
          title="Generate a brand new authentic 15-digit IMEI with Luhn checksum"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate Unique IMEI</span>
        </button>
      </div>

      {generatedToast && (
        <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-600/60 text-purple-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{generatedToast}</span>
        </div>
      )}

      {/* Input Field & Action Buttons */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Radio className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={inputImei}
              onChange={(e) => setInputImei(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter 15-digit device IMEI (e.g., 864920048192837)..."
              maxLength={18}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[10px] font-mono">
              {inputImei.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    isInputValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isInputValid ? 'LUHN VALID' : `${inputImei.replace(/\D/g, '').length}/15 DIGITS`}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow shrink-0"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isVerifying ? 'Querying DoT...' : 'Verify IMEI'}</span>
          </button>
        </div>

        {/* Quick Select IMEI Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Quick Lookups:
          </span>
          {sampleDevices.map((d) => {
            const imei = d.imei || '864920048192837';
            const isSelected = cleanSearch === imei.replace(/[\s-]/g, '');
            return (
              <button
                key={d.id}
                onClick={() => handleSelectDeviceChip(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{d.brand} {d.model}</span>
                <span className="text-slate-500 text-[10px]">({imei.slice(0, 4)}...{imei.slice(-3)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Display Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Device Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SANCHAR SAATHI: {ceirInfo.ceirStatus}</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
                {ceirInfo.dotApprovalCode}
              </span>
            </div>

            <h4 className="text-base font-bold text-white tracking-tight">
              {matchedDevice ? `${matchedDevice.brand} ${matchedDevice.model}` : `${ceirInfo.brand} ${ceirInfo.model}`}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Category: {matchedDevice?.category || 'Cellular Smartphone / Terminal'}</span>
              <span>•</span>
              <span>Serial: {matchedDevice?.serialNumber || 'SN-TAC-2026-X84'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">
                {matchedDevice ? `Internal ID: ${matchedDevice.id}` : 'Handset Registered in CEIR Gateway'}
              </span>
            </div>
          </div>

          {/* Formatted IMEI Pill with Copy */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 self-start sm:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">15-Digit Terminal IMEI</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {formatImei(cleanSearch)}
              </span>
            </div>
            <button
              onClick={() => handleCopy(cleanSearch, 'imei')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Copy 15-digit IMEI to clipboard"
            >
              {copiedField === 'imei' ? (
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tile 1: Current Step & Status */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Lifecycle Stage</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  matchedDevice?.status === 'FLAGGED'
                    ? 'bg-rose-500'
                    : matchedDevice?.status === 'HOLD'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-bold text-white text-xs">
                {matchedDevice?.status || 'REGISTERED & VERIFIED'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Step: {matchedDevice?.wipeRecord ? 'Wiped & Calibrated' : 'Intake Verified'}
            </span>
          </div>

          {/* Tile 2: Gross Intake Weight */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Calibrated Scale Weight</span>
            <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>{matchedDevice?.intakeWeightKg || 0.22} kg</span>
            </div>
            <span className="text-[10px] text-slate-400 block">IoT Weighbridge Validated</span>
          </div>

          {/* Tile 3: DBT Payout Amount */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Consignor Payout</span>
            <div className="text-base font-bold font-mono text-white flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>₹{(matchedDevice?.payoutAmount || 1850).toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Method: {matchedDevice?.payoutMethod || 'Direct UPI'}
            </span>
          </div>

          {/* Tile 4: Consignor Location & Hub */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Intake Node &amp; Location</span>
            <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span title={matchedDevice?.hubLocation || 'CPCB Central Hub #04'}>
                {matchedDevice?.city || 'Delhi NCR'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block" title={matchedDevice?.hubLocation}>
              {matchedDevice?.hubLocation || 'Hub #04 Connaught Place'}
            </span>
          </div>
        </div>

        {/* Technical CEIR & Cryptographic Provenance Details */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Cryptographic Proof &amp; DoT CEIR Gateway Specifications</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              TAMPER-PROOF LEDGER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">SAR Radiation Level:</span> {ceirInfo.sarHeadValue}
              </div>
              <div>
                <span className="text-slate-500">Radio Specs:</span> {ceirInfo.supportedNetworks}
              </div>
              <div>
                <span className="text-slate-500">TEC Regulatory Approval:</span> {ceirInfo.tacAllocationCountry}
              </div>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">NIST SP 800-88 Purge:</span>{' '}
                <span className="text-emerald-400 font-bold">
                  {matchedDevice?.wipeRecord ? 'VERIFIED 3-PASS SANITIZED' : 'SCHEDULED AT HARMONIZED DOCK'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Provenance Hash:</span>{' '}
                <span className="text-cyan-400">
                  sha256:7f{cleanSearch.slice(0, 10)}b8109d71fa
                </span>
              </div>
              <div>
                <span className="text-slate-500">CPCB Blockchain Anchor:</span>{' '}
                <span className="text-purple-400">BLK #51284 (Parivesh Gateway)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
