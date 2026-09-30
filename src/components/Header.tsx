import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Bell,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeIncidentsCount: number;
  healthScore: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onQuickChaos: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeIncidentsCount,
  healthScore,
  onRefresh,
  isRefreshing,
  onQuickChaos,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const roles: UserRole[] = [
    'Site Reliability Lead',
    'Incident Commander',
    'Operations Analyst',
    'Executive Observer',
    'Super Admin',
  ];

  const roleBadges: Record<UserRole, { color: string; desc: string }> = {
    'Site Reliability Lead': { color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40', desc: 'Full remediation & telemetry write access' },
    'Incident Commander': { color: 'border-amber-500/40 text-amber-300 bg-amber-950/40', desc: 'P1 command & runbook dispatch authority' },
    'Operations Analyst': { color: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40', desc: 'SLA analytics & reporting view' },
    'Executive Observer': { color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40', desc: 'Financial blast radius & high-level KPIs' },
    'Super Admin': { color: 'border-purple-500/40 text-purple-300 bg-purple-950/40', desc: 'Unrestricted security & chaos overrides' },
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Live Sync Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Activity className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PulseGrid AIOps
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  v3.4-PROD
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                  REALTIME SYNCHRONIZED (2s)
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-medium">Multi-Region Mesh</span>
              </div>
            </div>
          </div>

          {/* Global Health Pill */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-glow-emerald" />
              <span className="text-slate-400">Cluster Health:</span>
              <span className="font-mono font-semibold text-emerald-400">{healthScore}%</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3.5 h-3.5 ${activeIncidentsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-slate-400">Active Incidents:</span>
              <span className={`font-mono font-bold ${activeIncidentsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeIncidentsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Poll fresh telemetry"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Telemetry</span>
          </button>

          {/* Quick Chaos Simulation Button */}
          <button
            onClick={onQuickChaos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-medium transition-all shadow-sm shadow-rose-950/50 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Chaos Trigger</span>
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${roleBadges[currentRole].color}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Role</div>
                <div className="font-semibold">{currentRole}</div>
              </div>
              <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl p-2 z-50 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400 font-medium">
                  Switch Active RBAC Persona (Viva Demo Mode)
                </div>
                <div className="py-1 space-y-1">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                        currentRole === role
                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/60'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{role}</span>
                        {currentRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400">{roleBadges[role].desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 ring-1 ring-cyan-500/30 overflow-hidden flex items-center justify-center font-bold text-xs text-cyan-300">
              SC
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">Sarah Chen</div>
              <div className="text-[10px] text-slate-400 font-mono">jerrygodwin04@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
