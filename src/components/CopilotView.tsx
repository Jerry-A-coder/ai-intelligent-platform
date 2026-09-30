import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Bot,
  User,
  Zap,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Incident } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

interface CopilotViewProps {
  incidents: Incident[];
  preselectedIncidentId?: string;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  incidents,
  preselectedIncidentId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'rca'>('chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      content: `Hello Sarah. I am **PulseGrid Copilot**, powered by **Gemini 3.8 Flash**. I am grounded in live telemetry across your 9 microservice nodes and current active incidents (\`INC-2026-881\` on Order Orchestrator). 

How can I assist your site reliability operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // RCA Studio state
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    preselectedIncidentId || incidents[0]?.id || 'INC-2026-881'
  );
  const [rcaReport, setRcaReport] = useState<string>('');
  const [isGeneratingRca, setIsGeneratingRca] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const quickPrompts = [
    'Diagnose latency spike on order-orchestrator',
    'Generate Envoy circuit breaker configuration',
    'Explain 5-Whys for Redis fragmentation',
    'Provide Kubernetes rollback command for edge gateway',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: data.reply || 'No telemetry response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          content: 'Error communicating with AI Copilot service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateRca = async () => {
    setIsGeneratingRca(true);
    setRcaReport('');
    try {
      const res = await fetch('/api/ai/generate-rca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: selectedIncidentId }),
      });
      const data = await res.json();
      setRcaReport(data.rcaReport);
    } catch (err) {
      console.error(err);
      setRcaReport('Failed to generate RCA report. Please verify connection.');
    } finally {
      setIsGeneratingRca(false);
    }
  };

  const copyToClipboard = () => {
    if (!rcaReport) return;
    navigator.clipboard.writeText(rcaReport);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!rcaReport) return;
    const blob = new Blob([rcaReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCA-${selectedIncidentId}-PostMortem.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Gemini SRE Copilot</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('rca');
              if (!rcaReport) handleGenerateRca();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'rca'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Automated Post-Mortem RCA Studio</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Model: gemini-3.8-flash</span>
        </div>
      </div>

      {/* Mode 1: Interactive Chat Copilot */}
      {activeSubTab === 'chat' && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-col h-[650px] overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 opacity-60 text-[10px] font-mono">
                    <span>{m.sender === 'user' ? 'Sarah Chen (Lead)' : 'PulseGrid SRE Copilot'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans">
                    {m.content}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-slate-200">
                    SC
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 items-center text-xs text-slate-400 font-mono">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
                <span>Gemini 3.8 Flash evaluating cluster telemetry...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Prompts:
            </span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-700/60"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Copilot about incident diagnosis, auto-remediation, or system metrics..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Automated Post-Mortem RCA Studio */}
      {activeSubTab === 'rca' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Select Incident Target:</span>
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.id} — {inc.title.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateRca}
                disabled={isGeneratingRca}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingRca ? 'Synthesizing RCA...' : 'Regenerate Post-Mortem'}</span>
              </button>

              <button
                onClick={copyToClipboard}
                disabled={!rcaReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={downloadMarkdown}
                disabled={!rcaReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>
            </div>
          </div>

          {/* RCA Report Document Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto shadow-2xl relative">
            {isGeneratingRca ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <p>Gemini AI synthesizing official 5-Whys diagnostic breakdown and CAPA action table...</p>
              </div>
            ) : rcaReport ? (
              <div className="whitespace-pre-wrap font-sans prose prose-invert prose-sm max-w-none">
                {rcaReport}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                Click "Regenerate Post-Mortem" to compile an official post-incident RCA report.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
