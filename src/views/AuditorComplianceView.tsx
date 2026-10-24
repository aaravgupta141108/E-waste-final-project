import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Lock,
  Search,
  Check,
  TrendingUp,
  Scale,
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AUDIT_LOGS, CPCB_RECYCLERS, NATIONAL_STATS } from '../data/mockData';
import { ComplianceDeadlineReminder, AuditLogEntry, DeviceItem, UserProfile } from '../types';
import { ComplianceCalendar } from '../components/ComplianceCalendar';
import { ComplianceHistoryLog } from '../components/ComplianceHistoryLog';
import { ComplianceHeatmap } from '../components/ComplianceHeatmap';

interface AuditorComplianceViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onResolveFlag?: (deviceId: string) => void;
  reminders?: ComplianceDeadlineReminder[];
  onAddReminder?: (reminder: ComplianceDeadlineReminder) => void;
  onDeleteReminder?: (id: string) => void;
  onTriggerPushNotification?: (reminder: ComplianceDeadlineReminder) => void;
}

export const AuditorComplianceView: React.FC<AuditorComplianceViewProps> = ({
  currentUser,
  devices,
  onResolveFlag,
  reminders = [],
  onAddReminder = () => {},
  onDeleteReminder = () => {},
  onTriggerPushNotification = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'history' | 'calendar' | 'cpcb_targets' | 'heatmap' | 'audit_trail' | 'recycler_directory'>('scorecard');
  const [searchLog, setSearchLog] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // CPCB Quarterly Targets vs Actuals
  const quarterlyComplianceData = [
    { quarter: 'Q1 (Apr-Jun)', statutoryTargetMT: 240, actualRecycledMT: 248, compliancePct: 103.3 },
    { quarter: 'Q2 (Jul-Sep)', statutoryTargetMT: 260, actualRecycledMT: 254, compliancePct: 97.7 },
    { quarter: 'Q3 (Oct-Dec)', statutoryTargetMT: 280, actualRecycledMT: 264, compliancePct: 94.2 },
    { quarter: 'Q4 (Jan-Mar)', statutoryTargetMT: 300, actualRecycledMT: 0, compliancePct: 0.0 }
  ];

  const filteredLogs = AUDIT_LOGS.filter(
    (log) =>
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Pollution Control Board (CPCB) • Statutory Audit Node</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Regulatory Compliance, Targets & Chain of Custody Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Statutory oversight under E-Waste (Management) Rules 2022 & Amendment G.S.R. 699(E). Automated verification of EPR obligations and tamper-proof audit trails.
          </p>
        </div>

        <button
          onClick={() => setShowSubmissionModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-lg shadow-purple-600/20 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Generate CPCB Form-3 Audit Filing PDF</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'scorecard'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditor Scorecard & Flags</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'history'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Device Compliance History</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            Provenance
          </span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'calendar'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Compliance Deadline Calendar</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            Alert
          </span>
        </button>
        <button
          onClick={() => setActiveTab('cpcb_targets')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'cpcb_targets'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Quarterly EPR Targets vs Actuals</span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'heatmap'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Regional Targets &amp; District Heatmap</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            Underperforming Districts
          </span>
        </button>
        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'audit_trail'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Immutable Audit Log ({AUDIT_LOGS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('recycler_directory')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'recycler_directory'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Authorized Recyclers Directory</span>
        </button>
      </div>

      {/* Tab 1: Auditor Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Total Registered Units</span>
              <div className="text-xl font-bold text-white mt-1">
                {NATIONAL_STATS.platformRegisteredDevices.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400">100% Chain-of-Custody</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Gross Collected Weight</span>
              <div className="text-xl font-bold text-white mt-1">
                {NATIONAL_STATS.platformTotalKgCollected.toLocaleString()} kg
              </div>
              <span className="text-[10px] text-slate-400">Calibrated Scale Logs</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Wipe Success Rate</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">99.8%</div>
              <span className="text-[10px] text-slate-400">NIST SP 800-88 Purge</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">Open Flags & Discrepancies</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD').length} Cases
              </div>
              <span className="text-[10px] text-rose-400/80">Pending Admin Action</span>
            </div>
          </div>

          {/* Statutory Filing Countdown & Push Reminder Banner */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    Impending MoEFCC Filing: Q3 E-Waste Quarterly Return (Form 3)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    DUE IN 14 DAYS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Statutory Rule 13(1)(vii) mandate. Automated push notifications active for registered officers.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('heatmap')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Regional Heatmap &amp; Underperforming Districts</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Open Compliance Calendar</span>
              </button>
            </div>
          </div>

          {/* Flagged Devices Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Statutory Discrepancy & Quarantine Queue</h3>
              </div>
              <span className="text-xs text-amber-400 font-mono">STRICT CHAIN OF CUSTODY</span>
            </div>

            <div className="space-y-3">
              {devices
                .filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD')
                .map((d) => (
                  <div
                    key={d.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      d.status === 'FLAGGED'
                        ? 'bg-rose-950/20 border-rose-600/40'
                        : 'bg-amber-950/20 border-amber-600/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {d.brand} {d.model} ({d.category})
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                          {d.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            d.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{d.flagReason || d.holdReason}</p>
                      <div className="text-[10px] text-slate-400">
                        Intake: {d.intakeWeightKg} kg • Factory: {d.factoryWeightKg || 'Pending'} kg • Hub: {d.hubLocation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => onResolveFlag && onResolveFlag(d.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                        >
                          Admin Resolve with Note
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Compliance History Log */}
      {activeTab === 'history' && (
        <ComplianceHistoryLog devices={devices} currentUser={currentUser} />
      )}

      {/* Tab: Compliance Deadline Calendar */}
      {activeTab === 'calendar' && (
        <ComplianceCalendar
          reminders={reminders}
          onAddReminder={onAddReminder}
          onDeleteReminder={onDeleteReminder}
          onTriggerPushNotification={onTriggerPushNotification}
        />
      )}

      {/* Tab 2: Quarterly CPCB Targets */}
      {activeTab === 'cpcb_targets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Quarterly E-Waste Processing Targets vs Actuals (EPR Filing)
              </h3>
              <p className="text-xs text-slate-400">
                Statutory filing progress under MoEFCC Schedule III rules. Automated alerts for impending deadlines.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>Q3 FILING DUE: 14 DAYS</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyComplianceData}>
                <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="statutoryTargetMT" name="CPCB Statutory Target (MT)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualRecycledMT" name="Actual Recycled (MT)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">YTD Target Compliance</span>
              <div className="text-xl font-bold text-purple-400 mt-1">98.4% Average</div>
              <span className="text-[10px] text-slate-400">Exceeds minimum 80% EPR mandate</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Upcoming Regulatory Filing</span>
              <div className="text-xl font-bold text-white mt-1">Form 3 (Quarterly)</div>
              <span className="text-[10px] text-amber-400">Deadline: 5 November 2026</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Statutory Storage Threshold</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">42 Days Avg</div>
              <span className="text-[10px] text-slate-400">Well below 180-day legal ceiling</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Regional E-Waste Compliance Heatmap & District Matrix */}
      {activeTab === 'heatmap' && (
        <ComplianceHeatmap />
      )}

      {/* Tab 3: Immutable Audit Log */}
      {activeTab === 'audit_trail' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Statutory Audit Trail</h3>
              <p className="text-xs text-slate-400">
                MeitY & CERT-In compliant log entries retained for 180 days with cryptographic hash verification
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Filter logs by actor, entity or hash..."
                className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Entity Details</th>
                  <th className="p-3">IP / Network Node</th>
                  <th className="p-3">Tamper-Proof Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="p-3 font-sans">
                      <span className="font-bold text-white block">{log.actorName}</span>
                      <span className="text-[10px] text-purple-400">{log.actorRole}</span>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">{log.action}</td>
                    <td className="p-3 font-sans text-slate-300 max-w-xs">{log.details}</td>
                    <td className="p-3 text-slate-400 text-[10px]">{log.ipAddress}</td>
                    <td className="p-3 text-cyan-400 text-[10px]">{log.tamperProofHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Recycler Directory */}
      {activeTab === 'recycler_directory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">CPCB Authorized Recyclers & Refurbishers</h3>
            <p className="text-xs text-slate-400">Official national registered recyclers with valid Consent to Operate (CTO)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CPCB_RECYCLERS.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <p className="text-xs text-slate-400">{r.city}, {r.state}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div><span className="text-slate-500">CPCB Reg:</span> {r.cpcbRegNumber}</div>
                  <div><span className="text-slate-500">SPCB CTO:</span> {r.spcbConsentNumber}</div>
                  <div><span className="text-slate-500">Annual Capacity:</span> {r.annualCapacityTonnes.toLocaleString()} MT/yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formal CPCB Form-3 Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">
                  CPCB Form-3 Statutory Audit Submission
                </span>
              </div>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200">
              <div className="border-b-2 border-purple-600 pb-4">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  SCHEDULE III • FORM 3 [RULE 13(1)(VII), 13(3)(VI)]
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  OFFICIAL RETURN OF E-WASTE DISMANTLED & RECYCLED
                </h3>
                <p className="text-xs text-slate-400">
                  Central Pollution Control Board, Parivesh Bhawan, East Arjun Nagar, Delhi - 110032
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div><strong>Auditor in Charge:</strong> {currentUser.name} ({currentUser.id})</div>
                <div><strong>Reporting Period:</strong> FY 2026-27 (Quarter 1 to Quarter 3)</div>
                <div><strong>Total E-Waste Processed:</strong> 766.0 Metric Tonnes</div>
                <div><strong>Diverted from Landfills:</strong> 21,910 Metric Tonnes Nationwide</div>
                <div><strong>NIST SP 800-88 Data Scrub Validation:</strong> 100% Certified (0 incidents)</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-700/50 text-xs text-purple-300">
                This document is cryptographically verified against the national ledger. Contains immutable digital signatures compliant with Section 15 of Environment (Protection) Act.
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Form-3 CPCB Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
