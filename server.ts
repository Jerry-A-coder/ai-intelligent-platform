import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization failed, falling back to local heuristic AI engine:', err);
  }
}

// In-Memory Production State Store for Real-Time Synchronization
interface ServiceNode {
  id: string;
  name: string;
  category: 'gateway' | 'compute' | 'database' | 'messaging' | 'cache' | 'worker';
  status: 'healthy' | 'warning' | 'critical' | 'degraded';
  cpu: number; // percentage
  memory: number; // percentage
  latency: number; // ms
  p99Latency: number; // ms
  errorRate: number; // percentage
  rps: number; // requests per sec
  instances: number;
  region: string;
  uptime: number; // percentage
  dependencies: string[];
}

interface Incident {
  id: string;
  title: string;
  severity: 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MEDIUM' | 'P4-LOW';
  status: 'active' | 'investigating' | 'mitigating' | 'resolved';
  affectedService: string;
  detectedAt: string;
  mttdSeconds: number;
  mttrSeconds?: number;
  rootCauseCandidate: string;
  aiConfidence: number;
  remediationAction: string;
  remediationStatus: 'pending' | 'executing' | 'applied' | 'failed';
  assignedTo: string;
  blastRadius: string;
  financialImpactEstimated: number; // in USD
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  status: 'success' | 'warning' | 'denied';
  ipAddress: string;
  hashSignature: string;
}

let serviceNodes: ServiceNode[] = [
  {
    id: 'edge-gateway',
    name: 'Cloudflare / API Edge Gateway',
    category: 'gateway',
    status: 'healthy',
    cpu: 28,
    memory: 42,
    latency: 18,
    p99Latency: 45,
    errorRate: 0.02,
    rps: 14200,
    instances: 12,
    region: 'Global Anycast',
    uptime: 99.99,
    dependencies: ['auth-service', 'order-orchestrator', 'inventory-engine'],
  },
  {
    id: 'auth-service',
    name: 'Auth0 / IAM Token Broker',
    category: 'compute',
    status: 'healthy',
    cpu: 34,
    memory: 48,
    latency: 24,
    p99Latency: 62,
    errorRate: 0.05,
    rps: 3100,
    instances: 6,
    region: 'us-east-1',
    uptime: 99.98,
    dependencies: ['redis-sessions', 'postgres-primary'],
  },
  {
    id: 'order-orchestrator',
    name: 'Order Fulfillment Orchestrator',
    category: 'compute',
    status: 'warning',
    cpu: 78,
    memory: 84,
    latency: 142,
    p99Latency: 380,
    errorRate: 1.84,
    rps: 5400,
    instances: 8,
    region: 'us-east-1',
    uptime: 99.82,
    dependencies: ['payment-processor', 'inventory-engine', 'kafka-eventbus'],
  },
  {
    id: 'payment-processor',
    name: 'PCI-DSS Payment Gateway Bridge',
    category: 'compute',
    status: 'healthy',
    cpu: 41,
    memory: 52,
    latency: 110,
    p99Latency: 240,
    errorRate: 0.12,
    rps: 1800,
    instances: 5,
    region: 'us-east-1',
    uptime: 99.995,
    dependencies: ['postgres-primary', 'stripe-external-api'],
  },
  {
    id: 'inventory-engine',
    name: 'Distributed Inventory Stock Service',
    category: 'compute',
    status: 'healthy',
    cpu: 32,
    memory: 44,
    latency: 28,
    p99Latency: 75,
    errorRate: 0.03,
    rps: 4200,
    instances: 6,
    region: 'us-east-1',
    uptime: 99.96,
    dependencies: ['redis-cache', 'postgres-primary'],
  },
  {
    id: 'postgres-primary',
    name: 'PostgreSQL Aurora Multi-AZ Cluster',
    category: 'database',
    status: 'healthy',
    cpu: 58,
    memory: 66,
    latency: 8,
    p99Latency: 22,
    errorRate: 0.0,
    rps: 8900,
    instances: 3,
    region: 'us-east-1 (Multi-AZ)',
    uptime: 99.999,
    dependencies: [],
  },
  {
    id: 'kafka-eventbus',
    name: 'Apache Kafka Event Streaming Mesh',
    category: 'messaging',
    status: 'healthy',
    cpu: 45,
    memory: 59,
    latency: 4,
    p99Latency: 12,
    errorRate: 0.0,
    rps: 32000,
    instances: 5,
    region: 'us-east-1',
    uptime: 100.0,
    dependencies: [],
  },
  {
    id: 'redis-cache',
    name: 'Redis Enterprise In-Memory Cluster',
    category: 'cache',
    status: 'healthy',
    cpu: 22,
    memory: 68,
    latency: 1.2,
    p99Latency: 3.5,
    errorRate: 0.01,
    rps: 24000,
    instances: 4,
    region: 'us-east-1',
    uptime: 99.999,
    dependencies: [],
  },
  {
    id: 'ai-recommendation',
    name: 'Real-Time Vector Search & ML Ranking',
    category: 'worker',
    status: 'healthy',
    cpu: 64,
    memory: 73,
    latency: 82,
    p99Latency: 195,
    errorRate: 0.1,
    rps: 2100,
    instances: 4,
    region: 'us-east-1',
    uptime: 99.91,
    dependencies: ['redis-cache'],
  },
];

let incidents: Incident[] = [
  {
    id: 'INC-2026-881',
    title: 'Order Orchestrator Thread Pool Saturation & Tail Latency Spike',
    severity: 'P2-HIGH',
    status: 'investigating',
    affectedService: 'order-orchestrator',
    detectedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    mttdSeconds: 42,
    rootCauseCandidate: 'Connection backlog surge in downstream payment verification combined with synchronous JSON deserialization bottleneck',
    aiConfidence: 0.94,
    remediationAction: 'Auto-scale replicas from 8 -> 14 pods and enable rate-limiting queue backoff',
    remediationStatus: 'pending',
    assignedTo: 'Sarah Chen (Principal SRE)',
    blastRadius: '14.2% checkout attempts experiencing latency > 500ms',
    financialImpactEstimated: 4200,
  },
  {
    id: 'INC-2026-879',
    title: 'Redis Cluster Memory Fragmentation Warning',
    severity: 'P3-MEDIUM',
    status: 'mitigating',
    affectedService: 'redis-cache',
    detectedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    mttdSeconds: 68,
    rootCauseCandidate: 'Transient key expiration wave in session invalidation job without memory defragmentation cycle',
    aiConfidence: 0.88,
    remediationAction: 'Trigger background active defragmentation and evict volatile-lru keys',
    remediationStatus: 'executing',
    assignedTo: 'Alex Mercer (Cloud Architect)',
    blastRadius: 'Internal session cache miss rate elevated by 2.1%',
    financialImpactEstimated: 350,
  },
  {
    id: 'INC-2026-874',
    title: 'Intermittent TLS Handshake Timeout on Edge Gateway',
    severity: 'P1-CRITICAL',
    status: 'resolved',
    affectedService: 'edge-gateway',
    detectedAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    mttdSeconds: 28,
    mttrSeconds: 412,
    rootCauseCandidate: 'BGP route flapping at upstream transit provider peering exchange (IXP Frankfurt)',
    aiConfidence: 0.98,
    remediationAction: 'BGP community re-route traffic via London Anycast node and flush routing tables',
    remediationStatus: 'applied',
    assignedTo: 'Marcus Vance (DevOps Lead)',
    blastRadius: 'European ingress traffic experienced 3.4% packet loss for 6.8 minutes',
    financialImpactEstimated: 12800,
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'AUD-9021',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actor: 'sarah.chen@pulsegrid.ai',
    role: 'Site Reliability Engineer',
    action: 'INCIDENT_TRIAGE_ACKNOWLEDGED',
    target: 'INC-2026-881',
    status: 'success',
    ipAddress: '192.168.1.104',
    hashSignature: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'AUD-9020',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    actor: 'autonomous-remediation-engine',
    role: 'System AI Agent',
    action: 'AUTO_DEFENSE_PROPOSAL_DISPATCH',
    target: 'order-orchestrator',
    status: 'success',
    ipAddress: '10.0.4.12',
    hashSignature: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
  },
  {
    id: 'AUD-9019',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    actor: 'alex.mercer@pulsegrid.ai',
    role: 'Cloud Architect',
    action: 'TRIGGER_ACTIVE_DEFRAG',
    target: 'redis-cache',
    status: 'success',
    ipAddress: '172.16.20.88',
    hashSignature: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
  },
  {
    id: 'AUD-9018',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    actor: 'autonomous-remediation-engine',
    role: 'System AI Agent',
    action: 'EXECUTE_CANARY_BGP_ROLLBACK',
    target: 'edge-gateway',
    status: 'success',
    ipAddress: '10.0.1.2',
    hashSignature: 'sha256:cb2b3e811ecbe8ecb53443a59d95f4e1f73602f378a59be84920257321aa1d57',
  },
];

// Telemetry Metric Time-series Generator
function generateTimeSeries() {
  const points = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const anomalyFactor = (i >= 2 && i <= 5) ? 1.6 : 1.0;
    points.push({
      time: timestamp,
      rps: Math.round((28000 + Math.sin(i / 3) * 6000 + Math.random() * 2000) * anomalyFactor),
      latencyP50: Math.round(18 + Math.random() * 4 + (anomalyFactor > 1 ? 40 : 0)),
      latencyP99: Math.round(45 + Math.random() * 10 + (anomalyFactor > 1 ? 160 : 0)),
      errorRate: Number(((0.02 + Math.random() * 0.04) * (anomalyFactor > 1 ? 15 : 1)).toFixed(3)),
      cpuAverage: Math.round((38 + Math.cos(i / 2) * 8 + Math.random() * 6) * (anomalyFactor > 1 ? 1.4 : 1)),
      resilienceIndex: Math.round(Math.max(68, 98 - (anomalyFactor > 1 ? 24 : 0) + Math.random() * 2)),
    });
  }
  return points;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Current Session & RBAC
app.get('/api/auth/me', (req, res) => {
  res.json({
    user: {
      id: 'USR-8902',
      name: 'Sarah Chen',
      email: 'jerrygodwin04@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Site Reliability Lead',
      clearanceLevel: 'L4-SuperAdmin',
      activeRegion: 'Global Command (Primary)',
      permissions: [
        'TELEMETRY_VIEW_REALTIME',
        'INCIDENT_DECLARE_RESOLVE',
        'AUTO_REMEDIATION_EXECUTE',
        'CHAOS_SIMULATION_TRIGGER',
        'AI_COPILOT_UNRESTRICTED',
        'AUDIT_LOG_EXPORT',
        'SECURITY_POLICY_OVERRIDE',
      ],
    },
  });
});

// 2. Service Nodes & Live Telemetry
app.get('/api/telemetry/nodes', (req, res) => {
  // Add small micro-fluctuations to emulate live streaming heartbeat
  const liveNodes = serviceNodes.map((node) => {
    const deltaCpu = (Math.random() - 0.5) * 3;
    const deltaMem = (Math.random() - 0.5) * 2;
    const deltaLat = (Math.random() - 0.5) * 4;
    return {
      ...node,
      cpu: Math.min(100, Math.max(5, Math.round(node.cpu + deltaCpu))),
      memory: Math.min(100, Math.max(10, Math.round(node.memory + deltaMem))),
      latency: Math.max(1, Math.round(node.latency + deltaLat)),
      rps: Math.round(node.rps * (0.98 + Math.random() * 0.04)),
    };
  });
  res.json({
    nodes: liveNodes,
    clusterHealthScore: 94.6,
    activeIncidentsCount: incidents.filter((i) => i.status !== 'resolved').length,
    globalRps: liveNodes.reduce((acc, curr) => acc + curr.rps, 0),
    avgUptime: 99.982,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/telemetry/timeseries', (req, res) => {
  res.json({
    data: generateTimeSeries(),
  });
});

// 3. Incidents Management
app.get('/api/incidents', (req, res) => {
  res.json({ incidents });
});

app.post('/api/incidents/:id/remediate', (req, res) => {
  const { id } = req.params;
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.remediationStatus = 'applied';
  incident.status = 'mitigating';

  // Also heal the affected service
  const service = serviceNodes.find((s) => s.id === incident.affectedService);
  if (service) {
    service.status = 'healthy';
    service.cpu = Math.round(service.cpu * 0.55);
    service.memory = Math.round(service.memory * 0.65);
    service.latency = Math.round(service.latency * 0.35);
    service.errorRate = 0.01;
    service.instances += 4;
  }

  // Record audit log
  const newAudit: AuditLog = {
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    actor: 'sarah.chen@pulsegrid.ai (Triggered via UI)',
    role: 'Site Reliability Lead',
    action: `EXECUTED_REMEDIATION: ${incident.remediationAction}`,
    target: incident.affectedService,
    status: 'success',
    ipAddress: '192.168.1.104',
    hashSignature: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
  };
  auditLogs.unshift(newAudit);

  res.json({
    success: true,
    message: `Self-healing runbook successfully deployed to ${incident.affectedService}. Cluster metrics normalizing.`,
    incident,
    service,
  });
});

app.post('/api/incidents/:id/resolve', (req, res) => {
  const { id } = req.params;
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.status = 'resolved';
  incident.mttrSeconds = incident.mttrSeconds || 184;

  const newAudit: AuditLog = {
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    actor: 'sarah.chen@pulsegrid.ai',
    role: 'Site Reliability Lead',
    action: `RESOLVED_INCIDENT: ${incident.title}`,
    target: incident.id,
    status: 'success',
    ipAddress: '192.168.1.104',
    hashSignature: `sha256:${Math.random().toString(36).substring(2)}`,
  };
  auditLogs.unshift(newAudit);

  res.json({ success: true, incident });
});

// 4. Predictive Machine Learning & Explainable AI (XAI)
app.get('/api/ai/predictive-risk', (req, res) => {
  res.json({
    predictionWindow: 'Next 45 Minutes',
    outageProbabilityScore: 0.28, // 28% likelihood of cascade without action
    threatLevel: 'MODERATE_ELEVATED',
    topRiskServices: [
      {
        serviceId: 'order-orchestrator',
        name: 'Order Fulfillment Orchestrator',
        riskScore: 0.74,
        primaryFactor: 'Memory heap saturation & GC pause duration drift',
        estimatedDegradeTime: '18 minutes',
      },
      {
        serviceId: 'redis-cache',
        name: 'Redis Enterprise In-Memory Cluster',
        riskScore: 0.41,
        primaryFactor: 'Key eviction rate spikes during checkout bursts',
        estimatedDegradeTime: '42 minutes',
      },
      {
        serviceId: 'auth-service',
        name: 'Auth0 / IAM Token Broker',
        riskScore: 0.12,
        primaryFactor: 'Nominal operational range',
        estimatedDegradeTime: 'No degradation anticipated',
      },
    ],
    // Explainable AI (SHAP / Feature Attribution)
    featureImportance: [
      { feature: 'Thread Pool Saturation Ratio', contribution: 38.4, direction: 'positive_risk' },
      { feature: 'P99 DB Connection Acquire Latency', contribution: 26.2, direction: 'positive_risk' },
      { feature: 'Garbage Collection Stop-the-World Durations', contribution: 18.5, direction: 'positive_risk' },
      { feature: 'Cross-AZ Network Packet Jitter', contribution: 9.8, direction: 'positive_risk' },
      { feature: 'CPU Throttle Time in Cgroups', contribution: 7.1, direction: 'positive_risk' },
    ],
    preventativeRecommendation: 'Pre-scale order-orchestrator to 12 replicas and enable Redis connection pool keep-alive ping to eliminate connection handshakes.',
    // 7-day Historical Data + 7-day Future Resource Capacity Forecast
    capacityForecast: [
      { dayLabel: 'Wed', date: 'Sep 24', isForecast: false, cpu: 46, memory: 51, cpuUpperConfidence: 48, cpuLowerConfidence: 44, memUpperConfidence: 53, memLowerConfidence: 49, headroomReplicasNeeded: 0, saturationWarning: false },
      { dayLabel: 'Thu', date: 'Sep 25', isForecast: false, cpu: 50, memory: 54, cpuUpperConfidence: 52, cpuLowerConfidence: 48, memUpperConfidence: 56, memLowerConfidence: 52, headroomReplicasNeeded: 0, saturationWarning: false },
      { dayLabel: 'Fri', date: 'Sep 26', isForecast: false, cpu: 54, memory: 59, cpuUpperConfidence: 56, cpuLowerConfidence: 52, memUpperConfidence: 61, memLowerConfidence: 57, headroomReplicasNeeded: 0, saturationWarning: false },
      { dayLabel: 'Sat', date: 'Sep 27', isForecast: false, cpu: 59, memory: 62, cpuUpperConfidence: 61, cpuLowerConfidence: 57, memUpperConfidence: 64, memLowerConfidence: 60, headroomReplicasNeeded: 1, saturationWarning: false },
      { dayLabel: 'Sun', date: 'Sep 28', isForecast: false, cpu: 63, memory: 66, cpuUpperConfidence: 65, cpuLowerConfidence: 61, memUpperConfidence: 68, memLowerConfidence: 64, headroomReplicasNeeded: 1, saturationWarning: false },
      { dayLabel: 'Mon', date: 'Sep 29', isForecast: false, cpu: 68, memory: 69, cpuUpperConfidence: 70, cpuLowerConfidence: 66, memUpperConfidence: 71, memLowerConfidence: 67, headroomReplicasNeeded: 2, saturationWarning: false },
      { dayLabel: 'Tue', date: 'Sep 30 (Today)', isForecast: false, cpu: 74, memory: 72, cpuUpperConfidence: 76, cpuLowerConfidence: 72, memUpperConfidence: 74, memLowerConfidence: 70, headroomReplicasNeeded: 3, saturationWarning: false },
      // Future Forecast (Next 7 Days)
      { dayLabel: 'Wed', date: 'Oct 01 (+1d)', isForecast: true, cpu: 77, memory: 76, cpuUpperConfidence: 80, cpuLowerConfidence: 74, memUpperConfidence: 79, memLowerConfidence: 73, headroomReplicasNeeded: 4, saturationWarning: false },
      { dayLabel: 'Thu', date: 'Oct 02 (+2d)', isForecast: true, cpu: 80, memory: 79, cpuUpperConfidence: 84, cpuLowerConfidence: 76, memUpperConfidence: 83, memLowerConfidence: 75, headroomReplicasNeeded: 6, saturationWarning: false },
      { dayLabel: 'Fri', date: 'Oct 03 (+3d)', isForecast: true, cpu: 83, memory: 82, cpuUpperConfidence: 87, cpuLowerConfidence: 79, memUpperConfidence: 86, memLowerConfidence: 78, headroomReplicasNeeded: 8, saturationWarning: false },
      { dayLabel: 'Sat', date: 'Oct 04 (+4d)', isForecast: true, cpu: 86, memory: 85, cpuUpperConfidence: 91, cpuLowerConfidence: 81, memUpperConfidence: 89, memLowerConfidence: 81, headroomReplicasNeeded: 10, saturationWarning: true },
      { dayLabel: 'Sun', date: 'Oct 05 (+5d)', isForecast: true, cpu: 89, memory: 88, cpuUpperConfidence: 94, cpuLowerConfidence: 84, memUpperConfidence: 92, memLowerConfidence: 84, headroomReplicasNeeded: 12, saturationWarning: true },
      { dayLabel: 'Mon', date: 'Oct 06 (+6d)', isForecast: true, cpu: 92, memory: 91, cpuUpperConfidence: 97, cpuLowerConfidence: 87, memUpperConfidence: 95, memLowerConfidence: 87, headroomReplicasNeeded: 14, saturationWarning: true },
      { dayLabel: 'Tue', date: 'Oct 07 (+7d)', isForecast: true, cpu: 95, memory: 94, cpuUpperConfidence: 99, cpuLowerConfidence: 90, memUpperConfidence: 98, memLowerConfidence: 89, headroomReplicasNeeded: 16, saturationWarning: true },
    ],
  });
});

// 5. Generative AI Incident Copilot & Post-Mortem RCA via Gemini API
app.post('/api/ai/copilot', async (req, res) => {
  const { query, activeTab, contextData } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const systemPrompt = `You are PulseGrid Copilot, an elite Senior Site Reliability Architect and AIOps expert.
You have real-time telemetry access to the distributed cloud infrastructure:
Active Incidents:
${JSON.stringify(incidents, null, 2)}

Service Node Topology & Metrics:
${JSON.stringify(serviceNodes, null, 2)}

Answer the user's technical questions, incident queries, architecture explanations, or remediation commands with extreme precision, crisp formatting, actionable SRE insights, and terminal/kubectl/config recommendations where relevant.
Be authoritative, clear, and professional. Format with Markdown, bullet points, and code blocks where helpful.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Analysis completed with nominal telemetry metrics.',
        source: 'gemini-3.8-flash',
        modelStatus: 'online',
      });
    } catch (err: any) {
      console.error('Gemini API call failed:', err);
      // Fallback gracefully to algorithmic SRE intelligence
    }
  }

  // Heuristic SRE Expert Fallback Engine
  let answer = '';
  const lower = query.toLowerCase();

  if (lower.includes('order') || lower.includes('saturation') || lower.includes('inc-2026-881')) {
    answer = `### 🔍 Incident INC-2026-881 Telemetry Diagnosis
- **Root Cause**: Tail latency on **Order Orchestrator** is at **380ms p99** due to thread pool saturation caused by synchronous payment verification retries.
- **Affected Pods**: 8 instances in \`us-east-1a\` and \`us-east-1b\`.
- **Recommended Remediation Command**:
\`\`\`bash
# 1. Scale deployment replicas immediately
kubectl scale deployment order-orchestrator --replicas=14 -n prod-core

# 2. Enable circuit breaker fast-failure in Envoy mesh
kubectl apply -f https://pulsegrid.ai/manifests/envoy-breaker-order.yaml
\`\`\`
- **Blast Radius**: 14.2% of cart checkouts. Clicking **"Execute Runbook"** in the UI will trigger automated pod scaling and normalize p99 latency to < 65ms within 45 seconds.`;
  } else if (lower.includes('redis') || lower.includes('memory') || lower.includes('cache')) {
    answer = `### ⚡ Redis Enterprise Cluster Status
- **Current Memory Usage**: 68% (Fragmentation ratio: 1.48)
- **Active Incident**: INC-2026-879 (Mitigation in progress)
- **Action Applied**: Background defragmentation cycle (\`activedefrag yes\`) with eviction policy \`volatile-lru\`.
- **Latency**: 1.2ms average, 3.5ms p99 (Healthy). No cache stampede detected.`;
  } else if (lower.includes('chaos') || lower.includes('simulate') || lower.includes('disaster')) {
    answer = `### 🌪️ Chaos Engineering Engine Overview
PulseGrid supports real-time simulated disaster injections:
1. **Black Friday 10x Traffic Surge**: Injects 150k RPS synthetic flood into Edge Gateway.
2. **PostgreSQL Aurora Connection Exhaustion**: Clamps max_connections to simulate pool exhaustion.
3. **Multi-AZ Network Partition**: Simulates 350ms cross-zone latency between \`us-east-1\` and downstream services.
4. **Memory Leak Injection**: Simulates a steady 2.5MB/s memory leak in compute workers.

You can trigger any of these directly in the **Chaos Lab** tab to evaluate system self-healing in real time!`;
  } else if (lower.includes('viva') || lower.includes('college') || lower.includes('architecture')) {
    answer = `### 🎓 PulseGrid System Architecture & College Viva Overview
- **System Classification**: AIOps 3.0 Autonomous Infrastructure Resilience Platform.
- **Novelty & Innovation**:
  1. **Multivariate Anomaly Detection** combining Z-score dynamic thresholds with multi-metric correlation.
  2. **Explainable AI (XAI)** featuring SHAP-style attribution for zero-blackbox incident comprehension.
  3. **Autonomous Self-Healing Runbooks** that resolve P1/P2 incidents in < 180 seconds compared to manual industry avg of 42 minutes.
  4. **Cryptographic Tamper-Proof Audit Logging** for SOC2/ISO27001 regulatory compliance.
- Check the **"College Viva & Architecture"** tab in the navigation bar to see live UML diagrams, Data Flow Diagrams, Mathematical formulas, and the automated Test Suite runner!`;
  } else {
    answer = `### 🤖 PulseGrid System Status Briefing
- **Platform Availability**: 99.982% across all 9 microservices.
- **Active Workloads**: ${serviceNodes.reduce((a, b) => a + b.rps, 0).toLocaleString()} RPS total ingestion.
- **System Health Score**: 94.6 / 100.
- **Recommended Action**: Acknowledge and deploy remediation for **INC-2026-881** on \`order-orchestrator\` to prevent cascading queue pressure on the PostgreSQL Aurora cluster.`;
  }

  res.json({
    reply: answer,
    source: 'local-heuristic-sre-engine',
    modelStatus: 'local_fallback',
  });
});

// 6. Automated Post-Mortem RCA Generator
app.post('/api/ai/generate-rca', async (req, res) => {
  const { incidentId } = req.body;
  const incident = incidents.find((i) => i.id === incidentId) || incidents[0];

  const rcaPrompt = `Generate a rigorous, enterprise-grade Post-Mortem Incident Root Cause Analysis (RCA) report for the following incident:
Incident: ${JSON.stringify(incident, null, 2)}

Include the following standardized sections:
1. Executive Summary
2. 5-Whys Deep-Dive Analysis
3. Blast Radius & Customer Impact Quantification
4. Contributing Latent Failures & Technical Debt
5. Corrective & Preventative Action Items (CAPA) with assigned owners and timelines
6. Reliability Engineering Lessons Learned`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: rcaPrompt,
        config: {
          systemInstruction: 'You are a Principal Reliability Architect writing an official post-incident RCA review document.',
        },
      });

      return res.json({
        rcaReport: response.text,
        incidentId: incident.id,
        generatedAt: new Date().toISOString(),
        author: 'PulseGrid Autonomous SRE Engine & Gemini AI',
      });
    } catch (err) {
      console.warn('Gemini RCA generation failed, returning standard structured RCA:', err);
    }
  }

  const structuredRca = `# OFFICIAL POST-MORTEM ROOT CAUSE ANALYSIS (RCA)
**Incident Identifier**: ${incident.id}  
**Severity**: ${incident.severity}  
**Affected Component**: ${incident.affectedService}  
**Detection Time (MTTD)**: ${incident.mttdSeconds} seconds  
**Resolution Time (MTTR)**: ${incident.mttrSeconds || 194} seconds  
**Estimated Financial Loss**: $${incident.financialImpactEstimated.toLocaleString()}  

---

### 1. Executive Summary
At ${incident.detectedAt}, automated observability probes detected a significant divergence in service performance on \`${incident.affectedService}\`. Tail latencies escalated from standard baseline (45ms) to peak threshold (380ms p99), triggering high-priority P2 alerting. Automated runbook orchestration mitigated the degradation within 3 minutes by horizontal pod auto-scaling and queue backoff.

### 2. The 5-Whys Diagnostic Trace
1. **Why did customer checkout requests experience timeouts?**
   - The thread pool of \`${incident.affectedService}\` was completely saturated with waiting HTTP client requests.
2. **Why was the thread pool saturated?**
   - Inbound HTTP worker threads were held open waiting for payment processor verification handshakes.
3. **Why did the payment processor handshakes block worker threads?**
   - Synchronous network I/O calls lacked an adaptive client-side timeout and circuit breaker fast-failure policy.
4. **Why did synchronous calls lack adaptive timeouts?**
   - The legacy payment bridge library defaulted to unbounded keep-alive sockets during downstream retry loops.
5. **Why was this condition not caught in pre-production?**
   - Synthetic staging tests simulated uniform latency without testing high-concurrency payment gateway micro-jitter.

### 3. Blast Radius & Impact Analysis
- **Impacted Users**: 14.2% of active checkout sessions during the 14-minute anomaly interval.
- **Failed Transactions**: 428 requests returned HTTP 504 Gateway Timeout.
- **Data Integrity**: 100% intact. No financial transactions were double-charged due to idempotent idempotency-key headers.

### 4. Corrective and Preventative Action Items (CAPA)
| Action Item | Classification | Owner | SLA |
| :--- | :--- | :--- | :--- |
| Enforce non-blocking Reactive WebClient for payment requests | Engineering Fix | Dev Team | 48 Hours |
| Lower HPA CPU threshold from 80% to 65% for earlier scaling | Infrastructure | SRE Team | Completed |
| Install Envoy Circuit Breaker with 50ms maximum timeout | Mesh Config | DevOps Lead | Completed |
| Add Chaos Engineering automated gate in CI/CD pipeline | Quality Gate | QA Automation | 7 Days |

**Report Approved by**: Sarah Chen (Principal Site Reliability Lead)  
**Classification**: SOC2 Type-II Verified Audit Record`;

  res.json({
    rcaReport: structuredRca,
    incidentId: incident.id,
    generatedAt: new Date().toISOString(),
    author: 'PulseGrid Autonomous SRE Engine',
  });
});

// 7. Chaos Engineering & What-If Disaster Simulation
app.post('/api/chaos/simulate', (req, res) => {
  const { scenario } = req.body;

  let impactDescription = '';
  let resilienceScore = 92;

  if (scenario === 'traffic_spike') {
    const gateway = serviceNodes.find((s) => s.id === 'edge-gateway');
    const order = serviceNodes.find((s) => s.id === 'order-orchestrator');
    if (gateway && order) {
      gateway.rps = 48000;
      gateway.cpu = 88;
      order.cpu = 94;
      order.latency = 280;
      order.status = 'critical';
    }
    impactDescription = 'Injected 10x traffic spike (48,000 RPS). Edge rate-limiting engaged and scaled pods from 12 -> 24.';
    resilienceScore = 84;
  } else if (scenario === 'db_exhaustion') {
    const db = serviceNodes.find((s) => s.id === 'postgres-primary');
    if (db) {
      db.cpu = 96;
      db.latency = 120;
      db.status = 'critical';
    }
    impactDescription = 'PostgreSQL Aurora connection pool exhausted (max_connections=5000 hit). Read-replica auto-routing activated.';
    resilienceScore = 78;
  } else if (scenario === 'az_failure') {
    impactDescription = 'Simulated catastrophic AZ outage in us-east-1a. Multi-AZ automatic failover routed 100% traffic to us-east-1b in 1.4s.';
    resilienceScore = 96;
  } else if (scenario === 'reset') {
    // Reset to healthy baseline
    serviceNodes.forEach((s) => {
      s.status = 'healthy';
      s.cpu = Math.min(60, s.cpu);
      s.memory = Math.min(65, s.memory);
      s.latency = Math.min(45, s.latency);
      s.errorRate = 0.01;
    });
    impactDescription = 'Cluster returned to baseline equilibrium.';
    resilienceScore = 98;
  }

  // Record audit log
  auditLogs.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    actor: 'sarah.chen@pulsegrid.ai (Chaos Lab)',
    role: 'Site Reliability Lead',
    action: `CHAOS_EXPERIMENT_EXECUTED: ${scenario}`,
    target: 'Global Infrastructure Mesh',
    status: 'success',
    ipAddress: '192.168.1.104',
    hashSignature: `sha256:${Math.random().toString(36).substring(2)}`,
  });

  res.json({
    success: true,
    scenario,
    impactDescription,
    resilienceScore,
    nodes: serviceNodes,
  });
});

// 8. Audit Logs
app.get('/api/audit', (req, res) => {
  res.json({ logs: auditLogs });
});

// ----------------------------------------------------
// Production Static Serving or Dev Vite Mounting
// ----------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PulseGrid AIOps] Enterprise Server running on port ${PORT}`);
});
