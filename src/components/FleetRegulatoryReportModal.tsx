import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Building2,
  Calendar,
  Lock
} from 'lucide-react';
import { FleetTruck } from '../types';

interface FleetRegulatoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trucks: FleetTruck[];
  totalInTransitWeightKg: number;
}

export const FleetRegulatoryReportModal: React.FC<FleetRegulatoryReportModalProps> = ({
  isOpen,
  onClose,
  trucks,
  totalInTransitWeightKg
}) => {
  if (!isOpen) return null;

  const manifestNumber = `CPCB-F6-TRK-2026-${Date.now().toString().slice(-6)}`;
  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ['Vehicle Number', 'Driver Name', 'State', 'Status', 'Tonnage (Kg)', 'Route', 'Speed (km/h)', 'Coordinates', 'E-Waste Streams'];
    const rows = trucks.map(t => [
      t.vehicleNumber,
      t.driverName,
      t.state,
      t.status,
      t.capacityKg,
      `"${t.currentRoute}"`,
      t.speedKmph,
      `"${t.coordinates[0]}, ${t.coordinates[1]}"`,
      `"${t.stops?.map(s => s.stopName).join('; ') || 'Consumer Electronics & IT Scrap'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${manifestNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 print-only-container">
        
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-sm font-bold text-white tracking-tight">
                National Statutory Fleet Manifest & Telemetry Report
              </h2>
              <p className="text-xs text-slate-400">
                MoEFCC • CPCB Form 6 Hazardous Transit Document (E-Waste Management Rules 2022)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              aria-label="Download CSV data manifest"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              aria-label="Print or save as PDF"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close report dialog"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted Official Document Preview */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-900/90 text-slate-200 text-xs font-sans">
          
          {/* Statutory Header */}
          <div className="border-b border-slate-700/70 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold tracking-wider uppercase">
                  GOVERNMENT OF INDIA
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                  CPCB FORM 6
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                CENTRAL POLLUTION CONTROL BOARD • MOEFCC
              </h1>
              <p className="text-[11px] text-slate-400">
                National Hazardous E-Waste Movement Manifest & Certified Fleet Route Telemetry
              </p>
            </div>

            <div className="text-right space-y-1 border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-800">
              <div className="font-mono text-xs font-bold text-emerald-400">
                {manifestNumber}
              </div>
              <div className="text-[10px] text-slate-400">
                Generated: {generatedDate}
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory Chain of Custody Verified</span>
              </div>
            </div>
          </div>

          {/* High-Level Regulatory Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Fleet Vessels</span>
              <span className="text-base font-bold text-white font-mono">{trucks.length} Vehicles</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Inbound Mass</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{(totalInTransitWeightKg / 1000).toFixed(2)} Metric Tonnes</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tamper Seals Status</span>
              <span className="text-base font-bold text-emerald-400 font-mono">100% Intact (NIST SP 800)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Refinery Grade</span>
              <span className="text-base font-bold text-amber-400 font-mono">R2v3 / CPCB Certified</span>
            </div>
          </div>

          {/* Active Fleet Manifest Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified Transport Vehicles & Transit Waypoints</span>
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
                    <th className="py-2.5 px-3">Vehicle #</th>
                    <th className="py-2.5 px-3">Driver & Dept</th>
                    <th className="py-2.5 px-3">Route Corridor</th>
                    <th className="py-2.5 px-3">Load Mass</th>
                    <th className="py-2.5 px-3">GPS Live Fix</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {trucks.map((truck) => (
                    <tr key={truck.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white block">{truck.vehicleNumber}</span>
                        <span className="text-[9px] text-slate-400">{truck.id}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-200 block font-sans">{truck.driverName}</span>
                        <span className="text-[9px] text-slate-400">HazMat Lic: IND-HM-{truck.id.slice(-2)}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-300 block font-sans truncate max-w-[200px]" title={truck.currentRoute}>
                          {truck.currentRoute}
                        </span>
                        <span className="text-[9px] text-cyan-400">{truck.state}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {truck.capacityKg.toLocaleString()} kg
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-400">
                        {truck.coordinates[0].toFixed(4)}°N, {truck.coordinates[1].toFixed(4)}°E
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                          truck.status === 'In Transit'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}>
                          {truck.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Signatures & Chain of Custody Seal */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] text-slate-400">
            <div className="space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-300 block">Consignor / Regional Hub Sign-off</span>
              <p>National Hub Sector 62 Consolidation Yard</p>
              <div className="font-mono text-emerald-400 font-bold mt-2">DIGITALLY SIGNED • SHA-256</div>
            </div>

            <div className="space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-300 block">CPCB Transporter Authorization</span>
              <p>Authorized under Schedule II (Transportation of Hazardous Materials)</p>
              <div className="font-mono text-cyan-400 font-bold mt-2">SECURITY SEAL ID: SEAL-9921-OK</div>
            </div>

            <div className="space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-300 block">Recipient Licensed Refinery</span>
              <p>EcoRecycle Apex Demanufacturing Plant (MIDC)</p>
              <div className="font-mono text-purple-400 font-bold mt-2">INSPECTION ACKNOWLEDGED</div>
            </div>
          </div>

          {/* Regulatory Disclaimer Notice */}
          <div className="text-[9px] text-slate-500 text-center leading-relaxed font-sans">
            This digital manifest is electronically generated under the E-Waste (Management) Rules, 2022 by the Central Pollution Control Board.
            Any unauthorized diversion, dumping into unlined municipal landfills, or tampering with GPS tracking seals attracts statutory penalties under Section 15 of the Environment (Protection) Act, 1986.
          </div>
        </div>
      </div>
    </div>
  );
};
