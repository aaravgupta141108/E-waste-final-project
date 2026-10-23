import React, { useState } from 'react';
import {
  ShieldAlert,
  Settings,
  Scale,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Database,
  RefreshCw,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { DeviceItem, UserProfile } from '../types';
import { NATIONAL_STATS, RATE_TABLE } from '../data/mockData';

interface AdminMasterConsoleViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onResolveFlag: (deviceId: string, adminNote: string) => void;
}

export const AdminMasterConsoleView: React.FC<AdminMasterConsoleViewProps> = ({
  currentUser,
  devices,
  onResolveFlag
}) => {
  const [weightThresholdPct, setWeightThresholdPct] = useState('10');
  const [weightThresholdGrams, setWeightThresholdGrams] = useState('100');
  const [dailyPayoutCap, setDailyPayoutCap] = useState('50000');
  const [storageAlertDays, setStorageAlertDays] = useState('150');
  const [selectedFlaggedId, setSelectedFlaggedId] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const flaggedDevices = devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConfirmResolve = (deviceId: string) => {
    if (!resolutionNote.trim()) {
      alert('Statutory Rule: You must enter an administrative resolution note.');
      return;
    }
    onResolveFlag(deviceId, resolutionNote);
    setSelectedFlaggedId('');
    setResolutionNote('');
    alert('Discrepancy resolved by Master Admin. Device returned to processing line.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-red-950/60 border border-rose-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Administration • MoEFCC Apex Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            National E-Waste Hub Executive Command Console
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Full authority over statutory weight discrepancy thresholds, regional payout caps, DPDP data retention parameters, and administrative resolution of flagged batches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Database Status:</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYNCHRONIZED (INDIA-CENTRAL)
          </span>
        </div>
      </div>

      {/* Two-Column Grid: Settings & Discrepancy Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Statutory Parameters & Thresholds */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">System Governance Thresholds</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">SECTION 15 EPA ENFORCED</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Weight Discrepancy Tolerance (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightThresholdPct}
                    onChange={(e) => setWeightThresholdPct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum Weight Floor (g)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightThresholdGrams}
                    onChange={(e) => setWeightThresholdGrams(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">grams</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Citizen Daily Payout Cap (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={dailyPayoutCap}
                    onChange={(e) => setDailyPayoutCap(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">₹/day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Statutory Storage Warning (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={storageAlertDays}
                    onChange={(e) => setStorageAlertDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">days</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Per E-Waste Rules 2022, storage exceeding 180 days attracts environmental compensation penalties unless approved for specific recycling campaigns.
            </p>

            <div className="flex items-center justify-between pt-2">
              {isSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Parameters synchronized to national cluster</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Governance Parameters</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Discrepancy Flag Resolution Queue */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Discrepancy Resolution Queue</h3>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              {flaggedDevices.length} Open Cases
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {flaggedDevices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No active flags or holds. All batches validated.
              </p>
            ) : (
              flaggedDevices.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {d.id} • {d.brand} {d.model}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold font-mono">
                      {d.status}
                    </span>
                  </div>

                  <p className="text-slate-300">{d.flagReason || d.holdReason}</p>
                  <p className="text-[10px] text-slate-500">
                    Registered by {d.userName} ({d.userPhone}) at {d.hubLocation}
                  </p>

                  {selectedFlaggedId === d.id ? (
                    <div className="pt-2 space-y-2 border-t border-slate-800">
                      <label className="block text-[11px] text-slate-300 font-semibold">
                        Enter Administrative Resolution Note:
                      </label>
                      <input
                        type="text"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="e.g. Verified by visual inspect; discrepancy within acceptable transit loss. Approved."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedFlaggedId('')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmResolve(d.id)}
                          className="px-3 py-1 rounded bg-emerald-600 text-[11px] font-bold text-white"
                        >
                          Approve & Unblock
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedFlaggedId(d.id)}
                      className="text-[11px] text-amber-400 hover:underline pt-1 block"
                    >
                      Resolve this case with Administrative Sign-off →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
