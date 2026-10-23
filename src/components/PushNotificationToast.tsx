import React from 'react';
import { Bell, X, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { ComplianceDeadlineReminder } from '../types';

interface PushNotificationToastProps {
  activeNotification: {
    title: string;
    message: string;
    quarter: string;
    priority: string;
    deadline: string;
  } | null;
  onDismiss: () => void;
  onOpenCalendar: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  activeNotification,
  onDismiss,
  onOpenCalendar
}) => {
  if (!activeNotification) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 border-2 border-purple-500/70 rounded-2xl shadow-2xl p-4 backdrop-blur-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-purple-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                  MoEFCC STATUTORY PUSH ALERT
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <h4 className="text-xs font-bold text-white leading-snug mt-0.5">
                {activeNotification.title}
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pl-11">
          {activeNotification.message}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 pl-11 text-xs">
          <div className="font-mono text-[11px] text-amber-300">
            Due: {activeNotification.deadline}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onOpenCalendar();
                onDismiss();
              }}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition flex items-center gap-1 shadow"
            >
              <span>View Audit Filing</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
