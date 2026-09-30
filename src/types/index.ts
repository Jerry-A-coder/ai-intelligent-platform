export type UserRole =
  | 'Site Reliability Lead'
  | 'Incident Commander'
  | 'Operations Analyst'
  | 'Executive Observer'
  | 'Super Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  clearanceLevel: string;
  activeRegion: string;
  permissions: string[];
}

export type NodeCategory = 'gateway' | 'compute' | 'database' | 'messaging' | 'cache' | 'worker';
export type NodeStatus = 'healthy' | 'warning' | 'critical' | 'degraded';

export interface ServiceNode {
  id: string;
  name: string;
  category: NodeCategory;
  status: NodeStatus;
  cpu: number;
  memory: number;
  latency: number;
  p99Latency: number;
  errorRate: number;
  rps: number;
  instances: number;
  region: string;
  uptime: number;
  dependencies: string[];
}

export type IncidentSeverity = 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MEDIUM' | 'P4-LOW';
export type IncidentStatus = 'active' | 'investigating' | 'mitigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
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
  financialImpactEstimated: number;
}

export interface MetricDataPoint {
  time: string;
  rps: number;
  latencyP50: number;
  latencyP99: number;
  errorRate: number;
  cpuAverage: number;
  resilienceIndex: number;
}

export interface RiskFeature {
  feature: string;
  contribution: number;
  direction: 'positive_risk' | 'negative_risk';
}

export interface CapacityForecastPoint {
  dayLabel: string;
  date: string;
  isForecast: boolean;
  cpu: number;
  memory: number;
  cpuUpperConfidence?: number;
  cpuLowerConfidence?: number;
  memUpperConfidence?: number;
  memLowerConfidence?: number;
  headroomReplicasNeeded?: number;
  saturationWarning?: boolean;
}

export interface PredictiveRiskData {
  predictionWindow: string;
  outageProbabilityScore: number;
  threatLevel: string;
  topRiskServices: {
    serviceId: string;
    name: string;
    riskScore: number;
    primaryFactor: string;
    estimatedDegradeTime: string;
  }[];
  featureImportance: RiskFeature[];
  preventativeRecommendation: string;
  capacityForecast?: CapacityForecastPoint[];
}

export interface AuditLog {
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
