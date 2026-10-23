import React from 'react';
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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

  const roleLabels: Record<Role, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
    citizen: {
      label: 'Citizen / Consignor',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'Public Portal'
    },
    collection_engineer: {
      label: 'Collection Engineer',
      icon: <HardHat className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: 'Hub Logistics'
    },
    factory_engineer: {
      label: 'Factory Engineer',
      icon: <Factory className="w-3.5 h-3.5" />,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'Demanufacturing'
    },
    auditor: {
      label: 'CPCB / SPCB Auditor',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badge: 'Statutory Regulator'
    },
    admin: {
      label: 'Master Admin',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badge: 'MoEFCC Apex'
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Console', icon: BarChart3 },
    { id: 'fleet', label: 'Tracking & GIS', icon: Truck },
    { id: 'carbon', label: 'Carbon Impact', icon: Leaf },
    { id: 'compliance', label: 'CPCB Compliance', icon: ShieldCheck },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & National Emblem Accent */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                    BHARAT <span className="text-emerald-400">E-WASTE</span> HUB
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                    GOI • CPCB
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                  National Circular Economy & Data Erasure Registry
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utility Tools & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Statutory Verification Button */}
            <button
              onClick={onOpenStatutoryModal}
              title="Official Statutory Recycler & Certificate Verification"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify Portal</span>
            </button>

            {/* QR Scanner / Generator */}
            <button
              onClick={onOpenQrModal}
              title="Physical Bin & Chain of Custody QR Scanner"
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Prakriti AI Assistant */}
            <button
              onClick={onOpenAssistantModal}
              title="Prakriti Virtual E-Waste Assistant"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-600 transition group"
            >
              <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Real-time Field Chat */}
            <button
              onClick={onOpenChat}
              title="Live Operational Chat"
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </button>

            {/* Notification Center */}
            <button
              onClick={onOpenNotifications}
              title="Real-Time Alerts & Fleet Congestion Notifications"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] px-1 py-0.2 rounded-full min-w-[16px] text-center">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen View'}
              className="hidden sm:flex p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Global Theme Toggle: High-Contrast Compliance Mode (Light) vs System Dark */}
            <button
              onClick={onToggleTheme}
              title={
                theme === 'compliance-light'
                  ? 'Switch to System Dark Mode'
                  : 'Switch to High-Contrast Compliance Mode (Light theme for daytime audits)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                theme === 'compliance-light'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {theme === 'compliance-light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span className="hidden xl:inline text-[11px] font-bold text-amber-800">Compliance Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden xl:inline text-[11px] text-slate-300">Audit Mode</span>
                </>
              )}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${roleLabels[currentRole].color}`}
              >
                {roleLabels[currentRole].icon}
                <span className="hidden sm:inline font-semibold">{roleLabels[currentRole].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl py-2 z-50 backdrop-blur-xl"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role Persona (1-Click Test)
                    </p>
                  </div>
                  {(Object.keys(roleLabels) as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => onRoleChange(r)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                        currentRole === r
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {roleLabels[r].icon}
                        <span>{roleLabels[r].label}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {roleLabels[r].badge}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1 px-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onOpenStatutoryModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-950/20 border border-cyan-800/40"
            >
              <Search className="w-4 h-4" />
              <span>Verify Official Recyclers & Certificates</span>
            </button>
            <button
              onClick={() => {
                toggleFullscreen();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-emerald-400" /> : <Maximize className="w-4 h-4" />}
              <span>{isFullscreen ? 'Exit Fullscreen Mode' : 'Toggle Fullscreen Mode'}</span>
            </button>
            <button
              onClick={() => {
                onToggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                {theme === 'compliance-light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Theme: {theme === 'compliance-light' ? 'High-Contrast Compliance Mode' : 'System Dark Mode'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                {theme === 'compliance-light' ? 'LIGHT' : 'DARK'}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
