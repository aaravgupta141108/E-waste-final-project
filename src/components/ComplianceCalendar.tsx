import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Send,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { ComplianceDeadlineReminder, SystemAlert } from '../types';

interface ComplianceCalendarProps {
  reminders: ComplianceDeadlineReminder[];
  onAddReminder: (reminder: ComplianceDeadlineReminder) => void;
  onDeleteReminder: (id: string) => void;
  onTriggerPushNotification: (reminder: ComplianceDeadlineReminder) => void;
}

export const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({
  reminders,
  onAddReminder,
  onDeleteReminder,
  onTriggerPushNotification
}) => {
  // Calendar month state: current month is November 2026 (based on timeline)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 is November (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-05');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for custom reminder
  const [formTitle, setFormTitle] = useState('');
  const [formFilingType, setFormFilingType] = useState<ComplianceDeadlineReminder['filingType']>('MoEFCC Form 3 (Quarterly)');
  const [formDate, setFormDate] = useState('2026-11-05');
  const [formQuarter, setFormQuarter] = useState('FY 2026-27 Q3');
  const [formLeadTime, setFormLeadTime] = useState('14');
  const [formPriority, setFormPriority] = useState<ComplianceDeadlineReminder['priority']>('critical');
  const [formChannel, setFormChannel] = useState<ComplianceDeadlineReminder['notificationChannel']>('In-App & Push');
  const [formOfficer, setFormOfficer] = useState('Priya Iyer (CPCB)');
  const [formNotes, setFormNotes] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a reminder title');
      return;
    }

    const newRem: ComplianceDeadlineReminder = {
      id: `REM-${Date.now().toString().slice(-6)}`,
      title: formTitle,
      filingType: formFilingType,
      deadlineDate: formDate,
      quarter: formQuarter,
      leadTimeDays: parseInt(formLeadTime, 10) || 7,
      priority: formPriority,
      notificationChannel: formChannel,
      assignedOfficer: formOfficer,
      notes: formNotes || 'Statutory filing reminder configured for MoEFCC EPR portal.',
      isTriggered: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddReminder(newRem);
    setShowAddModal(false);
    setFormTitle('');
    setFormNotes('');
  };

  // Find reminders for a specific date in current view
  const getRemindersForDay = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.filter((r) => r.deadlineDate === formatted);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                CPCB / MoEFCC Statutory Compliance Calendar
              </h3>
              <p className="text-xs text-slate-400">
                Quarterly filing deadlines with push-style automated alerts & lead-time triggers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (reminders[0]) onTriggerPushNotification(reminders[0]);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-semibold border border-purple-500/30 transition flex items-center gap-1.5 shadow-sm"
            title="Test Push Notification Toast"
          >
            <Bell className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
            <span>Simulate Push Alert</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Set Custom Deadline Reminder</span>
          </button>
        </div>
      </div>

      {/* Calendar & Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Calendar Grid */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-bold text-white font-mono">
                {monthNames[currentMonth]} {currentYear}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-medium">
                MoEFCC Compliance Cycle
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {/* Empty slots for month start */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/30 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayReminders = getRemindersForDay(day);
              const hasCritical = dayReminders.some((r) => r.priority === 'critical');
              const hasHigh = dayReminders.some((r) => r.priority === 'high');
              const isSelected = selectedDate === formattedDate;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(formattedDate)}
                  className={`h-16 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                      : dayReminders.length > 0
                      ? hasCritical
                        ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                        : 'bg-purple-950/20 border-purple-500/30 hover:bg-purple-950/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected
                          ? 'text-purple-300'
                          : dayReminders.length > 0
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                    {dayReminders.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>

                  {dayReminders.length > 0 && (
                    <div className="text-[9px] font-sans truncate font-medium text-purple-300 bg-purple-950/80 px-1 py-0.5 rounded border border-purple-800/60">
                      {dayReminders[0].filingType.split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Critical MoEFCC Deadline</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>Quarterly Statutory Return</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Audit Completed</span>
            </span>
          </div>
        </div>

        {/* Right Side: Active Deadlines & Scheduled Reminders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Configured Filing Reminders</h4>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                {reminders.length} SCHEDULED
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {reminders.map((rem) => {
                const isCritical = rem.priority === 'critical';
                const isHigh = rem.priority === 'high';

                return (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-white">{rem.title}</h5>
                        <p className="text-[11px] text-purple-300 font-mono mt-0.5">
                          {rem.filingType} • {rem.quarter}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {rem.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Deadline Date:</span>
                        <span className="text-white font-bold">{rem.deadlineDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Alert Window:</span>
                        <span className="text-purple-400 font-bold">{rem.leadTimeDays} Days Before</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      {rem.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-emerald-400" />
                        <span>{rem.notificationChannel}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTriggerPushNotification(rem)}
                          className="px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 transition font-medium"
                          title="Send Push Alert Now"
                        >
                          Trigger Push
                        </button>
                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Set Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                <h4 className="text-base font-bold text-white">
                  Configure Statutory Filing Reminder
                </h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 MoEFCC E-Waste Return & Mass Balance Reconciliation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Filing Report Type
                  </label>
                  <select
                    value={formFilingType}
                    onChange={(e) => setFormFilingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="MoEFCC Form 3 (Quarterly)">MoEFCC Form 3 (Quarterly)</option>
                    <option value="State PCB Form 4 (Annual)">State PCB Form 4 (Annual)</option>
                    <option value="Battery EPR Half-Yearly">Battery EPR Half-Yearly</option>
                    <option value="Refurbisher Ledger Audit">Refurbisher Ledger Audit</option>
                    <option value="EPR Credit Reconciliation">EPR Credit Reconciliation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quarter / Cycle
                  </label>
                  <input
                    type="text"
                    value={formQuarter}
                    onChange={(e) => setFormQuarter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reminder Lead Time
                  </label>
                  <select
                    value={formLeadTime}
                    onChange={(e) => setFormLeadTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1">1 Day Before</option>
                    <option value="3">3 Days Before</option>
                    <option value="7">7 Days Before</option>
                    <option value="14">14 Days Before</option>
                    <option value="30">30 Days Before</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notification Channel
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="In-App & Push">In-App & Push Alert</option>
                    <option value="Push Notification">Push Notification Only</option>
                    <option value="SMS & Push">SMS & Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="critical">Critical (Legal Liability)</option>
                    <option value="high">High Urgency</option>
                    <option value="medium">Standard Operational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assigned Auditor / Compliance Officer
                </label>
                <input
                  type="text"
                  value={formOfficer}
                  onChange={(e) => setFormOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compliance Instructions & Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Ensure all recyclers upload weighbridge certified slips before Form 3 submission."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white transition flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Push Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
