import React, { useState, useEffect } from 'react';
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
  Moon,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Role, UserProfile } from '../types';
import { getPendingOfflineDeviceLogs, syncOfflineLogs, OfflineDeviceRecord } from '../utils/offlineDb';

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
  onSyncOfflineDevice?: (device: Partial<any>) => void;
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
  onToggleTheme = () => {},
  onSyncOfflineDevice
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Network & Offline DB state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Monitor network connectivity and IndexedDB queue
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      handleTriggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    const updatePendingCount = async () => {
      try {
        const records = await getPendingOfflineDeviceLogs();
        setPendingOfflineCount(records.length);
      } catch {
        // IndexedDB not ready or error
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('offline-db-updated', updatePendingCount);
      updatePendingCount();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('offline-db-updated', updatePendingCount);
      }
    };
  }, []);

  const handleTriggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const { syncedCount } = await syncOfflineLogs((item) => {
        if (onSyncOfflineDevice) {
          onSyncOfflineDevice({
            id: `BHW-2026-${Date.now().toString().slice(-4)}`,
            category: item.category,
            brand: item.brand,
            model: item.model,
            serialNumber: item.serialNumber,
            condition: item.condition,
            status: 'REGISTERED',
            intakeWeightKg: item.intakeWeightKg,
            hubLocation: item.hubLocation,
            registeredAt: item.loggedAt,
            updatedAt: new Date().toLocaleString(),
            payoutAmount: 1800,
            payoutMethod: 'UPI'
          });
        }
      });
      const records = await getPendingOfflineDeviceLogs();
      setPendingOfflineCount(records.length);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

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

  // Strict Role-Based Access Control: only display tabs appropriate for the signed-in persona
  const ROLE_ALLOWED_TABS: Record<Role, string[]> = {
    citizen: ['dashboard', 'carbon', 'leaderboard'],
    collection_engineer: ['dashboard', 'fleet', 'carbon'],
    factory_engineer: ['dashboard', 'fleet', 'carbon'],
    auditor: ['dashboard', 'fleet', 'compliance', 'carbon'],
    admin: ['dashboard', 'fleet', 'compliance', 'carbon', 'leaderboard']
  };

  const allNavItems = [
    { id: 'dashboard', label: 'Console', icon: BarChart3 },
    { id: 'fleet', label: 'Tracking & Fleet Hub', icon: Truck },
    { id: 'carbon', label: 'Carbon Impact', icon: Leaf },
    { id: 'compliance', label: 'CPCB Compliance', icon: ShieldCheck },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award }
  ];

  // Filter navItems according to current authenticated role
  const navItems = allNavItems.filter((item) =>
    ROLE_ALLOWED_TABS[currentRole]?.includes(item.id)
  );

  return (
    <header role="banner" className="sticky top-0 z-40 w-full bg-slate-950/98 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5">
        
        {/* ROW 1: Brand & Subtitle (Left) + Offline Status, Utility Action Icons & Persona Switcher (Right) */}
        <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-slate-800/60 gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              aria-label="Bharat E-Waste Hub Home Dashboard"
              className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded-xl"
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Offline Connectivity & IndexedDB Sync Status Pill */}
            <div
              aria-live="polite"
              className={`h-7 px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition ${
                !isOnline || pendingOfflineCount > 0
                  ? 'bg-amber-950/40 text-amber-300 border-amber-600/50 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title={
                !isOnline
                  ? 'Offline Mode Active: Logging directly into IndexedDB'
                  : pendingOfflineCount > 0
                  ? `${pendingOfflineCount} records pending sync in IndexedDB`
                  : 'Online: Low-latency sync active'
              }
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden md:inline text-[10px] font-bold">Offline Field Mode</span>
                  <span className="md:hidden text-[10px]">Offline</span>
                  {pendingOfflineCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                      {pendingOfflineCount}
                    </span>
                  )}
                </>
              ) : pendingOfflineCount > 0 ? (
                <>
                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    aria-label={`Sync ${pendingOfflineCount} pending items from IndexedDB`}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="text-[10px]">Sync ({pendingOfflineCount})</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden md:inline text-[10px] text-slate-400">Field Sync Online</span>
                </>
              )}
            </div>

            {/* Verify Portal Button */}
            <button
              onClick={onOpenStatutoryModal}
              aria-label="Official Statutory Recycler and Certificate Verification"
              className="h-7 hidden md:flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Verify Portal</span>
            </button>

            {/* Quick Action Icons Cluster */}
            <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={onOpenQrModal}
                aria-label="Open Chain of Custody QR Scanner"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={onOpenAssistantModal}
                aria-label="Open Prakriti Virtual E-Waste Assistant"
                className="relative w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-950/40 transition group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </button>

              <button
                onClick={onOpenChat}
                aria-label="Open Live Operations Chat"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={onOpenNotifications}
                aria-label={`Notification Center, ${unreadAlertCount} unread alerts`}
                className="relative w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                {unreadAlertCount > 0 && (
                  <span
                    aria-live="polite"
                    className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-bold text-[8px] px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
                  >
                    {unreadAlertCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
                className="hidden sm:flex w-7 h-7 rounded-md items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
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
              aria-label={theme === 'compliance-light' ? 'Switch to Dark Ops Mode' : 'Switch to Daylight Audit Mode'}
              title={theme === 'compliance-light' ? 'Switch to Dark Ops Mode' : 'Switch to High-Contrast Daylight Audit Mode'}
              className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition border focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                theme === 'compliance-light'
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {theme === 'compliance-light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold text-amber-950">Daylight Audit</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline text-[11px] text-slate-300">Dark Ops</span>
                </>
              )}
            </button>

            {/* Authenticated Identity Display & Explicit Logout Button (No role switching permitted in logged-in state) */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                aria-label={`Signed in as ${currentUser.name}, role: ${roleLabels[currentRole].label}`}
                className={`h-7 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold border ${roleLabels[currentRole].color}`}
              >
                {roleLabels[currentRole].icon}
                <span className="text-[11px] font-semibold hidden sm:inline">
                  {roleLabels[currentRole].label}
                </span>
                <span className="text-[11px] font-semibold sm:hidden">
                  {roleLabels[currentRole].short}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/80 text-slate-300 font-mono hidden md:inline">
                  {currentUser.name}
                </span>
              </div>

              {/* Explicit Sign Out Button */}
              <button
                onClick={onLogout}
                aria-label="Sign out of Bharat E-Waste Hub"
                className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                title="Sign Out / Disconnect session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ROW 2: Navigation Tabs (Role-Filtered) */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-6 h-9"
        >
          <div role="tablist" aria-label="Portal Modules" className="flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onTabChange(item.id)}
                  className={`relative h-full flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap px-1 group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded-t ${
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
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            role="navigation"
            aria-label="Mobile Navigation"
            className="lg:hidden py-3 border-t border-slate-800/80 space-y-1"
          >
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
          </nav>
        )}
      </div>
    </header>
  );
};
