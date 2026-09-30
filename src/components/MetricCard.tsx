import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtext?: string;
  trend?: number[]; // normalized 0-100 values for sparkline
  statusColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'neutral',
  icon: Icon,
  subtext,
  trend = [30, 42, 38, 55, 48, 62, 70, 65, 80],
  statusColor = 'text-cyan-400',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm hover:border-slate-700/80 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/80 ring-1 ring-slate-700/50">
          <Icon className={`w-4 h-4 ${statusColor}`} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {change && (
          <div
            className={`flex items-center text-[11px] font-semibold font-mono ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {changeType === 'positive' ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : changeType === 'negative' ? (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            ) : null}
            {change}
          </div>
        )}

        {subtext && <span className="text-[11px] text-slate-400">{subtext}</span>}

        {/* Mini SVG Sparkline */}
        {trend && trend.length > 0 && (
          <div className="w-16 h-6 ml-auto">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  changeType === 'negative'
                    ? 'text-rose-500'
                    : changeType === 'positive'
                    ? 'text-emerald-500'
                    : 'text-cyan-500'
                }
                points={trend
                  .map((val, idx) => {
                    const x = (idx / (trend.length - 1)) * 60;
                    const y = 20 - (val / 100) * 16;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Subtle bottom accent line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-500/50 transition-colors" />
    </div>
  );
};
