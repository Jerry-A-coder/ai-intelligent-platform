import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  Zap,
  Globe,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Terminal,
  Activity,
  X,
  Play,
} from 'lucide-react';
import { ServiceNode } from '../types';

interface TopologyMeshProps {
  nodes: ServiceNode[];
  onRemediateNode?: (nodeId: string) => void;
}

export const TopologyMesh: React.FC<TopologyMeshProps> = ({ nodes, onRemediateNode }) => {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gateway':
        return Globe;
      case 'database':
        return Database;
      case 'cache':
        return Zap;
      case 'messaging':
        return Radio;
      case 'worker':
        return Cpu;
      default:
        return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-rose-950/40 border-rose-500/80 text-rose-300',
          dot: 'bg-rose-500 pulse-glow-rose',
          badge: 'bg-rose-900/60 text-rose-300 border-rose-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/40 border-amber-500/80 text-amber-300',
          dot: 'bg-amber-400',
          badge: 'bg-amber-900/60 text-amber-300 border-amber-700',
        };
      default:
        return {
          bg: 'bg-slate-900/60 border-slate-700/60 text-slate-200',
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800',
        };
    }
  };

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Distributed Microservices Topology & Live Service Mesh
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ingress and inter-service telemetry dependency graph with live health propagation
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">Critical / Anomaly</span>
          </div>
        </div>
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {nodes.map((node) => {
          const Icon = getCategoryIcon(node.category);
          const styling = getStatusColor(node.status);
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`rounded-xl border p-4 cursor-pointer transition-all relative overflow-hidden group hover:scale-[1.01] ${styling.bg} ${
                isSelected ? 'ring-2 ring-cyan-400 border-transparent shadow-lg shadow-cyan-500/10' : ''
              }`}
            >
              {/* Top Row: Category + Name + Status Dot */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>{node.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {node.category} • {node.instances} Pods
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${styling.dot}`} />
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${styling.badge}`}>
                    {node.status}
                  </span>
                </div>
              </div>

              {/* Real-time Metric Indicators */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center font-mono">
                <div className="p-1.5 rounded bg-slate-900/50">
                  <div className="text-[10px] text-slate-400 uppercase">CPU Load</div>
                  <div className={`text-xs font-bold ${node.cpu > 80 ? 'text-rose-400' : node.cpu > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {node.cpu}%
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-900/50">
                  <div className="text-[10px] text-slate-400 uppercase">p99 Latency</div>
                  <div className={`text-xs font-bold ${node.p99Latency > 250 ? 'text-rose-400' : node.p99Latency > 120 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {node.p99Latency}ms
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-900/50">
                  <div className="text-[10px] text-slate-400 uppercase">Throughput</div>
                  <div className="text-xs font-bold text-white">
                    {(node.rps / 1000).toFixed(1)}k <span className="text-[9px] text-slate-400 font-normal">rps</span>
                  </div>
                </div>
              </div>

              {/* Dependency Indicator */}
              {node.dependencies.length > 0 && (
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 truncate">
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-slate-400">Calls:</span>
                  <span className="font-mono text-slate-300 truncate">
                    {node.dependencies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Drawer / Modal */}
      {selectedNode && (
        <div className="mt-6 rounded-xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-2xl relative animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  {selectedNode.id}
                </span>
                <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deployed in region: <span className="text-slate-200 font-mono">{selectedNode.region}</span> • SLA Uptime: <span className="text-emerald-400 font-mono">{selectedNode.uptime}%</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemediateNode && onRemediateNode(selectedNode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Container Diagnostics</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Memory Utilization</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{selectedNode.memory}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-cyan-400 h-full" style={{ width: `${selectedNode.memory}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Error Rate (HTTP 5xx)</div>
              <div className={`text-lg font-bold font-mono ${selectedNode.errorRate > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedNode.errorRate}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${selectedNode.errorRate > 1 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, selectedNode.errorRate * 20)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Median Latency (p50)</div>
              <div className="text-lg font-bold font-mono text-white">{selectedNode.latency}ms</div>
              <div className="text-[10px] text-slate-400 mt-1">Target SLA: &lt;50ms</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Active Container Replicas</div>
              <div className="text-lg font-bold font-mono text-white">{selectedNode.instances} Pods</div>
              <div className="text-[10px] text-emerald-400 mt-1">Autoscaler active (HPA)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
