import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  HardHat,
  Factory,
  Building2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  KeyRound,
  Phone,
  Lock,
  Globe2,
  Fingerprint,
  ScanFace,
  Cpu,
  CheckCircle2,
  AlertCircle,
  X,
  Key,
  UserPlus,
  UserCheck,
  BadgeCheck,
  Info
} from 'lucide-react';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { DEMO_USERS } from '../data/mockData';
import { Role, UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (role: Role, customUser?: UserProfile, asNewUser?: boolean) => void;
  onExplorePublicPortal?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'officer' | 'citizen' | 'persona'>('officer');

  // Officer Login State
  const [officerId, setOfficerId] = useState('ENG-COL-104');
  const [officerPassword, setOfficerPassword] = useState('maitri');
  const [officerError, setOfficerError] = useState<string | null>(null);

  // New Citizen State (0 Registered Devices)
  const [newCitizenName, setNewCitizenName] = useState('Aarav Gupta');
  const [newCitizenMobile, setNewCitizenMobile] = useState('+91 98234 56789');
  const [newCitizenCity, setNewCitizenCity] = useState('New Delhi');

  // Existing Citizen OTP State
  const [phoneOrEmail, setPhoneOrEmail] = useState('ananya.sharma@gmail.com');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Web Authentication API & Biometric States
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricTargetRole, setBiometricTargetRole] = useState<Role>('auditor');
  const [biometricPhase, setBiometricPhase] = useState<'idle' | 'challenging' | 'scanning' | 'verified' | 'error'>('idle');
  const [attestationHash, setAttestationHash] = useState('');
  const [authenticatorName, setAuthenticatorName] = useState('FIDO2 Level 3 Secure Enclave / TPM 2.0');

  // Official Statutory Officers with special IDs
  const STATUTORY_OFFICERS = [
    {
      id: 'ENG-COL-104',
      role: 'collection_engineer' as Role,
      title: 'Collection Engineer',
      officerName: 'Rajesh Verma',
      dept: 'National E-Waste Collection Hub #04',
      user: DEMO_USERS.collection_engineer,
      icon: HardHat,
      color: 'amber'
    },
    {
      id: 'ENG-FAC-302',
      role: 'factory_engineer' as Role,
      title: 'Factory Engineer',
      officerName: 'Dr. Suresh Nair',
      dept: 'EcoRecycle Apex Demanufacturing Plant',
      user: DEMO_USERS.factory_engineer,
      icon: Factory,
      color: 'cyan'
    },
    {
      id: 'AUD-CPCB-77',
      role: 'auditor' as Role,
      title: 'CPCB / SPCB Auditor',
      officerName: 'Priya Iyer',
      dept: 'Central Pollution Control Board (CPCB)',
      user: DEMO_USERS.auditor,
      icon: Building2,
      color: 'purple'
    },
    {
      id: 'ADM-NATIONAL-01',
      role: 'admin' as Role,
      title: 'Master Admin',
      officerName: 'Vikramaditya Sen',
      dept: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
      user: DEMO_USERS.admin,
      icon: ShieldAlert,
      color: 'rose'
    }
  ];

  // High-privilege roles requiring biometric verification
  const highPrivilegeRoles: Role[] = ['auditor', 'admin'];

  // Handle Official Statutory Officer Login
  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError(null);

    const cleanId = officerId.trim().toUpperCase();
    const cleanPass = officerPassword.trim().toLowerCase();

    // Password must be 'maitri'
    if (cleanPass !== 'maitri') {
      setOfficerError('Invalid statutory password. The access password for all official personnel is "maitri".');
      return;
    }

    // Match Special IDs
    let matchedOfficer = STATUTORY_OFFICERS.find(
      (o) => o.id === cleanId || o.role.toUpperCase() === cleanId
    );

    // Fallback aliases for convenience
    if (!matchedOfficer) {
      if (cleanId.includes('COLLECTION') || cleanId.includes('COL') || cleanId.includes('RAJESH')) {
        matchedOfficer = STATUTORY_OFFICERS[0];
      } else if (cleanId.includes('FACTORY') || cleanId.includes('FAC') || cleanId.includes('SURESH')) {
        matchedOfficer = STATUTORY_OFFICERS[1];
      } else if (cleanId.includes('AUDITOR') || cleanId.includes('CPCB') || cleanId.includes('PRIYA')) {
        matchedOfficer = STATUTORY_OFFICERS[2];
      } else if (cleanId.includes('ADMIN') || cleanId.includes('MOEF') || cleanId.includes('VIKRAM')) {
        matchedOfficer = STATUTORY_OFFICERS[3];
      }
    }

    if (!matchedOfficer) {
      setOfficerError(
        'Unrecognized Official ID. Valid IDs: ENG-COL-104 (Collection), ENG-FAC-302 (Factory), AUD-CPCB-77 (Auditor), ADM-NATIONAL-01 (Master Admin).'
      );
      return;
    }

    // High privilege check
    if (highPrivilegeRoles.includes(matchedOfficer.role)) {
      triggerBiometricAuth(matchedOfficer.role, matchedOfficer.user);
    } else {
      onLogin(matchedOfficer.role, matchedOfficer.user, false);
    }
  };

  // Quick select an officer & auto-fill ID and password 'maitri'
  const handleQuickSelectOfficer = (officer: typeof STATUTORY_OFFICERS[0]) => {
    setOfficerId(officer.id);
    setOfficerPassword('maitri');
    setOfficerError(null);
  };

  // Handle New Citizen Login (0 registered devices)
  const handleNewCitizenLogin = () => {
    const newUser: UserProfile = {
      id: `USR-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCitizenName.trim() || 'New Citizen Consignor',
      email: `${newCitizenName.toLowerCase().replace(/\s+/g, '.') || 'citizen'}@ewaste.gov.in`,
      mobile: newCitizenMobile.trim() || '+91 98000 00000',
      role: 'citizen',
      organization: 'Individual Citizen Network',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      state: 'Delhi NCR',
      city: newCitizenCity || 'New Delhi',
      pincode: '110001',
      upiId: `${newCitizenName.toLowerCase().replace(/\s+/g, '') || 'citizen'}@upi`
    };

    // Log in as new user with 0 registered devices
    onLogin('citizen', newUser, true);
  };

  // Handle Demo Citizen Login (existing records)
  const handleDemoCitizenLogin = () => {
    onLogin('citizen', DEMO_USERS.citizen, false);
  };

  // WebAuthn Passkey Simulation
  const triggerBiometricAuth = async (role: Role, userProfile?: UserProfile) => {
    setBiometricTargetRole(role);
    setBiometricModalOpen(true);
    setBiometricPhase('challenging');

    const challenge = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(challenge);
    }
    const hex = Array.from(challenge).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
    setAttestationHash(`0x${hex}...sha256`);

    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (available) {
            setAuthenticatorName('Apple Touch ID / Windows Hello / Android Biometric');
          } else {
            setAuthenticatorName('FIDO2 USB / NFC Security Key (YubiKey/Titan)');
          }
        }
      } catch {
        setAuthenticatorName('FIDO2 Hardware Token / Cryptographic Passkey');
      }
    } else {
      setAuthenticatorName('FIDO2 Emulated Cryptographic Enclave');
    }

    setTimeout(() => {
      setBiometricPhase('scanning');
      setTimeout(() => {
        setBiometricPhase('verified');
        setTimeout(() => {
          setBiometricModalOpen(false);
          onLogin(role, userProfile || DEMO_USERS[role], false);
        }, 900);
      }, 1500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                BHARAT <span className="text-emerald-400">E-WASTE</span> HUB
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Government of India
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National Statutory Tracking, NIST Data Erasure, and EPR Governance
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: 3D Model & National Metrics */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>National Circular Economy Infrastructure</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Collect. Wiping.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Recycle & Certify.
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              India&apos;s unified digital chain of custody for electronic waste. Powered by NIST SP 800-88 cryptographic sanitization, AI Computer Vision intake sorting, and CPCB EPR statutory traceability.
            </p>
          </div>

          {/* Interactive 3D Canvas Box */}
          <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-2xl p-2 group">
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-medium text-slate-300 tracking-wider">
                CIRCULAR MATRIX • 3D SPATIAL TELEMETRY
              </span>
            </div>
            <ThreeCanvas />
            <div className="absolute bottom-3 inset-x-4 z-10 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/70">
              <span>DRAG TO ROTATE 3D MOTHERBOARD CORE</span>
              <span className="text-emerald-400 font-semibold">IEEE 2883-2022 ALIGNED</span>
            </div>
          </div>

          {/* Official National Figures */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">FY 25-26 Generated</div>
              <div className="text-lg font-bold text-white mt-0.5">14.15 L MT</div>
              <div className="text-[10px] text-slate-400">CPCB Modelled</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Processed Tonnes</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">9.79 L MT</div>
              <div className="text-[10px] text-emerald-400/80">69.2% Recycled</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Data Scrub Level</div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">NIST 800-88</div>
              <div className="text-[10px] text-cyan-400/80">SHA-256 Verified</div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selector & Login Console */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-white">Access Portal</h2>
              <p className="text-xs text-slate-400">
                Official officers require Special ID and password <strong className="text-emerald-400">maitri</strong>
              </p>
            </div>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => { setActiveTab('officer'); setOfficerError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'officer'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Statutory Officers</span>
              </button>
              <button
                onClick={() => { setActiveTab('citizen'); setOfficerError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'citizen'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Citizen / Consignor</span>
              </button>
              <button
                onClick={() => { setActiveTab('persona'); setOfficerError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'persona'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Switch</span>
              </button>
            </div>
          </div>

          {/* TAB 1: STATUTORY OFFICERS (SPECIAL IDS & PASSWORD 'maitri') */}
          {activeTab === 'officer' && (
            <div className="space-y-4">
              {/* Quick Official Credentials Chips */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                  <span>Select Statutory Officer ID to Auto-Fill:</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    Password: maitri
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STATUTORY_OFFICERS.map((officer) => {
                    const Icon = officer.icon;
                    const isSelected = officerId === officer.id;
                    return (
                      <button
                        key={officer.id}
                        type="button"
                        onClick={() => handleQuickSelectOfficer(officer)}
                        className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate">{officer.title}</div>
                          <div className="text-[10px] font-mono text-amber-400/90 truncate">{officer.id}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Officer Login Form */}
              <form onSubmit={handleOfficerLogin} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Special Official ID *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => {
                        setOfficerId(e.target.value);
                        setOfficerError(null);
                      }}
                      placeholder="e.g. ENG-COL-104, ENG-FAC-302, AUD-CPCB-77, ADM-NATIONAL-01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono uppercase tracking-wide focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>Valid IDs:</span>
                    <span className="font-mono text-slate-400">ENG-COL-104</span> •
                    <span className="font-mono text-slate-400">ENG-FAC-302</span> •
                    <span className="font-mono text-slate-400">AUD-CPCB-77</span> •
                    <span className="font-mono text-slate-400">ADM-NATIONAL-01</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Statutory Password *
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      (Password is <strong>maitri</strong>)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={officerPassword}
                      onChange={(e) => {
                        setOfficerPassword(e.target.value);
                        setOfficerError(null);
                      }}
                      placeholder="Enter password (maitri)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {officerError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px] leading-relaxed">{officerError}</div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold text-xs text-white transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credentials & Enter Official Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  High-privilege roles (CPCB Auditor & Master Admin) will also trigger biometric passkey verification in accordance with statutory guidelines.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CITIZEN / CONSIGNOR (NEW USER VS DEMO) */}
          {activeTab === 'citizen' && (
            <div className="space-y-4">
              {/* Card 1: New Citizen with 0 registered devices */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>New Citizen Consignor</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono font-bold">
                          0 Devices
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Start with clean slate of 0 registered devices
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={newCitizenName}
                      onChange={(e) => setNewCitizenName(e.target.value)}
                      placeholder="e.g. Aarav Gupta"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={newCitizenMobile}
                      onChange={(e) => setNewCitizenMobile(e.target.value)}
                      placeholder="+91 98234 56789"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  💡 Upon logging in, you will see <strong>0 registered devices</strong>. Once you register your first electronic asset, it will immediately display in your roster along with its live 10-step circular lifecycle stage!
                </p>

                <button
                  type="button"
                  onClick={handleNewCitizenLogin}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign In as New User (0 Devices)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Demo Citizen (Ananya Sharma) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800">
                      <UserCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Existing Citizen Demo (Ananya Sharma)</div>
                      <div className="text-[10px] text-slate-400">Pre-loaded with 3 sample devices in various stages</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                    3 Devices
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDemoCitizenLogin}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <BadgeCheck className="w-4 h-4 text-teal-400" />
                    <span>Quick Sign In as Ananya Sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      setOtp('582910');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
                  >
                    Use OTP
                  </button>
                </div>

                {otpSent && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleDemoCitizenLogin();
                    }}
                    className="pt-2 border-t border-slate-800 space-y-2"
                  >
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Enter Demo OTP (Pre-filled):</span>
                      <span className="font-mono text-emerald-400">582910</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK ALL PERSONAS SWITCH */}
          {activeTab === 'persona' && (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {/* Option 1: New Citizen (0 Devices) */}
              <button
                onClick={handleNewCitizenLogin}
                className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-emerald-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                        New Citizen Consignor
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                        0 Devices (Clean Slate)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Starts with 0 registered devices. Add a device to view live 10-step tracking.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 2: Demo Citizen (3 Devices) */}
              <button
                onClick={handleDemoCitizenLogin}
                className="w-full text-left p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-teal-400">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-teal-300">
                        Citizen / Consignor (Demo)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        Ananya Sharma • 3 Devices
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      View pre-loaded device lifecycle, NIST wipe certs, and UPI payout acknowledgment.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 3-6: Official Statutory Officers */}
              {STATUTORY_OFFICERS.map((item) => {
                const Icon = item.icon;
                const isHighPrivilege = highPrivilegeRoles.includes(item.role);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isHighPrivilege) {
                        triggerBiometricAuth(item.role, item.user);
                      } else {
                        onLogin(item.role, item.user, false);
                      }
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            ID: {item.id}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                            Pass: maitri
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.officerName} • {item.dept}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-white transition">
                      {isHighPrivilege && <Fingerprint className="w-3.5 h-3.5 text-purple-400" />}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Security & Statutory Compliance Footnote */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>DPDP Act 2023 & CPCB EPR Statutory Verified</span>
            </span>
            <span className="font-mono text-[10px]">Server: Asia-South1 (Mumbai)</span>
          </div>
        </div>
      </main>

      {/* Web Authentication API / Biometric Passkey Modal */}
      {biometricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-6 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Fingerprint className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>WebAuthn Biometric Guard</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      Official Access
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    FIDO2 Statutory Authentication Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBiometricModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Biometric Scanner Area */}
            <div className="relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                    biometricPhase === 'verified'
                      ? 'border-emerald-500 scale-105'
                      : biometricPhase === 'scanning'
                      ? 'border-purple-500 animate-ping opacity-30'
                      : 'border-slate-700'
                  }`}
                />
                <div
                  className={`absolute inset-3 rounded-full border border-dashed transition-all duration-500 ${
                    biometricPhase === 'verified'
                      ? 'border-emerald-400'
                      : biometricPhase === 'scanning'
                      ? 'border-cyan-400 animate-spin'
                      : 'border-slate-800'
                  }`}
                  style={{ animationDuration: '6s' }}
                />
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                    biometricPhase === 'verified'
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400 scale-105'
                      : biometricPhase === 'scanning'
                      ? 'bg-purple-500/20 border border-purple-500/60 text-purple-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {biometricPhase === 'verified' ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in zoom-in" />
                  ) : (
                    <Fingerprint className="w-10 h-10" />
                  )}
                  {biometricPhase === 'scanning' && (
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-400" />
                  )}
                </div>
              </div>

              {/* Status message */}
              <div className="mt-4 text-center space-y-1">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  {biometricPhase === 'challenging' && <span>Generating W3C Challenge...</span>}
                  {biometricPhase === 'scanning' && (
                    <span className="text-purple-300 flex items-center gap-1.5">
                      <ScanFace className="w-4 h-4 animate-bounce" />
                      Touch Sensor or Verify Face ID / Passkey
                    </span>
                  )}
                  {biometricPhase === 'verified' && (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Biometric Signature Attested & Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {biometricPhase === 'verified'
                    ? 'Cryptographic assertion validated against Indian National EPR registry.'
                    : 'Prompting platform authenticator via navigator.credentials.get().'}
                </p>
              </div>
            </div>

            {/* Cryptographic Attestation Metadata */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Hardware Authenticator:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{authenticatorName}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Challenge Hash:</span>
                <span className="text-purple-400 font-semibold">{attestationHash || 'Generating...'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Target Access Role:</span>
                <span className="text-emerald-400 font-bold uppercase">{biometricTargetRole}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Statutory Passcode:</span>
                <span className="text-emerald-300 font-bold">maitri (Validated)</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setBiometricPhase('verified');
                  setTimeout(() => {
                    setBiometricModalOpen(false);
                    onLogin(biometricTargetRole, DEMO_USERS[biometricTargetRole], false);
                  }, 500);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Confirm Biometric & Proceed to Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBiometricModalOpen(false);
                  onLogin(biometricTargetRole, DEMO_USERS[biometricTargetRole], false);
                }}
                className="w-full text-center py-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                Bypass Biometric Verification (Demo / Testing Mode)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
