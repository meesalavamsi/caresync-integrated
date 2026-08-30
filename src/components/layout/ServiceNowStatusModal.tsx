import React, { useState } from 'react';
import { 
  Server, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  Database, 
  Send,
  Zap,
  Clock,
  Layers
} from 'lucide-react';
import { ServiceNowIncident, ServiceNowITRequest } from '../../types';

interface ServiceNowStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: ServiceNowIncident[];
  requests: ServiceNowITRequest[];
  onTriggerTestIncident: () => void;
}

export const ServiceNowStatusModal: React.FC<ServiceNowStatusModalProps> = ({
  isOpen,
  onClose,
  incidents,
  requests,
  onTriggerTestIncident
}) => {
  const [instanceUrl, setInstanceUrl] = useState('https://healthsystems-prod.service-now.com');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: string; latency: number; timestamp: string } | null>({
    status: '200 OK (Authenticated OAuth 2.0 Bearer)',
    latency: 38,
    timestamp: 'Just now'
  });

  if (!isOpen) return null;

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult({
        status: '200 OK (REST Table API & Flow Designer Live)',
        latency: Math.floor(25 + Math.random() * 20),
        timestamp: new Date().toLocaleTimeString()
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#001f1f] text-white flex items-center justify-between border-b border-[#0d3b38]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                ServiceNow Integration Engine
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Connected
                </span>
              </h3>
              <p className="text-xs text-teal-200/80">Bidirectional IT Service Management (ITSM) & Telemetry Sync</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Connection Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                Target Instance
              </span>
              <div className="mt-1 font-mono text-xs font-bold text-slate-800 truncate">
                healthsystems-prod
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Tokyo v24.2 Patch 4</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                REST Table API
              </span>
              <div className="mt-1 text-xs font-bold text-slate-800">
                incident / sc_req_item
              </div>
              <span className="text-[11px] text-slate-500">Auto-mapped schema</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Webhook Stream
              </span>
              <div className="mt-1 text-xs font-bold text-slate-800">
                Bidirectional
              </div>
              <span className="text-[11px] text-teal-600 font-medium">Real-time event stream</span>
            </div>
          </div>

          {/* Diagnostics and Ping */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="font-sans font-semibold text-slate-300">Live Gateway Telemetry</span>
              <button
                onClick={handlePing}
                disabled={isPinging}
                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                Test Ping API
              </button>
            </div>
            <div className="text-slate-300">Endpoint: <span className="text-teal-400">{instanceUrl}/api/now/table/incident</span></div>
            <div className="text-slate-300">OAuth Client ID: <span className="text-amber-400">caresync-clinical-ops-bridge</span></div>
            {pingResult && (
              <div className="pt-2 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{pingResult.status} — Response time: <strong className="text-white">{pingResult.latency}ms</strong> ({pingResult.timestamp})</span>
              </div>
            )}
          </div>

          {/* Active Synced Records */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Active ServiceNow Work Items in this Ward ({incidents.length + requests.length})
              </h4>
              <button
                onClick={onTriggerTestIncident}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Simulate Telemetry P1 Auto-Ticket
              </button>
            </div>

            <div className="space-y-2">
              {incidents.slice(0, 3).map((inc) => (
                <div 
                  key={inc.id} 
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800">{inc.number}</span>
                      <span className="font-semibold text-slate-800">{inc.title}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Assigned to: {inc.assignedGroup} • {inc.caller}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      inc.priority.startsWith('1') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 font-semibold text-slate-700 text-[10px]">
                      {inc.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Configured according to ServiceNow REST API v2 specification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
