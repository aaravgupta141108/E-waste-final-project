import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  CheckCircle2,
  Building2,
  ShieldAlert,
  Calendar,
  Radio,
  Mail,
  Smartphone,
  Check,
  AlertTriangle
} from 'lucide-react';
import { INDIA_GEO_HUBS } from './NationalHubRiskMap';

interface BulkNotifyHubsModalProps {
  onClose: () => void;
  onBroadcastComplete?: (count: number, topic: string) => void;
}

export const BulkNotifyHubsModal: React.FC<BulkNotifyHubsModalProps> = ({
  onClose,
  onBroadcastComplete
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    'Impending Statutory Q3 Form 3 Quarterly Return (Due in 14 Days)'
  );
  const [urgency, setUrgency] = useState<'CRITICAL' | 'STATUTORY_MANDATE' | 'ROUTINE'>('STATUTORY_MANDATE');
  const [customDirective, setCustomDirective] = useState(
    'All state-authorized consolidation hubs and registered TSDF facilities must finalize Q3 intake logs, NABL weighbridge calibration certs, and complete NIST SP 800-88 cryptographic erase records before the statutory ceiling date.'
  );
  const [selectedHubs, setSelectedHubs] = useState<string[]>(INDIA_GEO_HUBS.map((h) => h.code));
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const toggleHub = (code: string) => {
    setSelectedHubs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    setSelectedHubs(INDIA_GEO_HUBS.map((h) => h.code));
  };

  const handleDeselectAll = () => {
    setSelectedHubs([]);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHubs.length === 0) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      if (onBroadcastComplete) {
        onBroadcastComplete(selectedHubs.length, selectedTopic);
      }
      setTimeout(() => {
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Bulk Notify Regional Hubs &amp; Transporters
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  CPCB Broadcast Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispatch official regulatory directives and statutory deadline alerts to state-registered hubs simultaneously.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {broadcastSuccess ? (
            <div className="p-8 text-center bg-emerald-950/40 border border-emerald-500/60 rounded-2xl space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Broadcast Successfully Delivered!</h4>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                Statutory directive transmitted to <strong>{selectedHubs.length} regional hubs</strong> across CPCB Teletype, Push Notifications, and Encrypted Department Dispatch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4">
              {/* Topic Preset Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Statutory Notification Mandate *
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    if (e.target.value.includes('Form 3')) {
                      setUrgency('STATUTORY_MANDATE');
                      setCustomDirective(
                        'All state-authorized consolidation hubs and registered TSDF facilities must finalize Q3 intake logs, NABL weighbridge calibration certs, and complete NIST SP 800-88 cryptographic erase records before the statutory ceiling date.'
                      );
                    } else if (e.target.value.includes('Weighbridge')) {
                      setUrgency('CRITICAL');
                      setCustomDirective(
                        'Mandatory secondary weighbridge calibration check required within 48 hours. Any tare variances exceeding ±0.5% will result in automated consignment hold under CPCB Rule 13.'
                      );
                    } else {
                      setUrgency('CRITICAL');
                      setCustomDirective(
                        'Immediate audit inspection alert. Station engineers must resolve all open quarantine flags and upload certified serial inspection logs without delay.'
                      );
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Impending Statutory Q3 Form 3 Quarterly Return (Due in 14 Days)">
                    Impending Statutory Q3 Form 3 Quarterly Return (Due in 14 Days)
                  </option>
                  <option value="Urgent Weighbridge Calibration & Scale Verification Directive">
                    Urgent Weighbridge Calibration &amp; Scale Verification Directive
                  </option>
                  <option value="Quarantine Queue Discrepancy Escalation & Remediation Notice">
                    Quarantine Queue Discrepancy Escalation &amp; Remediation Notice
                  </option>
                </select>
              </div>

              {/* Urgency & Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency Priority *</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Immediate Action Required)</option>
                    <option value="STATUTORY_MANDATE">🟡 STATUTORY MANDATE (Legal Deadline)</option>
                    <option value="ROUTINE">🟢 ROUTINE (Compliance Advisory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dispatch Channels</label>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-purple-400" /> SPCB Teletype</span>
                    <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Mobile Push</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-400" /> CPCB Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Directive Text */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Directive Body *
                </label>
                <textarea
                  rows={3}
                  value={customDirective}
                  onChange={(e) => setCustomDirective(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Hub Recipients Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    Target State Ingress Hubs ({selectedHubs.length} Selected)
                  </label>
                  <div className="space-x-2 text-[10px]">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-purple-400 hover:text-purple-300 font-mono"
                    >
                      Select All (22)
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-slate-400 hover:text-slate-300 font-mono"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
                  {INDIA_GEO_HUBS.map((hub) => {
                    const isChecked = selectedHubs.includes(hub.code);
                    return (
                      <button
                        type="button"
                        key={hub.code}
                        onClick={() => toggleHub(hub.code)}
                        className={`p-1.5 rounded-lg border text-left flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-purple-950/60 border-purple-600/60 text-purple-200'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{hub.code} • {hub.name.split(' ')[0]}</span>
                        {isChecked && <Check className="w-3 h-3 text-purple-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedHubs.length === 0 || isBroadcasting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-pulse' : ''}`} />
                  <span>
                    {isBroadcasting
                      ? 'Dispatching Directive...'
                      : `Broadcast to ${selectedHubs.length} Hubs`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
