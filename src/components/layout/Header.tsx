import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  MapPin, 
  Bell, 
  ChevronDown, 
  Server, 
  RefreshCw, 
  AlertTriangle,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { WardLocation } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  selectedLocation: WardLocation;
  setSelectedLocation: (loc: WardLocation) => void;
  onOpenCommandPalette: () => void;
  onOpenServiceNowModal: () => void;
  onOpenNotifications: () => void;
  unreadAlertCount?: number;
  isSyncing?: boolean;
  currentUser?: { name: string; role: string; email: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  selectedLocation,
  setSelectedLocation,
  onOpenCommandPalette,
  onOpenServiceNowModal,
  onOpenNotifications,
  unreadAlertCount = 3,
  isSyncing = false,
  currentUser = null,
  onLogout
}) => {
  const displayName = currentUser?.name || 'Dr. Sarah Chen';
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : 'Senior Intensivist';
  const displayEmail = currentUser?.email || 'sarah.chen@hospital.org';
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const wardLocations: WardLocation[] = [
    'Cardiac ICU - Ward 4',
    'Neuro ICU - Ward 2',
    'Surgical Stepdown - Ward 6',
    'Emergency Dept - Pod A',
    'Pediatric ICU - Ward 3'
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left section: Toggle + Global Search */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search / Command Bar */}
        <div 
          onClick={onOpenCommandPalette}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-500 cursor-pointer transition-colors group text-sm max-w-md shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span className="flex-1 text-slate-400 group-hover:text-slate-600 truncate">
            Search commands...
          </span>
          <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300/80 bg-white text-[11px] font-medium text-slate-500 shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right section: Location Selector + ServiceNow Status + Notifications + Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Ward Location Selector */}
        <div className="relative">
          <button
            id="btn-location-picker"
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <div className="text-left leading-tight">
              <div className="text-slate-800 font-bold">{selectedLocation.split(' - ')[0]}</div>
              <div className="text-[11px] text-slate-600 font-medium">{selectedLocation.split(' - ')[1]}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showLocationMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Ward / Unit
              </div>
              {wardLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedLocation === loc ? 'font-semibold text-teal-700 bg-teal-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {selectedLocation === loc && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ServiceNow Connected Badge */}
        <button
          id="btn-servicenow-status"
          onClick={onOpenServiceNowModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all text-xs font-medium shadow-2xs"
          title="ServiceNow Backend REST & Webhook Gateway Connected"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">ServiceNow Connected</span>
          <span className="sm:hidden">SN Connected</span>
        </button>

        {/* Notification Bell */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative pl-1 border-l border-slate-200">
          <button
            id="btn-user-profile"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{displayName}</div>
              <div className="text-[11px] text-slate-600 font-medium">{displayRole}</div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&h=120&q=80"
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs ring-2 ring-teal-500/20"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 text-sm">{displayName}</p>
                <p className="text-slate-500 text-[11px]">{displayEmail}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CareSync Role: {displayRole}
                </div>
              </div>

              <div className="py-1">
                <button 
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Shift Preferences
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenServiceNowModal();
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Server className="w-4 h-4 text-slate-400" />
                  ServiceNow Credentials & Tokens
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button 
                  onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                  className="w-full text-left px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out / Handover Shift
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
