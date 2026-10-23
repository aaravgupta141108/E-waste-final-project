import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { NotificationCenter } from './components/NotificationCenter';
import { PrakritiAssistant } from './components/PrakritiAssistant';
import { QRCodeModal } from './components/QRCodeModal';
import { StatutoryVerificationModal } from './components/StatutoryVerificationModal';
import { LiveChat } from './components/LiveChat';
import { LoginView } from './views/LoginView';
import { CitizenPortalView } from './views/CitizenPortalView';
import { CollectionConsoleView } from './views/CollectionConsoleView';
import { FactoryConsoleView } from './views/FactoryConsoleView';
import { AuditorComplianceView } from './views/AuditorComplianceView';
import { AdminMasterConsoleView } from './views/AdminMasterConsoleView';
import { CarbonImpactView } from './views/CarbonImpactView';
import { TrackingFleetGISView } from './views/TrackingFleetGISView';
import { LeaderboardView } from './views/LeaderboardView';
import { PushNotificationToast } from './components/PushNotificationToast';
import { DEMO_USERS, MOCK_DEVICES, SYSTEM_ALERTS, INITIAL_COMPLIANCE_REMINDERS } from './data/mockData';
import { ComplianceDeadlineReminder, DeviceItem, OperatorIntervention, Role, SystemAlert, UserProfile } from './types';

export default function App() {
  // Launch login page first by default
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>('citizen');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data State
  const [devices, setDevices] = useState<DeviceItem[]>(MOCK_DEVICES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(SYSTEM_ALERTS);
  const [reminders, setReminders] = useState<ComplianceDeadlineReminder[]>(INITIAL_COMPLIANCE_REMINDERS);
  const [activePushNotification, setActivePushNotification] = useState<{
    title: string;
    message: string;
    quarter: string;
    priority: string;
    deadline: string;
  } | null>(null);

  // Theme state: 'dark' vs 'compliance-light' (high-contrast daylight regulatory audit mode)
  const [theme, setTheme] = useState<'dark' | 'compliance-light'>('dark');

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'compliance-light') {
        document.documentElement.classList.add('compliance-mode');
        document.body.classList.add('compliance-mode');
      } else {
        document.documentElement.classList.remove('compliance-mode');
        document.body.classList.remove('compliance-mode');
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'compliance-light' : 'dark'));
  };

  // Modals & Drawers State
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [targetQrDeviceId, setTargetQrDeviceId] = useState<string | null>(null);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [targetChatCaseId, setTargetChatCaseId] = useState<string | null>(null);

  const handleOpenQrModal = (deviceId?: string) => {
    setTargetQrDeviceId(deviceId || null);
    setIsQrModalOpen(true);
  };

  const handleOpenChat = (caseId?: string) => {
    setTargetChatCaseId(caseId || null);
    setIsChatOpen(true);
  };

  // User and Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.citizen);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  // Role Switcher
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    setCurrentUser(DEMO_USERS[newRole]);
    setIsNewUser(false);
    setActiveTab('dashboard');
  };

  // Switch to clean New Citizen with 0 devices
  const handleSwitchToNewCitizen = (customName?: string) => {
    const newUser: UserProfile = {
      id: `USR-NEW-${Date.now().toString().slice(-4)}`,
      name: customName || 'New Citizen Consignor',
      email: 'citizen.new@ewaste.gov.in',
      mobile: '+91 98000 12345',
      role: 'citizen',
      organization: 'Individual Citizen Network',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      state: 'Delhi NCR',
      city: 'New Delhi',
      pincode: '110001',
      upiId: ''
    };
    setCurrentRole('citizen');
    setCurrentUser(newUser);
    setIsNewUser(true);
    setActiveTab('dashboard');
  };

  // Login handler with support for custom new user profile
  const handleLogin = (role: Role, customUser?: UserProfile, asNewUser: boolean = false) => {
    setCurrentRole(role);
    if (customUser) {
      setCurrentUser(customUser);
    } else {
      setCurrentUser(DEMO_USERS[role]);
    }
    setIsNewUser(asNewUser);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Device state mutations
  const handleUpdateDeviceStatus = (
    deviceId: string,
    newStatus: DeviceItem['status'],
    extraData?: Partial<DeviceItem>
  ) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          return {
            ...d,
            status: newStatus,
            updatedAt: new Date().toLocaleString(),
            ...(extraData || {})
          };
        }
        return d;
      })
    );
  };

  const handleRegisterDevice = (deviceData: Partial<DeviceItem>) => {
    const payout = deviceData.payoutAmount || 1500;
    const co2 = deviceData.co2SavedKg || (deviceData.category === 'Smartphone' ? 58 : deviceData.category === 'Laptop' ? 245 : 120);
    const age = deviceData.deviceAgeYears || 2.2;
    const designCap =
      deviceData.category === 'Smartphone'
        ? 4500
        : deviceData.category === 'Laptop'
        ? 4800
        : deviceData.category === 'Lithium Battery Pack'
        ? 100000
        : 3200;
    const estHealth = Math.max(20, Math.min(100, Math.round(100 - age * 7.4)));

    const newDevice: DeviceItem = {
      id: deviceData.id || `BHW-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.mobile,
      category: deviceData.category || 'Smartphone',
      brand: deviceData.brand || 'Generic',
      model: deviceData.model || 'Standard',
      serialNumber: deviceData.serialNumber || `SN-${Date.now()}`,
      imei: deviceData.imei,
      condition: deviceData.condition || 'working',
      status: 'REGISTERED',
      intakeWeightKg: deviceData.intakeWeightKg || 0.3,
      estimatedScrapValue: deviceData.estimatedScrapValue || 450,
      resaleValue: deviceData.resaleValue || 2000,
      payoutAmount: payout,
      payoutMethod: 'UPI',
      city: currentUser.city,
      state: currentUser.state,
      hubLocation: 'National Hub Sector 62 / Connaught Place',
      registeredAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      intakeImageUrl:
        deviceData.intakeImageUrl ||
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
      batteryPresent: deviceData.batteryPresent ?? true,
      co2SavedKg: co2,
      deviceAgeYears: age,
      batteryDecayModel: {
        designCapacityMah: designCap,
        estimatedRemainingCapacityMah: Math.round((designCap * estHealth) / 100),
        healthPct: estHealth,
        estimatedCycles: Math.round(age * 220),
        decayModelRate: '7.4% / yr Arrhenius Decay',
        status: estHealth >= 80 ? 'Optimal' : estHealth >= 60 ? 'Normal Aging' : 'Degraded',
        secondLifeSuitability: estHealth >= 65 ? 'Eligible for Solar BESS stationary cascade' : 'Direct hydrometallurgical refining'
      },
      pickupInfo: deviceData.pickupInfo || {
        pickupId: `PKP-IND-${Date.now().toString().slice(-6)}`,
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM - 01:00 PM',
        pickupAddress: `${currentUser.city || 'Connaught Place'}, ${currentUser.state || 'Delhi NCR'}`,
        pincode: currentUser.pincode || '110001',
        assignedCollectorName: 'Vikram Singh (CPCB Badge #COL-882)',
        collectorPhone: '+91 98112 44910',
        collectorVehicleNumber: 'DL-01-EV-4491 (Green Corridor EV)',
        status: 'Scheduled',
        reachesEngineerEta: 'Estimated handover to Hub Engineer: Tomorrow 02:30 PM',
        engineerName: 'Rajesh Verma (ENG-COL-104)',
        hubLocation: 'CPCB Certified Hub #04 - Connaught Place',
        currentStageDescription: 'Doorstep pickup booked. Collection Engineer assigned with GPS-monitored electric van.'
      },
      greenPointsEarned: Math.round(payout * 0.12) + 150,
      carbonCreditsEarnedKg: co2,
      financialBenefits: {
        upiPayoutInr: payout,
        eprSubsidyBonusInr: 350,
        greenTaxRebateInr: 200,
        dataSanitizationSavingsInr: 1200,
        totalBenefitsInr: payout + 1750
      }
    };

    setDevices((prev) => [newDevice, ...prev]);

    // Update current user's registered device count and green points
    setCurrentUser((prev) => ({
      ...prev,
      registeredDevicesCount: (prev.registeredDevicesCount || 0) + 1,
      totalGreenPoints: (prev.totalGreenPoints || 0) + Math.round(payout * 0.12) + 150,
      totalCarbonCreditsKg: (prev.totalCarbonCreditsKg || 0) + co2,
      totalFinancialBenefitsInr: (prev.totalFinancialBenefitsInr || 0) + payout + 1750
    }));
  };

  const handleConfirmDetails = (deviceId: string) => {
    handleUpdateDeviceStatus(deviceId, 'DETAILS_CONFIRMED');
  };

  const handleAcknowledgePayment = (deviceId: string) => {
    handleUpdateDeviceStatus(deviceId, 'PAYMENT_ACKNOWLEDGED', {
      payoutAcknowledgedAt: new Date().toLocaleString()
    });
  };

  // 10-Stage Statutory Lifecycle advancement
  const LIFECYCLE_SEQUENCE: DeviceItem['status'][] = [
    'REGISTERED',
    'DETAILS_CONFIRMED',
    'WIPING',
    'WIPE_VERIFIED',
    'PAYMENT_SENT',
    'PAYMENT_ACKNOWLEDGED',
    'READY_FOR_DISPATCH',
    'FACTORY_INSPECTION',
    'RECYCLED',
    'CERTIFIED'
  ];

  const handleAdvanceDeviceStage = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const currentIdx = LIFECYCLE_SEQUENCE.indexOf(d.status);
          if (currentIdx !== -1 && currentIdx < LIFECYCLE_SEQUENCE.length - 1) {
            const nextStatus = LIFECYCLE_SEQUENCE[currentIdx + 1];
            const extra: Partial<DeviceItem> = {
              updatedAt: new Date().toLocaleString()
            };
            if (nextStatus === 'WIPING' || nextStatus === 'WIPE_VERIFIED') {
              extra.wipeRecord = {
                id: `WIPE-${d.id.slice(-4)}`,
                deviceId: d.id,
                method: 'Cryptographic Purge & Multi-Pass Overwrite',
                standard: 'NIST SP 800-88 Rev. 2',
                toolName: 'BharatScrub Secure Enterprise',
                toolVersion: 'v4.2.1-IND',
                startTime: new Date(Date.now() - 1800000).toLocaleString(),
                endTime: new Date().toLocaleString(),
                status: 'Pass',
                verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                recoverySampleTest: 'Passed (0 sectors recoverable)',
                energyKwh: 0.045,
                engineerName: 'Rajesh Verma (ENG-COL-104)',
                videoProofUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
                notes: 'NIST SP 800-88 cryptographic key zeroization complete.'
              };
            }
            if (nextStatus === 'PAYMENT_SENT') {
              extra.payoutTxnRef = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/HDFC`;
              extra.payoutSentAt = new Date().toLocaleString();
            }
            if (nextStatus === 'CERTIFIED') {
              extra.certificateId = `CPCB-CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
              extra.certificateHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
            }
            return {
              ...d,
              status: nextStatus,
              ...extra
            };
          }
        }
        return d;
      })
    );
  };

  const handleAddOperatorIntervention = (deviceId: string, intervention: OperatorIntervention) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const currentInterventions = d.interventions || [];
          return {
            ...d,
            interventions: [intervention, ...currentInterventions]
          };
        }
        return d;
      })
    );
  };

  const handleBulkImportDevices = (importedItems: Partial<DeviceItem>[]) => {
    const newItems: DeviceItem[] = importedItems.map((item, idx) => ({
      id: item.id || `BHW-BULK-${Date.now().toString().slice(-4)}-${idx + 1}`,
      userId: item.userId || currentUser.id,
      userName: item.userName || currentUser.name,
      userPhone: item.userPhone || currentUser.mobile,
      category: item.category || 'PCB & Component Board',
      brand: item.brand || 'Enterprise OEM',
      model: item.model || 'Server Node',
      serialNumber: item.serialNumber || `SRV-${Date.now()}-${idx}`,
      condition: item.condition || 'not_booting',
      status: 'REGISTERED',
      intakeWeightKg: item.intakeWeightKg || 1.2,
      estimatedScrapValue: item.estimatedScrapValue || 800,
      resaleValue: item.resaleValue || 0,
      payoutAmount: item.payoutAmount || 800,
      payoutMethod: 'Bank Transfer',
      city: currentUser.city,
      state: currentUser.state,
      hubLocation: currentUser.organization || 'Central E-Waste Hub',
      registeredAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      intakeImageUrl:
        item.intakeImageUrl ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      batteryPresent: item.batteryPresent ?? false,
      co2SavedKg: item.co2SavedKg || 120
    }));

    setDevices((prev) => [...newItems, ...prev]);
  };

  const handleResolveFlag = (deviceId: string, adminNote?: string) => {
    handleUpdateDeviceStatus(deviceId, 'ACCEPTED', {
      flagReason: undefined,
      flagNotes: `Resolved by Master Admin with note: ${adminNote || 'Approved'}`
    });
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const handleAddReminder = (newReminder: ComplianceDeadlineReminder) => {
    setReminders((prev) => [newReminder, ...prev]);

    // Trigger floating push toast
    setActivePushNotification({
      title: newReminder.title,
      message: `Statutory reminder active for ${newReminder.filingType}. Alert triggers ${newReminder.leadTimeDays} days prior to deadline.`,
      quarter: newReminder.quarter,
      priority: newReminder.priority,
      deadline: newReminder.deadlineDate
    });

    // Add alert to NotificationCenter list so bell counter increments!
    const newAlert: SystemAlert = {
      id: `ALT-REM-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'cpcb_deadline',
      title: newReminder.title,
      message: `Statutory deadline configured for ${newReminder.deadlineDate} (${newReminder.filingType}). Lead time: ${newReminder.leadTimeDays} days.`,
      severity: newReminder.priority === 'critical' ? 'critical' : newReminder.priority === 'high' ? 'high' : 'medium',
      resolved: false,
      linkToTab: 'compliance'
    };
    setAlerts((prev) => [newAlert, ...prev]);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newReminder.title, {
          body: `Deadline: ${newReminder.deadlineDate} (${newReminder.filingType})`
        });
      } catch (e) {}
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTriggerPushNotification = (rem: ComplianceDeadlineReminder) => {
    setActivePushNotification({
      title: `Urgent Filing Notice: ${rem.title}`,
      message: `${rem.notes} Report must be filed on the CPCB EPR portal by ${rem.deadlineDate}.`,
      quarter: rem.quarter,
      priority: rem.priority,
      deadline: rem.deadlineDate
    });

    const newAlert: SystemAlert = {
      id: `ALT-REM-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'cpcb_deadline',
      title: `Impending Deadline: ${rem.title}`,
      message: `Quarterly filing due on ${rem.deadlineDate}. Assigned to ${rem.assignedOfficer}.`,
      severity: rem.priority === 'critical' ? 'critical' : 'high',
      resolved: false,
      linkToTab: 'compliance'
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // If not logged in, show Login page
  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        onExplorePublicPortal={() => {
          setIsLoggedIn(true);
          setCurrentRole('citizen');
          setActiveTab('carbon');
        }}
      />
    );
  }

  // Filter devices visible to Citizen (New user starts with 0 devices)
  const visibleDevices =
    currentRole === 'citizen'
      ? isNewUser
        ? devices.filter((d) => d.userId === currentUser.id)
        : devices.filter((d) => d.userId === currentUser.id || d.userId === 'USR-IND-8821')
      : devices;

  const handleSyncOfflineDevice = (newDeviceData: Partial<DeviceItem>) => {
    handleRegisterDevice(newDeviceData);
    const newAlert: SystemAlert = {
      id: `ALT-SYNC-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type: 'data_integrity',
      title: 'Offline Field Records Synced',
      message: `Consignment ${newDeviceData.brand || 'Device'} ${newDeviceData.model || ''} logged in offline field mode was uploaded to National Hub.`,
      severity: 'low',
      resolved: false,
      linkToTab: 'dashboard'
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const unreadAlertCount = alerts.filter((a) => !a.resolved).length;

  // Strict Role-Based Access Control definition
  const ROLE_ALLOWED_TABS: Record<Role, string[]> = {
    citizen: ['dashboard', 'carbon', 'leaderboard'],
    collection_engineer: ['dashboard', 'fleet', 'carbon'],
    factory_engineer: ['dashboard', 'fleet', 'carbon'],
    auditor: ['dashboard', 'fleet', 'compliance', 'carbon'],
    admin: ['dashboard', 'fleet', 'compliance', 'carbon', 'leaderboard']
  };

  const isTabAllowed = ROLE_ALLOWED_TABS[currentRole]?.includes(activeTab);

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onSwitchToNewCitizen={handleSwitchToNewCitizen}
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenStatutoryModal={() => setIsStatutoryModalOpen(true)}
        onOpenQrModal={() => handleOpenQrModal()}
        onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenChat={() => handleOpenChat()}
        onLogout={handleLogout}
        unreadAlertCount={unreadAlertCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSyncOfflineDevice={handleSyncOfflineDevice}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        className={`flex-1 w-full ${activeTab === 'fleet' ? 'max-w-[1720px] mx-auto px-2 sm:px-4 py-2' : 'max-w-7xl xl:max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'}`}
      >
        {/* Role-Based Access Gate if unauthorized tab is navigated */}
        {!isTabAllowed ? (
          <div role="region" aria-label="Restricted Module Access" className="p-8 sm:p-14 text-center rounded-2xl glass-panel space-y-4 max-w-xl mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Statutory Access Restriction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This module requires official statutory officer clearance (CPCB Auditor, Hub Logistics, or Apex Admin).
              Your active authenticated profile ({currentUser.name}) is signed in under <strong>{currentUser.role.replace('_', ' ').toUpperCase()}</strong>.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-900/30"
              >
                Return to My Authorized Console
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Router */}
            {activeTab === 'dashboard' && (
              <>
                {currentRole === 'citizen' && (
                  <CitizenPortalView
                    currentUser={currentUser}
                    devices={visibleDevices}
                    onRegisterDevice={handleRegisterDevice}
                    onConfirmDetails={handleConfirmDetails}
                    onUpdatePaymentPreference={(upiId) => {
                      currentUser.upiId = upiId;
                    }}
                    onAcknowledgePayment={handleAcknowledgePayment}
                    onOpenQrModal={handleOpenQrModal}
                    onOpenChat={handleOpenChat}
                    onAdvanceDeviceStage={handleAdvanceDeviceStage}
                  />
                )}

            {currentRole === 'collection_engineer' && (
              <CollectionConsoleView
                devices={devices}
                currentUser={currentUser}
                onUpdateDeviceStatus={handleUpdateDeviceStatus}
                onBulkImportDevices={handleBulkImportDevices}
              />
            )}

            {currentRole === 'factory_engineer' && (
              <FactoryConsoleView
                devices={devices}
                currentUser={currentUser}
                onUpdateDeviceStatus={handleUpdateDeviceStatus}
                onAddOperatorIntervention={handleAddOperatorIntervention}
              />
            )}

            {currentRole === 'auditor' && (
              <AuditorComplianceView
                currentUser={currentUser}
                devices={devices}
                onResolveFlag={(dId) => handleResolveFlag(dId)}
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onDeleteReminder={handleDeleteReminder}
                onTriggerPushNotification={handleTriggerPushNotification}
              />
            )}

            {currentRole === 'admin' && (
              <AdminMasterConsoleView
                currentUser={currentUser}
                devices={devices}
                onResolveFlag={handleResolveFlag}
              />
            )}
          </>
        )}

        {activeTab === 'fleet' && (
          <TrackingFleetGISView
            devices={devices}
            onSelectDevice={(dId) => {
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'carbon' && (
          <CarbonImpactView currentUser={currentUser} devices={devices} />
        )}

        {activeTab === 'compliance' && (
          <AuditorComplianceView
            currentUser={currentUser}
            devices={devices}
            onResolveFlag={(dId) => handleResolveFlag(dId)}
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onTriggerPushNotification={handleTriggerPushNotification}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}
          </>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="w-full max-w-7xl xl:max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Bharat E-Waste Hub • Central Pollution Control Board (CPCB) & MoEFCC Statutory Governance Node
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            NIST SP 800-88 Rev. 2 • IEEE 2883-2022 • DPDP Act 2023 Compliant
          </span>
        </div>
      </footer>

      {/* Interactive Global Modals */}
      <StatutoryVerificationModal
        isOpen={isStatutoryModalOpen}
        onClose={() => setIsStatutoryModalOpen(false)}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setTargetQrDeviceId(null);
        }}
        devices={devices}
        targetDeviceId={targetQrDeviceId}
        onSelectDevice={(dId) => {
          setTargetQrDeviceId(dId);
          setActiveTab('dashboard');
        }}
      />

      <PrakritiAssistant
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <LiveChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setTargetChatCaseId(null);
        }}
        currentRole={currentRole}
        currentUserName={currentUser.name}
        devices={devices}
        selectedCaseId={targetChatCaseId}
        onSelectCase={(caseId) => setTargetChatCaseId(caseId)}
      />

      {/* Push-style Notification Toast */}
      <PushNotificationToast
        activeNotification={activePushNotification}
        onDismiss={() => setActivePushNotification(null)}
        onOpenCalendar={() => {
          setActiveTab('compliance');
        }}
      />
    </div>
  );
}
