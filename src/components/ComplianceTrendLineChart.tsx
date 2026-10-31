import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export interface MonthlyTrendDataPoint {
  id: string;
  month: string;
  monthShort: string;
  monthIndex: number;
  year: number;
  totalDevices: number;
  passedCount: number;
  failedCount: number;
  flaggedCount: number;
  passRatePct: number;
  failRatePct: number;
  flaggedRatePct: number;
  systemicFailurePoint?: {
    severity: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    primaryRootCause: string;
    affectedHub: string;
    statutoryRule: string;
  };
}

export const SIX_MONTH_COMPLIANCE_TREND_DATA: MonthlyTrendDataPoint[] = [
  {
    id: 'm-2026-05',
    month: 'May 2026',
    monthShort: 'May',
    monthIndex: 0,
    year: 2026,
    totalDevices: 3240,
    passedCount: 2835,
    failedCount: 97,
    flaggedCount: 308,
    passRatePct: 87.5,
    failRatePct: 3.0,
    flaggedRatePct: 9.5,
    systemicFailurePoint: {
      severity: 'medium',
      title: 'Secondary Battery Cell Pouch Swell in Tier-2 Hubs',
      description: 'Thermal aging in unconditioned storage sheds caused 308 mobile battery intake units to be flagged for specialized fire-retardant transport.',
      primaryRootCause: 'Ambient ambient heat >42°C in Northern transit hubs without active climate staging.',
      affectedHub: 'Lucknow-Kanpur Clean Corridor Hub #03',
      statutoryRule: 'CPCB Rule 14(2) — Hazardous Battery Segregation'
    }
  },
  {
    id: 'm-2026-06',
    month: 'June 2026',
    monthShort: 'Jun',
    monthIndex: 1,
    year: 2026,
    totalDevices: 3410,
    passedCount: 3000,
    failedCount: 102,
    flaggedCount: 308,
    passRatePct: 88.0,
    failRatePct: 3.0,
    flaggedRatePct: 9.0,
    systemicFailurePoint: {
      severity: 'medium',
      title: 'Informal Aggregator Gross Weight Overstatement',
      description: 'Discrepancy identified between consignor declared weight and first-stage digital ingress scale.',
      primaryRootCause: 'Moisture absorption in cardboard packing bundles during early monsoon transit.',
      affectedHub: 'Kolkata Howrah Demanufacturing Node #01',
      statutoryRule: 'CPCB Rule 19(2) — Tare Offset Standard'
    }
  },
  {
    id: 'm-2026-07',
    month: 'July 2026',
    monthShort: 'Jul',
    monthIndex: 2,
    year: 2026,
    totalDevices: 3720,
    passedCount: 3292,
    failedCount: 168,
    flaggedCount: 260,
    passRatePct: 88.5,
    failRatePct: 4.5,
    flaggedRatePct: 7.0,
    systemicFailurePoint: {
      severity: 'critical',
      title: 'Thermal Smelter Flue Gas Scrubber Bypass Spill',
      description: 'Primary particulate filter malfunction caused 168 MT smelter lot to fail ambient air emissions with heavy lead particulate levels.',
      primaryRootCause: 'Unscheduled slurry pump outage; bypass valve triggered without statutory secondary baghouse activation.',
      affectedHub: 'Kanpur Industrial Smelter Complex',
      statutoryRule: 'Air (Prevention and Control of Pollution) Act 1981 & Rule 14'
    }
  },
  {
    id: 'm-2026-08',
    month: 'August 2026',
    monthShort: 'Aug',
    monthIndex: 3,
    year: 2026,
    totalDevices: 4120,
    passedCount: 3679,
    failedCount: 124,
    flaggedCount: 317,
    passRatePct: 89.3,
    failRatePct: 3.0,
    flaggedRatePct: 7.7,
    systemicFailurePoint: {
      severity: 'high',
      title: 'DoT CEIR Lost/Stolen Flag Surge (DoT Circular 18-A)',
      description: 'Automated DoT Sanchar Saathi API query intercepted 68 handsets reported stolen on national IMEI blocklist.',
      primaryRootCause: 'Informal buyback channels attempting to liquidate locked equipment via bulk enterprise pallets.',
      affectedHub: 'Delhi Okhla Sub-Hub #02',
      statutoryRule: 'DoT Telecom Security Bureau Sanchar Saathi Protocol'
    }
  },
  {
    id: 'm-2026-09',
    month: 'September 2026',
    monthShort: 'Sep',
    monthIndex: 4,
    year: 2026,
    totalDevices: 4450,
    passedCount: 3858,
    failedCount: 178,
    flaggedCount: 414,
    passRatePct: 86.7,
    failRatePct: 4.0,
    flaggedRatePct: 9.3,
    systemicFailurePoint: {
      severity: 'critical',
      title: 'Backyard Acid Leaching Cluster & Mercury Vapor Surge',
      description: 'Enforcement raid identified 178 MT scrap routed to uncertified clandestine nitric acid bath extractors.',
      primaryRootCause: 'Informal scrap price arbitrage offering 12% above statutory CPCB minimum payout rates.',
      affectedHub: 'Sealdah-Howrah Industrial Corridor',
      statutoryRule: 'Section 15, EPA 1986 & Hazardous Wastes Rules'
    }
  },
  {
    id: 'm-2026-10',
    month: 'October 2026',
    monthShort: 'Oct',
    monthIndex: 5,
    year: 2026,
    totalDevices: 4920,
    passedCount: 4457,
    failedCount: 98,
    flaggedCount: 365,
    passRatePct: 90.6,
    failRatePct: 2.0,
    flaggedRatePct: 7.4,
    systemicFailurePoint: {
      severity: 'high',
      title: 'Inter-State Hosur Checkpoint Weighbridge Tare Calibration Divergence',
      description: '14.2% mass discrepancy between dispatch manifest and state border weighbridge due to load-cell zero-point drift.',
      primaryRootCause: 'Outdated firmware on regional strain gauge without automatic temperature compensation.',
      affectedHub: 'Hosur-Bengaluru Transit Node',
      statutoryRule: 'Weights & Measures Act / SPCB CTO Rule 9'
    }
  }
];

interface ComplianceTrendLineChartProps {
  onSelectMonth?: (point: MonthlyTrendDataPoint) => void;
}

export const ComplianceTrendLineChart: React.FC<ComplianceTrendLineChartProps> = ({ onSelectMonth }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // View Controls
  const [metricMode, setMetricMode] = useState<'rate' | 'count'>('rate'); // % or Counts
  const [visibleSeries, setVisibleSeries] = useState<{
    pass: boolean;
    fail: boolean;
    flagged: boolean;
  }>({
    pass: true,
    fail: true,
    flagged: true
  });
  const [showSystemicMarkers, setShowSystemicMarkers] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MonthlyTrendDataPoint>(
    SIX_MONTH_COMPLIANCE_TREND_DATA[SIX_MONTH_COMPLIANCE_TREND_DATA.length - 1]
  );
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyTrendDataPoint | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // ResizeObserver for responsive D3 rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Summary Metrics computed over the 6-month period
  const metricsSummary = useMemo(() => {
    const totalProcessed = SIX_MONTH_COMPLIANCE_TREND_DATA.reduce((acc, d) => acc + d.totalDevices, 0);
    const totalPassed = SIX_MONTH_COMPLIANCE_TREND_DATA.reduce((acc, d) => acc + d.passedCount, 0);
    const totalFailed = SIX_MONTH_COMPLIANCE_TREND_DATA.reduce((acc, d) => acc + d.failedCount, 0);
    const totalFlagged = SIX_MONTH_COMPLIANCE_TREND_DATA.reduce((acc, d) => acc + d.flaggedCount, 0);

    const firstPoint = SIX_MONTH_COMPLIANCE_TREND_DATA[0];
    const lastPoint = SIX_MONTH_COMPLIANCE_TREND_DATA[SIX_MONTH_COMPLIANCE_TREND_DATA.length - 1];
    const passDelta = (lastPoint.passRatePct - firstPoint.passRatePct).toFixed(1);
    const failDelta = (lastPoint.failRatePct - firstPoint.failRatePct).toFixed(1);

    return {
      totalProcessed,
      totalPassed,
      totalFailed,
      totalFlagged,
      avgPassRate: ((totalPassed / totalProcessed) * 100).toFixed(1),
      avgFailRate: ((totalFailed / totalProcessed) * 100).toFixed(1),
      avgFlaggedRate: ((totalFlagged / totalProcessed) * 100).toFixed(1),
      passDelta: parseFloat(passDelta),
      failDelta: parseFloat(failDelta)
    };
  }, []);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || containerWidth <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 28, right: 32, bottom: 48, left: 52 };
    const height = Math.max(300, Math.min(380, Math.round(containerWidth * 0.42)));
    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients and Filters in <defs>
    const defs = svg.append('defs');

    // Gradient for Pass Area
    const passGradient = defs.append('linearGradient').attr('id', 'd3-pass-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    passGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.28);
    passGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Gradient for Fail Area
    const failGradient = defs.append('linearGradient').attr('id', 'd3-fail-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    failGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.25);
    failGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.0);

    // Gradient for Flagged Area
    const flaggedGradient = defs.append('linearGradient').attr('id', 'd3-flagged-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    flaggedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.22);
    flaggedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // Glow Filter
    const filter = defs.append('filter').attr('id', 'd3-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(SIX_MONTH_COMPLIANCE_TREND_DATA.map((d) => d.monthShort))
      .range([0, innerWidth])
      .padding(0.12);

    let yMin = 0;
    let yMax = 100;

    if (metricMode === 'rate') {
      yMin = 0;
      yMax = 100;
    } else {
      const maxVal = d3.max(SIX_MONTH_COMPLIANCE_TREND_DATA, (d) => Math.max(d.passedCount, d.flaggedCount, d.failedCount)) || 5000;
      yMin = 0;
      yMax = Math.ceil(maxVal * 1.15);
    }

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]).nice();

    // Background Gridlines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid grid-y')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-opacity', 0.6);
    g.select('.grid-y .domain').remove();

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => (metricMode === 'rate' ? `${d}%` : `${d}`));

    const xAxisGroup = g
      .append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px').attr('font-weight', '600').attr('dy', '1.2em');
    xAxisGroup.selectAll('line').attr('stroke', '#334155');
    xAxisGroup.select('.domain').attr('stroke', '#334155');

    const yAxisGroup = g.append('g').attr('class', 'axis axis-y').call(yAxis);
    yAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px').attr('font-mono', 'true');
    yAxisGroup.selectAll('line').attr('stroke', '#334155');
    yAxisGroup.select('.domain').attr('stroke', '#334155');

    // 80% Statutory Floor Indicator Line (when in rate mode)
    if (metricMode === 'rate') {
      const floorY = yScale(80);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', floorY)
        .attr('y2', floorY)
        .attr('stroke', '#10b981')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.5);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', floorY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#10b981')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.8)
        .text('80% CPCB Statutory Floor');
    }

    // Line and Area Generators
    const getVal = (d: MonthlyTrendDataPoint, type: 'pass' | 'fail' | 'flagged') => {
      if (metricMode === 'rate') {
        return type === 'pass' ? d.passRatePct : type === 'fail' ? d.failRatePct : d.flaggedRatePct;
      }
      return type === 'pass' ? d.passedCount : type === 'fail' ? d.failedCount : d.flaggedCount;
    };

    const lineGenerator = (type: 'pass' | 'fail' | 'flagged') =>
      d3
        .line<MonthlyTrendDataPoint>()
        .x((d) => xScale(d.monthShort) || 0)
        .y((d) => yScale(getVal(d, type)))
        .curve(d3.curveMonotoneX);

    const areaGenerator = (type: 'pass' | 'fail' | 'flagged') =>
      d3
        .area<MonthlyTrendDataPoint>()
        .x((d) => xScale(d.monthShort) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(getVal(d, type)))
        .curve(d3.curveMonotoneX);

    // 1. Draw Pass Area & Line
    if (visibleSeries.pass) {
      g.append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'url(#d3-pass-gradient)')
        .attr('d', areaGenerator('pass'));

      const passPath = g
        .append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.8)
        .attr('d', lineGenerator('pass'))
        .attr('filter', 'url(#d3-glow)');

      // Smooth Line Enter Animation
      const passLength = (passPath.node() as SVGPathElement)?.getTotalLength() || 1000;
      passPath
        .attr('stroke-dasharray', `${passLength} ${passLength}`)
        .attr('stroke-dashoffset', passLength)
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // 2. Draw Flagged Area & Line
    if (visibleSeries.flagged) {
      g.append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'url(#d3-flagged-gradient)')
        .attr('d', areaGenerator('flagged'));

      const flaggedPath = g
        .append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.4)
        .attr('d', lineGenerator('flagged'))
        .attr('filter', 'url(#d3-glow)');

      const flaggedLength = (flaggedPath.node() as SVGPathElement)?.getTotalLength() || 1000;
      flaggedPath
        .attr('stroke-dasharray', `${flaggedLength} ${flaggedLength}`)
        .attr('stroke-dashoffset', flaggedLength)
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // 3. Draw Fail Area & Line
    if (visibleSeries.fail) {
      g.append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'url(#d3-fail-gradient)')
        .attr('d', areaGenerator('fail'));

      const failPath = g
        .append('path')
        .datum(SIX_MONTH_COMPLIANCE_TREND_DATA)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator('fail'))
        .attr('filter', 'url(#d3-glow)');

      const failLength = (failPath.node() as SVGPathElement)?.getTotalLength() || 1000;
      failPath
        .attr('stroke-dasharray', `${failLength} ${failLength}`)
        .attr('stroke-dashoffset', failLength)
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Interactive Vertical Crosshair Group
    const crosshair = g.append('g').attr('class', 'crosshair').style('display', 'none');

    const crosshairLine = crosshair
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#c084fc')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    // Interactive Points Group
    const pointsGroup = g.append('g').attr('class', 'd3-points');

    SIX_MONTH_COMPLIANCE_TREND_DATA.forEach((d) => {
      const cx = xScale(d.monthShort) || 0;

      // Pass Point
      if (visibleSeries.pass) {
        const cy = yScale(getVal(d, 'pass'));
        pointsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', selectedPoint.id === d.id ? 6 : 4.5)
          .attr('fill', '#10b981')
          .attr('stroke', '#064e3b')
          .attr('stroke-width', selectedPoint.id === d.id ? 3 : 2)
          .attr('class', 'cursor-pointer transition-all hover:scale-125')
          .on('click', () => {
            setSelectedPoint(d);
            if (onSelectMonth) onSelectMonth(d);
          });
      }

      // Flagged Point
      if (visibleSeries.flagged) {
        const cy = yScale(getVal(d, 'flagged'));
        pointsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', selectedPoint.id === d.id ? 5.5 : 4)
          .attr('fill', '#f59e0b')
          .attr('stroke', '#78350f')
          .attr('stroke-width', 2)
          .attr('class', 'cursor-pointer transition-all hover:scale-125')
          .on('click', () => {
            setSelectedPoint(d);
            if (onSelectMonth) onSelectMonth(d);
          });
      }

      // Fail Point
      if (visibleSeries.fail) {
        const cy = yScale(getVal(d, 'fail'));
        pointsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', selectedPoint.id === d.id ? 6 : 4.5)
          .attr('fill', '#f43f5e')
          .attr('stroke', '#881337')
          .attr('stroke-width', selectedPoint.id === d.id ? 3 : 2)
          .attr('class', 'cursor-pointer transition-all hover:scale-125')
          .on('click', () => {
            setSelectedPoint(d);
            if (onSelectMonth) onSelectMonth(d);
          });
      }

      // Systemic Failure Point Callout Pin
      if (showSystemicMarkers && d.systemicFailurePoint) {
        const isCritical = d.systemicFailurePoint.severity === 'critical';
        const markerGroup = g
          .append('g')
          .attr('transform', `translate(${cx}, ${12})`)
          .attr('class', 'cursor-pointer')
          .on('click', () => {
            setSelectedPoint(d);
            if (onSelectMonth) onSelectMonth(d);
          });

        // Pulsing pin ring
        markerGroup
          .append('circle')
          .attr('r', isCritical ? 9 : 7)
          .attr('fill', isCritical ? '#f43f5e' : '#f59e0b')
          .attr('opacity', 0.25)
          .attr('class', isCritical ? 'animate-ping' : '');

        markerGroup
          .append('circle')
          .attr('r', isCritical ? 6 : 5)
          .attr('fill', isCritical ? '#f43f5e' : '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.2);

        // Marker label on top
        markerGroup
          .append('text')
          .attr('y', -8)
          .attr('text-anchor', 'middle')
          .attr('fill', isCritical ? '#fda4af' : '#fde68a')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(isCritical ? 'CRITICAL' : 'ALERT');
      }
    });

    // Invisible Overlay for Hover Scrubbing
    const bisect = (mx: number) => {
      const step = innerWidth / (SIX_MONTH_COMPLIANCE_TREND_DATA.length - 1);
      const idx = Math.max(0, Math.min(SIX_MONTH_COMPLIANCE_TREND_DATA.length - 1, Math.round(mx / step)));
      return SIX_MONTH_COMPLIANCE_TREND_DATA[idx];
    };

    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const point = bisect(mx);
        if (point) {
          const px = xScale(point.monthShort) || 0;
          crosshair.style('display', null);
          crosshairLine.attr('x1', px).attr('x2', px);
          setHoveredPoint(point);
        }
      })
      .on('mouseleave', () => {
        crosshair.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('click', (event) => {
        const [mx] = d3.pointer(event);
        const point = bisect(mx);
        if (point) {
          setSelectedPoint(point);
          if (onSelectMonth) onSelectMonth(point);
        }
      });
  }, [containerWidth, metricMode, visibleSeries, showSystemicMarkers, selectedPoint, onSelectMonth]);

  const activeDisplayPoint = hoveredPoint || selectedPoint;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top Banner Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Interactive Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>CPCB Compliance Trend Line (Last 6 Months)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                D3.js ENGINE
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Continuous multi-series D3 visualization plotting Pass, Fail, and Flagged status trajectories across all 22 state hubs. Identifies systemic failure points, tare calibration drifts, and clandestine diversion risks.
          </p>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Rate vs Count Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricMode('rate')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'rate'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-3 py-1.5 rounded-lg transition ${
                metricMode === 'count'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unit Volume
            </button>
          </div>

          {/* Toggle Systemic Failure Markers */}
          <button
            type="button"
            onClick={() => setShowSystemicMarkers(!showSystemicMarkers)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              showSystemicMarkers
                ? 'bg-rose-950/60 text-rose-300 border-rose-600/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Systemic Failure Pins on chart"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Failure Pins</span>
          </button>
        </div>
      </div>

      {/* KPI Headline Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs relative z-10">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-sans block">6-Mo Total Volume</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {metricsSummary.totalProcessed.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Units</span>
          </div>
          <span className="text-[10px] text-purple-400 font-sans block">May 2026 – Oct 2026</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-sans block">Average Pass Rate</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
            <span>{metricsSummary.avgPassRate}%</span>
            <span className="text-xs font-sans text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{metricsSummary.passDelta}%
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-sans block">Statutory Threshold: 80%</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-sans block">Discrepancy Flags</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            {metricsSummary.avgFlaggedRate}% <span className="text-xs text-slate-400 font-normal font-sans">({metricsSummary.totalFlagged})</span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-sans block">Tare Offset &amp; CEIR Holds</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-sans block">Statutory Non-Compliance</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 flex items-center gap-1.5">
            <span>{metricsSummary.avgFailRate}%</span>
            <span className="text-xs font-sans text-emerald-400 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {metricsSummary.failDelta}%
            </span>
          </div>
          <span className="text-[10px] text-rose-400/80 font-sans block">Show-Cause Decreased</span>
        </div>
      </div>

      {/* Series Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 relative z-10 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pr-1">
            Display Series:
          </span>

          <button
            type="button"
            onClick={() => setVisibleSeries((prev) => ({ ...prev, pass: !prev.pass }))}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
              visibleSeries.pass
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Pass Trend</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200">
              {metricsSummary.avgPassRate}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((prev) => ({ ...prev, fail: !prev.fail }))}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
              visibleSeries.fail
                ? 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Fail / Violations</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
              {metricsSummary.avgFailRate}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((prev) => ({ ...prev, flagged: !prev.flagged }))}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
              visibleSeries.flagged
                ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Flagged / Quarantine</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200">
              {metricsSummary.avgFlaggedRate}%
            </span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-purple-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive scrubbing active (hover or tap any node)</span>
        </div>
      </div>

      {/* Main D3 Responsive Chart Container */}
      <div ref={containerRef} className="w-full relative z-10 select-none">
        <svg ref={svgRef} className="w-full overflow-visible" />
      </div>

      {/* Systemic Failure Point Deep-Dive Card (Focus on selected or hovered month) */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 relative z-10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              activeDisplayPoint.systemicFailurePoint?.severity === 'critical'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Systemic Failure Point Diagnostic — {activeDisplayPoint.month}
                </h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  activeDisplayPoint.systemicFailurePoint?.severity === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-600/60'
                }`}>
                  {activeDisplayPoint.systemicFailurePoint?.severity || 'REGULATORY ALERT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Root-cause telemetry cross-referenced against CPCB Schedule III and NABL scale inspection logs.
              </p>
            </div>
          </div>

          {/* Month Telemetry Pill Strip */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              Pass: {activeDisplayPoint.passRatePct}% ({activeDisplayPoint.passedCount})
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800">
              Flagged: {activeDisplayPoint.flaggedRatePct}% ({activeDisplayPoint.flaggedCount})
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800">
              Fail: {activeDisplayPoint.failRatePct}% ({activeDisplayPoint.failedCount})
            </span>
          </div>
        </div>

        {activeDisplayPoint.systemicFailurePoint && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-xs">
            {/* Left Narrative */}
            <div className="md:col-span-8 space-y-2.5">
              <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{activeDisplayPoint.systemicFailurePoint.title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {activeDisplayPoint.systemicFailurePoint.description}
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  Primary Root Cause Identified:
                </span>
                <p className="text-purple-300 font-mono text-[11px] leading-relaxed">
                  {activeDisplayPoint.systemicFailurePoint.primaryRootCause}
                </p>
              </div>
            </div>

            {/* Right Statutory Action Box */}
            <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">Impacted Logistics Hub:</span>
                <strong className="text-slate-200">{activeDisplayPoint.systemicFailurePoint.affectedHub}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">Statutory Act / Rule:</span>
                <span className="text-cyan-400 font-bold">{activeDisplayPoint.systemicFailurePoint.statutoryRule}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Remediation mandate issued via CPCB Parivesh Gateway</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Month Selection Quick Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
        <span className="text-slate-400 font-mono text-[11px] shrink-0">Select Month Horizon:</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {SIX_MONTH_COMPLIANCE_TREND_DATA.map((d) => {
            const isSelected = selectedPoint.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedPoint(d);
                  if (onSelectMonth) onSelectMonth(d);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{d.monthShort} 26</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  d.passRatePct >= 90 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {d.passRatePct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
