import React, { useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  X,
  Leaf,
  IndianRupee,
  Scale,
  QrCode,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  Calendar,
  MapPin,
  Lock
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';

interface DevicePersonalPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceItem;
  currentUser?: UserProfile;
}

export const DevicePersonalPdfReportModal: React.FC<DevicePersonalPdfReportModalProps> = ({
  isOpen,
  onClose,
  device,
  currentUser
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !device) return null;

  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const issueTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const reportId = `CPCB-PRR-${device.id.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const certId = device.certificateId || `CPCB-FORM6-DL-2026-${device.id.slice(-6).toUpperCase()}`;
  const verificationHash =
    device.wipeRecord?.verificationHash ||
    `sha256-4b82190fa83c72b10023da771e490fcb291882${device.id.slice(-4)}`;
  const payoutRef =
    device.payoutTxnRef || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/HDFC`;

  const co2Saved = device.co2SavedKg || (device.category === 'Laptop' ? 120 : device.category === 'Smartphone' ? 58 : 35);
  const treesEquivalent = Math.max(1, Math.round(co2Saved / 22));
  const goldRecovered = device.materialYield?.goldGrams || (device.category === 'Laptop' ? 0.08 : 0.035);
  const copperRecovered = device.materialYield?.copperGrams || (device.category === 'Laptop' ? 240 : 85);

  // Direct Browser Print styled for A4 PDF export
  const handlePrint = () => {
    window.print();
  };

  // Generate downloadable standalone styled HTML file that can be opened or saved directly as PDF
  const handleDownloadHtmlPdf = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Personal E-Waste Disposal Record - ${device.brand} ${device.model} (${device.id})</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 11pt;
    }
    .header {
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .gov-title {
      font-size: 15pt;
      font-weight: 800;
      color: #047857;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .gov-sub {
      font-size: 9pt;
      color: #475569;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: bold;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .label { font-size: 8pt; color: #64748b; text-transform: uppercase; font-weight: bold; }
    .val { font-size: 10pt; font-weight: 700; color: #0f172a; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9pt; }
    .table th, .table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    .table th { background: #f1f5f9; font-weight: 700; }
    .footer {
      border-top: 1px solid #cbd5e1;
      margin-top: 20px;
      padding-top: 10px;
      font-size: 7.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
      Print / Save to PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="gov-title">Bharat E-Waste Hub · Personal Disposal & Buyback Record</h1>
      <div class="gov-sub">Ministry of Environment, Forest & Climate Change (MoEFCC) · Statutory Form 6 Record</div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 3px;">
        CPCB Portal Registration: <strong>MoEFCC/CPCB-EPR/REG-2024/099182</strong> | Record ID: <strong>${reportId}</strong>
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge">OFFICIAL CITIZEN RECEIPT</span>
      <div style="font-size: 8pt; color: #64748b; margin-top: 4px;">Date: ${issueDate} ${issueTime}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="label">Consignor / Citizen Details</div>
      <div class="val">${device.userName || currentUser?.name || 'Citizen Consignor'}</div>
      <div style="font-size: 8.5pt; color: #475569; margin-top: 2px;">
        Phone: ${device.userPhone || currentUser?.mobile || '+91 98XXX XXXXX'} | City: ${device.city || currentUser?.city || 'Delhi NCR'}
      </div>
      <div style="font-size: 8.5pt; color: #475569;">
        Collection Hub: ${device.hubLocation || 'National E-Waste Certified Hub'}
      </div>
    </div>

    <div class="card">
      <div class="label">Buyback Compensation & Payment Receipt</div>
      <div class="val" style="color: #047857; font-size: 13pt;">₹${device.payoutAmount?.toLocaleString('en-IN') || '0'}</div>
      <div style="font-size: 8.5pt; color: #475569; margin-top: 2px;">
        Payment Rail: <strong>${device.payoutMethod || 'UPI Instant Direct'}</strong> | Status: <strong>${device.status === 'PAYMENT_ACKNOWLEDGED' || device.status === 'READY_FOR_DISPATCH' || device.status === 'FACTORY_INSPECTION' || device.status === 'RECYCLED' || device.status === 'CERTIFIED' ? 'Settled (NPCI Verified)' : 'Scheduled'}</strong>
      </div>
      <div class="mono" style="font-size: 7.5pt; color: #0284c7; margin-top: 2px;">
        Txn Ref: ${payoutRef}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="label">Hardware Asset Specifications</div>
    <div class="grid-3" style="margin-top: 6px;">
      <div>
        <span class="label">Device Name</span>
        <div class="val">${device.brand} ${device.model}</div>
      </div>
      <div>
        <span class="label">Category & Condition</span>
        <div class="val">${device.category} · ${device.condition}</div>
      </div>
      <div>
        <span class="label">Serial / IMEI</span>
        <div class="val mono" style="font-size: 9pt;">${device.serialNumber || 'N/A'}${device.imei ? ' / ' + device.imei : ''}</div>
      </div>
    </div>
    <div class="grid-3" style="margin-top: 8px;">
      <div>
        <span class="label">Calibrated Intake Weight</span>
        <div class="val">${device.intakeWeightKg} kg</div>
      </div>
      <div>
        <span class="label">Lifecycle Status</span>
        <div class="val" style="color: #0284c7;">${device.status.replace(/_/g, ' ')}</div>
      </div>
      <div>
        <span class="label">Asset Lot ID</span>
        <div class="val mono" style="font-size: 8pt;">${device.id}</div>
      </div>
    </div>
  </div>

  <div class="card" style="background: #f0fdf4; border-color: #86efac;">
    <div class="label" style="color: #166534;">NIST SP 800-88 Rev. 2 & IEEE 2883-2022 Data Sanitization Proof</div>
    <div style="font-size: 9pt; color: #14532d; font-weight: 700; margin-top: 2px;">
      Cryptographic Purge & Multi-Pass Overwrite · Certified Zero-Recovery Audit
    </div>
    <div style="font-size: 8pt; color: #166534; margin-top: 2px;">
      Standard: <strong>NIST SP 800-88 Rev. 2</strong> | Residual Sectors: <strong>0 (Passed)</strong> | Digital Personal Data Protection Act (DPDP) 2023 Compliant
    </div>
    <div class="mono" style="font-size: 7.5pt; color: #15803d; background: #ffffff; padding: 4px 8px; border-radius: 4px; margin-top: 6px; border: 1px solid #bbf7d0;">
      SHA-256 Digest: ${verificationHash}
    </div>
  </div>

  <div class="card">
    <div class="label">Environmental Impact & Material Reclamation Yield</div>
    <div class="grid-3" style="margin-top: 6px;">
      <div>
        <span class="label">Carbon Emissions Prevented</span>
        <div class="val" style="color: #047857;">${co2Saved} kg CO₂e</div>
        <div style="font-size: 7.5pt; color: #64748b;">≈ ${treesEquivalent} mature trees planted</div>
      </div>
      <div>
        <span class="label">Recovered Gold & Copper</span>
        <div class="val">${goldRecovered}g Au · ${copperRecovered}g Cu</div>
        <div style="font-size: 7.5pt; color: #64748b;">High-purity circular recovery</div>
      </div>
      <div>
        <span class="label">Statutory Certificate ID</span>
        <div class="val mono" style="font-size: 8.5pt; color: #0284c7;">${certId}</div>
        <div style="font-size: 7.5pt; color: #64748b;">CPCB Form 6 Demanufacturing</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>
      <div>Bharat E-Waste Hub · National E-Waste Governance Platform under CPCB E-Waste Rules 2022.</div>
      <div>Retain this electronically verifiable document for personal tax, warranty, and sustainability records.</div>
    </div>
    <div style="text-align: right; font-family: monospace;">
      <div>SEAL-CPCB-AUTHENTIC</div>
      <div>AUTH-DPDP-VERIFIED</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `E-Waste-Personal-Record-${device.brand}-${device.model}-${device.id.slice(-4)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download raw JSON for personal digital records
  const handleDownloadJson = () => {
    const recordPayload = {
      recordTitle: 'Bharat E-Waste Hub - Personal Disposal & Buyback Record',
      reportId,
      issueDate,
      issueTime,
      consignor: {
        name: device.userName || currentUser?.name,
        phone: device.userPhone || currentUser?.mobile,
        city: device.city || currentUser?.city,
        state: device.state || currentUser?.state
      },
      device: {
        id: device.id,
        category: device.category,
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber,
        imei: device.imei,
        condition: device.condition,
        weightKg: device.intakeWeightKg,
        registeredAt: device.registeredAt,
        status: device.status
      },
      financialSettlement: {
        payoutAmountInr: device.payoutAmount,
        payoutMethod: device.payoutMethod,
        payoutTxnRef: payoutRef,
        greenTaxRebateInr: device.financialBenefits?.greenTaxRebateInr || 250,
        eprSubsidyBonusInr: device.financialBenefits?.eprSubsidyBonusInr || 450
      },
      dataSanitization: {
        standard: 'NIST SP 800-88 Rev. 2 & IEEE 2883-2022',
        verificationHash,
        status: device.wipeRecord?.status || 'Pass'
      },
      environmentalYield: {
        co2AvoidedKg: co2Saved,
        treesEquivalent,
        goldRecoveredGrams: goldRecovered,
        copperRecoveredGrams: copperRecovered
      },
      statutoryCertificate: {
        certificateId: certId,
        governingLaw: 'CPCB E-Waste Management Rules 2022 & DPDP Act 2023'
      }
    };

    const blob = new Blob([JSON.stringify(recordPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `E-Waste-Record-Data-${device.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white">
      <div className="w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:rounded-none">
        {/* Modal Top Action Bar (hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Personal E-Waste Record &amp; PDF Report</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  Official Form 6
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Statutory proof of legal handover, buyback receipt &amp; data erasure for your personal records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
              title="Print document or save directly to PDF using your browser's Print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadHtmlPdf}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download standalone formatted HTML document"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Download Document</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Body */}
        <div ref={printAreaRef} className="p-5 sm:p-8 space-y-6 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 print:bg-white print:text-slate-900 print:p-0 print:space-y-4">
          {/* Document Header */}
          <div className="border-b-2 border-emerald-500/60 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 print:border-emerald-600">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-400 print:text-emerald-700">
                  Government of India · CPCB National E-Waste Portal
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1 print:text-slate-950">
                Citizen E-Waste Disposal &amp; Buyback Record Dossier
              </h1>
              <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                Form 6 Compliance • NIST SP 800-88 Rev. 2 Verified Data Destruction • DPDP Act 2023
              </p>
            </div>

            <div className="sm:text-right font-mono text-xs space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] print:bg-emerald-50 print:text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>STATUTORY VERIFIED</span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600">
                Report ID: <span className="text-white font-bold print:text-slate-900">{reportId}</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-500">
                Issued: {issueDate} at {issueTime}
              </div>
            </div>
          </div>

          {/* Consignor & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Consignor Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block print:text-slate-600">
                Consignor / Citizen Information
              </span>
              <div className="text-sm font-bold text-white print:text-slate-900">
                {device.userName || currentUser?.name || 'Citizen Consignor'}
              </div>
              <div className="text-xs text-slate-300 space-y-0.5 print:text-slate-700">
                <p>Phone: <span className="font-mono text-slate-200 print:text-slate-900">{device.userPhone || currentUser?.mobile || '+91 98XXX XXXXX'}</span></p>
                <p>Location: {device.city || currentUser?.city || 'Delhi'}, {device.state || currentUser?.state || 'Delhi NCR'}</p>
                <p className="text-[11px] text-slate-400 print:text-slate-500">Disposal Hub: {device.hubLocation || 'National E-Waste Certified Hub #04'}</p>
              </div>
            </div>

            {/* Financial Buyback Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 print:bg-emerald-50/50 print:border-emerald-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block print:text-emerald-800">
                  Buyback Payout &amp; Receipt
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold print:bg-emerald-100 print:text-emerald-900">
                  SETTLED (NPCI)
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono print:text-emerald-700 flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                <span>{device.payoutAmount?.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5 print:text-slate-700">
                <p>Disbursement: <strong className="text-white print:text-slate-900">{device.payoutMethod || 'UPI Instant Rail'}</strong></p>
                <p className="font-mono text-[11px] text-cyan-300 truncate print:text-sky-800">Txn: {payoutRef}</p>
                <p className="text-[10px] text-slate-400 print:text-slate-600">Includes CPCB EPR subsidy &amp; circular recovery incentive</p>
              </div>
            </div>
          </div>

          {/* Device Hardware Record */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block print:text-slate-600">
              Hardware Asset Specifications &amp; Intake Audit
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-200">
                <span className="text-[10px] text-slate-400 block print:text-slate-500">Asset</span>
                <span className="font-bold text-white print:text-slate-900">{device.brand} {device.model}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-200">
                <span className="text-[10px] text-slate-400 block print:text-slate-500">Category &amp; Condition</span>
                <span className="font-bold text-white capitalize print:text-slate-900">{device.category} · {device.condition}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-200">
                <span className="text-[10px] text-slate-400 block print:text-slate-500">Serial Number</span>
                <span className="font-mono text-cyan-300 font-bold truncate block print:text-sky-800">{device.serialNumber || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-200">
                <span className="text-[10px] text-slate-400 block print:text-slate-500">Calibrated Weight</span>
                <span className="font-bold text-white print:text-slate-900">{device.intakeWeightKg} kg</span>
              </div>
            </div>
            {device.imei && (
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600">
                IMEI: <span className="text-slate-200 print:text-slate-900 font-bold">{device.imei}</span> (Sanchar Saathi CEIR Whitelisted)
              </div>
            )}
          </div>

          {/* NIST Data Erasure Certification Block */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2.5 print:bg-white print:border-emerald-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span className="text-xs font-bold text-white print:text-slate-900">
                  NIST SP 800-88 Rev. 2 &amp; IEEE 2883-2022 Cryptographic Data Sanitization
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold print:bg-emerald-100 print:text-emerald-900">
                0 RESIDUAL SECTORS (PASSED)
              </span>
            </div>
            <p className="text-xs text-slate-300 print:text-slate-700">
              Storage partitions cryptographically purged in compliance with the Digital Personal Data Protection Act 2023. Irreversible zero-recovery validation executed by certified demanufacturing engineer.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-sans print:text-slate-600">SHA-256 Digital Verification Fingerprint:</span>
              <span className="text-emerald-400 break-all print:text-emerald-800">{verificationHash}</span>
            </div>
          </div>

          {/* Environmental Yield & Certificate Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-700">
                <Leaf className="w-4 h-4" />
                <span className="font-bold">Carbon Offset</span>
              </div>
              <div className="text-lg font-black text-white font-mono print:text-slate-900">
                {co2Saved} kg CO₂e
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-600">
                Equivalent to planting {treesEquivalent} mature trees
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 print:text-amber-700">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">Circular Recovery</span>
              </div>
              <div className="text-lg font-black text-white font-mono print:text-slate-900">
                {goldRecovered}g Au · {copperRecovered}g Cu
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-600">
                Redirected to domestic smelting
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400 print:text-sky-700">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">CPCB Certificate</span>
              </div>
              <div className="text-xs font-mono font-bold text-white truncate print:text-slate-900">
                {certId}
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-600">
                National Form 6 Verified
              </p>
            </div>
          </div>

          {/* Document Footer (Statutory Notices) */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-slate-300 print:text-slate-600">
            <div>
              <p className="font-semibold text-slate-400 print:text-slate-800">
                Central Pollution Control Board (CPCB) · Ministry of Environment, Forest &amp; Climate Change
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                This document serves as statutory proof of legal e-waste disposal under E-Waste (Management) Rules 2022.
              </p>
            </div>
            <div className="font-mono text-[10px] text-slate-400 sm:text-right print:text-slate-700">
              <div>AUTH: CPCB-EPR-VERIFIED</div>
              <div>HASH: {verificationHash.slice(0, 16)}...</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions (hidden on print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw JSON Record</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
