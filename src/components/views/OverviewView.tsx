import React from 'react';
import { 
  Activity, 
  Users, 
  Bed, 
  AlertTriangle, 
  Pill, 
  CheckSquare, 
  Server, 
  ArrowUpRight, 
  Heart, 
  ShieldAlert, 
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  HeartPulse,
  UserCheck,
  BedDouble,
  CheckCircle2
} from 'lucide-react';
import { NavTab, Patient, Bed as BedType, CareTask, MedicationSafetyAlert, ServiceNowIncident } from '../../types';

interface OverviewViewProps {
  onSelectTab: (tab: NavTab) => void;
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  beds: BedType[];
  careTasks: CareTask[];
  medAlerts: MedicationSafetyAlert[];
  incidents: ServiceNowIncident[];
  onNewIncident: () => void;
  onNewAdmission: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectTab,
  patients,
  onSelectPatient,
  beds,
  careTasks,
  medAlerts,
  incidents,
  onNewIncident,
  onNewAdmission
}) => {
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied' || b.status === 'critical').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const occupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);
  const pendingStatTasks = careTasks.filter(t => t.priority === 'STAT' && t.status !== 'completed');
  const criticalPatients = patients.filter(p => p.acuityLevel.includes('High') || p.vitals.hrStatus === 'critical' || p.vitals.bpStatus === 'dropping');

  // Helper for rendering distinct medical bed icons based on status/type
  const renderBedIcon = (status: string, bedNumber: string) => {
    if (status === 'cleaning' || status === 'freeing-soon') return <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />;
    if (status === 'critical' || bedNumber.includes('ICU') || bedNumber.includes('ER')) return <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />;
    if (status === 'occupied') return <UserCheck className="w-4 h-4 text-teal-300" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#002826] via-[#023b38] to-[#044c48] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-teal-800/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-teal-300" />
              Cardiac ICU • Morning Shift Control
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Clinical & IT Operations Command Center
            </h1>
            <p className="text-slate-200 text-xs mt-1 max-w-2xl leading-relaxed">
              Monitoring 12 bed stations, real-time telemetry streams, drug interaction safety guards, and active ServiceNow IT tickets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-overview-admit"
              onClick={onNewAdmission}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-[#002220] font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
            >
              <Bed className="w-4 h-4" />
              Admit Patient
            </button>
            <button
              id="btn-overview-new-sn"
              onClick={onNewIncident}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Server className="w-4 h-4 text-teal-300" />
              Log ServiceNow IT Ticket
            </button>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Occupancy Card */}
        <div 
          onClick={() => onSelectTab('bed-management')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bed Occupancy</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{occupancyPercent}%</span>
            <span className="text-xs text-slate-500 font-medium">({occupiedBeds}/{totalBeds} Beds)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${occupancyPercent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-teal-700 font-medium">{availableBeds} Available</span>
            <span className="flex items-center text-teal-700 font-medium group-hover:underline">
              Manage <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* STAT Tasks Card */}
        <div 
          onClick={() => onSelectTab('care-tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">STAT Care Tasks</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{pendingStatTasks.length}</span>
            <span className="text-xs text-rose-600 font-bold">Overdue / Priority</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
            {pendingStatTasks[0]?.title || 'All high-priority tasks completed'}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-rose-600 font-semibold">{careTasks.length} total active</span>
            <span className="flex items-center text-teal-700 font-medium group-hover:underline">
              View Board <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Medication Safety Alerts */}
        <div 
          onClick={() => onSelectTab('medication-safety')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Medication Safety</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{medAlerts.length}</span>
            <span className="text-xs text-amber-700 font-bold">Active Warnings</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
            Warfarin + Aspirin interaction at Bed 4A
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-semibold">Pyxis bridge online</span>
            <span className="flex items-center text-teal-700 font-medium group-hover:underline">
              Review <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* ServiceNow Open Incidents */}
        <div 
          onClick={() => onSelectTab('administration')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ServiceNow ITSM</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{incidents.filter(i => i.state !== 'Resolved' && i.state !== 'Closed').length}</span>
            <span className="text-xs text-emerald-700 font-bold">Open Tickets</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
            Ventilator V-04 (INC0010482) in progress
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-semibold">100% SLA Compliant</span>
            <span className="flex items-center text-teal-700 font-medium group-hover:underline">
              IT Hub <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Critical Patients + Real-time Telemetry + Quick Task Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Acuity Patient Watchlist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Patients List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  ICU Telemetry & Patient Watchlist
                </h3>
                <p className="text-xs text-slate-500">Real-time vital parameters from Mindray bedside monitors</p>
              </div>
              <button
                onClick={() => onSelectTab('ward-dashboard')}
                className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
              >
                Ward View <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {patients.slice(0, 3).map((pt) => {
                const isCrit = pt.acuityLevel.includes('High') || pt.vitals.hrStatus === 'critical';
                return (
                  <div
                    key={pt.id}
                    onClick={() => {
                      onSelectPatient(pt.id);
                      onSelectTab('patient-360');
                    }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50/70 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
                          isCrit ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {pt.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-teal-900">{pt.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-600">
                              Bed {pt.roomNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCrit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {pt.statusTag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Dx: {pt.admittingDx} • Nurse: {pt.primaryNurse}
                          </p>
                        </div>
                      </div>

                      {/* Vitals Pills */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">HR</div>
                          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                            <Heart className={`w-3 h-3 ${isCrit ? 'text-rose-500 animate-pulse' : 'text-teal-500'}`} />
                            {pt.vitals.hr} bpm
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">BP</div>
                          <div className="text-xs font-bold text-slate-800">
                            {pt.vitals.bpSystolic}/{pt.vitals.bpDiastolic}
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">SpO2</div>
                          <div className="text-xs font-bold text-teal-700">
                            {pt.vitals.spO2}%
                          </div>
                        </div>

                        <div className="p-2 text-slate-400 group-hover:text-teal-700">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Abnormal Alert Strip if any */}
                    {pt.abnormalAlert && !pt.abnormalAlert.acknowledged && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800 font-medium">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{pt.abnormalAlert.message}</span>
                        </div>
                        <span className="text-[11px] font-bold underline">Review Lab</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Bed Status Overview (UPGRADED HACKATHON BED CARDS) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-600" />
                Ward Floor Grid Quick View
              </h3>
              <button
                onClick={() => onSelectTab('bed-management')}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                Full Floorplan & Transfers
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {beds.map((b) => {
                const isOccupied = b.status === 'occupied';
                const isCritical = b.status === 'critical';
                const isCleaning = b.status === 'cleaning' || b.status === 'freeing-soon';
                const isAvailable = b.status === 'available';

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectTab('bed-management')}
                    className={`relative group overflow-hidden rounded-xl p-3 border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer backdrop-blur-md ${
                      isCritical
                        ? 'bg-gradient-to-br from-[#3b060d] to-[#210206] border-rose-500/50 shadow-rose-950/50'
                        : isOccupied
                        ? 'bg-gradient-to-br from-[#043835] to-[#022322] border-teal-500/40 shadow-teal-950/50'
                        : isCleaning
                        ? 'bg-gradient-to-br from-[#332b1a] to-[#1f190e] border-amber-500/40 shadow-amber-950/50'
                        : 'bg-gradient-to-br from-[#063b32] to-[#02211c] border-emerald-500/40 shadow-emerald-950/50'
                    }`}
                  >
                    {/* Subtle background glow effect */}
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-all" />

                    {/* Card Header: Bed Number & Dynamic Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs tracking-wide text-white flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-teal-400 opacity-80" />
                        Bed {b.number}
                      </span>
                      <div className="p-1 rounded-md bg-black/20 border border-white/5">
                        {renderBedIcon(b.status, b.number)}
                      </div>
                    </div>

                    {/* Status Badge & Patient Context */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCritical
                              ? 'bg-rose-400 animate-ping'
                              : isOccupied
                              ? 'bg-teal-400 animate-pulse'
                              : isCleaning
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-semibold tracking-wide uppercase ${
                            isCritical
                              ? 'text-rose-300'
                              : isOccupied
                              ? 'text-teal-300'
                              : isCleaning
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          {b.status.replace('-', ' ')}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 truncate pt-0.5">
                        {isOccupied || isCritical ? 'Active Monitor' : 'Ready for admission'}
                      </p>
                    </div>

                    {/* Bottom live indicator line */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                        isCritical ? 'bg-rose-400/80' : isOccupied ? 'bg-teal-400/60' : isCleaning ? 'bg-amber-400/60' : 'bg-emerald-400/60'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: ServiceNow Ticket Stream + High Priority Care Tasks */}
        <div className="space-y-6">
          {/* ServiceNow ITSM Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                ServiceNow Active Tickets
              </h3>
              <button
                onClick={() => onSelectTab('administration')}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                All ({incidents.length})
              </button>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 3).map((inc) => (
                <div 
                  key={inc.id}
                  onClick={() => onSelectTab('administration')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700">{inc.number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inc.priority.startsWith('1') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inc.priority.split(' - ')[1]}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                    {inc.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{inc.assignedGroup.split(' ')[0]}</span>
                    <span className="text-teal-700 font-medium">{inc.slaTimeLeft.split(' ')[0]} SLA</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onNewIncident}
              className="w-full mt-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
            >
              + Create ServiceNow IT Incident
            </button>
          </div>

          {/* Urgent Care Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                Due Care Tasks
              </h3>
              <button
                onClick={() => onSelectTab('care-tasks')}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                Task Board
              </button>
            </div>

            <div className="space-y-2.5">
              {careTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTab('care-tasks')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-white transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      task.priority === 'STAT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{task.time} ({task.relativeTime})</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 line-clamp-1">{task.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{task.patientName} • {task.bedNumber}</span>
                    <span className="text-teal-700 font-medium">{task.assignedTo?.split(',')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};