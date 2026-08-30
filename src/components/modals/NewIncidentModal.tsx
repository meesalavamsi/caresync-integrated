import React, { useState } from 'react';
import { 
  Server, 
  X, 
  AlertTriangle, 
  Send, 
  Cpu, 
  Radio, 
  Database,
  Building
} from 'lucide-react';
import { ServiceNowIncident } from '../../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Partial<ServiceNowIncident>) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceNowIncident['category']>('Biomedical Equipment');
  const [priority, setPriority] = useState<ServiceNowIncident['priority']>('1 - Critical');
  const [location, setLocation] = useState('Cardiac ICU - Ward 4 - Bed 402');
  const [caller, setCaller] = useState('Dr. Sarah Chen');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const incNum = `INC00${Math.floor(10550 + Math.random() * 900)}`;

    onSubmit({
      id: `inc-${Date.now()}`,
      number: incNum,
      sysId: `sys_id_${Math.random().toString(36).substring(2, 12)}`,
      title: title.trim(),
      category,
      priority,
      state: 'New',
      caller,
      assignedGroup: category === 'Biomedical Equipment' ? 'Biomedical Rapid Response' : 'EHR / Interface Engine Team',
      assignedTo: 'Unassigned (Triage in Progress)',
      location,
      created: 'Just now',
      updated: 'Just now',
      description: description.trim() || 'ServiceNow automated ticket created from CareSync Clinical Command Console.',
      workNotes: [
        `Just now - Incident created by ${caller} via CareSync REST Gateway.`,
        'Just now - Auto-routed to Clinical Engineering on-call team.'
      ],
      slaStatus: 'Within SLA',
      slaTimeLeft: priority.startsWith('1') ? '58 mins (1-hr SLA)' : '3h 58m (4-hr SLA)'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#001f1f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Create ServiceNow IT Incident</h3>
              <p className="text-xs text-teal-200/80">Dispatches real-time ticket to ServiceNow ITSM Table</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Short Description / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Infusion Pump Alaris #4 telemetry packet failure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden focus:border-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
              >
                <option value="Biomedical Equipment">Biomedical Equipment</option>
                <option value="EHR / Epic Bridge">EHR / Epic Bridge</option>
                <option value="PACS / Imaging">PACS / Imaging</option>
                <option value="Bedside Telemetry">Bedside Telemetry</option>
                <option value="Pharmacy Pyxis">Pharmacy Pyxis</option>
                <option value="Network / Wi-Fi">Network / Wi-Fi</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Urgency / Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
              >
                <option value="1 - Critical">1 - Critical (Patient Care Affected)</option>
                <option value="2 - High">2 - High (Degraded Performance)</option>
                <option value="3 - Moderate">3 - Moderate</option>
                <option value="4 - Low">4 - Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location / Impact Bed</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Caller / Submitter</label>
              <input
                type="text"
                value={caller}
                onChange={(e) => setCaller(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Detailed Technical Description</label>
            <textarea
              rows={3}
              placeholder="Describe failure symptoms, monitor error codes, or physical location..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Endpoint: https://healthsystems-prod.service-now.com/api/now/table/incident</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit to ServiceNow
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
