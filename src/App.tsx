/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Radio,
  Server,
  Shield,
  Zap,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { MetricCard } from './components/MetricCard';
import { TopologyMesh } from './components/TopologyMesh';
import { TelemetryCharts } from './components/TelemetryCharts';
import { IncidentsView } from './components/IncidentsView';
import { PredictiveRiskView } from './components/PredictiveRiskView';
import { CopilotView } from './components/CopilotView';
import { ChaosLabView } from './components/ChaosLabView';
import { AuditSecurityView } from './components/AuditSecurityView';
import { VivaAcademicView } from './components/VivaAcademicView';
import {
  UserRole,
  ServiceNode,
  Incident,
  MetricDataPoint,
  PredictiveRiskData,
  AuditLog,
} from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Site Reliability Lead');
  const [activeTab, setActiveTab] = useState<TabKey>('command-center');

  // Live state
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [timeSeries, setTimeSeries] = useState<MetricDataPoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [riskData, setRiskData] = useState<PredictiveRiskData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthScore, setHealthScore] = useState<number>(94.6);
  const [globalRps, setGlobalRps] = useState<number>(78400);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [preselectedIncidentId, setPreselectedIncidentId] = useState<string>('INC-2026-881');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Fetch telemetry & cluster data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [nodesRes, seriesRes, incRes, riskRes, auditRes] = await Promise.all([
        fetch('/api/telemetry/nodes'),
        fetch('/api/telemetry/timeseries'),
        fetch('/api/incidents'),
        fetch('/api/ai/predictive-risk'),
        fetch('/api/audit'),
      ]);

      if (nodesRes.ok) {
        const nodesData = await nodesRes.json();
        setNodes(nodesData.nodes || []);
        setHealthScore(nodesData.clusterHealthScore || 94.6);
        setGlobalRps(nodesData.globalRps || 78400);
      }

      if (seriesRes.ok) {
        const seriesData = await seriesRes.json();
        setTimeSeries(seriesData.data || []);
      }

      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidents(incData.incidents || []);
      }

      if (riskRes.ok) {
        const rData = await riskRes.json();
        setRiskData(rData);
      }

      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditLogs(aData.logs || []);
      }
    } catch (err) {
      console.error('Failed to sync telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic heartbeat sync (every 4 seconds for real-time telemetry feel)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/telemetry/nodes')
        .then((res) => res.json())
        .then((data) => {
          if (data.nodes) {
            setNodes(data.nodes);
            setHealthScore(data.clusterHealthScore);
            setGlobalRps(data.globalRps);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Action Handlers
  const handleRemediate = async (incidentId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/remediate`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Remediation error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResolve = async (incidentId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/resolve`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Resolve error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTriggerChaos = async (scenario: string) => {
    const res = await fetch('/api/chaos/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    const data = await res.json();
    if (data.nodes) {
      setNodes(data.nodes);
    }
    await fetchData();
    return data;
  };

  const handleOpenRca = (incidentId: string) => {
    setPreselectedIncidentId(incidentId);
    setActiveTab('genai-copilot');
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeIncidentsCount={activeIncidents.length}
        healthScore={healthScore}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        onQuickChaos={() => setActiveTab('chaos-lab')}
      />

      {/* Navigation Tab Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeIncidentsCount={activeIncidents.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* TAB 1: Live Command Mesh */}
        {activeTab === 'command-center' && (
          <div className="space-y-6">
            {/* Top Row KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Global Availability SLA"
                value="99.982"
                unit="%"
                change="+0.014% vs 30d"
                changeType="positive"
                icon={Shield}
                subtext="Multi-AZ Target: 99.99%"
                trend={[92, 94, 95, 96, 98, 97, 99, 99.9, 99.98]}
                statusColor="text-emerald-400"
              />

              <MetricCard
                title="Ingress Throughput (RPS)"
                value={globalRps ? (globalRps / 1000).toFixed(1) : '78.4'}
                unit="k rps"
                change="+8.4% peak"
                changeType="positive"
                icon={Activity}
                subtext="Across 9 Microservices"
                trend={[60, 65, 72, 70, 78, 82, 80, 85, 88]}
                statusColor="text-cyan-400"
              />

              <MetricCard
                title="Cluster Median Latency"
                value="18"
                unit="ms p50"
                change="-3.2ms after cache"
                changeType="positive"
                icon={Zap}
                subtext="p99: 142ms (Tail spike)"
                trend={[35, 30, 26, 24, 21, 20, 19, 18, 18]}
                statusColor="text-amber-400"
              />

              <MetricCard
                title="Active Anomaly Radar"
                value={activeIncidents.length}
                unit="Incidents"
                change={activeIncidents.length > 0 ? 'P2 Saturation Alert' : 'Nominal'}
                changeType={activeIncidents.length > 0 ? 'negative' : 'positive'}
                icon={AlertTriangle}
                subtext="Automated RCA Ready"
                trend={[2, 1, 0, 0, 1, 2, 2, 1, activeIncidents.length]}
                statusColor={activeIncidents.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
              />
            </div>

            {/* Microservice Topology Mesh */}
            <TopologyMesh
              nodes={nodes}
              onRemediateNode={(nodeId) => {
                const inc = incidents.find((i) => i.affectedService === nodeId);
                if (inc) {
                  handleRemediate(inc.id);
                }
              }}
            />

            {/* Synchronized Real-Time Telemetry Time-Series Chart */}
            <TelemetryCharts data={timeSeries} />
          </div>
        )}

        {/* TAB 2: Incidents Management & Self-Healing */}
        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onRemediate={handleRemediate}
            onResolve={handleResolve}
            onOpenRca={handleOpenRca}
            isActionLoading={isActionLoading}
          />
        )}

        {/* TAB 3: Predictive ML & Explainable AI (XAI) */}
        {activeTab === 'predictive-risk' && (
          <PredictiveRiskView riskData={riskData} />
        )}

        {/* TAB 4: Gemini SRE Copilot & Post-Mortem RCA */}
        {activeTab === 'genai-copilot' && (
          <CopilotView
            incidents={incidents}
            preselectedIncidentId={preselectedIncidentId}
          />
        )}

        {/* TAB 5: Chaos Engineering & What-If Simulator */}
        {activeTab === 'chaos-lab' && (
          <ChaosLabView
            nodes={nodes}
            onTriggerChaos={handleTriggerChaos}
          />
        )}

        {/* TAB 6: Audit & Cyber Security */}
        {activeTab === 'audit-security' && (
          <AuditSecurityView logs={auditLogs} />
        )}

        {/* TAB 7: College Viva & Architecture Hub */}
        {activeTab === 'viva-architecture' && (
          <VivaAcademicView />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 lg:px-8 py-5 text-xs text-slate-500 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">PulseGrid AIOps 3.0</span>
            <span>•</span>
            <span>Enterprise Autonomous Incident Intelligence & Operational Resilience Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => setActiveTab('viva-architecture')}>
              Academic Documentation
            </span>
            <span>•</span>
            <span>SOC2 Type-II Verified</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
