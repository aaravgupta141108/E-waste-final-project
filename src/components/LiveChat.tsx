import React, { useState } from 'react';
import { X, Send, MessageSquare, User, HardHat, Factory, ShieldCheck, CheckCheck } from 'lucide-react';
import { Role } from '../types';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  currentUserName: string;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUserName
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'c-1',
      senderName: 'Rajesh Verma',
      senderRole: 'collection_engineer',
      text: 'Batch #BATCH-DEL-2026-W42 dispatch initiated. 12 laptops, all NIST wiped with SHA-256 hashes generated.',
      timestamp: '10:45 AM'
    },
    {
      id: 'c-2',
      senderName: 'Dr. Suresh Nair',
      senderRole: 'factory_engineer',
      text: 'Acknowledged Rajesh. Demanufacturing Line 2 is primed for Li-ion battery pouch decoupling under argon chamber.',
      timestamp: '10:48 AM'
    },
    {
      id: 'c-3',
      senderName: 'Ananya Sharma',
      senderRole: 'citizen',
      text: 'Hello, I just received my UPI payout acknowledgement for Galaxy S20. Can I now download my green certificate?',
      timestamp: '11:15 AM'
    },
    {
      id: 'c-4',
      senderName: 'Priya Iyer',
      senderRole: 'auditor',
      text: 'Yes Ananya! Your disposal certificate is cryptographically signed and available in your Citizen Console with QR proof.',
      timestamp: '11:18 AM'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUserName,
      senderRole: currentRole,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'collection_engineer':
        return <HardHat className="w-3 h-3 text-amber-400" />;
      case 'factory_engineer':
        return <Factory className="w-3 h-3 text-cyan-400" />;
      case 'auditor':
      case 'admin':
        return <ShieldCheck className="w-3 h-3 text-purple-400" />;
      default:
        return <User className="w-3 h-3 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Operations Live Channel</h2>
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

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isMe = m.senderName === currentUserName;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  {getRoleIcon(m.senderRole)}
                  <span className="font-semibold text-slate-300">{m.senderName}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message channel as ${currentUserName}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
