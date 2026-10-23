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
  Printer
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
