import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  Building,
  CheckCircle2,
  ExternalLink,
  FileText,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import { CPCB_RECYCLERS } from '../data/mockData';

interface StatutoryVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatutoryVerificationModal: React.FC<StatutoryVerificationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL');

  if (!isOpen) return null;

  const filteredRecyclers = CPCB_RECYCLERS.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.cpcbRegNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.spcbConsentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = filterState === 'ALL' || rec.state === filterState;
    return matchesSearch && matchesState;
  });

  const allStates = Array.from(new Set(CPCB_RECYCLERS.map((r) => r.state)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Statutory National Verification & Recycler Registry
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold uppercase">
                  Official CPCB / MoEFCC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cross-verify registered e-waste recyclers, state consent to operate (CTO), and statutory certificates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by CPCB Reg Number, SPCB Consent, or Recycler name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All States (National Directory)</option>
            {allStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecyclers.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/40 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {rec.name}
                      <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-400">
                      {rec.city}, {rec.state}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shrink-0">
                    {rec.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">CPCB EPR Reg:</span> {rec.cpcbRegNumber}
                  </div>
                  <div>
                    <span className="text-slate-400">SPCB Consent:</span> {rec.spcbConsentNumber}
                  </div>
                  <div>
                    <span className="text-slate-400">Valid Through:</span> {rec.validityExpiry}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-300 font-semibold">
                      {(rec.annualCapacityTonnes).toLocaleString()} MT/year
                    </span>{' '}
                    authorised
                  </div>
                  <div>
                    <span className="text-cyan-400 font-semibold">
                      {(rec.processedThisYearTonnes).toLocaleString()} MT
                    </span>{' '}
                    processed
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.specialization.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Official Verification Notice Banner */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="text-slate-200 font-semibold">
                Official National Statutory Verification Guarantee
              </p>
              <p>
                In strict compliance with the E-Waste (Management) Rules 2022 and second amendment G.S.R. 699(E) dated 12 Nov 2024, no entity may trade or scrap electronic waste without CPCB portal registration. All recycler IDs shown above are synchronized with the national registry.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-[11px]">
                <a
                  href="https://eprewastecpcb.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>CPCB EPR Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://sancharsaathi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>DoT Sanchar Saathi (CEIR)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://righttorepairindia.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>DoCA Right to Repair India</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
