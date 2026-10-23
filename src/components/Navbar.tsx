import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Leaf,
  BarChart3,
  Award,
  Bell,
  Bot,
  QrCode,
  Search,
  LogOut,
  ChevronDown,
  Building2,
  HardHat,
  Factory,
  UserCheck,
  ShieldAlert,
  MessageSquare,
  Menu,
  X,
  Maximize,
  Minimize,
  Sun,
  Moon
} from 'lucide-react';
import { Role, UserProfile } from '../types';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  currentUser: UserProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenStatutoryModal: () => void;
  onOpenQrModal: () => void;
  onOpenAssistantModal: () => void;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
  unreadAlertCount: number;
  theme?: 'dark' | 'compliance-light';
  onToggleTheme?: () => void;
  onSwitchToNewCitizen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onSwitchToNewCitizen,
  currentUser,
  activeTab,
  onTabChange,
  onOpenStatutoryModal,
  onOpenQrModal,
  onOpenAssistantModal,
  onOpenNotifications,
  onOpenChat,
  onLogout,
  unreadAlertCount,
  theme = 'dark',
  onToggleTheme = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const roleLabels: Record<Role, { label: string; short: string; icon: React.ReactNode; color: string; badge: string }> = {
    citizen: {
      label: 'Citizen / Consignor',
      short: 'Citizen',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
      badge: 'Public'
    },
    collection_engineer: {
      label: 'Collection Engineer',
      short: 'Logistics',
      icon: <HardHat className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
      badge: 'Hub Logistics'
    },
    factory_engineer: {
      label: 'Factory Engineer',
      short: 'Factory',
      icon: <Factory className="w-3.5 h-3.5" />,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20',
      badge: 'Refinery'
    },
    auditor: {
      label: 'CPCB / SPCB Auditor',
      short: 'Auditor',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
      badge: 'Statutory'
    },
    admin: {
      label: 'Master Admin',
      short: 'Admin',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
      badge: 'MoEFCC Apex'
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Console', icon: BarChart3 },
    { id: 'fleet', label: 'Tracking & Fleet Hub', icon: Truck },
    { id: 'carbon', label: 'Carbon Impact', icon: Leaf },
    { id: 'compliance', label: 'CPCB Compliance', icon: ShieldCheck },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/98 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5">
        
        {/* ROW 1: Brand & Subtitle (Left) + Utility Action Icons & Persona Switcher (Right) */}
        <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-slate-800/60 gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1 font-sans">
                    BHARAT <span className="text-emerald-400">E-WASTE</span> HUB
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                    GOI • CPCB
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans tracking-normal font-normal">
                  National Circular Economy & Data Erasure Registry
                </span>
              </div>
            </button>
          </div>

          {/* Right Utility Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Verify Portal Button */}
            <button
              onClick={onOpenStatutoryModal}
              title="Official Statutory Recycler & Certificate Verification"
              className="h-7 hidden md:flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Verify Portal</span>
            </button>

            {/* Quick Action Icons Cluster (Exact icons from screenshot) */}
            <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={onOpenQrModal}
                title="Chain of Custody QR Scanner"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={onOpenAssistantModal}
                title="Prakriti Virtual E-Waste Assistant"
                className="relative w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-950/40 transition group"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </button>

              <button
                onClick={onOpenChat}
                title="Live Operations Chat"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={onOpenNotifications}
                title="Notification Center"
                className="relative w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-bold text-[8px] px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                  4
                </span>
              </button>

              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="hidden sm:flex w-7 h-7 rounded-md items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                {isFullscreen ? (
                  <Minimize className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Maximize className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Audit Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title="Toggle Audit Mode"
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition border ${
                theme === 'compliance-light'
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {theme === 'compliance-light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold text-amber-900">Audit Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline text-[11px] text-slate-300">Audit Mode</span>
                </>
              )}
            </button>

            {/* Role Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold border transition ${roleLabels[currentRole].color}`}
              >
                {roleLabels[currentRole].icon}
                <span className="text-[11px] font-semibold hidden sm:inline">
                  {roleLabels[currentRole].label}
                </span>
                <span className="text-[11px] font-semibold sm:hidden">
                  {roleLabels[currentRole].short}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900/98 border border-slate-800 shadow-2xl py-1.5 z-50 backdrop-blur-xl"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 border-b border-slate-800/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Persona
                    </p>
                  </div>
                  {(Object.keys(roleLabels) as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs transition ${
                        currentRole === r
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {roleLabels[r].icon}
                        <span>{roleLabels[r].label}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {roleLabels[r].badge}
                      </span>
                    </button>
                  ))}
                  {onSwitchToNewCitizen && (
                    <button
                      onClick={() => {
                        onSwitchToNewCitizen();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between text-xs transition text-emerald-400 hover:bg-slate-800/70 border-t border-slate-800/70 mt-1 pt-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold">New Citizen (0 Devices)</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                        Fresh
                      </span>
                    </button>
                  )}
                  <div className="border-t border-slate-800 mt-1 pt-1 px-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-1 flex items-center gap-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ROW 2: Navigation Tabs (Left Aligned with active emerald underline) */}
        <div className="hidden lg:flex items-center gap-6 h-9">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative h-full flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap px-1 group ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800/80 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
