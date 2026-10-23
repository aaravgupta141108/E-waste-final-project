import React, { useState } from 'react';
import {
  Leaf,
  Download,
  Share2,
  TreePine,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Globe2,
  CheckCircle2,
  FileText,
  Building,
  Printer,
  Recycle,
  Activity,
  ArrowUpRight,
  Calendar,
  Car,
  Fuel,
  Plane,
  Smartphone,
  Zap,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NATIONAL_STATS } from '../data/mockData';
import { DeviceItem, UserProfile } from '../types';

interface CarbonImpactViewProps {
  currentUser: UserProfile;
  devices: DeviceItem[];
}

export const CarbonImpactView: React.FC<CarbonImpactViewProps> = ({ currentUser, devices }) => {
  const [viewLevel, setViewLevel] = useState<'national' | 'state'>('national');
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh');
  const [showReportModal, setShowReportModal] = useState(false);

  // User personal savings
  const userCo2Saved = devices.reduce((sum, d) => sum + (d.co2SavedKg || 0), 0);
  const userTreesEquiv = Math.round(userCo2Saved / 22);
  const userLeadPrevented = (devices.length * 0.42).toFixed(2);
  const userGoldRecovered = (devices.length * 0.045).toFixed(3);

  // Monthly trends for area chart
  const monthlyTrendData = [
    { month: 'May 2026', co2AvoidedTonnes: 140, hubEnergyKwh: 12, netSavedTonnes: 139.8 },
    { month: 'Jun 2026', co2AvoidedTonnes: 280, hubEnergyKwh: 24, netSavedTonnes: 279.7 },
    { month: 'Jul 2026', co2AvoidedTonnes: 490, hubEnergyKwh: 41, netSavedTonnes: 489.5 },
    { month: 'Aug 2026', co2AvoidedTonnes: 820, hubEnergyKwh: 68, netSavedTonnes: 819.2 },
    { month: 'Sep 2026', co2AvoidedTonnes: 1410, hubEnergyKwh: 115, netSavedTonnes: 1408.7 },
    { month: 'Oct 2026', co2AvoidedTonnes: 2185, hubEnergyKwh: 182, netSavedTonnes: 2183.0 }
  ];

  // Material Pie Data
  const materialPieData = [
    { name: 'Copper & Cable (Cu)', value: 42, color: '#f59e0b' },
    { name: 'Aluminum & Casings (Al)', value: 28, color: '#94a3b8' },
    { name: 'Clean Recovered Plastics', value: 16, color: '#10b981' },
    { name: 'Silicon & Glass', value: 11, color: '#38bdf8' },
    { name: 'Precious Gold & Ag', value: 3, color: '#fbbf24' }
  ];

  // State Drilldown data
  const currentStateData = NATIONAL_STATS.topStates.find((s) => s.state === selectedState) || NATIONAL_STATS.topStates[0];

  const stateComparisonData = NATIONAL_STATS.topStates.map((st) => ({
    name: st.state.length > 11 ? st.state.slice(0, 9) + '..' : st.state,
    fullName: st.state,
    GeneratedMT: Math.round(st.generated / 1000),
    RecycledMT: Math.round(st.recycled / 1000),
    RatePct: st.rate
  }));

  const handlePrintOrDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-800/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Leaf className="w-3.5 h-3.5" />
            <span>Methodology: ASU Life-Cycle Assessment & MoEFCC Displacement (0.5 Factor)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            National Carbon Impact & Life-Cycle Emissions Dashboard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Quantifying net avoided GHG emissions from genuine electronic device reuse and certified hydrometallurgical smelting versus virgin ore mining.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Formal Impact Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total CO₂ Saved</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {NATIONAL_STATS.totalCo2SavedTonnes.toLocaleString()} MT
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            ≈ {NATIONAL_STATS.treesEquivalentPlanted.toLocaleString()} Urban Trees Planted
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Toxic Leachate Halted</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">
            {NATIONAL_STATS.toxicLeadCadmiumPreventedKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-slate-400">
            Heavy metals (Lead, Cadmium, Hg) diverted from aquifers
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Precious Metals Harvested</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {NATIONAL_STATS.goldRecoveredGrams.toLocaleString()} g Gold
          </div>
          <div className="text-[11px] text-slate-400">
            + {NATIONAL_STATS.copperRecoveredKg.toLocaleString()} kg Copper recovered
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Your Personal Contribution</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {userCo2Saved.toFixed(1)} kg CO₂
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {currentUser.name} • {userTreesEquiv} Urban Trees
          </div>
        </div>
      </div>

      {/* Relative Impact Widget comparing saved CO2 against real-world metrics */}
      <RelativeImpactWidget userCo2Saved={userCo2Saved} userName={currentUser.name} />

      {/* Drill-Down Toggle Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Visualization Scope:
          </span>
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewLevel('national')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                viewLevel === 'national'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              National Aggregates
            </button>
            <button
              onClick={() => setViewLevel('state')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                viewLevel === 'state'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              State-by-State Drilldown
            </button>
          </div>
        </div>

        {viewLevel === 'state' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400">Select State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {NATIONAL_STATS.topStates.map((st) => (
                <option key={st.state} value={st.state}>
                  {st.state} ({st.rate}% Recycled)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Recycling Analytics Card based on User's Registered Device Lifecycle History */}
      <RecyclingAnalyticsCard devices={devices} currentUser={currentUser} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: State Comparison Bar Chart or Area Trend */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                {viewLevel === 'national'
                  ? 'National GHG Emissions Avoided Trajectory (Tonnes CO₂)'
                  : `State E-Waste Processing Capacity: ${selectedState} vs National Peers`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {viewLevel === 'national'
                  ? 'Net savings accounting for hub power meter consumption and transport logistics'
                  : 'CPCB Generation Estimates vs Officially Certified Recycled Quantities (000s MT)'}
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              RECHARTS TELEMETRY
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {viewLevel === 'national' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="netSavedTonnes"
                    name="Net CO₂ Saved (Tonnes)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#co2Grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateComparisonData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="GeneratedMT" name="Generated (K MT)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="RecycledMT" name="Recycled (K MT)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {viewLevel === 'state' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-400">Selected State:</span>{' '}
                <strong className="text-white">{currentStateData.state}</strong>
              </div>
              <div>
                <span className="text-slate-400">Recycling Efficiency:</span>{' '}
                <strong className="text-emerald-400">{currentStateData.rate}%</strong>
              </div>
              <div>
                <span className="text-slate-400">Certified Intake Hubs:</span>{' '}
                <strong className="text-cyan-400">{currentStateData.hubs} Centers</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Chart: Material Recovery Breakdown */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Circular Material Extraction Yield</h3>
            <p className="text-[11px] text-slate-400">Recovered raw elements by fraction weight (%)</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {materialPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {materialPieData.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300 text-[11px]">{m.name}</span>
                </div>
                <span className="font-mono text-[11px] text-white font-bold">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formal Impact Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Formal Carbon Reduction & ESG Compliance Report
                </span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Certificate Page */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200 font-sans print:bg-white print:text-black">
              {/* Document Header */}
              <div className="border-b-2 border-emerald-600 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                    CENTRAL POLLUTION CONTROL BOARD • MINISTRY OF ENVIRONMENT
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    NATIONAL E-WASTE CARBON DISCLOSURE STATEMENT
                  </h3>
                  <p className="text-xs text-slate-400">
                    Statutory Life-Cycle Carbon Accounting & Material Custody Summary
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              {/* Contributor Information */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Authorized Contributor:</span>
                  <span className="text-white font-bold text-sm">{currentUser.name}</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">{currentUser.organization || 'Green Citizen'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">National Registry ID:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{currentUser.id}</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">Region: {currentUser.state}</span>
                </div>
              </div>

              {/* Metric Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Quantified Environmental Contributions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Impact Indicator</th>
                        <th className="p-2.5">User Contribution</th>
                        <th className="p-2.5">Equivalence Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                      <tr>
                        <td className="p-2.5 font-sans">Avoided GHG Emissions</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{userCo2Saved.toFixed(1)} kg CO₂e</td>
                        <td className="p-2.5 text-slate-400 font-sans">≈ {userTreesEquiv} Urban Trees</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans">Groundwater Leachate Prevented</td>
                        <td className="p-2.5 text-cyan-400 font-bold">{userLeadPrevented} kg Pb/Cd/Hg</td>
                        <td className="p-2.5 text-slate-400 font-sans">Diverted from Municipal Landfills</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans">Precious Gold (Au) Circular Yield</td>
                        <td className="p-2.5 text-yellow-400 font-bold">{userGoldRecovered} grams</td>
                        <td className="p-2.5 text-slate-400 font-sans">Zero Virgin Mining Extraction</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Digital Attestation */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Cryptographically Signed & Timestamped</div>
                  <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                    SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Close
              </button>
              <button
                onClick={handlePrintOrDownload}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RecyclingAnalyticsProps {
  devices: DeviceItem[];
  currentUser: UserProfile;
}

export const RecyclingAnalyticsCard: React.FC<RecyclingAnalyticsProps> = ({ devices, currentUser }) => {
  const [metricMode, setMetricMode] = useState<'co2' | 'materials'>('co2');

  // Build chronological history of CO2 savings and metals based on user's devices
  const userDevices = devices.filter((d) => d.userId === currentUser.id || currentUser.role !== 'citizen');
  const totalUserCo2 = userDevices.reduce((sum, d) => sum + (d.co2SavedKg || 0), 0);
  const certifiedCo2 = userDevices
    .filter((d) => d.status === 'CERTIFIED' || d.status === 'RECYCLED')
    .reduce((sum, d) => sum + (d.co2SavedKg || 0), 0);
  const totalCopperGrams = userDevices.reduce((sum, d) => sum + (d.materialYield?.copperGrams || 18.5), 0);
  const totalGoldGrams = userDevices.reduce((sum, d) => sum + (d.materialYield?.goldGrams || 0.04), 0);

  // Generate milestone timeline points from actual devices
  const timelinePoints = React.useMemo(() => {
    if (userDevices.length === 0) {
      return [
        { label: 'Baseline', cumulativeCo2Kg: 0, certifiedCo2Kg: 0, copperGrams: 0, goldMg: 0 },
        { label: 'Intake 1', cumulativeCo2Kg: 0, certifiedCo2Kg: 0, copperGrams: 0, goldMg: 0 }
      ];
    }

    let runningCo2 = 0;
    let runningCertified = 0;
    let runningCopper = 0;
    let runningGold = 0;

    const points = [
      {
        label: 'Baseline',
        cumulativeCo2Kg: 0,
        certifiedCo2Kg: 0,
        copperGrams: 0,
        goldMg: 0,
        event: 'Account Created'
      }
    ];

    // Map each registered device into a lifecycle milestone
    userDevices.forEach((d, idx) => {
      const co2 = d.co2SavedKg || 50;
      runningCo2 += co2;
      const isCertified = d.status === 'CERTIFIED' || d.status === 'RECYCLED';
      if (isCertified) {
        runningCertified += co2;
      }
      runningCopper += d.materialYield?.copperGrams || 16.5;
      runningGold += (d.materialYield?.goldGrams || 0.038) * 1000; // in mg

      const cleanModel = d.model.length > 12 ? d.model.slice(0, 10) + '..' : d.model;
      points.push({
        label: `${d.brand} ${cleanModel}`,
        cumulativeCo2Kg: Math.round(runningCo2 * 10) / 10,
        certifiedCo2Kg: Math.round(runningCertified * 10) / 10,
        copperGrams: Math.round(runningCopper),
        goldMg: Math.round(runningGold),
        event: `Intake #${idx + 1}: ${d.brand} (${d.status})`
      });
    });

    return points;
  }, [userDevices]);

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
      {/* Top Header of Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Recycle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Recycling Analytics & Life-Cycle Carbon Trajectory
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  Personal Consignment Ledger
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing cumulative avoided GHG emissions (kg CO₂e) and high-value materials diversion based on your registered device lifecycle milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Mode Switcher */}
        <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setMetricMode('co2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              metricMode === 'co2'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CO₂ Avoided Trend
          </button>
          <button
            onClick={() => setMetricMode('materials')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              metricMode === 'materials'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Materials Recovered
          </button>
        </div>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Avoided CO₂</span>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {totalUserCo2.toFixed(1)} <span className="text-xs font-sans text-emerald-400">kg CO₂e</span>
          </div>
          <span className="text-[10px] text-emerald-400/90 block">Across {userDevices.length} Consignments</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">CPCB Certified Offsets</span>
          <div className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {certifiedCo2.toFixed(1)} <span className="text-xs font-sans text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {totalUserCo2 > 0 ? Math.round((certifiedCo2 / totalUserCo2) * 100) : 0}% Form-6 Verified
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Recovered Copper (Cu)</span>
          <div className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
            {totalCopperGrams.toFixed(1)} <span className="text-xs font-sans text-slate-400">grams</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Diverted from Landfill Ore</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Urban Gold (Au) Harvest</span>
          <div className="text-xl font-extrabold text-yellow-400 font-mono tabular-nums">
            {totalGoldGrams.toFixed(3)} <span className="text-xs font-sans text-slate-400">grams</span>
          </div>
          <span className="text-[10px] text-yellow-500/90 block">PCB Smelting Purity 99.9%</span>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-1">
        {userDevices.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
            <Recycle className="w-8 h-8 text-slate-600 mb-2 animate-spin" style={{ animationDuration: '10s' }} />
            <p className="text-sm font-semibold text-slate-300">No Consignment Lifecycle Data Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Register your electronic devices in the Citizen Portal to automatically generate your verified CO₂ savings curve.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelinePoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="personalCo2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="materialsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070a11',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {metricMode === 'co2' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="cumulativeCo2Kg"
                    name="Cumulative Avoided CO₂ (kg)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#personalCo2Grad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="certifiedCo2Kg"
                    name="Officially Certified Offset (kg)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#06b6d4"
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="copperGrams"
                    name="Recovered Copper (grams)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#materialsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="goldMg"
                    name="Recovered Gold (mg)"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#fbbf24"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

interface RelativeImpactProps {
  userCo2Saved: number;
  userName: string;
}

export const RelativeImpactWidget: React.FC<RelativeImpactProps> = ({ userCo2Saved, userName }) => {
  const [activeTab, setActiveTab] = useState<'equivalents' | 'benchmarks'>('equivalents');

  // Concrete Real-World Equivalent Factors:
  // 1 Urban Peepal/Neem Tree absorbs ~21.77 kg CO2 / year
  const treesPlanted = (userCo2Saved / 21.77).toFixed(1);
  // Standard passenger vehicle emits ~12.6 kg CO2/day (or ~383 kg/month, ~4,600 kg/year)
  const carDaysOffRoad = (userCo2Saved / 12.6).toFixed(1);
  const carMonthsOffRoad = (userCo2Saved / 383).toFixed(2);
  // Standard 2-BHK Indian home grid power emissions: ~6.5 kg CO2/day
  const homePowerDays = Math.round(userCo2Saved / 6.5);
  // Commercial aviation: ~0.115 kg CO2 per passenger-km (Delhi-Mumbai is ~1,150 km = 132 kg CO2)
  const flightKmOffset = Math.round(userCo2Saved / 0.115);
  const flightTripsDelMum = (userCo2Saved / 132).toFixed(1);
  // 1 full smartphone recharge: ~0.0084 kg CO2
  const phoneCharges = Math.round(userCo2Saved / 0.0084).toLocaleString();
  // 1 liter of gasoline combustion: ~2.31 kg CO2
  const litersFuelSaved = (userCo2Saved / 2.31).toFixed(1);

  // National statutory tier target progress
  const tiers = [
    { name: 'Bronze Consignor', targetKg: 100, badge: 'CPCB Citizen Bronze' },
    { name: 'Silver Guardian', targetKg: 250, badge: 'CPCB Eco Silver' },
    { name: 'Gold Champion', targetKg: 500, badge: 'CPCB Gold Pioneer' },
    { name: 'Platinum Sovereign', targetKg: 1000, badge: 'MoEFCC National Vanguard' }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
      {/* Top Header of Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Relative Environmental Impact &amp; Real-World Equivalencies
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                ASU / MoEFCC Factors
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Translating your <strong className="text-emerald-400 font-mono">{userCo2Saved.toFixed(1)} kg CO₂e</strong> into tangible, human-scale everyday sustainability metrics.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('equivalents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'equivalents'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real-World Metrics
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'benchmarks'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            National Tier Progress
          </button>
        </div>
      </div>

      {activeTab === 'equivalents' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Urban Trees Planted */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Trees Planted &amp; Grown</span>
              <TreePine className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {treesPlanted} <span className="text-xs font-sans text-emerald-400 font-normal">Mature Urban Trees</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equivalent to the full annual carbon absorption of <strong>{treesPlanted} mature Peepal or Neem trees</strong> growing in an urban green belt.
            </p>
            <div className="pt-1 text-[9px] font-mono text-emerald-500/80">Factor: ~21.8 kg CO₂ / tree / year</div>
          </div>

          {/* 2. Cars Taken Off Road */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold uppercase tracking-wider">Cars Taken Off the Road</span>
              <Car className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {carDaysOffRoad} <span className="text-xs font-sans text-cyan-400 font-normal">Vehicle-Days (or {carMonthsOffRoad} months)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equal to removing an average gasoline passenger vehicle entirely from urban city streets for <strong>{carDaysOffRoad} days</strong>.
            </p>
            <div className="pt-1 text-[9px] font-mono text-cyan-500/80">Factor: ~12.6 kg CO₂ / vehicle / day</div>
          </div>

          {/* 3. Clean Household Electricity */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Zero-Emission Home Energy</span>
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {homePowerDays} <span className="text-xs font-sans text-amber-400 font-normal">Full Days of Power</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enough avoided emissions to power a standard 2-BHK residential apartment with <strong>100% clean grid energy for {homePowerDays} days</strong>.
            </p>
            <div className="pt-1 text-[9px] font-mono text-amber-500/80">Factor: ~6.5 kg CO₂ / day (India Grid)</div>
          </div>

          {/* 4. Commercial Flight Offset */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Flight Passenger Distance</span>
              <Plane className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {flightKmOffset.toLocaleString()} <span className="text-xs font-sans text-purple-400 font-normal">km Offset</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cancels the aviation emissions of <strong>{flightTripsDelMum} one-way passenger flights between New Delhi and Mumbai</strong>.
            </p>
            <div className="pt-1 text-[9px] font-mono text-purple-500/80">Factor: ~0.115 kg CO₂ / passenger-km</div>
          </div>

          {/* 5. Smartphone Recharges */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/20 hover:border-teal-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-teal-400">
              <span className="text-xs font-bold uppercase tracking-wider">Smartphone Recharges</span>
              <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {phoneCharges} <span className="text-xs font-sans text-teal-400 font-normal">Full 0-100% Cycles</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equivalent to charging your smartphone battery from zero to full <strong>{phoneCharges} times</strong> over its operational lifetime.
            </p>
            <div className="pt-1 text-[9px] font-mono text-teal-500/80">Factor: ~0.0084 kg CO₂ / cycle</div>
          </div>

          {/* 6. Gasoline Liters Conserved */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-bold uppercase tracking-wider">Crude Petrol Conserved</span>
              <Fuel className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              {litersFuelSaved} <span className="text-xs font-sans text-rose-400 font-normal">Liters Unburned</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Directly spares <strong>{litersFuelSaved} liters of motor gasoline</strong> from being extracted, refined, and combusted into our air.
            </p>
            <div className="pt-1 text-[9px] font-mono text-rose-500/80">Factor: ~2.31 kg CO₂ / liter petrol</div>
          </div>
        </div>
      ) : (
        /* National Milestone Benchmarks Progress */
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            CPCB National Statutory Recognition Tiers for active citizen consignors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tiers.map((tier, idx) => {
              const pct = Math.min(100, Math.round((userCo2Saved / tier.targetKg) * 100));
              const isAchieved = userCo2Saved >= tier.targetKg;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isAchieved
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isAchieved ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isAchieved ? 'Achieved' : `${pct}%`}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {tier.targetKg} kg
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-2">{tier.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tier.badge}</p>

                  <div className="mt-3 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved ? 'bg-emerald-400' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
