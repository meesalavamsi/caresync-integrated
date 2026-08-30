import React from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  CheckSquare, 
  UserCheck, 
  Pill, 
  Bed, 
  Users, 
  BarChart3, 
  Settings, 
  Activity,
  Server,
  X
} from 'lucide-react';
import { NavTab } from '../../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  incidentCount?: number;
  alertCount?: number;
  allowedTabs?: NavTab[];
  serviceNowConnected?: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  incidentCount = 2,
  alertCount = 3,
  allowedTabs,
  serviceNowConnected = null
}) => {
  const allNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ward-dashboard', label: 'Ward Dashboard', icon: Activity },
    { id: 'care-tasks', label: 'Care Tasks', icon: CheckSquare, badge: 3, badgeColor: 'bg-rose-500 text-white' },
    { id: 'patient-360', label: 'Patient 360', icon: UserCheck },
    { id: 'medication-safety', label: 'Medication Safety', icon: Pill, badge: alertCount > 0 ? alertCount : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'bed-management', label: 'Bed Management', icon: BedDouble },
    { id: 'family-portal', label: 'Family Portal', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'administration', label: 'Administration', icon: Settings, badge: incidentCount > 0 ? `${incidentCount} SN` : undefined, badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  ];

  const navItems = allowedTabs
    ? allNavItems.filter((item) => allowedTabs.includes(item.id))
    : allNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#001f1f] text-slate-300 flex flex-col border-r border-[#0d3b38] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#093532]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-1.5">
                CareSync
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-teal-900/80 text-teal-300 border border-teal-700/50">
                  ICU
                </span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#0a4440] text-white shadow-sm border border-teal-500/30'
                    : 'text-slate-300 hover:bg-[#06302e] hover:text-white'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-400 rounded-r-full" />
                )}

                <div className="flex items-center gap-3">
                  <Icon 
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ServiceNow Backend Status Footer */}
        <div className="p-3 m-3 rounded-xl bg-[#032927] border border-[#0e4844] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-teal-400" />
              ServiceNow Hub
            </span>
            {serviceNowConnected === false ? (
              <span className="flex items-center gap-1 text-[11px] text-rose-300 font-semibold">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                Offline
              </span>
            ) : serviceNowConnected === null ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                Checking…
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-teal-300 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                </span>
                Connected
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-teal-900/50">
            <span>Mode: <strong className="text-slate-200">{serviceNowConnected ? 'Live' : 'Demo'}</strong></span>
            <span>Table API: <strong className="text-teal-300">{serviceNowConnected === false ? '—' : 'REST'}</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
};
