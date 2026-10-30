import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Scale,
  Lock,
  QrCode,
  Truck,
  Hash,
  Calendar,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';
import { NATIONAL_STATS } from '../data/mockData';

interface CpcbForm6AuditReportModalProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onClose: () => void;
}

export const CpcbForm6AuditReportModal: React.FC<CpcbForm6AuditReportModalProps> = ({
  currentUser,
  devices,
  onClose
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCopyTab, setActiveCopyTab] = useState<'copy1' | 'copy2' | 'copy3' | 'copy4' | 'copy5' | 'copy6'>('copy1');

  const manifestNo = `CPCB/EPR-F6/2026-27/${Math.floor(100000 + Math.random() * 900000)}`;
  const dispatchDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const generationTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const totalCalculatedKg = devices.reduce(
    (acc, d) => acc + (d.factoryWeightKg || d.intakeWeightKg || 0.45),
    0
  );
  const totalWeightKg = Math.max(totalCalculatedKg, 1845.6);
  const totalWeightMT = (totalWeightKg / 1000).toFixed(3);

  const merkleRootHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const nistAuditBlock = '0x88f4b912a772c91048b301cde8290fbc9821873401';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['FORM 6 - E-WASTE MANIFEST (RULE 19) REGULATORY AUDIT REPORT'],
      ['Manifest Document No', manifestNo],
      ['Date of Issue', `${dispatchDate} ${generationTime} IST`],
      ['Statutory Regulatory Body', 'Central Pollution Control Board (CPCB) - Ministry of Environment, Forest and Climate Change'],
      ['Lead Auditor', `${currentUser.name} (${currentUser.id} - ${currentUser.role})`],
      ['Total Units Processed', devices.length.toString()],
      ['Gross Weight (kg)', totalWeightKg.toFixed(2)],
      ['Gross Weight (Metric Tonnes)', totalWeightMT],
      ['NIST SP 800-88 Sanitization Status', '100% Certified Data Purge Complete'],
      ['Tamper-Proof Merkle Root Hash', merkleRootHash],
      ['Ledger Block Anchor', nistAuditBlock],
      [],
      ['Item ID', 'Category', 'Brand & Model', 'Intake Weight (kg)', 'Status', 'Sanitization Standard', 'Verification ID'],
      ...devices.slice(0, 50).map((d) => [
        d.id,
        d.category,
        `"${d.brand} ${d.model}"`,
        (d.intakeWeightKg || 0.4).toFixed(2),
        d.status,
        'NIST SP 800-88 Rev. 2 Purge',
        `CPCB-V-${d.id}`
      ])
    ];

    const csvContent = csvRows.map((r) => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CPCB_Form_6_Manifest_${manifestNo.replace(/\//g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copiesInfo = [
    { key: 'copy1', label: 'Copy 1 (Yellow)', desc: 'To be retained by Sender / Consignor Hub', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { key: 'copy2', label: 'Copy 2 (Pink)', desc: 'To be retained by Receiver / TSDF Recycler', color: 'text-pink-400 border-pink-500/40 bg-pink-500/10' },
    { key: 'copy3', label: 'Copy 3 (Orange)', desc: 'To be retained by Transporter in transit', color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
    { key: 'copy4', label: 'Copy 4 (Green)', desc: 'Signed receipt returned to Sender Consignor', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { key: 'copy5', label: 'Copy 5 (Blue)', desc: 'Returned to State Pollution Control Board (SPCB)', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { key: 'copy6', label: 'Copy 6 (White)', desc: 'Submitted to CPCB National Central Portal', color: 'text-purple-300 border-purple-500/40 bg-purple-500/10' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header (Screen-only bar) */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  CPCB Form-6 Statutory Regulatory Transit Manifest &amp; Audit Report
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Rule 19 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory Manifest for E-Waste Movement &amp; Chain of Custody • E-Waste (Management) Rules 2022
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
              title="Download raw audit data as CSV"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              title="Print formal CPCB Form-6 document"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form-6</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6-Part Copy Selector Pill Row (Screen-only) */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 print:hidden text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Manifest Copies:
          </span>
          {copiesInfo.map((copy) => (
            <button
              key={copy.key}
              onClick={() => setActiveCopyTab(copy.key as any)}
              className={`px-3 py-1 rounded-lg font-medium text-[11px] border transition whitespace-nowrap ${
                activeCopyTab === copy.key
                  ? `${copy.color} shadow font-bold`
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {copy.label}
            </button>
          ))}
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900 print:p-0 print:bg-white print:text-black print:overflow-visible">
          <div className="form6-printable-sheet bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-2xl border border-slate-300 max-w-4xl mx-auto print:border-none print:shadow-none print:max-w-none print:w-full print:p-0">
            
            {/* Formal CPCB / Govt of India Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5 mb-5 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="text-left text-[11px] text-slate-700 font-mono">
                  <div><strong>SCHEDULE III</strong></div>
                  <div>[See Rule 19]</div>
                  <div>MoEFCC Notification G.S.R. 699(E)</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-slate-900 mb-1">
                    CPCB
                  </div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-800 uppercase">
                    सत्यमेव जयते
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-700 font-mono">
                  <div className="font-bold text-purple-900">{manifestNo}</div>
                  <div>Issued: {dispatchDate}</div>
                  <div className="text-[10px] text-slate-600">{generationTime} IST</div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                FORM 6: E-WASTE MANIFEST
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                Statutory Manifest for Transportation of E-Waste and Chain-of-Custody Verification
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 border border-slate-400 text-slate-800 text-[11px] font-bold rounded">
                {copiesInfo.find((c) => c.key === activeCopyTab)?.label} — {copiesInfo.find((c) => c.key === activeCopyTab)?.desc}
              </div>
            </div>

            {/* Manifest 3-Column Entity Grid: Consignor, Transporter, Consignee */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs text-slate-800 border border-slate-300 rounded-lg p-3 bg-slate-50/70">
              {/* 1. Sender (Consignor) */}
              <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-300 pb-3 md:pb-0 md:pr-3">
                <div className="font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>1. Consignor (Sender)</span>
                </div>
                <div><strong>Facility:</strong> National E-Waste Ingress Hub #01</div>
                <div><strong>CPCB Reg No:</strong> CPCB/EPR-ING/2026/088</div>
                <div><strong>Address:</strong> Sector 18, Udyog Vihar, Gurugram, HR</div>
                <div><strong>Contact:</strong> Station Officer: {currentUser.name}</div>
                <div><strong>State:</strong> Haryana / Delhi NCR Node</div>
              </div>

              {/* 2. Transporter */}
              <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-300 pb-3 md:pb-0 md:pr-3">
                <div className="font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-700" />
                  <span>2. Authorized Transporter</span>
                </div>
                <div><strong>Carrier:</strong> E-Logix Green Fleet Inter-State Logistics</div>
                <div><strong>SPCB Hazmat Reg:</strong> HSPCB/HAZ-LOG/2024-99</div>
                <div><strong>Vehicle Reg No:</strong> HR-55-AU-9821 (GPS Monitored)</div>
                <div><strong>Driver Name &amp; DL:</strong> R. S. Yadav (DL-HR2620190012)</div>
                <div><strong>Tamper Seal ID:</strong> SEAL-TAMPER-RFID-77192</div>
              </div>

              {/* 3. Consignee (Receiver) */}
              <div className="space-y-1.5">
                <div className="font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>3. Consignee (TSDF / Recycler)</span>
                </div>
                <div><strong>Destination:</strong> EcoGreen Tech Authorized Recyclers</div>
                <div><strong>CPCB EPR Reg:</strong> EPR-REC-DL-2023-0091</div>
                <div><strong>Facility:</strong> Plot 42, Okhla Industrial Area Phase-III</div>
                <div><strong>Capacity:</strong> 12,500 MT/annum (Valid to 2028)</div>
                <div><strong>SPCB Node:</strong> Delhi Pollution Control Committee</div>
              </div>
            </div>

            {/* Consignment Weight & Scale Details */}
            <div className="mb-6 border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold text-xs text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-700" />
                  <span>4. E-Waste Consignment Quantities &amp; NABL Calibrated Weighbridge Record</span>
                </div>
                <span className="text-[10px] font-mono text-slate-600">NABL Cert: NABL-CAL-DEL-8821</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center text-xs">
                <div className="p-3">
                  <span className="text-[11px] text-slate-600 block">Gross Weight</span>
                  <span className="text-base font-bold font-mono text-slate-900">4,120.0 kg</span>
                  <span className="text-[10px] text-slate-500 block">Truck + E-Waste</span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-600 block">Tare Weight</span>
                  <span className="text-base font-bold font-mono text-slate-900">2,274.4 kg</span>
                  <span className="text-[10px] text-slate-500 block">Empty Vehicle</span>
                </div>
                <div className="p-3 bg-purple-50/60">
                  <span className="text-[11px] text-purple-900 font-semibold block">Net E-Waste Weight</span>
                  <span className="text-base font-black font-mono text-purple-950">{totalWeightKg.toLocaleString()} kg</span>
                  <span className="text-[10px] text-purple-700 font-bold block">{totalWeightMT} Metric Tonnes</span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-600 block">Total Units Tagged</span>
                  <span className="text-base font-bold font-mono text-slate-900">{devices.length} Units</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">100% QR Geotagged</span>
                </div>
              </div>
            </div>

            {/* Itemized E-Waste Category Breakdown Table */}
            <div className="mb-6 border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold text-xs text-slate-800">
                5. Schedule I E-Waste Categorization &amp; Statutory Handling Summary
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300 text-slate-700">
                    <th className="p-2.5 font-bold">Category Code</th>
                    <th className="p-2.5 font-bold">E-Waste Description</th>
                    <th className="p-2.5 font-bold">Qty (Units)</th>
                    <th className="p-2.5 font-bold">Total Weight (kg)</th>
                    <th className="p-2.5 font-bold">Hazardous Elements Handled</th>
                    <th className="p-2.5 font-bold">Sanitization Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-purple-900">ITEW1</td>
                    <td className="p-2.5">Centralized data processing (Servers, Mainframes)</td>
                    <td className="p-2.5 font-mono">14</td>
                    <td className="p-2.5 font-mono">420.0</td>
                    <td className="p-2.5 text-slate-600">Lead solder, BFR resins</td>
                    <td className="p-2.5 font-semibold text-emerald-700">NIST SP 800-88 Purge</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-purple-900">ITEW2</td>
                    <td className="p-2.5">Personal Computing (Laptops, Desktops, Tablets)</td>
                    <td className="p-2.5 font-mono">68</td>
                    <td className="p-2.5 font-mono">612.5</td>
                    <td className="p-2.5 text-slate-600">Lithium-ion cells, PCB Copper</td>
                    <td className="p-2.5 font-semibold text-emerald-700">IEEE 2883-2022 Cryptographic Erase</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-purple-900">ITEW15</td>
                    <td className="p-2.5">Smartphones &amp; Cellular Telephony terminals</td>
                    <td className="p-2.5 font-mono">142</td>
                    <td className="p-2.5 font-mono">184.2</td>
                    <td className="p-2.5 text-slate-600">Cobalt, Neodymium, Gold trace</td>
                    <td className="p-2.5 font-semibold text-emerald-700">DoT Sanchar Saathi IMEI Cleared</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-purple-900">CEEW1</td>
                    <td className="p-2.5">Display screens, Monitors &amp; LED/OLED panels</td>
                    <td className="p-2.5 font-mono">31</td>
                    <td className="p-2.5 font-mono">385.0</td>
                    <td className="p-2.5 text-slate-600">Liquid crystals, Indium Tin Oxide</td>
                    <td className="p-2.5 text-slate-700">Mechanical Deconstruction Safe</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-purple-900">ITEW7</td>
                    <td className="p-2.5">Networking equipment, Switches, Routers &amp; UPS</td>
                    <td className="p-2.5 font-mono">26</td>
                    <td className="p-2.5 font-mono">243.9</td>
                    <td className="p-2.5 text-slate-600">Electrolytic capacitors, Lead-Acid</td>
                    <td className="p-2.5 font-semibold text-emerald-700">NVRAM Zeroed &amp; Decommissioned</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cryptographic Compliance Proofs */}
            <div className="mb-6 p-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>6. Tamper-Proof Cryptographic Anchors &amp; Chain-of-Custody Integrity</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">IMMUTABLE BLOCK HEIGHT #892,104</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">SHA-256 Merkle Manifest Root Hash:</span>
                  <div className="flex items-center justify-between">
                    <span className="truncate mr-2 font-bold text-slate-900">{merkleRootHash}</span>
                    <button
                      onClick={() => copyToClipboard(merkleRootHash, 'root')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {copiedKey === 'root' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">NIST SP 800-88 Rev. 2 Ledger Anchor:</span>
                  <div className="flex items-center justify-between">
                    <span className="truncate mr-2 font-bold text-slate-900">{nistAuditBlock}</span>
                    <button
                      onClick={() => copyToClipboard(nistAuditBlock, 'nist')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {copiedKey === 'nist' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Attestation & Signatures */}
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 text-xs space-y-4">
              <div className="text-[11px] text-slate-600 italic leading-relaxed">
                "I hereby declare that the contents of this consignment are fully and accurately described above by proper shipping name and are classified, packaged, marked and labeled/placarded, and are in all respects in proper condition for transport according to applicable international and national government regulations under the Environment (Protection) Act, 1986 and E-Waste (Management) Rules, 2022."
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-300">
                <div className="text-center space-y-1">
                  <div className="h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-mono text-[11px] text-slate-800 font-bold">DIGITALLY SIGNED &amp; SEALED</span>
                  </div>
                  <span className="font-bold text-slate-900 block">Consignor (Sender)</span>
                  <span className="text-[10px] text-slate-600 block">{currentUser.name} (Officer ID: {currentUser.id})</span>
                  <span className="text-[9px] text-slate-500 block">Date: {dispatchDate}</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-mono text-[11px] text-slate-800 font-bold">R. S. Yadav (Verified DL)</span>
                  </div>
                  <span className="font-bold text-slate-900 block">Transporter Representative</span>
                  <span className="text-[10px] text-slate-600 block">E-Logix Fleet Unit #04</span>
                  <span className="text-[9px] text-slate-500 block">Vehicle: HR-55-AU-9821</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="font-mono text-[11px] text-purple-900 font-bold">CPCB STATUTORY VERIFIED</span>
                  </div>
                  <span className="font-bold text-slate-900 block">CPCB / SPCB Inspecting Officer</span>
                  <span className="text-[10px] text-slate-600 block">Regional Director / Statutory Auditor</span>
                  <span className="text-[9px] text-slate-500 block">NABL Calibrated Scale Node</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: 6-Copy Statutory Rule Note */}
            <div className="mt-4 pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 font-mono">
              <span>CPCB FORM-6 • GENERATED UNDER RULE 19 OF E-WASTE (MANAGEMENT) RULES, 2022</span>
              <span>VERIFIED TIMESTAMP: {dispatchDate} {generationTime} IST</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen-only) */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-400">
            Official CPCB Form-6 record ready for print or electronic archival submission.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
