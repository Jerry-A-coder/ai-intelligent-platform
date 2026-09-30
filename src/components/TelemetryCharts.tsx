import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Filter,
  Maximize2,
  Activity,
  Layers,
} from 'lucide-react';
import { MetricDataPoint } from '../types';

interface TelemetryChartsProps {
  data: MetricDataPoint[];
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'latency' | 'rps' | 'errorRate' | 'resilience'>('latency');
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h'>('1h');
  const [hoveredPoint, setHoveredPoint] = useState<MetricDataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 text-center text-slate-400">
        Loading real-time time-series telemetry...
      </div>
    );
  }

  // Calculate chart boundaries based on selectedMetric
  let values: number[] = [];
  let unit = '';
  let color = 'stroke-cyan-400';
  let fillColor = 'fill-cyan-500/10';

  if (selectedMetric === 'latency') {
    values = data.map((d) => d.latencyP99);
    unit = 'ms (p99)';
    color = 'stroke-amber-400';
    fillColor = 'fill-amber-500/10';
  } else if (selectedMetric === 'rps') {
    values = data.map((d) => d.rps);
    unit = 'requests/sec';
    color = 'stroke-cyan-400';
    fillColor = 'fill-cyan-500/10';
  } else if (selectedMetric === 'errorRate') {
    values = data.map((d) => d.errorRate);
    unit = '% 5xx errors';
    color = 'stroke-rose-400';
    fillColor = 'fill-rose-500/10';
  } else {
    values = data.map((d) => d.resilienceIndex);
    unit = '/100 Index';
    color = 'stroke-emerald-400';
    fillColor = 'fill-emerald-500/10';
  }

  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1 || 1;
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = data.map((d, idx) => {
    const val = selectedMetric === 'latency'
      ? d.latencyP99
      : selectedMetric === 'rps'
      ? d.rps
      : selectedMetric === 'errorRate'
      ? d.errorRate
      : d.resilienceIndex;

    const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y, dataPoint: d, val };
  });

  const pathData = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const areaData = `${pathData} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md">
      {/* Chart Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Dynamic Telemetry Ingress & Outage Horizon</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronous time-series tracking cluster throughput, tail latency, error rate and resilience index
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Buttons */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedMetric('latency')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedMetric === 'latency' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Latency (p99)
            </button>
            <button
              onClick={() => setSelectedMetric('rps')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedMetric === 'rps' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              RPS
            </button>
            <button
              onClick={() => setSelectedMetric('errorRate')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedMetric === 'errorRate' ? 'bg-rose-950 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Errors
            </button>
            <button
              onClick={() => setSelectedMetric('resilience')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedMetric === 'resilience' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resilience
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            {(['15m', '1h', '6h', '24h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer ${
                  timeRange === r ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Time-Series Chart */}
      <div className="relative mt-4 overflow-hidden">
        {hoveredPoint && (
          <div className="absolute top-2 left-10 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700 text-xs shadow-xl backdrop-blur-md z-10 font-mono">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Time: {hoveredPoint.time}</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-amber-400 font-bold">p99: {hoveredPoint.latencyP99}ms</span>
              <span className="text-cyan-400 font-bold">{hoveredPoint.rps.toLocaleString()} RPS</span>
              <span className={hoveredPoint.errorRate > 0.1 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                Err: {hoveredPoint.errorRate}%
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - 2 * paddingY);
            const labelVal = (minVal + ratio * range).toFixed(selectedMetric === 'errorRate' ? 2 : 0);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaData} className={fillColor} />

          {/* Trend line */}
          <path
            d={pathData}
            fill="none"
            className={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.time === pt.dataPoint.time ? 5 : 3}
              className={`${color} fill-slate-950 transition-all cursor-pointer hover:r-6`}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(pt.dataPoint)}
            />
          ))}
        </svg>

        {/* X-Axis Time Labels */}
        <div className="flex justify-between px-10 text-[10px] font-mono text-slate-500 mt-1">
          <span>{data[0]?.time}</span>
          <span>{data[Math.floor(data.length / 2)]?.time}</span>
          <span>{data[data.length - 1]?.time} (Now)</span>
        </div>
      </div>
    </div>
  );
};
