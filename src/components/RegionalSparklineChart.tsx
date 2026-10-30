import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Scale
} from 'lucide-react';
import { StateComplianceData, getGradientScaleColor, getGradientScaleBadge } from './ComplianceHeatmap';

export interface MonthDataPoint {
  month: string;
  performancePct: number;
  collectedMT: number;
  targetMT: number;
}

export interface RegionalSparklineChartProps {
  selectedState: StateComplianceData;
  allStates?: StateComplianceData[];
  onSelectState?: (state: StateComplianceData) => void;
  compact?: boolean;
}

// Generate realistic 6-month historical data based on the state's current metric
export function getSixMonthTrend(state: StateComplianceData): MonthDataPoint[] {
  const customTrend = (state as any).historicalTrend;
  if (customTrend && Array.isArray(customTrend) && customTrend.length === 6) {
    return customTrend;
  }

  const months = ['May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'];
  const currentPct = state.collectionPerformancePct;
  const currentCollected = state.actualCollectedMT;
  const monthlyTarget = Math.round(state.statutoryTargetMT / 3); // ~monthly quota

  // Create trajectory leading to current performance
  const trajectoryOffsets = state.riskLevel === 'critical'
    ? [-12, -8, -5, -7, -2, 0] // struggling / declining
    : state.riskLevel === 'warning'
    ? [-6, -4, -1, -3, 1, 0] // borderline
    : [-8, -5, -2, 1, 3, 0]; // improving / surplus

  return months.map((month, idx) => {
    const offset = trajectoryOffsets[idx];
    const pct = Math.max(45, Math.min(125, +(currentPct + offset).toFixed(1)));
    const collected = Math.round((monthlyTarget * pct) / 100);

    return {
      month,
      performancePct: pct,
      collectedMT: collected,
      targetMT: monthlyTarget
    };
  });
}

export const RegionalSparklineChart: React.FC<RegionalSparklineChartProps> = ({
  selectedState,
  allStates = [],
  onSelectState,
  compact = false
}) => {
  const trendData = getSixMonthTrend(selectedState);
  const strokeColor = getGradientScaleColor(selectedState.collectionPerformancePct);
  const badge = getGradientScaleBadge(selectedState.collectionPerformancePct);

  // Calculate momentum between month 0 (May) and month 5 (Oct)
  const startPct = trendData[0].performancePct;
  const endPct = trendData[trendData.length - 1].performancePct;
  const diff = +(endPct - startPct).toFixed(1);
  const isPositive = diff >= 0;

  // Average 6-month attainment
  const avgPct = +(trendData.reduce((acc, d) => acc + d.performancePct, 0) / trendData.length).toFixed(1);
  const peakPoint = [...trendData].sort((a, b) => b.performancePct - a.performancePct)[0];
  const lowestPoint = [...trendData].sort((a, b) => a.performancePct - b.performancePct)[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header with state identity & quick switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow shrink-0"
            style={{ backgroundColor: strokeColor }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedState.state}</span>
                <span className="text-slate-400 font-normal text-xs">({selectedState.zone} Zone)</span>
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase text-white shadow-xs"
                style={{ backgroundColor: strokeColor }}
              >
                {selectedState.riskLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              6-Month Historical E-Waste Collection Trajectory (May 2026 – Oct 2026)
            </p>
          </div>
        </div>

        {/* State Switcher dropdown if allStates provided */}
        {allStates.length > 0 && onSelectState && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Inspect Region:</span>
            <select
              value={selectedState.state}
              onChange={(e) => {
                const found = allStates.find((s) => s.state === e.target.value);
                if (found) onSelectState(found);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            >
              {allStates.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.collectionPerformancePct.toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI metric strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Current Attainment</span>
          <div className="text-lg font-bold font-mono mt-0.5" style={{ color: strokeColor }}>
            {selectedState.collectionPerformancePct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">
            {selectedState.actualCollectedMT} MT Verified
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">6-Month Momentum</span>
          <div className={`text-lg font-bold font-mono mt-0.5 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{diff > 0 ? `+${diff}%` : `${diff}%`}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            vs. May 2026 baseline
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">6-Mo Average Rate</span>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {avgPct}%
          </div>
          <span className="text-[10px] text-slate-400">
            Mean Compliance Floor
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Peak Period</span>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
            {peakPoint.month}
          </div>
          <span className="text-[10px] text-slate-400">
            High of {peakPoint.performancePct}%
          </span>
        </div>
      </div>

      {/* Sparkline Visualizer Area */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Monthly Attainment (%) Trendline against 100% Statutory Quota Target</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Weighbridge Calibrated Logs
          </span>
        </div>

        <div className="h-44 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2 pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${selectedState.state.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[40, 130]}
                unit="%"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                }}
                formatter={((val: any) => [`${val}%`, 'Attainment Rate']) as any}
                labelFormatter={(label, payload) => {
                  const pt = payload?.[0]?.payload as MonthDataPoint;
                  if (!pt) return label;
                  return `${label} — ${pt.collectedMT} MT Collected (Target: ${pt.targetMT} MT)`;
                }}
              />

              {/* 100% Baseline Mandate Line */}
              <ReferenceLine
                y={100}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{ value: '100% CPCB Quota', fill: '#10b981', fontSize: 10, position: 'right' }}
              />

              {/* 80% Critical Floor */}
              <ReferenceLine
                y={80}
                stroke="#e11d48"
                strokeDasharray="2 2"
                strokeWidth={1}
                label={{ value: '80% Floor', fill: '#e11d48', fontSize: 9, position: 'right' }}
              />

              <Area
                type="monotone"
                dataKey="performancePct"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient-${selectedState.state.replace(/\s+/g, '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini month-by-month pill strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-xs">
        {trendData.map((pt, i) => (
          <div
            key={pt.month}
            className={`p-2 rounded-xl text-center border transition ${
              i === trendData.length - 1
                ? 'bg-slate-800/90 border-purple-500/50 shadow-sm'
                : 'bg-slate-950 border-slate-800/80'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-mono block">{pt.month}</span>
            <span
              className="text-xs font-bold font-mono block mt-0.5"
              style={{ color: getGradientScaleColor(pt.performancePct) }}
            >
              {pt.performancePct}%
            </span>
            <span className="text-[9px] text-slate-500 block font-mono">{pt.collectedMT} MT</span>
          </div>
        ))}
      </div>
    </div>
  );
};
