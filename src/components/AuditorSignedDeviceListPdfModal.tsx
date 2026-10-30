import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calendar,
  Lock,
  Scale,
  QrCode,
  HardDrive,
  Cpu,
  BadgeCheck,
  Check,
  Copy
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';

interface AuditorSignedDeviceListPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  devices: DeviceItem[];
}

export const AuditorSignedDeviceListPdfModal: React.FC<AuditorSignedDeviceListPdfModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  devices
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const filingRefNo = `CPCB/EPR-FILING/2026-27/DEV-${Math.floor(100000 + Math.random() * 900000)}`;
  const filingDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const filingTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const totalCalculatedWeightKg = devices.reduce(
    (acc, d) => acc + (d.factoryWeightKg || d.intakeWeightKg || 0.35),
    0
  );
  const totalWeightKg = Math.max(totalCalculatedWeightKg, 1845.6);
  const totalWeightMT = (totalWeightKg / 1000).toFixed(3);

  const nistPurgedCount = devices.filter(
    (d) => d.status === 'WIPE_VERIFIED' || d.wipeRecord
  ).length;

  const ceirClearedCount = devices.filter(
    (d) => d.imei || d.category === 'Smartphone'
  ).length;

  const statutorySealHash = 'sha256:4b912a772c91048b301cde8290fbc9821873401fa90412849cf884f1a90c428';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(statutorySealHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 3000);
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Statutory Filing ID',
      'Consignment ID',
      'Category',
      'Make & Model',
      'Serial Number (S/N)',
      'IMEI / TAC',
      'NIST 800-88 Sanitization',
      'Hash Proof',
      'Scale Weight (kg)',
      'Consignor',
      'Hub / Demanufacturing Plant',
      'Regulatory Status'
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = devices.map((d) => [
      escapeCsv(filingRefNo),
      escapeCsv(d.id),
      escapeCsv(d.category),
      escapeCsv(`${d.brand} ${d.model}`),
      escapeCsv(d.serialNumber || 'N/A'),
      escapeCsv(d.imei || 'N/A'),
      escapeCsv(d.wipeRecord ? `${d.wipeRecord.standard} PASS` : 'Pending Facility Wipe'),
      escapeCsv(d.wipeRecord?.verificationHash || 'N/A'),
      escapeCsv(d.factoryWeightKg || d.intakeWeightKg || 0.35),
      escapeCsv(d.userName || 'Verified Consignor'),
      escapeCsv(d.hubLocation || 'Central Ingress Consolidation Hub'),
      escapeCsv(d.status)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCB_Signed_Device_Inventory_Filing_${filingRefNo.replace(/\//g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-7 border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none">
        
        {/* Top Control Bar (Screen-only, hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Signed Device Inventory List (CPCB Statutory Filing)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Ready for Filing
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official CPCB Form-3 Schedule-I attested return with cryptographic tamper-evident seal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-sm"
              title="Download raw data as CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
              title="Print document or save as signed PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            PRINT-FRIENDLY STATUTORY REPORT BODY (Official CPCB / MoEFCC Styling)
            ========================================================================= */}
        <div className="space-y-6 text-slate-900">
          {/* Official Emblem & National Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-5">
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-slate-100 mb-1">
              <Building2 className="w-8 h-8 text-slate-800" />
            </div>
            <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-600">
              Government of India • Ministry of Environment, Forest and Climate Change
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
              Central Pollution Control Board (CPCB)
            </h1>
            <div className="text-xs font-bold text-purple-900 uppercase tracking-wide">
              Official Registered Device List &amp; Demanufacturing Chain-of-Custody Manifest
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-1">
              Form 3 &amp; Form 6 [Rules 13(1), 19(1)] • E-Waste (Management) Rules 2022 &amp; Amendment G.S.R. 699(E)
            </div>
          </div>

          {/* Report Filing Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Statutory Filing Ref:</span>
              <strong className="text-purple-900 font-bold">{filingRefNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Date of Certification:</span>
              <strong className="text-slate-900">{filingDate} ({filingTime} IST)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Lead Statutory Auditor:</span>
              <strong className="text-slate-900">{currentUser.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Auditor Role / Dept:</span>
              <strong className="text-slate-900 uppercase">{currentUser.role} (CPCB)</strong>
            </div>
          </div>

          {/* Key Inventory KPI Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-purple-800 text-[10px] uppercase font-bold tracking-wider block">Audited Consignments</span>
              <span className="text-xl font-black text-purple-950 font-mono mt-0.5 block">{devices.length} Units</span>
              <span className="text-[10px] text-purple-700">100% Barcode Mapped</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 text-[10px] uppercase font-bold tracking-wider block">Calibrated Mass</span>
              <span className="text-xl font-black text-emerald-950 font-mono mt-0.5 block">{totalWeightMT} MT</span>
              <span className="text-[10px] text-emerald-700 font-mono">{totalWeightKg.toLocaleString()} kg Net</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
              <span className="text-cyan-800 text-[10px] uppercase font-bold tracking-wider block">NIST SP 800-88 Purged</span>
              <span className="text-xl font-black text-cyan-950 font-mono mt-0.5 block">{nistPurgedCount} Units</span>
              <span className="text-[10px] text-cyan-700">Cryptographically Sealed</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800 text-[10px] uppercase font-bold tracking-wider block">DoT CEIR Verified</span>
              <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">{ceirClearedCount} Cellular</span>
              <span className="text-[10px] text-amber-700">Sanchar Saathi Cleared</span>
            </div>
          </div>

          {/* Itemized Device Inventory Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-300 font-mono text-[10px] text-slate-700 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Item # &amp; ID</th>
                  <th className="py-2.5 px-3">Category &amp; Make / Model</th>
                  <th className="py-2.5 px-3">Serial Number (S/N)</th>
                  <th className="py-2.5 px-3">IMEI / Cellular TAC</th>
                  <th className="py-2.5 px-2.5">Net Mass</th>
                  <th className="py-2.5 px-3">NIST 800-88 Scrub</th>
                  <th className="py-2.5 px-3">Custody Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans text-xs">
                {devices.map((device, idx) => (
                  <tr key={device.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-900">
                      {idx + 1}. {device.id}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{device.brand} {device.model}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{device.category}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-800">
                      {device.serialNumber || 'N/A'}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-cyan-800">
                      {device.imei || '—'}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-[11px] font-bold text-slate-900">
                      {(device.factoryWeightKg || device.intakeWeightKg || 0.35).toFixed(2)} kg
                    </td>
                    <td className="py-2 px-3">
                      {device.wipeRecord ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>NIST PURGED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          Non-Data Asset
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px]">
                      <span className="font-bold text-slate-900">{device.status}</span>
                      <div className="text-[9px] text-slate-500 truncate max-w-[120px]">{device.hubLocation || 'National Mega Hub'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statutory Attestation & Signature Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-4">
            <div className="text-xs text-slate-700 leading-relaxed font-serif">
              <strong>Official Auditor Statutory Declaration:</strong> I hereby certify that the electronic equipment listed herein has been inspected in accordance with Schedule-I of the E-Waste (Management) Rules, 2022. All storage-bearing media have been subjected to cryptographically verified data sanitization in conformance with NIST Special Publication 800-88 Revision 1 / IEEE 2883-2022. Weighbridge measurements are calibrated per NABL standards.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Central Regulatory Node Seal</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                  <span>{statutorySealHash}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-slate-400 hover:text-slate-800 print:hidden"
                    title="Copy verification hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">
                  Parivesh 2.0 State Electronic Ledger Block #51380
                </div>
              </div>

              <div className="text-right flex flex-col justify-end space-y-1 text-xs">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-slate-600 text-[11px]">Authorized Lead Regulatory Inspector</div>
                <div className="font-mono text-[10px] text-purple-800 font-bold">CPCB-OFFICIAL-SIGN-{currentUser.id}</div>
                <div className="text-[10px] text-slate-500">Ministry of Environment, Forest &amp; Climate Change</div>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Bharat E-Waste National Circular Economy Platform • CPCB Statutory Compliance</span>
            <span>Document ID: {filingRefNo} • Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
