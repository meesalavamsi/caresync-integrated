import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Bed, 
  Pill, 
  AlertTriangle, 
  CheckSquare, 
  Server, 
  ArrowRight,
  X
} from 'lucide-react';
import { NavTab, Patient, CareTask, ServiceNowIncident } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  careTasks: CareTask[];
  incidents: ServiceNowIncident[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  patients,
  onSelectPatient,
  careTasks,
  incidents
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.mrn.includes(query) || 
    p.roomNumber.includes(query) ||
    p.admittingDx.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIncidents = incidents.filter(inc => 
    inc.number.toLowerCase().includes(query.toLowerCase()) ||
    inc.title.toLowerCase().includes(query.toLowerCase()) ||
    inc.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = careTasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.patientName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a patient name, MRN, ServiceNow incident (INC...), or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-slate-800 placeholder-slate-400 text-sm focus:outline-hidden bg-transparent"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Navigation */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Screen Navigation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'overview' as NavTab, label: 'Overview / Mission Control' },
                { id: 'ward-dashboard' as NavTab, label: 'Ward Dashboard' },
                { id: 'patient-360' as NavTab, label: 'Patient 360 View' },
                { id: 'medication-safety' as NavTab, label: 'Medication Safety' },
                { id: 'care-tasks' as NavTab, label: 'Care Tasks (STAT)' },
                { id: 'administration' as NavTab, label: 'ServiceNow IT Hub' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 text-left transition-colors text-slate-700 font-medium"
                >
                  <span className="truncate">{tab.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Patients Section */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3 h-3 text-teal-600" />
                Patients in Unit ({filteredPatients.length})
              </div>
              <div className="space-y-1">
                {filteredPatients.map(pt => (
                  <button
                    key={pt.id}
                    onClick={() => {
                      onSelectPatient(pt.id);
                      onSelectTab('patient-360');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50 border border-transparent hover:border-teal-200 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {pt.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-teal-900 flex items-center gap-2">
                          {pt.name}
                          <span className="text-[11px] font-normal text-slate-500">MRN: {pt.mrn}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Room {pt.roomNumber} • {pt.admittingDx}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                      HR: {pt.vitals.hr} | SpO2: {pt.vitals.spO2}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ServiceNow Incidents */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3 h-3 text-emerald-600" />
                ServiceNow IT Incidents ({filteredIncidents.length})
              </div>
              <div className="space-y-1">
                {filteredIncidents.map(inc => (
                  <button
                    key={inc.id}
                    onClick={() => {
                      onSelectTab('administration');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">{inc.number}</span>
                      <span className="text-slate-700 truncate max-w-md">{inc.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inc.priority.startsWith('1') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inc.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-white border border-slate-300 text-slate-600">Esc</kbd> to close</span>
          <span>CareSync + ServiceNow Bridge Active</span>
        </div>
      </div>
    </div>
  );
};
