import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Play,
  CheckCircle2,
  Terminal,
  Cpu,
  Database,
  Radio,
} from 'lucide-react';
import { ServiceNode } from '../types';

interface ChaosLabViewProps {
  nodes: ServiceNode[];
  onTriggerChaos: (scenario: string) => Promise<any>;
}

export const ChaosLabView: React.FC<ChaosLabViewProps> = ({ nodes, onTriggerChaos }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<{
    impactDescription: string;
    resilienceScore: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scenarios = [
    {
      id: 'traffic_spike',
      title: 'Black Friday 10x Traffic Spike Surge',
      description: 'Injects 48,000 synthetic requests/second through Cloudflare Edge into Order Orchestrator.',
      risk: 'High Concurrency',
      target: 'Edge Gateway & Compute Pods',
      icon: Activity,
    },
    {
      id: 'db_exhaustion',
      title: 'PostgreSQL Aurora Connection Exhaustion',
      description: 'Clamps active connections to 5,000 pool max, simulating unreleased database connection leaks.',
      risk: 'State Layer Lock',
      target: 'PostgreSQL Aurora Cluster',
      icon: Database,
    },
    {
      id: 'az_failure',
      title: 'Multi-AZ Catastrophic Outage (us-east-1a)',
      description: 'Simulates complete hypervisor crash in Availability Zone A to verify instant DNS Anycast failover.',
      risk: 'Physical Partition',
      target: 'Multi-AZ Infrastructure',
      icon: Radio,
    },
  ];

  const handleRunChaos = async (scenarioId: string) => {
    setIsLoading(true);
    setActiveScenario(scenarioId);
    try {
      const res = await onTriggerChaos(scenarioId);
      setSimResult({
        impactDescription: res.impactDescription,
        resilienceScore: res.resilienceScore,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setActiveScenario('reset');
    try {
      const res = await onTriggerChaos('reset');
      setSimResult({
        impactDescription: res.impactDescription,
        resilienceScore: res.resilienceScore,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-950/80 to-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-900/60 border border-rose-700/60 text-rose-300">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              </span>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Chaos Engineering & What-If Simulator
                </span>
                <h3 className="text-lg font-bold text-white">
                  Autonomous Fault Injection & Self-Healing Resilience Validation
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Safely inject controlled turbulence into production mesh nodes to verify automatic circuit-breaker tripping, horizontal pod autoscaling (HPA), and zero-downtime multi-AZ failover.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Reset Baseline Equilibrium</span>
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrent = activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all backdrop-blur-md ${
                isCurrent
                  ? 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/80 uppercase">
                    {sc.risk}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">{sc.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{sc.description}</p>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-500 mb-3">Target: {sc.target}</div>
                <button
                  onClick={() => handleRunChaos(sc.id)}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/80 text-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Inject Turbulence</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulation Result Console */}
      {simResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Live Fault Injection Feedback & Resilience Telemetry</h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Calculated Resilience Score:</span>
              <span
                className={`text-lg font-bold font-mono px-3 py-0.5 rounded border ${
                  simResult.resilienceScore > 90
                    ? 'border-emerald-600 bg-emerald-950 text-emerald-400'
                    : simResult.resilienceScore > 75
                    ? 'border-amber-600 bg-amber-950 text-amber-400'
                    : 'border-rose-600 bg-rose-950 text-rose-400'
                }`}
              >
                {simResult.resilienceScore} / 100
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed">
            <div className="text-cyan-400 font-semibold mb-1">[PULSEGRID-CHAOS-DAEMON-OUTPUT]</div>
            <div>{simResult.impactDescription}</div>
            <div className="mt-2 text-emerald-400">
              ✓ Automated HPA scaling triggers executed within 4.2 seconds. No HTTP 500 error propagation to ingress.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
