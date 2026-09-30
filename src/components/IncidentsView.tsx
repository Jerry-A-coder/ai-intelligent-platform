import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Play,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Incident } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  onRemediate: (incidentId: string) => Promise<void>;
  onResolve: (incidentId: string) => Promise<void>;
  onOpenRca: (incidentId: string) => void;
  isActionLoading: boolean;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onRemediate,
  onResolve,
  onOpenRca,
  isActionLoading,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const handleRemediateClick = async (id: string) => {
    await onRemediate(id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#3b82f6'],
    });
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'P1-CRITICAL':
        return 'border-rose-500/80 bg-rose-950/40 text-rose-300';
      case 'P2-HIGH':
        return 'border-amber-500/80 bg-amber-950/40 text-amber-300';
      case 'P3-MEDIUM':
        return 'border-blue-500/80 bg-blue-950/40 text-blue-300';
      default:
        return 'border-slate-700 bg-slate-900/40 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Mean Time to Detect (MTTD)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">36 sec</div>
          <div className="text-[11px] text-slate-400 mt-1">94% faster than industry standard</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Mean Time to Remediate (MTTR)</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">3.2 min</div>
          <div className="text-[11px] text-slate-400 mt-1">Autonomous self-healing active</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Prevented Revenue Loss</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">$48,200</div>
          <div className="text-[11px] text-slate-400 mt-1">Calculated across 3 incidents</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">AI Diagnostic Accuracy</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">96.8%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Telemetry-grounded attribution</div>
        </div>
      </div>

      {/* Incidents Command List */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Real-Time Incident Triage & Automated Self-Healing Mesh
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated anomaly correlation with single-click deterministic runbook remediation
            </p>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            {['ALL', 'P1-CRITICAL', 'P2-HIGH', 'P3-MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                  filterSeverity === sev ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Cards */}
        <div className="mt-5 space-y-4">
          {filtered.map((incident) => {
            const isResolved = incident.status === 'resolved';

            return (
              <div
                key={incident.id}
                className={`rounded-xl border p-5 transition-all ${
                  isResolved
                    ? 'border-slate-800/60 bg-slate-900/30 opacity-75'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getSeverityStyle(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{incident.id}</span>
                    <h4 className="text-sm font-bold text-white">{incident.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-full border ${
                        incident.status === 'resolved'
                          ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                          : incident.status === 'mitigating'
                          ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                          : 'border-amber-500/40 bg-amber-950/40 text-amber-300 animate-pulse'
                      }`}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      MTTD: {incident.mttdSeconds}s
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 text-xs">
                  {/* AI Root Cause Candidate */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          AI-Attributed Root Cause Diagnosis
                        </span>
                        <span className="font-mono text-emerald-400">
                          Confidence: {(incident.aiConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{incident.rootCauseCandidate}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                      <div>
                        Target Service: <span className="font-mono text-white font-semibold">{incident.affectedService}</span>
                      </div>
                      <div>
                        Commander: <span className="text-slate-200">{incident.assignedTo}</span>
                      </div>
                      <div>
                        Est. Exposure: <span className="text-amber-300 font-mono font-bold">${incident.financialImpactEstimated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remediation Action Box */}
                  <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        Autonomous Self-Healing Runbook
                      </div>
                      <p className="text-xs text-slate-300 mb-3 font-mono leading-tight">
                        {incident.remediationAction}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-cyan-900/60">
                      {!isResolved && (
                        <button
                          onClick={() => handleRemediateClick(incident.id)}
                          disabled={isActionLoading || incident.remediationStatus === 'applied'}
                          className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            incident.remediationStatus === 'applied'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {incident.remediationStatus === 'applied'
                              ? 'Runbook Successfully Deployed'
                              : 'Execute Automated Runbook'}
                          </span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        {!isResolved && (
                          <button
                            onClick={() => onResolve(incident.id)}
                            disabled={isActionLoading}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer text-center"
                          >
                            Mark Resolved
                          </button>
                        )}

                        <button
                          onClick={() => onOpenRca(incident.id)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-cyan-800/80 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Gemini RCA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
