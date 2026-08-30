import React, { useState } from 'react';
import { 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  User, 
  Layers, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Database,
  Cpu,
  Wifi,
  Radio,
  FileCode
} from 'lucide-react';
import { ServiceNowIncident, ServiceNowITRequest } from '../../types';

interface AdministrationViewProps {
  incidents: ServiceNowIncident[];
  requests: ServiceNowITRequest[];
  onNewIncident: () => void;
  onUpdateIncidentState: (incidentId: string, newState: 'In Progress' | 'On Hold' | 'Resolved' | 'Closed') => void;
  onAddWorkNote: (incidentId: string, note: string) => void;
  onOpenServiceNowModal: () => void;
}

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  incidents,
  requests,
  onNewIncident,
  onUpdateIncidentState,
  onAddWorkNote,
  onOpenServiceNowModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'requests' | 'diagnostics'>('incidents');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'inc-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newWorkNote, setNewWorkNote] = useState<string>('');

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const filteredIncidents = incidents.filter(inc => {
    const matchesPriority = filterPriority === 'all' || inc.priority.includes(filterPriority);
    const matchesSearch = inc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.caller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkNote.trim() || !selectedIncident) return;
    onAddWorkNote(selectedIncident.id, `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${newWorkNote.trim()}`);
    setNewWorkNote('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">ServiceNow IT Service Requests & Incident Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Instance REST Bridge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Biomedical engineering tickets, telemetry interfaces, PACS gateways, and clinical device request fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenServiceNowModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Server className="w-4 h-4 text-teal-600" />
            API & Webhook Details
          </button>
          <button
            id="btn-create-sn-ticket"
            onClick={onNewIncident}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create IT Incident
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Incidents</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {incidents.filter(i => i.state !== 'Resolved' && i.state !== 'Closed').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {incidents.filter(i => i.state === 'Resolved').length} Resolved this shift
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Priority 1 (Critical)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {incidents.filter(i => i.priority.startsWith('1') && i.state !== 'Resolved').length}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Ventilator Telemetry (Bed 402)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">IT Service Requests</span>
          <div className="text-2xl font-black text-teal-700 mt-1">{requests.length}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            Pyxis & Barcode Scanners
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Service SLA Compliance</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            All tickets within target SLA
          </div>
        </div>
      </div>

      {/* Navigation Subtabs: Incidents vs Service Requests vs API Gateway */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'incidents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Incident Management (incident)
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
            {incidents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'requests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-400" />
          Service Requests (sc_req_item)
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'diagnostics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-sky-400" />
          Biomedical IoT & Telemetry Health
        </button>
      </div>

      {/* Subtab 1: Incidents Tracking */}
      {activeSubTab === 'incidents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 1 Col: Incidents List with Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by INC#, equipment, caller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold">
                {['all', '1 - Critical', '2 - High', '3 - Moderate'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p === 'all' ? 'all' : p.split(' - ')[0])}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
                      (p === 'all' && filterPriority === 'all') || filterPriority === p.split(' - ')[0]
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'all' ? 'All Priorities' : p.split(' - ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto">
              {filteredIncidents.map(inc => {
                const isSelected = inc.id === selectedIncident?.id;
                const isP1 = inc.priority.startsWith('1');

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-800 text-xs">{inc.number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isP1 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inc.priority.split(' - ')[1]}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                      {inc.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{inc.assignedGroup.split(' ')[0]}</span>
                      <span className={`font-semibold ${
                        inc.state === 'Resolved' ? 'text-emerald-600' : 'text-slate-700'
                      }`}>
                        {inc.state}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Incident Details Inspector & Work Notes */}
          {selectedIncident && (
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-teal-800">{selectedIncident.number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedIncident.priority.startsWith('1') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedIncident.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs">
                      {selectedIncident.category}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 mt-2">{selectedIncident.title}</h2>
                </div>

                {/* State changer buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {(['In Progress', 'On Hold', 'Resolved'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => onUpdateIncidentState(selectedIncident.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedIncident.state === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Caller</span>
                  <strong className="text-slate-800">{selectedIncident.caller}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assignment Group</span>
                  <strong className="text-slate-800">{selectedIncident.assignedGroup}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Tech</span>
                  <strong className="text-teal-700">{selectedIncident.assignedTo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">SLA Time Remaining</span>
                  <strong className="text-emerald-700 font-bold">{selectedIncident.slaTimeLeft}</strong>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800">Incident Description & Clinical Impact</h4>
                <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Work Notes Stream */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  ServiceNow Work Notes & Activity Stream ({selectedIncident.workNotes.length})
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedIncident.workNotes.map((note, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{note}</span>
                    </div>
                  ))}
                </div>

                {/* Add Work Note Input */}
                <form onSubmit={handlePostNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add clinical update or biomedical work note..."
                    value={newWorkNote}
                    onChange={(e) => setNewWorkNote(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post to ServiceNow
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: IT Service Requests (Catalog Items) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800 text-xs">{req.ritmNumber}</span>
                      <span className="text-slate-400 text-xs">({req.reqNumber})</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-1">{req.item}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    req.stage === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {req.stage}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{req.details}</p>

                {/* Fulfillment Stepper */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="text-teal-700">1. Submitted</span>
                    <span className="text-teal-700">2. Approval</span>
                    <span className={req.stage === 'Fulfillment' || req.stage === 'Delivered' ? 'text-teal-700' : ''}>3. Fulfillment</span>
                    <span className={req.stage === 'Delivered' ? 'text-emerald-700' : ''}>4. Delivered</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: req.stage === 'Delivered' ? '100%' : req.stage === 'Fulfillment' ? '75%' : '50%' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Requested for: <strong className="text-slate-800">{req.requestedFor}</strong></span>
                  <span>Est: <strong className="text-teal-800">{req.estimatedCompletion}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Biomedical IoT Diagnostics */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Biomedical IoT Gateway Telemetry & Asset Status</h3>
              <p className="text-xs text-slate-500">Connected clinical devices registered in ServiceNow CMDB</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              12 / 12 Devices Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { name: 'Mindray Central Gateway #1', ip: '10.240.12.8', packets: '48.2 kpps', status: 'Healthy (0.01% drop)' },
              { name: 'Hamilton-G5 Ventilator Bridge', ip: '10.240.12.14', packets: '12.4 kpps', status: 'Warning (INC0010482)' },
              { name: 'Pyxis MedStation 4000 Unit A', ip: '10.240.14.99', packets: '2.1 kpps', status: 'Healthy' },
              { name: 'Philips Telemetry Antenna Pod', ip: '10.240.18.2', packets: '110.8 kpps', status: 'Healthy' },
              { name: 'CareSync FHIR / HL7 Broker', ip: '10.240.8.5', packets: '94.0 kpps', status: 'Healthy (42ms lag)' },
              { name: 'Zebra TC52-HC Barcode Mesh', ip: '10.240.22.40', packets: '8.7 kpps', status: 'Healthy' },
            ].map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{d.name}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${d.status.includes('Warning') ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                </div>
                <div className="text-slate-500 text-[11px]">IP Address: <span className="font-mono text-slate-700">{d.ip}</span></div>
                <div className="text-slate-500 text-[11px]">Data Rate: <strong className="text-slate-800">{d.packets}</strong></div>
                <div className={`text-[11px] font-semibold ${d.status.includes('Warning') ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {d.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
