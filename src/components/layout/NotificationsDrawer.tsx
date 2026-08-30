import React from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Pill, 
  Server, 
  CheckCircle, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { NavTab } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenPatient: (patientId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenPatient
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      type: 'critical-lab',
      title: 'Critical Lab Value: Marcus Reynolds (Bed 402)',
      message: 'Potassium 5.8 mEq/L resulted. Attending MD review required.',
      time: '5 mins ago',
      tab: 'patient-360' as NavTab,
      patientId: 'pt-1',
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    {
      id: 'notif-2',
      type: 'med-alert',
      title: 'Drug Interaction Flagged: Warfarin + Aspirin',
      message: 'Bed 4A - High risk of gastrointestinal bleeding.',
      time: '12 mins ago',
      tab: 'medication-safety' as NavTab,
      icon: Pill,
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    {
      id: 'notif-3',
      type: 'servicenow',
      title: 'ServiceNow Incident INC0010482 Assigned',
      message: 'David Zhang dispatched for Ventilator V-04 telemetry check.',
      time: '25 mins ago',
      tab: 'administration' as NavTab,
      icon: Server,
      color: 'bg-teal-100 text-teal-700 border-teal-200'
    },
    {
      id: 'notif-4',
      type: 'task',
      title: 'Care Task Overdue: Lasix 40mg IV Push',
      message: 'Bed 402-A (Sharma, R.) is 45m past scheduled administration.',
      time: '45 mins ago',
      tab: 'care-tasks' as NavTab,
      icon: Clock,
      color: 'bg-rose-100 text-rose-700 border-rose-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-800 text-base">Ward Notifications & Alerts</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.patientId) onOpenPatient(n.patientId);
                  onSelectTab(n.tab);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50/80 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${n.color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-800 text-xs group-hover:text-teal-800 line-clamp-1">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-600 font-medium shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-teal-800 font-bold group-hover:underline">
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">4 total unacknowledged</span>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};
