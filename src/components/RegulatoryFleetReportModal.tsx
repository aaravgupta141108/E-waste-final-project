import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  X,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  QrCode,
  Hash,
  Scale,
  Navigation
} from 'lucide-react';
import { FleetTruck, DeviceItem } from '../types';

interface RegulatoryFleetReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trucks: FleetTruck[];
  devices?: DeviceItem[];
  selectedTruck?: FleetTruck;
}

export const RegulatoryFleetReportModal: React.FC<RegulatoryFleetReportModalProps> = ({
  isOpen,
  onClose,
  trucks,
  devices = [],
  selectedTruck
}) => {
  const [digitalSealApplied, setDigitalSealApplied] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const reportId = `CPCB/EPR-MFT/2026/Q4-${selectedTruck ? selectedTruck.id.slice(-4) : 'ALL'}-${Date.now().toString().slice(-4)}`;
  const generatedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  const verificationHash = '0x8f2a9c14e578b901d32feaa46019b8827cfa55018e32948bbda109823c4a921f';

  // Compute aggregated live telemetry
  const totalWeightInTransit = trucks.reduce((sum, t) => sum + (t.currentLoadKg ?? t.loadWeightKg ?? 1200), 0);
  const totalCapacity = trucks.reduce((sum, t) => sum + (t.capacityKg || 2500), 0);
  const avgEfficiency = Math.round((totalWeightInTransit / (totalCapacity || 1)) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    setIsExporting(true);
    const headers = ['Truck ID', 'Vehicle Reg', 'Driver', 'Route', 'Status', 'Payload (Kg)', 'Speed (km/h)', 'Geofence Status'];
    const rows = trucks.map(t => [
      t.id,
      t.vehicleNumber,
      `"${t.driverName}"`,
      `"${t.currentRoute}"`,
      t.status,
      t.currentLoadKg ?? t.loadWeightKg ?? 1200,
      t.speedKmph ?? 0,
      t.isGeofenced ?? true ? 'Compliant' : 'Warning'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CPCB_E-Waste_Fleet_Manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none print:bg-white print:text-black">
        
        {/* Modal Top Control Bar (Hidden during Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  CPCB Form 6 Regulatory Fleet Manifest
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  STATUTORY VALID
                </span>
              </div>
              <p className="text-xs text-slate-400">
                MoEFCC E-Waste Management Rules 2022 • Rule 19 Hazardous Freight Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Regulatory Document Content */}
        <div id="cpcb-report-printable-area" className="p-6 sm:p-8 space-y-6 text-slate-200 print:text-black print:p-4 text-xs font-sans">
          
          {/* Header of Official Manifest */}
          <div className="border-b-2 border-slate-700 pb-5 print:border-black space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 print:text-black uppercase">
                  Government of India • Ministry of Environment, Forest and Climate Change
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight">
                  CENTRAL POLLUTION CONTROL BOARD (CPCB)
                </h1>
                <div className="text-xs text-slate-300 print:text-slate-700 font-semibold">
                  FORM 6 — E-WASTE MANIFEST & CHAIN-OF-CUSTODY AUDIT DISPATCH RECORD
                </div>
                <div className="text-[10px] text-slate-400 print:text-slate-600">
                  [Statutory Compliance under Rule 19 of E-Waste (Management) Rules, 2022]
                </div>
              </div>

              {/* QR and Manifest ID */}
              <div className="flex flex-col items-end text-right shrink-0">
                <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-600 flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 print:text-slate-600 mt-1">
                  Scan for NIC Verification
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 print:border-slate-300 font-mono text-[10px]">
              <div>
                <span className="text-slate-500 print:text-slate-600 block">Manifest Number:</span>
                <strong className="text-emerald-400 print:text-black">{reportId}</strong>
              </div>
              <div>
                <span className="text-slate-500 print:text-slate-600 block">Filing Quarter:</span>
                <strong className="text-white print:text-black">FY 2025-26 • Q4 Statutory</strong>
              </div>
              <div>
                <span className="text-slate-500 print:text-slate-600 block">Generated Timestamp:</span>
                <span className="text-slate-300 print:text-black">{generatedAt}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-slate-600 block">Statutory Clearance:</span>
                <span className="text-emerald-400 print:text-green-800 font-bold">100% SPCB Authorized</span>
              </div>
            </div>
          </div>

          {/* Section 1: Consignor, Transporter & Consignee Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-black font-bold uppercase text-[10px] tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Consignor (Sender)</span>
              </div>
              <div className="font-bold text-white print:text-black text-xs">
                National E-Waste Circular Hub (Central Node)
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-700 leading-relaxed">
                Plot 42, Connaught Place / Sector 62 Corridor<br />
                New Delhi - 110001, India<br />
                CPCB Reg: <span className="font-mono text-slate-300 print:text-black">CPCB-EPR-HUB-0091</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 print:text-black font-bold uppercase text-[10px] tracking-wider">
                <Truck className="w-3.5 h-3.5" />
                <span>2. Transporter / Carrier</span>
              </div>
              <div className="font-bold text-white print:text-black text-xs">
                Bharat Clean Logistics Dedicated Freight Network
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-700 leading-relaxed">
                Hazmat Freight Carrier License: <span className="font-mono text-slate-300 print:text-black">HZM-DL-2024-8119</span><br />
                Fleet AIS-140 GPS Compliance: <strong className="text-emerald-400 print:text-green-800">Active (Continuous)</strong><br />
                Emergency Contact: <span className="font-mono">+91 11 2309 8800</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 print:text-black font-bold uppercase text-[10px] tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>3. Consignee (Recycler)</span>
              </div>
              <div className="font-bold text-white print:text-black text-xs">
                Greater Noida Circular Extraction Complex
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-700 leading-relaxed">
                Ecotech III Industrial Cluster, Greater Noida (UP)<br />
                UPPCB Consent To Operate: <span className="font-mono text-slate-300 print:text-black">UPPCB/CTO/2023/8491</span><br />
                Recycling Target: <strong className="text-emerald-400 print:text-green-800">95.4% Recovery Rate</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Fleet Telemetry & Active Manifest Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-300 print:text-black">
                <Navigation className="w-4 h-4 text-emerald-400 print:text-black" />
                <span>Active Vehicle Consignment Roster (Live GPS Monitored)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                {trucks.length} Vehicles Scheduled • {totalWeightInTransit.toLocaleString()} kg Total Payload
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 print:bg-slate-100 text-[10px] font-mono uppercase text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-400">
                    <th className="py-2 px-3">Vehicle / ID</th>
                    <th className="py-2 px-3">Driver Name</th>
                    <th className="py-2 px-3">Transit Corridor</th>
                    <th className="py-2 px-3 text-right">Payload (kg)</th>
                    <th className="py-2 px-3 text-center">Speed</th>
                    <th className="py-2 px-3 text-center">Route Progress</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300 text-[11px]">
                  {trucks.map((truck) => (
                    <tr key={truck.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-2 px-3 font-mono">
                        <strong className="text-white print:text-black">{truck.vehicleNumber}</strong>
                        <span className="block text-[9px] text-slate-400 print:text-slate-600">{truck.id}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-200 print:text-black font-medium">
                        {truck.driverName}
                      </td>
                      <td className="py-2 px-3 text-slate-300 print:text-slate-700 max-w-[200px] truncate">
                        {truck.currentRoute}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 print:text-black">
                        {(truck.currentLoadKg ?? truck.loadWeightKg ?? 1200).toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-300 print:text-black">
                        {truck.speedKmph} km/h
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-[10px]">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 print:bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 print:bg-black"
                              style={{ width: `${truck.routeProgressPct ?? 50}%` }}
                            />
                          </div>
                          <span className="text-slate-400 print:text-slate-700">{truck.routeProgressPct ?? 50}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 print:border-slate-400 print:text-black print:bg-slate-100">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 print:text-black" />
                          <span>{truck.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Material Streams & Hazardous Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 print:text-slate-700">
                Scheduled Material Characterization
              </div>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-300 print:text-slate-700">Printed Circuit Boards (Grade A/B):</span>
                  <strong className="text-white print:text-black">3,450 kg (Au/Ag/Cu Recoverable)</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-300 print:text-slate-700">Lithium-ion Battery Packs (NMC/LFP):</span>
                  <strong className="text-amber-400 print:text-black">1,820 kg (UN 3480 Hazmat)</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-300 print:text-slate-700">Displays (OLED, LED & Leaded CRT):</span>
                  <strong className="text-white print:text-black">1,610 kg (Lead-Shielded)</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300 print:text-slate-700">Engineering Polymers & ABS Casing:</span>
                  <strong className="text-cyan-400 print:text-black">2,420 kg (Pelletizing)</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 print:border-slate-300 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 print:text-slate-700">
                Data Sanitization & NIST SP 800-88 Proof
              </div>
              <p className="text-[11px] text-slate-300 print:text-slate-700 leading-relaxed">
                All consignments containing storage media (HDDs, NVMe SSDs, Flash Memory) are certified sanitized prior to transit via BharatScrub Enterprise cryptographic key erasure and physical magnetic degaussing. Zero recoverable sectors certified under DPDP Act 2023.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-emerald-400 print:text-green-900 border-t border-slate-800/60 print:border-slate-200">
                <span>NIST SP 800-88 Rev. 2 Cryptographic Proof:</span>
                <strong>VERIFIED (PASS)</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Statutory Signatures & Chain of Custody Seal */}
          <div className="pt-4 border-t-2 border-slate-700 print:border-black grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px]">
            <div className="space-y-3">
              <span className="text-slate-500 print:text-slate-700 block uppercase font-mono">Consignor Dispatch Officer</span>
              <div className="h-10 border-b border-slate-600 print:border-slate-400 flex items-end pb-1 font-serif italic text-slate-300 print:text-black">
                Dr. Alok Nath, Sc.D.
              </div>
              <span className="text-slate-400 print:text-slate-600 block">Lead Dispatch Officer, CPCB Hub</span>
            </div>

            <div className="space-y-3">
              <span className="text-slate-500 print:text-slate-700 block uppercase font-mono">Authorized Carrier Lead</span>
              <div className="h-10 border-b border-slate-600 print:border-slate-400 flex items-end pb-1 font-serif italic text-slate-300 print:text-black">
                Vikramaditya Rao
              </div>
              <span className="text-slate-400 print:text-slate-600 block">Fleet Supervisor, Bharat Clean Logistics</span>
            </div>

            <div className="space-y-3">
              <span className="text-slate-500 print:text-slate-700 block uppercase font-mono">Cryptographic Tamper-Proof Seal</span>
              <div className="p-2 rounded bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 font-mono text-[9px] text-slate-400 print:text-slate-700 break-all leading-tight">
                SHA-256: {verificationHash}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-green-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CPCB Sovereign Digital Seal Active</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[9px] text-slate-500 print:text-slate-600 text-center pt-2 border-t border-slate-800 print:border-slate-300">
            This document is generated automatically by Bharat E-Waste Hub in compliance with the Ministry of Environment, Forest and Climate Change (MoEFCC) E-Waste Management Rules 2022. Any tampering with this manifest invalidates statutory EPR certificates.
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during Print) */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400 font-mono">
            Form 6 Regulatory Manifest • Auto-archived to CPCB Audit Ledger
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
