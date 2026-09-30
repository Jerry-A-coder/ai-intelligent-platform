import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  FileCheck,
  CheckCircle2,
  Search,
  Filter,
  Terminal,
  Shield,
  Clock,
  UserCheck,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditSecurityViewProps {
  logs: AuditLog[];
}

export const AuditSecurityView: React.FC<AuditSecurityViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SOC2 Type-II Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100% Valid</div>
          <div className="text-[11px] text-slate-400 mt-1">Audit log retention: 365 Days</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cryptographic Integrity</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">SHA-256 Chain</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero tamper anomalies detected</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MFA & IAM Policy</span>
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">Strict Enforced</div>
          <div className="text-[11px] text-slate-400 mt-1">FIDO2 WebAuthn & TOTP</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active RBAC Roles</span>
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">5 Personas</div>
          <div className="text-[11px] text-slate-400 mt-1">Principle of Least Privilege</div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Zero-Trust Role-Based Access Control (RBAC) Policy Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicit granular permissions across platform capabilities ensuring non-repudiation
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-semibold">Capability / Action</th>
                <th className="pb-2.5 text-center">Super Admin</th>
                <th className="pb-2.5 text-center">SRE Lead</th>
                <th className="pb-2.5 text-center">Incident Commander</th>
                <th className="pb-2.5 text-center">Ops Analyst</th>
                <th className="pb-2.5 text-center">Executive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-sans font-medium text-white">View Realtime Telemetry & Service Mesh</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white">Execute Automated Remediation Runbooks</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white">Trigger Chaos Turbulence Experiments</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white">Generate Gemini Post-Mortem RCA Documents</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white">Export Audit Trails & Modify Security Policies</td>
                <td className="text-center text-emerald-400 font-bold">✓</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Cryptographically Signed Immutable Audit Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every remediation, role escalation, and chaos injection is hashed with SHA-256 for non-repudiation
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-72"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5">ID</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Actor</th>
                <th className="pb-2.5">Role</th>
                <th className="pb-2.5">Action Executed</th>
                <th className="pb-2.5">Target</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">SHA-256 Hash Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 text-cyan-400 font-bold">{log.id}</td>
                  <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 font-sans text-white">{log.actor}</td>
                  <td className="py-3 text-slate-400">{log.role}</td>
                  <td className="py-3 text-amber-300 font-semibold">{log.action}</td>
                  <td className="py-3 text-cyan-300">{log.target}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-[10px] text-slate-400 truncate max-w-[120px]" title={log.hashSignature}>
                    {log.hashSignature.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
