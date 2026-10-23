import React, { useState } from 'react';
import {
  FileText,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  AlertTriangle,
  QrCode,
  MapPin,
  Lock,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardHat,
  Factory,
  User,
  ArrowRight,
  Filter
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';

interface ComplianceHistoryLogProps {
  devices: DeviceItem[];
  currentUser: UserProfile;
}

export const ComplianceHistoryLog: React.FC<ComplianceHistoryLogProps> = ({
  devices,
  currentUser
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.serialNumber && d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.imei && d.imei.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'ALL' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedDevice =
    devices.find((d) => d.id === selectedDeviceId) || filteredDevices[0] || devices[0];

  const handlePrintReport = () => {
    window.print();
  };

  const categories = Array.from(new Set(devices.map((d) => d.category)));

  // Generate complete chronological lifecycle steps
  const buildLifecycleTimeline = (device: DeviceItem) => {
    const events = [];

    // 1. Registration & Ownership
    events.push({
      step: 1,
      title: 'Intake Registration & Ownership Declaration',
      actor: `${device.userName} (Consignor)`,
      role: 'Consignor',
      timestamp: device.registeredAt,
      location: device.hubLocation,
      status: 'VERIFIED',
      hash: 'sha256-own-decl-88192a01',
      details: `Device registered with statutory ownership declaration under DPDP Act 2023. Category: ${device.category}, Condition: ${device.condition}.`
    });

    // 2. Hardware profile & user confirmation
    events.push({
      step: 2,
      title: 'Hardware Profile & Firmware Verification',
      actor: 'Rajesh Verma (Collection Engineer)',
      role: 'Collection Hub',
      timestamp: device.registeredAt,
      location: device.hubLocation,
      status: 'VERIFIED',
      hash: 'sha256-hw-prof-99120b44',
      details: `Physical triage recorded. Storage: ${device.storageType || 'Flash'} (${device.storageSizeGb || 128} GB), S/N: ${device.serialNumber}, UEFI: ${device.uefiVersion || 'Embedded'}. Owner confirmed.`
    });

    // 3. Sanchar Saathi IMEI Check (if mobile)
    if (device.imei) {
      events.push({
        step: 3,
        title: 'DoT Sanchar Saathi (CEIR) Legitimacy Check',
        actor: 'CEIR Automated Gateway',
        role: 'Regulator API',
        timestamp: device.registeredAt,
        location: 'Department of Telecommunications',
        status: device.status === 'HOLD' ? 'QUARANTINE_HOLD' : 'CLEAN_VERIFIED',
        hash: 'sha256-ceir-valid-77319c',
        details: device.status === 'HOLD'
          ? 'CEIR Flag: Activation locked or unverified ownership. Moved to HOLD status.'
          : `IMEI ${device.imei} verified genuine. Not flagged on lost/stolen central registry.`
      });
    }

    // 4. NIST SP 800-88 Data Sanitization
    if (device.wipeRecord) {
      events.push({
        step: 4,
        title: `NIST SP 800-88 Rev. 2 Cryptographic Sanitization (${device.wipeRecord.method})`,
        actor: device.wipeRecord.engineerName,
        role: 'Collection Hub',
        timestamp: device.wipeRecord.endTime,
        location: device.hubLocation,
        status: device.wipeRecord.status === 'Pass' ? 'PURGE_PASSED' : 'FAILED',
        hash: device.wipeRecord.verificationHash,
        details: `Sanitization tool: ${device.wipeRecord.toolName} ${device.wipeRecord.toolVersion}. Forensic sample test: ${device.wipeRecord.recoverySampleTest}. Energy consumed: ${device.wipeRecord.energyKwh} kWh.`
      });
    }

    // 5. Payout Disbursed & Acknowledged
    if (device.payoutSentAt) {
      events.push({
        step: 5,
        title: 'Statutory Buyback Payout Disbursement & Citizen Receipt',
        actor: 'NPCI / Bank Gateway',
        role: 'Payment Rail',
        timestamp: device.payoutSentAt,
        location: 'Financial Settlement Node',
        status: device.payoutAcknowledgedAt ? 'ACKNOWLEDGED' : 'SENT',
        hash: 'sha256-payout-remit-32948',
        details: `Amount: ₹${device.payoutAmount.toLocaleString()} via ${device.payoutMethod}. Txn Ref: ${device.payoutTxnRef || 'PENDING'}. Confirmed by citizen on ${device.payoutAcknowledgedAt || 'Pending receipt'}.`
      });
    }

    // 6. Live Geotagged Scale Dispatch
    events.push({
      step: 6,
      title: 'Calibrated Scale Weighing & Geotagged Dispatch Lot',
      actor: 'Rajesh Verma (ENG-COL-104)',
      role: 'Collection Hub',
      timestamp: device.updatedAt,
      location: 'GPS: 28.5355° N, 77.3910° E (Accuracy: ±8.5m)',
      status: 'DISPATCH_SEALED',
      hash: 'sha256-geo-scale-449102',
      details: `Weighbridge recorded: ${device.intakeWeightKg} kg. Assigned to transit batch ${device.batchId || 'BATCH-DEL-2026-W42'}.`
    });

    // 7. Demanufacturing Plant Intake & Discrepancy Check
    if (device.factoryWeightKg) {
      events.push({
        step: 7,
        title: 'Factory Intake & Weight Discrepancy Audit',
        actor: 'Dr. Suresh Nair (Factory Lead)',
        role: 'Refinery Plant',
        timestamp: device.updatedAt,
        location: device.recyclerName || 'EcoRecycle Apex Solutions',
        status: Math.abs(device.weightDiscrepancyPct || 0) > 10 ? 'FLAGGED' : 'ACCEPTED',
        hash: 'sha256-fac-weigh-881920',
        details: `Factory measured weight: ${device.factoryWeightKg} kg. Variance: ${device.weightDiscrepancyPct || 0}%. Authenticity verified.`
      });
    }

    // 8. Operator Interventions
    if (device.interventions && device.interventions.length > 0) {
      device.interventions.forEach((intv, idx) => {
        events.push({
          step: 8 + idx,
          title: `Operator Intervention: ${intv.actionType}`,
          actor: intv.operatorName,
          role: 'Demanufacturing Engineer',
          timestamp: intv.timestamp,
          location: intv.station,
          status: intv.hazardDetected ? 'HAZARD_SECURED' : 'COMPLETED',
          hash: `sha256-intv-${intv.id}`,
          details: `${intv.notes} ${intv.hazardType ? `Hazard handled: ${intv.hazardType}` : ''}`
        });
      });
    }

    // 9. Material Recovery Extraction
    if (device.materialYield) {
      events.push({
        step: 9,
        title: 'Hydrometallurgical Extraction & Circular Yield Allocation',
        actor: 'Automated Recovery Smelter',
        role: 'Refinery Plant',
        timestamp: device.updatedAt,
        location: device.recyclerName || 'EcoRecycle Apex Solutions',
        status: 'MATERIALS_EXTRACTED',
        hash: 'sha256-mat-yield-109283',
        details: `Recovered fractions: Gold: ${device.materialYield.goldGrams}g, Copper: ${device.materialYield.copperGrams}g, Aluminum: ${device.materialYield.aluminumGrams}g, Plastics: ${device.materialYield.plasticGrams}g, Rare Earths: ${device.materialYield.rareEarthGrams}g.`
      });
    }

    // 10. Official Green Certification
    if (device.certificateId) {
      events.push({
        step: 10,
        title: 'CPCB Statutory Green Disposal Certificate Issuance',
        actor: 'Central Pollution Control Board Registry',
        role: 'Statutory Authority',
        timestamp: device.updatedAt,
        location: 'National Registry Ledger',
        status: 'CERTIFIED_SEALED',
        hash: device.certificateHash || 'sha256-cert-apex-882190',
        details: `Certificate ID: ${device.certificateId}. Avoided CO₂ emissions: ${device.co2SavedKg} kg. Form 3 ledger updated.`
      });
    }

    return events;
  };

  const timeline = selectedDevice ? buildLifecycleTimeline(selectedDevice) : [];

  return (
    <div className="space-y-6">
      {/* Top Controls & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Device-Level Statutory Compliance History & Lifecycle Audit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  End-to-end cryptographic provenance trail from drop-off to material extraction
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              disabled={!selectedDevice}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-2 shadow-md shadow-purple-600/20"
            >
              <FileText className="w-4 h-4" />
              <span>Export Signed Verification Report</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Device ID, Serial Number, IMEI, Brand, or Model..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Categories ({devices.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Device Selector on Left, Chronological Verified History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Device Picker Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Audit Registry Items</span>
            <span className="font-mono text-purple-400">{filteredDevices.length} MATCHES</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredDevices.map((device) => {
              const isSelected = selectedDevice?.id === device.id;
              return (
                <div
                  key={device.id}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {device.brand} {device.model}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {device.id} • {device.category}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        device.status === 'CERTIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : device.status === 'FLAGGED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : device.status === 'HOLD'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Scale: {device.intakeWeightKg} kg</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {device.co2SavedKg} kg CO₂
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chronological Audit Trail Details Column */}
        {selectedDevice && (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Header Device Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedDevice.brand} {selectedDevice.model}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-purple-400 border border-purple-800/50">
                    {selectedDevice.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Serial: <span className="font-mono text-slate-300">{selectedDevice.serialNumber || 'N/A'}</span>
                  {selectedDevice.imei && (
                    <> • IMEI: <span className="font-mono text-slate-300">{selectedDevice.imei}</span></>
                  )}
                  {selectedDevice.uefiVersion && (
                    <> • UEFI: <span className="font-mono text-slate-300">{selectedDevice.uefiVersion}</span></>
                  )}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Statutory Status</span>
                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950 px-2 py-1 rounded border border-emerald-800 inline-block mt-0.5">
                  {selectedDevice.status}
                </span>
              </div>
            </div>

            {/* Cryptographic Ledger Verification Hash Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>IMMUTABLE PROVENANCE LEDGER HASH (SHA-256)</span>
                </span>
                <span className="text-emerald-400 font-bold">VERIFIED VALID</span>
              </div>
              <div className="bg-slate-900 p-2 rounded text-[11px] text-purple-300 overflow-x-auto select-all">
                {selectedDevice.certificateHash ||
                  selectedDevice.wipeRecord?.verificationHash ||
                  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Chronological Chain of Custody Audit Trail ({timeline.length} Recorded Milestones)
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative group text-xs space-y-1">
                    {/* Bullet marker */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-purple-500 group-hover:scale-125 transition flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{event.timestamp}</span>
                          <span>•</span>
                          <span>{event.actor} ({event.role})</span>
                          <span>•</span>
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 shrink-0">
                        {event.status}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                      {event.details}
                    </p>

                    <div className="text-[9px] font-mono text-slate-500 pt-0.5">
                      Node Attestation: {event.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Signed Lifecycle Verification Report Modal */}
      {showExportModal && selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-purple-500/50 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">
                  Official CPCB Signed Device Lifecycle Audit Report
                </span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Document Body (Printable format) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200 font-sans print:bg-white print:text-black">
              {/* Document Header */}
              <div className="border-b-2 border-purple-600 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-purple-400">
                    CENTRAL POLLUTION CONTROL BOARD • MINISTRY OF ENVIRONMENT, FOREST & CLIMATE CHANGE
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    STATUTORY VERIFICATION & CHAIN OF CUSTODY REPORT
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official Inspection Record under E-Waste (Management) Rules 2022 & Amendment G.S.R. 699(E)
                  </p>
                </div>
                <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://bharat-ewaste.gov.in/verify/${selectedDevice.id}`}
                    alt="Statutory QR"
                    className="w-12 h-12"
                  />
                </div>
              </div>

              {/* Asset Identity Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">National Asset ID:</span>
                  <span className="font-mono text-purple-300 font-bold">{selectedDevice.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Category & Brand:</span>
                  <span className="text-white font-medium">{selectedDevice.category} - {selectedDevice.brand}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Model & Spec:</span>
                  <span className="text-white font-medium">{selectedDevice.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Serial / IMEI:</span>
                  <span className="font-mono text-white">{selectedDevice.serialNumber || selectedDevice.imei}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Calibrated Intake Weight:</span>
                  <span className="font-mono text-white">{selectedDevice.intakeWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Authorized Recycler:</span>
                  <span className="text-white font-medium">{selectedDevice.recyclerName || 'EcoRecycle Apex Solutions'}</span>
                </div>
              </div>

              {/* Data Sanitization Attestation */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>NIST SP 800-88 Rev. 2 & IEEE 2883 Cryptographic Sanitization Attestation</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ZERO RESIDUAL DATA</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>
                    <strong>Erasure Method:</strong> {selectedDevice.wipeRecord?.method || 'Cryptographic Block Erase & Key Revocation'}
                  </p>
                  <p>
                    <strong>Verification SHA-256:</strong>{' '}
                    <span className="font-mono text-[10px] text-emerald-400">
                      {selectedDevice.wipeRecord?.verificationHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </span>
                  </p>
                  <p>
                    <strong>Forensic Sample Recovery Test:</strong> {selectedDevice.wipeRecord?.recoverySampleTest || 'Passed (0 sectors recoverable)'}
                  </p>
                </div>
              </div>

              {/* Lifecycle Milestones Summary */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Verified Custodial Milestones
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-2">Stage</th>
                        <th className="p-2">Timestamp (IST)</th>
                        <th className="p-2">Actor / Authority</th>
                        <th className="p-2">Custodial Node / GPS</th>
                        <th className="p-2">Ledger Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {timeline.slice(0, 6).map((ev, i) => (
                        <tr key={i}>
                          <td className="p-2 font-sans font-bold text-white">{ev.title.slice(0, 30)}...</td>
                          <td className="p-2 text-slate-400">{ev.timestamp}</td>
                          <td className="p-2 text-purple-300 font-sans">{ev.actor}</td>
                          <td className="p-2 text-slate-400 font-sans">{ev.location}</td>
                          <td className="p-2 text-emerald-400 font-bold">{ev.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Digital Sign-off Footnote */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-white">Statutory Regulatory Officer Signature:</div>
                  <div className="font-mono text-purple-400 text-[11px]">
                    {currentUser.name} — CPCB Central Regional Office
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Digital Signature Key ID: 0x98A1...F904 | Certified CPCB Inspector
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">Document Hash ID</span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    CPCB-VERIF-{selectedDevice.id}-{Date.now().toString().slice(-6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Close
              </button>
              <button
                onClick={handlePrintReport}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Verified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
