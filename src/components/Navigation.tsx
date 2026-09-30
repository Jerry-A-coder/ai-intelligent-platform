import React from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  Sparkles,
  Flame,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export type TabKey =
  | 'command-center'
  | 'incidents'
  | 'predictive-risk'
  | 'genai-copilot'
  | 'chaos-lab'
  | 'audit-security'
  | 'viva-architecture';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  activeIncidentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  activeIncidentsCount,
}) => {
  const tabs = [
    {
      id: 'command-center' as TabKey,
      label: 'Live Command Mesh',
      icon: Activity,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800/60',
    },
    {
      id: 'incidents' as TabKey,
      label: 'Incident Command & Healing',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} ACTIVE` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800/60 animate-pulse',
    },
    {
      id: 'predictive-risk' as TabKey,
      label: 'Predictive ML & XAI',
      icon: Brain,
      badge: '45m Outage Forecast',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800/60',
    },
    {
      id: 'genai-copilot' as TabKey,
      label: 'Gemini Copilot & RCA',
      icon: Sparkles,
      badge: 'AI GEN',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800/60',
    },
    {
      id: 'chaos-lab' as TabKey,
      label: 'Chaos Lab & Simulator',
      icon: Flame,
      badge: 'Disaster Testing',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800/60',
    },
    {
      id: 'audit-security' as TabKey,
      label: 'Audit & Cyber Security',
      icon: ShieldCheck,
      badge: 'SOC2 Type-II',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800/60',
    },
    {
      id: 'viva-architecture' as TabKey,
      label: 'College Viva & Architecture',
      icon: GraduationCap,
      badge: 'Viva Ready',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
    },
  ];

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 lg:px-8">
      <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 text-cyan-400 shadow-sm border border-slate-700/80 ring-1 ring-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
