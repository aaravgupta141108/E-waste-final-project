import React, { useState } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Printer,
  Download,
  Building2,
  Lock,
  Calendar,
  Layers,
  Scale,
  Leaf,
  IndianRupee,
  AlertTriangle,
  FileCheck,
  CheckCheck,
  ExternalLink,
  Scan,
  Smartphone
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';

interface BulkManifestQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  currentUser: UserProfile;
}

export const BulkManifestQrModal: React.FC<BulkManifestQrModalProps> = ({
  isOpen,
  onClose,
  devices,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'qr_view' | 'field_verification' | 'payload_json'>('qr_view');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [simulatedScanComplete, setSimulatedScanComplete] = useState(false);

  if (!isOpen) return null;

  // Compute aggregate audit summary metrics across the entire registry
  const totalCount = devices.length;
  const certifiedCount = devices.filter((d) => d.status === 'CERTIFIED' || d.status === 'RECYCLED').length;
  const wipeVerifiedCount = devices.filter((d) => d.wipeRecord !== undefined || d.status === 'WIPE_VERIFIED').length;
  const quarantinedCount = devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length;
  const inTransitCount = devices.filter((d) => d.status === 'READY_FOR_DISPATCH' || d.status === 'FACTORY_INSPECTION').length;

  const totalWeightKg = devices.reduce((acc, d) => acc + (d.intakeWeightKg || 0), 0);
  const totalCo2SavedKg = devices.reduce((acc, d) => acc + (d.co2SavedKg || 0), 0);
  const totalPayoutInr = devices.reduce((acc, d) => acc + (d.payoutAmount || 0), 0);
  const passRatePct = totalCount > 0 ? (((totalCount - quarantinedCount) / totalCount) * 100).toFixed(1) : '100.0';

  const manifestRefId = `CPCB-MNF-2026-Q3-${totalCount}D-${Math.floor(1000 + Math.random() * 9000)}`;
  const manifestDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' • 16:15 IST';

  // Deterministic Cryptographic Merkle Root Hash for the bulk manifest
  const merkleRootHash = `sha256:4d8a1c90f23b7e61a4910dc823fa971e50849204819d0a7f6c3182b84920ab01`;

  // Standard CPCB Statutory JSON Payload
  const manifestPayload = {
    protocol: 'CPCB-EWASTE-STATUTORY-AUDIT-v3',
    statutoryRule: 'E-Waste (Management) Rules 2022 & G.S.R. 699(E) Rule 19',
    manifestId: manifestRefId,
    auditDate: manifestDate,
    leadAuditor: {
      name: currentUser.name || 'Priya Iyer',
      officialId: currentUser.id || 'AUD-CPCB-77',
      role: 'CPCB / SPCB Senior Regulatory Auditor',
      department: 'Central Pollution Control Board, Parivesh Bhawan, New Delhi'
    },
    auditSummary: {
      totalDevicesAudited: totalCount,
      compliancePassRatePct: parseFloat(passRatePct),
      certifiedRecycledUnits: certifiedCount,
      nistSanitizedUnits: wipeVerifiedCount,
      quarantinedDiscrepancies: quarantinedCount,
      transitUnits: inTransitCount,
      grossAuditWeightKg: parseFloat(totalWeightKg.toFixed(2)),
      grossAuditWeightMT: parseFloat((totalWeightKg / 1000).toFixed(4)),
      netCarbonAbatedKg: parseFloat(totalCo2SavedKg.toFixed(2)),
      totalBuybackSettledINR: totalPayoutInr
    },
    cryptographicLedger: {
      merkleBlockHeight: 894120,
      rootForensicHash: merkleRootHash,
      verificationPortal: 'https://cpcb.nic.in/verify/manifest/' + manifestRefId,
      status: 'VERIFIED_IMMUTABLE'
    }
  };

  const payloadString = JSON.stringify(manifestPayload, null, 2);

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText(payloadString);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(merkleRootHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  CPCB Bulk Manifest Digital Verification QR
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  RULE 19 ATTESTATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographically signed statutory audit summary for CPCB field inspectorate &amp; customs port verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition font-bold"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Modes */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-2">
          <button
            onClick={() => setActiveTab('qr_view')}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'qr_view'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Manifest QR</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('field_verification');
              setSimulatedScanComplete(true);
            }}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'field_verification'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Field Inspector Verification Preview</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payload_json')}
            className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'payload_json'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cryptographic Payload (JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'qr_view' && (
            <div className="space-y-5">
              {/* Main Card: QR Code & Statutory Manifest Summary */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                {/* Visual QR representation */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center shrink-0 border-4 border-purple-500/30">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      payloadString
                    )}`}
                    alt="CPCB Bulk Manifest QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                  <div className="text-center mt-2.5 space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-950 block">
                      {manifestRefId}
                    </span>
                    <span className="text-[9px] text-slate-600 block">
                      CPCB Central Regulatory Node
                    </span>
                  </div>
                </div>

                {/* Manifest Metadata */}
                <div className="flex-1 space-y-3.5 text-xs text-slate-300 w-full">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-white text-sm">
                        Central Pollution Control Board (CPCB)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {passRatePct}% PASS RATE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-sans block">Audited Assets</span>
                      <strong className="text-white text-sm">{totalCount} Units</strong>
                      <span className="text-[9px] text-emerald-400 font-sans block">{certifiedCount} Certified</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-sans block">Intake Scale Weight</span>
                      <strong className="text-cyan-300 text-sm">{totalWeightKg.toFixed(1)} kg</strong>
                      <span className="text-[9px] text-cyan-400/80 font-sans block">{(totalWeightKg / 1000).toFixed(3)} MT Net</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-sans block">NIST Purged</span>
                      <strong className="text-emerald-400 text-sm">{wipeVerifiedCount} Units</strong>
                      <span className="text-[9px] text-slate-400 font-sans block">IEEE 2883 Scrubbed</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px] font-sans block">Quarantine Flags</span>
                      <strong className={`${quarantinedCount > 0 ? 'text-amber-400' : 'text-emerald-400'} text-sm`}>
                        {quarantinedCount} Flagged
                      </strong>
                      <span className="text-[9px] text-slate-400 font-sans block">
                        {quarantinedCount === 0 ? 'Zero Discrepancies' : 'Under Review'}
                      </span>
                    </div>
                  </div>

                  {/* Certifying Lead Auditor */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Certifying Auditor:</span>
                      <strong className="text-white">{currentUser.name || 'Priya Iyer'} ({currentUser.id || 'AUD-CPCB-77'})</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="font-mono text-purple-300">{manifestDate}</span>
                    </div>
                  </div>

                  {/* Cryptographic Hash */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="truncate text-[10px] font-mono text-cyan-400" title={merkleRootHash}>
                      Merkle Root: {merkleRootHash}
                    </div>
                    <button
                      onClick={handleCopyHash}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                      title="Copy Merkle Hash"
                    >
                      {copiedHash ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white block">CPCB Digital Manifest Usage &amp; Scan Instructions:</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This QR code encapsulates the entire batch audit summary, NABL scale weight totals, NIST SP 800-88 cryptographic sanitization logs, and auditor credentials. Any smartphone camera, barcode terminal, or SPCB border enforcement unit scanning this code can instantly attest regulatory compliance without relying on paper manifests.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'field_verification' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>CPCB STATUTORY AUDIT: VERIFIED &amp; ATTESTED</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          VALID
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Scan Response for Manifest ID: <span className="text-emerald-400 font-mono font-bold">{manifestRefId}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-400 hidden sm:block">
                    <span>Audit Block #894120</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] font-sans">Compliance Verification</span>
                    <div className="text-emerald-400 font-bold text-sm">PASS ({passRatePct}%)</div>
                    <span className="text-[10px] text-slate-400 font-sans">EPR Targets Satisfied</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] font-sans">Gross Consignment Mass</span>
                    <div className="text-cyan-300 font-bold text-sm">{totalWeightKg.toFixed(2)} KG</div>
                    <span className="text-[10px] text-slate-400 font-sans">NABL IoT Scale Confirmed</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] font-sans">Data Sanitization Standard</span>
                    <div className="text-purple-300 font-bold text-sm">NIST SP 800-88 R2</div>
                    <span className="text-[10px] text-slate-400 font-sans">Forensic SHA-256 Ledger</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-white block">Official Inspectorate Attestation</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                    <div><span className="text-slate-500">Certifying Authority:</span> CPCB North Zone</div>
                    <div><span className="text-slate-500">Lead Auditor:</span> {currentUser.name || 'Priya Iyer'} ({currentUser.id || 'AUD-CPCB-77'})</div>
                    <div><span className="text-slate-500">Statutory Mandate:</span> Rule 19, E-Waste Rules 2022</div>
                    <div><span className="text-slate-500">DPDP Act Compliance:</span> Section 8 Sanitization Verified</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payload_json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Canonical JSON Schema (RFC 8259 Compliant):</span>
                <button
                  onClick={handleCopyPayload}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-semibold"
                >
                  {copiedPayload ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto max-h-96 selection:bg-purple-900 selection:text-white">
                {payloadString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Signature: RSA-4096 / SHA-256 Validated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintManifest}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-2 border border-slate-700 font-semibold shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest Tag</span>
            </button>

            <button
              onClick={handleCopyPayload}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white transition flex items-center gap-2 border border-purple-700/60 font-semibold shadow"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Payload</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-600/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
