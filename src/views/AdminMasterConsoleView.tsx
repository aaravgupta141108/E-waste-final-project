import React, { useState } from 'react';
import {
  ShieldAlert,
  Settings,
  Scale,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Database,
  RefreshCw,
  Save,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Truck,
  ArrowRight,
  Sliders,
  Send,
  Zap,
  Layers,
  Building2,
  MapPin,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { DeviceItem, UserProfile } from '../types';
import { NATIONAL_STATS, RATE_TABLE } from '../data/mockData';

interface AdminMasterConsoleViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
  onResolveFlag: (deviceId: string, adminNote: string) => void;
}

// Historical + 30/60/90 Day Forecasted Intake Data (Metric Tonnes)
const INTAKE_TIMELINE_DATA = [
  { month: 'May 2026', historicalIntakeMT: 310, forecastedSurgeMT: null, confidenceUpper: null, confidenceLower: null },
  { month: 'Jun 2026', historicalIntakeMT: 335, forecastedSurgeMT: null, confidenceUpper: null, confidenceLower: null },
  { month: 'Jul 2026', historicalIntakeMT: 350, forecastedSurgeMT: null, confidenceUpper: null, confidenceLower: null },
  { month: 'Aug 2026', historicalIntakeMT: 378, forecastedSurgeMT: null, confidenceUpper: null, confidenceLower: null },
  { month: 'Sep 2026', historicalIntakeMT: 412, forecastedSurgeMT: null, confidenceUpper: null, confidenceLower: null },
  { month: 'Oct 2026 (Now)', historicalIntakeMT: 465, forecastedSurgeMT: 465, confidenceUpper: 465, confidenceLower: 465 },
  { month: 'Nov 2026 (+30d)', historicalIntakeMT: null, forecastedSurgeMT: 540, confidenceUpper: 575, confidenceLower: 505 },
  { month: 'Dec 2026 (+60d)', historicalIntakeMT: null, forecastedSurgeMT: 615, confidenceUpper: 660, confidenceLower: 570 },
  { month: 'Jan 2027 (+90d)', historicalIntakeMT: null, forecastedSurgeMT: 690, confidenceUpper: 750, confidenceLower: 630 }
];

// Regional Hub Capacity vs Projected Intake Surge
interface HubForecast {
  hubId: string;
  name: string;
  city: string;
  state: string;
  ratedCapacityMT: number;
  currentInventoryMT: number;
  projected30dMT: number;
  projected60dMT: number;
  projected90dMT: number;
  surgeDeltaPct: number;
  status: 'SURGE_OVERFLOW_RISK' | 'HIGH_LOAD' | 'BALANCED' | 'CAPACITY_GAP';
  riskDescription: string;
  recommendedAction: string;
}

const REGIONAL_HUB_FORECASTS: HubForecast[] = [
  {
    hubId: 'HUB-DEL-01',
    name: 'Delhi NCR (Okhla Apex Facility)',
    city: 'New Delhi',
    state: 'Delhi NCR',
    ratedCapacityMT: 250,
    currentInventoryMT: 220,
    projected30dMT: 298,
    projected60dMT: 330,
    projected90dMT: 365,
    surgeDeltaPct: 35.5,
    status: 'SURGE_OVERFLOW_RISK',
    riskDescription: 'Imminent warehouse overflow: 119% of rated capacity projected due to post-festival consumer trade-ins.',
    recommendedAction: 'Trigger inter-hub balancing transit order to Jaipur/Chandigarh backup storage.'
  },
  {
    hubId: 'HUB-BLR-02',
    name: 'Bengaluru (Peenya Industrial Cluster)',
    city: 'Bengaluru',
    state: 'Karnataka',
    ratedCapacityMT: 300,
    currentInventoryMT: 245,
    projected30dMT: 288,
    projected60dMT: 315,
    projected90dMT: 340,
    surgeDeltaPct: 17.5,
    status: 'HIGH_LOAD',
    riskDescription: 'High load forecast at 96% capacity from enterprise Q3 server rack decommissioning.',
    recommendedAction: 'Extend double-shift NIST cryptographic sanitization docks to expedite outbound dispatch.'
  },
  {
    hubId: 'HUB-MUM-03',
    name: 'Mumbai (Taloja Mid-Zone)',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    ratedCapacityMT: 280,
    currentInventoryMT: 215,
    projected30dMT: 258,
    projected60dMT: 275,
    projected90dMT: 290,
    surgeDeltaPct: 20.0,
    status: 'BALANCED',
    riskDescription: 'Steady throughput at 92% capacity. Refineries clearing shredder inventory on cadence.',
    recommendedAction: 'Maintain standard dispatch schedules; monitor sea freight battery container lots.'
  },
  {
    hubId: 'HUB-HYD-04',
    name: 'Hyderabad (Cherlapally Green Hub)',
    city: 'Hyderabad',
    state: 'Telangana',
    ratedCapacityMT: 220,
    currentInventoryMT: 182,
    projected30dMT: 198,
    projected60dMT: 210,
    projected90dMT: 225,
    surgeDeltaPct: 8.8,
    status: 'BALANCED',
    riskDescription: 'Healthy 90% utilization. Good balance between citizen collection and PCB smelting.',
    recommendedAction: 'No intervention required. Standard regulatory logs active.'
  },
  {
    hubId: 'HUB-CHN-05',
    name: 'Chennai (Ambattur Industrial Hub)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    ratedCapacityMT: 200,
    currentInventoryMT: 112,
    projected30dMT: 96,
    projected60dMT: 90,
    projected90dMT: 85,
    surgeDeltaPct: -14.3,
    status: 'CAPACITY_GAP',
    riskDescription: 'Intake Deficit / Capacity Gap: Facility operating at only 48% capacity due to port warehouse informal diversions.',
    recommendedAction: 'Boost citizen buyback incentive rate by +12% and deploy mobile collection vans.'
  },
  {
    hubId: 'HUB-KOL-06',
    name: 'Kolkata (Kasba Regional Hub)',
    city: 'Kolkata',
    state: 'West Bengal',
    ratedCapacityMT: 180,
    currentInventoryMT: 74,
    projected30dMT: 55,
    projected60dMT: 50,
    projected90dMT: 45,
    surgeDeltaPct: -25.7,
    status: 'CAPACITY_GAP',
    riskDescription: 'Critical Intake Deficit: Facility underutilized at 30% capacity. Severe informal market leakage in East zone.',
    recommendedAction: 'Issue SPCB Rule 14 formalization directive and increase kabadiwala digital aggregator bounties.'
  }
];

export const AdminMasterConsoleView: React.FC<AdminMasterConsoleViewProps> = ({
  currentUser,
  devices,
  onResolveFlag
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'predictive_analytics' | 'governance_thresholds'>('predictive_analytics');
  const [forecastHorizon, setForecastHorizon] = useState<'30d' | '60d' | '90d'>('30d');
  const [selectedHub, setSelectedHub] = useState<HubForecast>(REGIONAL_HUB_FORECASTS[0]);

  // Governance parameters state
  const [weightThresholdPct, setWeightThresholdPct] = useState('10');
  const [weightThresholdGrams, setWeightThresholdGrams] = useState('100');
  const [dailyPayoutCap, setDailyPayoutCap] = useState('50000');
  const [storageAlertDays, setStorageAlertDays] = useState('150');
  const [selectedFlaggedId, setSelectedFlaggedId] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [balancingFleetDispatched, setBalancingFleetDispatched] = useState<string | null>(null);

  const flaggedDevices = devices.filter((d) => d.status === 'FLAGGED' || d.status === 'HOLD');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConfirmResolve = (deviceId: string) => {
    if (!resolutionNote.trim()) {
      alert('Statutory Rule: You must enter an administrative resolution note.');
      return;
    }
    onResolveFlag(deviceId, resolutionNote);
    setSelectedFlaggedId('');
    setResolutionNote('');
    alert('Discrepancy resolved by Master Admin. Device returned to processing line.');
  };

  const handleDispatchBalancingFleet = (hub: HubForecast) => {
    setBalancingFleetDispatched(hub.hubId);
    setTimeout(() => setBalancingFleetDispatched(null), 4000);
  };

  // Helper for dynamic bar chart fill
  const getHubBarColor = (hub: HubForecast) => {
    if (hub.status === 'SURGE_OVERFLOW_RISK') return '#f43f5e'; // rose-500
    if (hub.status === 'HIGH_LOAD') return '#f59e0b'; // amber-500
    if (hub.status === 'CAPACITY_GAP') return '#8b5cf6'; // purple-500
    return '#10b981'; // emerald-500
  };

  const getProjectedMetric = (hub: HubForecast) => {
    if (forecastHorizon === '30d') return hub.projected30dMT;
    if (forecastHorizon === '60d') return hub.projected60dMT;
    return hub.projected90dMT;
  };

  const surgeCount = REGIONAL_HUB_FORECASTS.filter((h) => h.status === 'SURGE_OVERFLOW_RISK').length;
  const gapCount = REGIONAL_HUB_FORECASTS.filter((h) => h.status === 'CAPACITY_GAP').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-red-950/60 border border-rose-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Administration • MoEFCC Apex Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            National E-Waste Hub Executive Command Console
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Predictive machine learning forecasting of regional inventory surges &amp; gaps, statutory discrepancy resolution, and national EPR weight calibration thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Database Status:</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYNCHRONIZED (INDIA-CENTRAL)
          </span>
        </div>
      </div>

      {/* Admin Mode Switcher Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('predictive_analytics')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeAdminTab === 'predictive_analytics'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Predictive Hub Inventory &amp; Surge Forecast Dashboard</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            ML Engine
          </span>
        </button>
        <button
          onClick={() => setActiveAdminTab('governance_thresholds')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeAdminTab === 'governance_thresholds'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Governance Thresholds &amp; Discrepancy Queue ({flaggedDevices.length})</span>
        </button>
      </div>

      {/* TAB 1: PREDICTIVE INVENTORY SURGE & GAP FORECASTING DASHBOARD */}
      {activeAdminTab === 'predictive_analytics' && (
        <div className="space-y-6">
          {/* Key Executive Surge Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-xs">National Projected Surge (+30d)</span>
              <div className="text-xl font-bold text-white mt-1 font-mono">
                540 <span className="text-xs font-normal text-slate-400">MT/month</span>
              </div>
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+16.1% over current intake</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40">
              <span className="text-slate-400 text-xs">Critical Overflow Surge Warning</span>
              <div className="text-xl font-bold text-rose-400 mt-1 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>{surgeCount} Regional Hub</span>
              </div>
              <span className="text-[10px] text-rose-400/80">Delhi NCR (&gt;118% Rated Capacity)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/40">
              <span className="text-slate-400 text-xs">Intake Deficit / Capacity Gaps</span>
              <div className="text-xl font-bold text-purple-400 mt-1 flex items-center gap-1.5 font-mono">
                <TrendingDown className="w-5 h-5 text-purple-400" />
                <span>{gapCount} Regional Hubs</span>
              </div>
              <span className="text-[10px] text-purple-400/80">Kolkata &amp; Chennai Underutilized</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/40">
              <span className="text-slate-400 text-xs">Recommended Balancing Shift</span>
              <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                48.0 <span className="text-xs font-normal text-slate-400">MT</span>
              </div>
              <span className="text-[10px] text-emerald-400/80">Inter-State Transit Balancing</span>
            </div>
          </div>

          {/* Main Forecast Chart: Historical vs Forecasted Surge Curve */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Historical Device Intake vs. Forecasted Inventory Surge Curve
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    ARIMA + PROPHET MODEL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Time-series projection derived from historical weighbridge logs, seasonal festive gadget cycles, and statutory corporate IT retirement waves.
                </p>
              </div>

              {/* Forecast Horizon Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
                <span className="text-slate-500 text-[10px] px-2 font-mono uppercase">Horizon:</span>
                <button
                  onClick={() => setForecastHorizon('30d')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    forecastHorizon === '30d' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setForecastHorizon('60d')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    forecastHorizon === '60d' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  60 Days
                </button>
                <button
                  onClick={() => setForecastHorizon('90d')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    forecastHorizon === '90d' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>

            {/* Recharts Area / Line Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={INTAKE_TIMELINE_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" MT" domain={[200, 800]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                    }}
                    formatter={((val: any, name?: any) => {
                      if (!val) return ['--', name || ''];
                      return [`${val} MT`, name || ''];
                    }) as any}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }} />
                  <ReferenceLine
                    x="Oct 2026 (Now)"
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Current Date', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                  />
                  {/* Historical Intake Line */}
                  <Line
                    type="monotone"
                    dataKey="historicalIntakeMT"
                    name="Historical Verified Intake (MT)"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 4 }}
                  />
                  {/* Forecasted Surge Curve */}
                  <Line
                    type="monotone"
                    dataKey="forecastedSurgeMT"
                    name="Projected Inventory Surge (MT)"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    dot={{ fill: '#f43f5e', r: 5 }}
                  />
                  {/* Upper/Lower Confidence Band */}
                  <Area
                    type="monotone"
                    dataKey="confidenceUpper"
                    name="95% Confidence Upper Bound"
                    fill="#f43f5e"
                    fillOpacity={0.12}
                    stroke="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceLower"
                    name="95% Confidence Lower Bound"
                    fill="#0f172a"
                    fillOpacity={0.4}
                    stroke="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Primary Surge Driver #1</span>
                <strong className="text-white">Festive Consumer Device Upgrades</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Over 4.8 million smartphones &amp; laptops replaced nationwide in Q3 festive sale cycle.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Primary Surge Driver #2</span>
                <strong className="text-amber-300">Corporate Fiscal End Asset Retirement</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Enterprise 3-year refresh contracts releasing bulk server and PCB lots to hubs.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Primary Surge Driver #3</span>
                <strong className="text-rose-400">Battery Decaying Cascades</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  First-gen EV two-wheeler battery pack retirements increasing by 54% month-over-month.
                </p>
              </div>
            </div>
          </div>

          {/* Hub Capacity vs Projected Intake Bar Chart & Interactive Hub Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Hub Utilization Chart */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Regional Hub Storage vs. {forecastHorizon.toUpperCase()} Forecasted Intake
                  </h4>
                  <p className="text-xs text-slate-400">
                    Comparing rated physical warehouse capacity against incoming intake surge.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  RED = OVERFLOW &gt;100%
                </span>
              </div>

              <div className="h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={REGIONAL_HUB_FORECASTS}
                    margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        setSelectedHub(e.activePayload[0].payload as HubForecast);
                      }
                    }}
                  >
                    <XAxis
                      dataKey="city"
                      stroke="#64748b"
                      fontSize={10}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={10} unit=" MT" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                      formatter={((val: any, name?: any) => [`${val} MT`, name || '']) as any}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                    <Bar
                      dataKey="ratedCapacityMT"
                      name="Rated Storage Capacity (MT)"
                      fill="#334155"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={
                        forecastHorizon === '30d'
                          ? 'projected30dMT'
                          : forecastHorizon === '60d'
                          ? 'projected60dMT'
                          : 'projected90dMT'
                      }
                      name={`Projected ${forecastHorizon.toUpperCase()} Intake (MT)`}
                      radius={[4, 4, 0, 0]}
                    >
                      {REGIONAL_HUB_FORECASTS.map((entry, index) => (
                        <Cell key={`hub-cell-${index}`} fill={getHubBarColor(entry)} cursor="pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>Surge Overflow (&gt;100% capacity)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>High Load (90-99%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Balanced (70-89%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500" />
                  <span>Capacity Gap / Deficit (&lt;60%)</span>
                </span>
              </div>
            </div>

            {/* Selected Hub Deep-Dive & Administrative Balancing Actions */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Hub Forecast Inspection</span>
                  <h4 className="text-sm font-bold text-white">{selectedHub.name}</h4>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedHub.status === 'SURGE_OVERFLOW_RISK'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedHub.status === 'HIGH_LOAD'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : selectedHub.status === 'CAPACITY_GAP'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {selectedHub.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Hub Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-sans">Rated Capacity</span>
                  <div className="text-white font-bold">{selectedHub.ratedCapacityMT} MT</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-sans">Current In-Warehouse</span>
                  <div className="text-cyan-400 font-bold">{selectedHub.currentInventoryMT} MT</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-sans">
                    Projected {forecastHorizon.toUpperCase()} Surge
                  </span>
                  <div
                    className={`font-bold ${
                      selectedHub.status === 'SURGE_OVERFLOW_RISK'
                        ? 'text-rose-400'
                        : selectedHub.status === 'CAPACITY_GAP'
                        ? 'text-purple-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {getProjectedMetric(selectedHub)} MT ({selectedHub.surgeDeltaPct > 0 ? `+${selectedHub.surgeDeltaPct}%` : `${selectedHub.surgeDeltaPct}%`})
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-sans">Warehouse Load Ratio</span>
                  <div
                    className={`font-bold ${
                      (getProjectedMetric(selectedHub) / selectedHub.ratedCapacityMT) >= 1
                        ? 'text-rose-400'
                        : 'text-white'
                    }`}
                  >
                    {((getProjectedMetric(selectedHub) / selectedHub.ratedCapacityMT) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Risk Description */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <span className="text-slate-400 font-bold block text-[11px]">Intake Anomaly Diagnosis:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedHub.riskDescription}
                </p>
                <div className="pt-1 text-[11px] text-amber-300 font-medium">
                  Recommendation: {selectedHub.recommendedAction}
                </div>
              </div>

              {/* Executive Admin Actions */}
              <div className="pt-2 space-y-2">
                {selectedHub.status === 'SURGE_OVERFLOW_RISK' && (
                  <button
                    onClick={() => handleDispatchBalancingFleet(selectedHub)}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Authorize Inter-Hub Balancing Transit Fleet</span>
                  </button>
                )}

                {selectedHub.status === 'CAPACITY_GAP' && (
                  <button
                    onClick={() => alert(`Dynamic Buyback Tariff raised +15% for ${selectedHub.name} to stimulate citizen intake!`)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Boost Regional Dynamic Buyback Tariff (+15%)</span>
                  </button>
                )}

                <button
                  onClick={() => alert(`MoEFCC Advisory Dossier exported for ${selectedHub.name}!`)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Regional Inventory Forecast Dossier</span>
                </button>

                {balancingFleetDispatched === selectedHub.hubId && (
                  <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Order Authorized! 40 MT balancing convoy dispatched from {selectedHub.city} to satellite depots.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM GOVERNANCE THRESHOLDS & DISCREPANCY QUEUE */}
      {activeAdminTab === 'governance_thresholds' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Statutory Parameters & Thresholds */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">System Governance Thresholds</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SECTION 15 EPA ENFORCED</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Weight Discrepancy Tolerance (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weightThresholdPct}
                      onChange={(e) => setWeightThresholdPct(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimum Weight Floor (g)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weightThresholdGrams}
                      onChange={(e) => setWeightThresholdGrams(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">grams</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Citizen Daily Payout Cap (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={dailyPayoutCap}
                      onChange={(e) => setDailyPayoutCap(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">₹/day</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Statutory Storage Warning (Days)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={storageAlertDays}
                      onChange={(e) => setStorageAlertDays(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">days</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Per E-Waste Rules 2022, storage exceeding 180 days attracts environmental compensation penalties unless approved for specific recycling campaigns.
              </p>

              <div className="flex items-center justify-between pt-2">
                {isSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Parameters synchronized to national cluster</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Governance Parameters</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Discrepancy Flag Resolution Queue */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Discrepancy Resolution Queue</h3>
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                {flaggedDevices.length} Open Cases
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {flaggedDevices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No active flags or holds. All batches validated.
                </p>
              ) : (
                flaggedDevices.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {d.id} • {d.brand} {d.model}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold font-mono">
                        {d.status}
                      </span>
                    </div>

                    <p className="text-slate-300">{d.flagReason || d.holdReason}</p>
                    <p className="text-[10px] text-slate-500">
                      Registered by {d.userName} ({d.userPhone}) at {d.hubLocation}
                    </p>

                    {selectedFlaggedId === d.id ? (
                      <div className="pt-2 space-y-2 border-t border-slate-800">
                        <label className="block text-[11px] text-slate-300 font-semibold">
                          Enter Administrative Resolution Note:
                        </label>
                        <input
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g. Verified by visual inspect; discrepancy within acceptable transit loss. Approved."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedFlaggedId('')}
                            className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmResolve(d.id)}
                            className="px-3 py-1 rounded bg-emerald-600 text-[11px] font-bold text-white"
                          >
                            Approve &amp; Unblock
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedFlaggedId(d.id)}
                        className="text-[11px] text-amber-400 hover:underline pt-1 block"
                      >
                        Resolve this case with Administrative Sign-off →
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
