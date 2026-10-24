import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  MapPin,
  Filter,
  FileSpreadsheet,
  ShieldAlert,
  Send,
  Building,
  ArrowRight,
  Info
} from 'lucide-react';

export interface DistrictComplianceData {
  district: string;
  state: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central';
  statutoryTargetMT: number;
  actualCollectedMT: number;
  compliancePct: number;
  gapMT: number; // shortfall if positive, surplus if negative
  riskLevel: 'critical' | 'warning' | 'compliant' | 'overperforming';
  registeredHubsCount: number;
  activeEprRecyclers: number;
  primaryDeficitFactor: string;
}

export const DISTRICT_COMPLIANCE_DATA: DistrictComplianceData[] = [
  {
    district: 'New Delhi (Central & South)',
    state: 'Delhi NCR',
    zone: 'North',
    statutoryTargetMT: 420,
    actualCollectedMT: 448,
    compliancePct: 106.7,
    gapMT: -28,
    riskLevel: 'overperforming',
    registeredHubsCount: 6,
    activeEprRecyclers: 9,
    primaryDeficitFactor: 'None - Surpassing CPCB Quota via Doorstep Transit'
  },
  {
    district: 'Gurugram & Manesar Cyber Corridor',
    state: 'Haryana',
    zone: 'North',
    statutoryTargetMT: 310,
    actualCollectedMT: 326,
    compliancePct: 105.2,
    gapMT: -16,
    riskLevel: 'overperforming',
    registeredHubsCount: 4,
    activeEprRecyclers: 7,
    primaryDeficitFactor: 'Corporate IT Asset Bulk Retirement Streamlined'
  },
  {
    district: 'Bengaluru (Urban & Electronic City)',
    state: 'Karnataka',
    zone: 'South',
    statutoryTargetMT: 460,
    actualCollectedMT: 474,
    compliancePct: 103.0,
    gapMT: -14,
    riskLevel: 'overperforming',
    registeredHubsCount: 7,
    activeEprRecyclers: 12,
    primaryDeficitFactor: 'None - High Corporate Compliance Rate'
  },
  {
    district: 'Mumbai Suburban & Navi Mumbai',
    state: 'Maharashtra',
    zone: 'West',
    statutoryTargetMT: 480,
    actualCollectedMT: 456,
    compliancePct: 95.0,
    gapMT: 24,
    riskLevel: 'compliant',
    registeredHubsCount: 8,
    activeEprRecyclers: 11,
    primaryDeficitFactor: 'Informal Kurla & Deonar scrap diversion (5%)'
  },
  {
    district: 'Hyderabad (Cyberabad & Cherlapally)',
    state: 'Telangana',
    zone: 'South',
    statutoryTargetMT: 340,
    actualCollectedMT: 316,
    compliancePct: 92.9,
    gapMT: 24,
    riskLevel: 'warning',
    registeredHubsCount: 5,
    activeEprRecyclers: 8,
    primaryDeficitFactor: 'Delayed institutional turnover from SME electronics'
  },
  {
    district: 'Pune & Pimpri-Chinchwad Tech Hub',
    state: 'Maharashtra',
    zone: 'West',
    statutoryTargetMT: 280,
    actualCollectedMT: 232,
    compliancePct: 82.9,
    gapMT: 48,
    riskLevel: 'warning',
    registeredHubsCount: 4,
    activeEprRecyclers: 5,
    primaryDeficitFactor: 'Industrial electronics backlog in auto ancillaries'
  },
  {
    district: 'Indore Clean Corridor',
    state: 'Madhya Pradesh',
    zone: 'Central',
    statutoryTargetMT: 190,
    actualCollectedMT: 196,
    compliancePct: 103.2,
    gapMT: -6,
    riskLevel: 'overperforming',
    registeredHubsCount: 3,
    activeEprRecyclers: 4,
    primaryDeficitFactor: 'High municipal segregation alignment'
  },
  {
    district: 'Chennai (Guindy & Ambattur)',
    state: 'Tamil Nadu',
    zone: 'South',
    statutoryTargetMT: 360,
    actualCollectedMT: 274,
    compliancePct: 76.1,
    gapMT: 86,
    riskLevel: 'critical',
    registeredHubsCount: 4,
    activeEprRecyclers: 6,
    primaryDeficitFactor: 'Unregulated seaport warehouse storage & informal salvaging'
  },
  {
    district: 'Ahmedabad & Sanand Industrial Zone',
    state: 'Gujarat',
    zone: 'West',
    statutoryTargetMT: 290,
    actualCollectedMT: 215,
    compliancePct: 74.1,
    gapMT: 75,
    riskLevel: 'critical',
    registeredHubsCount: 3,
    activeEprRecyclers: 5,
    primaryDeficitFactor: 'Informal non-ferrous metal extraction workshops'
  },
  {
    district: 'Kolkata & Howrah Industrial Cluster',
    state: 'West Bengal',
    zone: 'East',
    statutoryTargetMT: 320,
    actualCollectedMT: 214,
    compliancePct: 66.9,
    gapMT: 106,
    riskLevel: 'critical',
    registeredHubsCount: 3,
    activeEprRecyclers: 4,
    primaryDeficitFactor: 'Severe informal market leakage & lack of citizen buyback centers'
  },
  {
    district: 'Lucknow & Kanpur Corridor',
    state: 'Uttar Pradesh',
    zone: 'North',
    statutoryTargetMT: 260,
    actualCollectedMT: 169,
    compliancePct: 65.0,
    gapMT: 91,
    riskLevel: 'critical',
    registeredHubsCount: 3,
    activeEprRecyclers: 3,
    primaryDeficitFactor: 'Unregistered acid leaching informal units in Moradabad-Lucknow belt'
  },
  {
    district: 'Patna Urban & Ganga Belt',
    state: 'Bihar',
    zone: 'East',
    statutoryTargetMT: 210,
    actualCollectedMT: 128,
    compliancePct: 61.0,
    gapMT: 82,
    riskLevel: 'critical',
    registeredHubsCount: 2,
    activeEprRecyclers: 2,
    primaryDeficitFactor: 'Zero certified lithium refining capacity in 300km radius'
  }
];

export const ComplianceHeatmap: React.FC = () => {
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'warning' | 'compliant'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictComplianceData | null>(
    DISTRICT_COMPLIANCE_DATA.find((d) => d.riskLevel === 'critical') || DISTRICT_COMPLIANCE_DATA[0]
  );
  const [metricView, setMetricView] = useState<'tonnes' | 'efficiency'>('tonnes');
  const [enforcementAlertSent, setEnforcementAlertSent] = useState<string | null>(null);

  const filteredData = DISTRICT_COMPLIANCE_DATA.filter((d) => {
    if (filterZone !== 'all' && d.zone !== filterZone) return false;
    if (filterRisk === 'critical' && d.riskLevel !== 'critical') return false;
    if (filterRisk === 'warning' && d.riskLevel !== 'warning') return false;
    if (filterRisk === 'compliant' && d.riskLevel !== 'compliant' && d.riskLevel !== 'overperforming') return false;
    return true;
  });

  // Aggregated calculations
  const totalTargetMT = filteredData.reduce((acc, d) => acc + d.statutoryTargetMT, 0);
  const totalActualMT = filteredData.reduce((acc, d) => acc + d.actualCollectedMT, 0);
  const overallCompliancePct = totalTargetMT > 0 ? (totalActualMT / totalTargetMT) * 100 : 0;
  const criticalCount = DISTRICT_COMPLIANCE_DATA.filter((d) => d.riskLevel === 'critical').length;
  const totalShortfallMT = DISTRICT_COMPLIANCE_DATA.filter((d) => d.gapMT > 0).reduce((acc, d) => acc + d.gapMT, 0);

  const handleIssueNotice = (districtName: string) => {
    setEnforcementAlertSent(districtName);
    setTimeout(() => setEnforcementAlertSent(null), 4000);
  };

  const getBarColor = (entry: DistrictComplianceData) => {
    if (entry.riskLevel === 'critical') return '#f43f5e'; // rose-500
    if (entry.riskLevel === 'warning') return '#f59e0b'; // amber-500
    if (entry.riskLevel === 'overperforming') return '#10b981'; // emerald-500
    return '#06b6d4'; // cyan-500
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">National Target (Q3 Mandate)</span>
          <div className="text-xl font-bold text-white mt-1">
            {totalTargetMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT</span>
          </div>
          <span className="text-[10px] text-slate-500">Statutory CPCB Quota</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 text-xs">Actual Verified Collection</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {totalActualMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            {overallCompliancePct.toFixed(1)}% Achieved
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40">
          <span className="text-slate-400 text-xs">Critical Underperforming</span>
          <div className="text-xl font-bold text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>{criticalCount} Districts</span>
          </div>
          <span className="text-[10px] text-rose-400/80">&lt;80% Quota Attainment</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40">
          <span className="text-slate-400 text-xs">Cumulative Statutory Shortfall</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {totalShortfallMT.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT Gap</span>
          </div>
          <span className="text-[10px] text-amber-400/80">EPR Penalty Exposure</span>
        </div>
      </div>

      {/* Main Heatmap Visualizer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Regional E-Waste Compliance Heatmap &amp; Target Matrix
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                CPCB FORM 3 RULE 13(1)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visual benchmark comparing statutory recycling quotas against weighbridge-verified collection rates. Auditors can isolate districts risking non-compliance fines.
            </p>
          </div>

          {/* Controls: Metric Toggle & Zone Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setMetricView('tonnes')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  metricView === 'tonnes'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Metric Tonnes (MT)
              </button>
              <button
                onClick={() => setMetricView('efficiency')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  metricView === 'efficiency'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Attainment (%)
              </button>
            </div>

            {/* Filter by Risk */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">🚨 Critical Underperforming (&lt;80%)</option>
              <option value="warning">⚠️ Borderline / Warning (80-95%)</option>
              <option value="compliant">✅ Compliant / Surplus (≥95%)</option>
            </select>

            {/* Filter by Zone */}
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All National Zones</option>
              <option value="North">North Zone</option>
              <option value="South">South Zone</option>
              <option value="West">West Zone</option>
              <option value="East">East Zone</option>
              <option value="Central">Central Zone</option>
            </select>
          </div>
        </div>

        {/* Recharts Heatmap / Bar Comparison */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedDistrict = e.activePayload[0].payload as DistrictComplianceData;
                  setSelectedDistrict(clickedDistrict);
                }
              }}
            >
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={10}
                domain={metricView === 'tonnes' ? [0, 520] : [0, 120]}
                unit={metricView === 'tonnes' ? ' MT' : '%'}
              />
              <YAxis
                type="category"
                dataKey="district"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                }}
                formatter={((val: any, name?: any) => {
                  if (metricView === 'efficiency') {
                    return [`${val}%`, 'Attainment Rate'];
                  }
                  return [`${val} MT`, name === 'actualCollectedMT' ? 'Actual Collected' : 'Statutory Target'];
                }) as any}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              {metricView === 'tonnes' ? (
                <>
                  <Bar
                    dataKey="statutoryTargetMT"
                    name="CPCB Statutory Target (MT)"
                    fill="#334155"
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                  />
                  <Bar
                    dataKey="actualCollectedMT"
                    name="Actual Verified Intake (MT)"
                    radius={[0, 6, 6, 0]}
                    barSize={14}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </>
              ) : (
                <>
                  <ReferenceLine
                    x={100}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: '100% Target', fill: '#10b981', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    x={80}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{ value: '80% Critical Floor', fill: '#f43f5e', fontSize: 10, position: 'bottom' }}
                  />
                  <Bar
                    dataKey="compliancePct"
                    name="Collection Attainment (%)"
                    radius={[0, 6, 6, 0]}
                    barSize={16}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-pct-${index}`}
                        fill={getBarColor(entry)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>&gt;100% Target Met (Surplus)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500" />
              <span>90-100% Acceptable</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>80-89% Moderate Shortfall</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>&lt;80% Critical Non-Compliance</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Click any bar above or card below to inspect district audit dossier
          </span>
        </div>
      </div>

      {/* Selected District Deep-Dive & Enforcement Action Card */}
      {selectedDistrict && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                  selectedDistrict.riskLevel === 'critical'
                    ? 'bg-rose-600'
                    : selectedDistrict.riskLevel === 'warning'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedDistrict.district} ({selectedDistrict.state})
                </h4>
                <p className="text-xs text-slate-400">
                  Regional Zone: {selectedDistrict.zone} • {selectedDistrict.registeredHubsCount} Authorized Collection Hubs • {selectedDistrict.activeEprRecyclers} Certified EPR Refineries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedDistrict.riskLevel === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : selectedDistrict.riskLevel === 'warning'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedDistrict.riskLevel.toUpperCase()} RISK TIER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Statutory Mandate (Quota)</span>
              <div className="text-lg font-bold text-white font-mono">
                {selectedDistrict.statutoryTargetMT} MT
              </div>
              <span className="text-[10px] text-slate-400">CPCB Assigned FY26</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Actual Intake Verified</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {selectedDistrict.actualCollectedMT} MT
              </div>
              <span className="text-[10px] text-slate-400">Weighbridge Scale Logs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Compliance Attainment</span>
              <div
                className={`text-lg font-bold font-mono ${
                  selectedDistrict.compliancePct >= 95
                    ? 'text-emerald-400'
                    : selectedDistrict.compliancePct >= 80
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {selectedDistrict.compliancePct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedDistrict.compliancePct >= 100 ? 'Quota Met' : 'Statutory Deficit'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Shortfall / Variance</span>
              <div
                className={`text-lg font-bold font-mono ${
                  selectedDistrict.gapMT > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {selectedDistrict.gapMT > 0 ? `-${selectedDistrict.gapMT} MT` : `+${Math.abs(selectedDistrict.gapMT)} MT`}
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedDistrict.gapMT > 0 ? 'Shortfall Gap' : 'Surplus Quota'}
              </span>
            </div>
          </div>

          {/* Root Cause & Remedial Actions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Identified Leakage / Root Cause Factor:
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedDistrict.primaryDeficitFactor}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Statutory Authority: SPCB / CPCB Regional Inspectorate under E-Waste Rules Rule 14.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIssueNotice(selectedDistrict.district)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Issue Statutory Rule 14 Show-Cause Notice</span>
                </button>
                <button
                  onClick={() => alert(`Mobile collection fleet dispatched to ${selectedDistrict.district}!`)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Deploy Rapid Collection Van</span>
                </button>
              </div>
            </div>

            {enforcementAlertSent && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Official Show-Cause Notice dispatched to State Pollution Control Board for <strong>{enforcementAlertSent}</strong>. Notice Hash: #CPCB-SCN-{Date.now().toString().slice(-6)}.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* District Compliance Grid Matrix (Heatmap Table) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              District Attainment Registry Matrix ({filteredData.length} Districts)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Sorted by CPCB Priority
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">District &amp; State</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Target Quota (MT)</th>
                <th className="py-2.5 px-3">Actual Intake (MT)</th>
                <th className="py-2.5 px-3">Attainment %</th>
                <th className="py-2.5 px-3">Deficit / Surplus</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.map((d) => (
                <tr
                  key={d.district}
                  onClick={() => setSelectedDistrict(d)}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    selectedDistrict?.district === d.district ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white">
                    {d.district}
                    <span className="block text-[10px] text-slate-400 font-normal">{d.state}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{d.zone}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{d.statutoryTargetMT} MT</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{d.actualCollectedMT} MT</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span
                      className={
                        d.compliancePct >= 95
                          ? 'text-emerald-400'
                          : d.compliancePct >= 80
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {d.compliancePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {d.gapMT > 0 ? (
                      <span className="text-rose-400 font-bold">-{d.gapMT} MT</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">+{Math.abs(d.gapMT)} MT</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        d.riskLevel === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : d.riskLevel === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {d.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDistrict(d);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
