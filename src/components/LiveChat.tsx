import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  User,
  HardHat,
  Factory,
  ShieldCheck,
  CheckCheck,
  Smartphone,
  ChevronDown,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';
import { DeviceItem, Role } from '../types';

export interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  currentUserName: string;
  devices: DeviceItem[];
  selectedCaseId?: string | null;
  onSelectCase?: (caseId: string) => void;
}

export interface ChatMessage {
  id: string;
  caseId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}

// Case-specific live operational data seed
const INITIAL_CASE_THREADS: Record<string, ChatMessage[]> = {
  'BHW-2026-9041': [
    {
      id: 'm-9041-1',
      caseId: 'BHW-2026-9041',
      senderName: 'Ananya Sharma',
      senderRole: 'citizen',
      text: 'Namaste! Handed over my Samsung Galaxy S20 FE to the doorstep collection van at Mayur Vihar Phase 1.',
      timestamp: 'Oct 15, 10:15 AM'
    },
    {
      id: 'm-9041-2',
      caseId: 'BHW-2026-9041',
      senderName: 'Rajesh Verma (ENG-COL-104)',
      senderRole: 'collection_engineer',
      text: 'Received at Central Hub #04. Serial RF8N7029DKL logged. Moving to BharatScrub sanitization dock in Bin #BIN-DEL-9041.',
      timestamp: 'Oct 15, 11:42 AM'
    },
    {
      id: 'm-9041-3',
      caseId: 'BHW-2026-9041',
      senderName: 'Rajesh Verma (ENG-COL-104)',
      senderRole: 'collection_engineer',
      text: 'NIST SP 800-88 Rev. 2 cryptographic erase complete. Zero residual sectors confirmed. SHA-256 hash e3b0c44... uploaded to National Hub.',
      timestamp: 'Oct 16, 02:28 PM'
    },
    {
      id: 'm-9041-4',
      caseId: 'BHW-2026-9041',
      senderName: 'Ananya Sharma',
      senderRole: 'citizen',
      text: 'Received ₹2,850 UPI payout acknowledgement on my HDFC account. Releasing device for green corridor transport.',
      timestamp: 'Oct 18, 12:45 PM'
    },
    {
      id: 'm-9041-5',
      caseId: 'BHW-2026-9041',
      senderName: 'Dr. Suresh Nair (ENG-FAC-302)',
      senderRole: 'factory_engineer',
      text: 'Demanufacturing Plant received Pallet #LOT-DEL-42. Li-ion pouch safely extracted under Argon containment. 16.5g copper & 0.038g gold segregated.',
      timestamp: 'Oct 19, 10:14 AM'
    },
    {
      id: 'm-9041-6',
      caseId: 'BHW-2026-9041',
      senderName: 'Priya Iyer (AUD-CPCB-77)',
      senderRole: 'auditor',
      text: 'Official Government of India Form 6 Destruction Certificate CPCB-CERT-DEL-2026-88192 validated and digitally countersigned.',
      timestamp: 'Oct 20, 04:15 PM'
    }
  ],
  'BHW-2026-9042': [
    {
      id: 'm-9042-1',
      caseId: 'BHW-2026-9042',
      senderName: 'Ananya Sharma',
      senderRole: 'citizen',
      text: 'Laptop consignment ThinkPad T480 submitted with cracked display but functional NVMe motherboard.',
      timestamp: 'Oct 17, 11:00 AM'
    },
    {
      id: 'm-9042-2',
      caseId: 'BHW-2026-9042',
      senderName: 'Rajesh Verma (ENG-COL-104)',
      senderRole: 'collection_engineer',
      text: 'Custody taken at Hub #04. 512GB NVMe sanitized via IEEE 2883-2022 purge opcode. Dispatched in EV #DL-01-EV-4491 under Pallet #LOT-DEL-42.',
      timestamp: 'Oct 18, 10:48 AM'
    },
    {
      id: 'm-9042-3',
      caseId: 'BHW-2026-9042',
      senderName: 'Dr. Suresh Nair (ENG-FAC-302)',
      senderRole: 'factory_engineer',
      text: 'Triage notice: Swollen dual battery cell pack (>15mm distension). Detached with ceramic tools into flame-proof vermiculite barrel.',
      timestamp: 'Oct 21, 02:05 PM'
    },
    {
      id: 'm-9042-4',
      caseId: 'BHW-2026-9042',
      senderName: 'Priya Iyer (AUD-CPCB-77)',
      senderRole: 'auditor',
      text: 'Hazardous intervention logged in Form 2 manifest. Motherboard approved for secondary gold-cyanide hydrometallurgical leaching.',
      timestamp: 'Oct 21, 02:30 PM'
    }
  ],
  'BHW-2026-8810': [
    {
      id: 'm-8810-1',
      caseId: 'BHW-2026-8810',
      senderName: 'Ananya Sharma',
      senderRole: 'citizen',
      text: 'Booked pickup for 48V Exide Li-ion module. Required heavy lifter van due to 14.5 kg weight.',
      timestamp: 'Oct 18, 10:20 AM'
    },
    {
      id: 'm-8810-2',
      caseId: 'BHW-2026-8810',
      senderName: 'Rajesh Verma (ENG-COL-104)',
      senderRole: 'collection_engineer',
      text: 'Crated in fire-retardant Hazmat Class 9 certified Pallet Bin #BIN-DEL-8810. Bank payout ₹4,200 disbursed via NEFT.',
      timestamp: 'Oct 20, 03:40 PM'
    },
    {
      id: 'm-8810-3',
      caseId: 'BHW-2026-8810',
      senderName: 'Rajesh Verma (ENG-COL-104)',
      senderRole: 'collection_engineer',
      text: 'Pallet secured on Geotagged Electric Fleet #DL-01-EV-4491 en route to EcoRecycle Apex refinery.',
      timestamp: 'Oct 21, 09:30 AM'
    }
  ]
};

export const LiveChat: React.FC<LiveChatProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUserName,
  devices = [],
  selectedCaseId,
  onSelectCase
}) => {
  // Select active case (fallback to first device)
  const [activeCaseId, setActiveCaseId] = useState<string>(
    selectedCaseId || devices[0]?.id || 'BHW-2026-9041'
  );

  // Sync when selectedCaseId changes externally
  useEffect(() => {
    if (selectedCaseId) {
      setActiveCaseId(selectedCaseId);
    } else if (!activeCaseId && devices.length > 0) {
      setActiveCaseId(devices[0].id);
    }
  }, [selectedCaseId, devices]);

  // Master per-case messages store
  const [caseMessages, setCaseMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CASE_THREADS);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Current active device
  const currentDevice = devices.find((d) => d.id === activeCaseId) || devices[0];

  // Get active case messages (or generate default seed for newly registered device)
  const activeMessages = React.useMemo(() => {
    if (caseMessages[activeCaseId]) {
      return caseMessages[activeCaseId];
    }

    if (currentDevice) {
      return [
        {
          id: `m-init-${currentDevice.id}-1`,
          caseId: currentDevice.id,
          senderName: currentDevice.userName || currentUserName,
          senderRole: 'citizen' as Role,
          text: `Intake registered for ${currentDevice.brand} ${currentDevice.model} (${currentDevice.category}). Physical Bin & QR linkage established.`,
          timestamp: currentDevice.registeredAt || 'Just now'
        },
        {
          id: `m-init-${currentDevice.id}-2`,
          caseId: currentDevice.id,
          senderName: 'Rajesh Verma (ENG-COL-104)',
          senderRole: 'collection_engineer' as Role,
          text: `Doorstep collection logged. Assigned to Green Electric Van. Scheduled for Hub intake & NIST SP 800-88 sanitization.`,
          timestamp: 'Just now'
        }
      ];
    }

    return [];
  }, [activeCaseId, caseMessages, currentDevice, currentUserName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || !activeCaseId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      caseId: activeCaseId,
      senderName: currentUserName,
      senderRole: currentRole,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCaseMessages((prev) => ({
      ...prev,
      [activeCaseId]: [...(prev[activeCaseId] || activeMessages), newMsg]
    }));
    setInput('');

    // Trigger simulated operational response after 1.2s for realism
    setTimeout(() => {
      let responderName = 'Rajesh Verma (ENG-COL-104)';
      let responderRole: Role = 'collection_engineer';
      let responderText = `Acknowledged. Operational record for case ${activeCaseId} verified against statutory CPCB chain of custody.`;

      if (currentRole === 'collection_engineer') {
        responderName = 'Dr. Suresh Nair (ENG-FAC-302)';
        responderRole = 'factory_engineer';
        responderText = `Factory Demanufacturing Station received notification for Case ${activeCaseId}. Line scales prepared.`;
      } else if (currentRole === 'factory_engineer') {
        responderName = 'Priya Iyer (AUD-CPCB-77)';
        responderRole = 'auditor';
        responderText = `Statutory audit note appended to Case ${activeCaseId}. Material recovery certificate queue updated.`;
      }

      const autoReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        caseId: activeCaseId,
        senderName: responderName,
        senderRole: responderRole,
        text: responderText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCaseMessages((prev) => ({
        ...prev,
        [activeCaseId]: [...(prev[activeCaseId] || []), autoReply]
      }));
    }, 1200);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'collection_engineer':
        return <HardHat className="w-3.5 h-3.5 text-amber-400" />;
      case 'factory_engineer':
        return <Factory className="w-3.5 h-3.5 text-cyan-400" />;
      case 'auditor':
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'collection_engineer':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'factory_engineer':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'auditor':
      case 'admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Main Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Operations Live Channel</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">
                Citizen • Hub Logistics • Factory Engineers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Case Selector Dropdown & Scoped Case Banner */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Consignment Case:</span>
            </label>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800 font-bold">
              {devices.length} Cases in Registry
            </span>
          </div>

          <select
            value={activeCaseId}
            onChange={(e) => {
              setActiveCaseId(e.target.value);
              onSelectCase?.(e.target.value);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} — {d.brand} {d.model} ({d.status.replace(/_/g, ' ')})
              </option>
            ))}
          </select>

          {/* Custody Bin linkage indicator for active case */}
          {currentDevice && (
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500 font-sans">Physical Bin Linkage:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  BIN-{currentDevice.city.slice(0, 3).toUpperCase()}-{currentDevice.id.slice(-4)}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Stage: {currentDevice.status}
              </span>
            </div>
          )}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/60">
          {activeMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No operational transmissions yet for this case. Type a message below to coordinate.
            </div>
          ) : (
            activeMessages.map((m) => {
              const isMe = m.senderName === currentUserName || m.senderRole === currentRole;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold ${getRoleBadgeStyle(m.senderRole)}`}>
                      {getRoleIcon(m.senderRole)}
                      <span>{m.senderRole.replace('_', ' ').toUpperCase()}</span>
                    </span>
                    <span className="font-semibold text-slate-300">{m.senderName}</span>
                    <span>•</span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Broadcasting to case: <strong className="text-slate-300 font-mono">{activeCaseId}</strong></span>
            <span>Signed in as <strong className="text-emerald-400">{currentUserName}</strong></span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Send message to case ${activeCaseId}...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
