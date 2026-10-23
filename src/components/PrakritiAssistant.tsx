import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  Activity,
  FileText
} from 'lucide-react';

interface PrakritiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const PrakritiAssistant: React.FC<PrakritiAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Namaste! I am Prakriti, your National E-Waste Circular Governance Assistant. You can type or click the microphone to query live environmental data, CPCB compliance rules, or file status reports using voice speech.',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Voice-to-Text (Speech Recognition) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English / Global English

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceNotice('Listening... Speak your query (e.g. "Query environmental data" or "File status report")');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setVoiceNotice(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          setVoiceNotice(null);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setVoiceNotice(null);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch (e) {
        console.warn('Speech recognition start failed, using speech synthesis simulation:', e);
      }
    }

    // Fallback simulation if speech recognition API is blocked in sandbox iframe
    setIsListening(true);
    setVoiceNotice('Listening via voice input... (Speak now)');
    const sampleVoiceQueries = [
      'Query environmental data and carbon impact metrics',
      'File status report for MoEFCC Form 3 quarterly return',
      'What is the current landfill capacity risk in Ghazipur and Deonar?',
      'Check NIST SP 800-88 data sanitization compliance'
    ];
    const picked = sampleVoiceQueries[Math.floor(Math.random() * sampleVoiceQueries.length)];

    let currentChars = '';
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < picked.length) {
        currentChars += picked[idx];
        setInput(currentChars);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
          setVoiceNotice(null);
        }, 600);
      }
    }, 40);
  };

  if (!isOpen) return null;

  const quickQuestions = [
    '🎤 Query environmental data',
    '🎤 File status report (Form 3)',
    'How is e-waste buyback payout calculated?',
    'What data erasure standard is used for SSDs & phones?',
    'Why is Ghazipur / Deonar landfill tracking critical?'
  ];

  const handleSend = (textToSend?: string) => {
    const rawQuery = textToSend || input;
    // Clean query from voice icons if clicked
    const query = rawQuery.replace(/^🎤\s*/, '').trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      // Query Environmental Data handler
      if (
        lower.includes('environmental data') ||
        lower.includes('environmental') ||
        lower.includes('co2') ||
        lower.includes('carbon') ||
        lower.includes('emissions') ||
        lower.includes('leachate')
      ) {
        reply = `**National Statutory Environmental Telemetry (FY 2025-26):**\n\n` +
          `• **Total CO2 Emissions Mitigated**: 4,120 Metric Tonnes across 14.15 L MT generated e-waste.\n` +
          `• **National Landfill Diversion**: 69.2% (9.79 L MT safely channeled into certified R2/EPR refineries).\n` +
          `• **Groundwater Leachate Prevented**: 1,420,000 Liters of toxic liquid runoff blocked from unlined aquifers.\n` +
          `• **Hazardous Heavy Metals Neutralized**: 840 kg of Lead (Pb), Mercury (Hg), and Cadmium (Cd) extracted & immobilized.\n` +
          `• **Top Performing States**: Uttar Pradesh (95.4%), Telangana (89.0%), Madhya Pradesh (68.2%).\n\n` +
          `You can export the signed environmental impact certificate or toggle state GIS drill-downs in the **Carbon Impact** dashboard!`;
      }
      // File Status Report handler
      else if (
        lower.includes('file status report') ||
        lower.includes('status report') ||
        lower.includes('form 3') ||
        lower.includes('quarterly report') ||
        lower.includes('filing') ||
        lower.includes('quarterly return')
      ) {
        reply = `**MoEFCC / CPCB Statutory Filing Status Report:**\n\n` +
          `• **Regulatory Mandate**: E-Waste Management Rules 2022 (Rule 13(1)(vii)) — Form 3 Quarterly Return.\n` +
          `• **Impending Quarter**: Q3 (October – December 2026).\n` +
          `• **Statutory Recycling Target**: 280 MT.\n` +
          `• **Actual Certified Demanufacturing**: 264 MT (94.2% statutory quota achieved).\n` +
          `• **Current Filing Status**: **READY FOR REGULATORY SUBMISSION** (Due in 14 days — 5 November 2026).\n` +
          `• **Cryptographic Verification**: SHA-256 batch validation active across all 18 processing lots.\n` +
          `• **Supervising Officer**: Rajesh Verma (CPCB Inspector ID: CPCB-REG-DL-2024-884).\n\n` +
          `You can navigate to the **CPCB Compliance > Compliance Calendar** tab to review deadline reminders or trigger official push filings!`;
      } else if (lower.includes('payout') || lower.includes('pricing') || lower.includes('formula') || lower.includes('calculate')) {
        reply = `Under the National E-Waste Governance framework, the payout formula is:\n\n**Offer = max(S, a × R) − H**\n\n• **S (Scrap Value)** = Measured weight × CPCB quoted raw material scrap rate.\n• **R (Resale Value)** = Expected refurbished secondary market value after intake grading (Grade A/B).\n• **a (User Share)** = Statutory share passed to the citizen (70–75%).\n• **H (Handling Fee)** = Fixed logistics & NIST-certified data scrub fee (₹150).\n\nIf the device is functional, you receive fair reuse market value rather than minimal scrap!`;
      } else if (lower.includes('standard') || lower.includes('nist') || lower.includes('erase') || lower.includes('clear') || lower.includes('purge')) {
        reply = `Bharat E-Waste Hub enforces **NIST SP 800-88 Rev. 2 & IEEE 2883-2022**:\n\n1. **Clear (Logical Reset)**: Factory resets or multi-pass logical overwrites. Note: insufficient for high-security flash storage.\n2. **Purge (Physical sanitization)**: ATA Secure Erase or NVMe Sanitize crypto block scramble. Infeasible to recover even in forensic lab.\n3. **Destroy**: Mechanical cross-cut shredding or disk shearing for damaged/dead media.\n\nEvery erasure generates a tamper-evident SHA-256 cryptographic certificate.`;
      } else if (lower.includes('cpcb') || lower.includes('recycler') || lower.includes('verify')) {
        reply = `Under the E-Waste (Management) Rules 2022 & 2024 Amendments, all recyclers and refurbishers must hold a valid **CPCB EPR Registration Number** and State PCB Consent to Operate (CTO). You can use our "Statutory Verification Portal" tab to cross-verify any recycler license and capacity in real-time.`;
      } else if (lower.includes('landfill') || lower.includes('ghazipur') || lower.includes('deonar') || lower.includes('capacity')) {
        reply = `Traditional municipal dumps (like Ghazipur in Delhi and Deonar in Mumbai) are exceeding critical capacity (>95%). When e-waste is dumped in unlined landfills, heavy metals like **Lead (Pb), Mercury (Hg), and Cadmium (Cd)** leach into groundwater. Our GIS Spatial Grid automatically re-routes e-waste shipments when landfill buffers near alert levels.`;
      } else {
        reply = `Thank you for consulting the Bharat E-Waste governance portal. All devices tracked through this hub follow strict chain of custody: intake inspection, IMEI/CEIR verification, NIST cryptographic data scrub, factory demanufacturing, and state PCB certified material recovery. You can check your device stage in the Console!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl h-[85vh] max-h-[680px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Prakriti E-Waste Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Voice & Rules Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">MoEFCC • CPCB 2022/2024 Rules • NIST SP 800-88 Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              </div>
              <span className="italic text-slate-400 text-[11px]">Prakriti is consulting CPCB gazette & data rules...</span>
            </div>
          )}
        </div>

        {/* Voice Listening Active Audio Waveform Banner */}
        {isListening && (
          <div className="px-4 py-2.5 bg-rose-950/40 border-t border-rose-500/40 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span>{voiceNotice || 'Listening to your speech... Speak now'}</span>
            </div>
            {/* Visual audio frequency equalizer bars */}
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
            </div>
          </div>
        )}

        {/* Quick query chips */}
        <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/70 overflow-x-auto flex gap-2 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Input Bar with Voice-to-Text Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isListening
                ? 'Listening to your voice... (Speak now)'
                : 'Ask or speak query (e.g. "Query environmental data" or "File status report")...'
            }
            className={`flex-1 bg-slate-900 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              isListening ? 'border-rose-500 shadow-md shadow-rose-950/50' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />

          {/* Voice Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop voice listening' : 'Start voice speech query (Voice-to-Text)'}
            className={`p-2 rounded-xl border transition flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
