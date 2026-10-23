import React from 'react';
import { X, Bell, AlertTriangle, Truck, ShieldAlert, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { SystemAlert } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onResolveAlert: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const severityIcons = {
    critical: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    high: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    medium: <Truck className="w-4 h-4 text-blue-400" />,
    low: <Bell className="w-4 h-4 text-slate-400" />
  };

  const severityStyles = {
    critical: 'border-rose-500/40 bg-rose-950/20',
    high: 'border-amber-500/40 bg-amber-950/20',
    medium: 'border-blue-500/40 bg-blue-950/20',
    low: 'border-slate-800 bg-slate-900/40'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">National Telemetry & Alerts</h2>
              <p className="text-[11px] text-slate-400">Real-time route alerts & landfill capacity triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">All Systems Nominal</p>
              <p className="text-xs text-slate-500 mt-1">No active dispatch or landfill alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${severityStyles[alert.severity]} ${
                  alert.resolved ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {severityIcons[alert.severity]}
                    <span className="text-xs font-semibold text-white">{alert.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{alert.message}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  {alert.linkToTab && (
                    <button
                      onClick={() => {
                        onNavigateTab(alert.linkToTab!);
                        onClose();
                      }}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Inspect Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition ml-auto"
                    >
                      Acknowledge & Clear
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-center">
          <span className="text-[10px] text-slate-500">
            CPCB Incident Notification Node • Connected to State Control Rooms
          </span>
        </div>
      </div>
    </div>
  );
};
