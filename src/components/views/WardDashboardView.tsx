import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  User, 
  Pill, 
  FileText, 
  Server, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  ShieldAlert, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import { Patient, NavTab, Bed } from '../../types';
import { BedStatusLogo } from '../common/BedStatusLogo';
import { PatientVitalsMonitor } from '../common/PatientVitalsMonitor';

interface WardDashboardViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onSelectTab: (tab: NavTab) => void;
  beds: Bed[];
  onNewAdmission: () => void;
  onOpenPacs: (patient: Patient) => void;
}

export const WardDashboardView: React.FC<WardDashboardViewProps> = ({
  patients,
  onSelectPatient,
  onSelectTab,
  beds,
  onNewAdmission,
  onOpenPacs
}) => {
  const [filterAcuity, setFilterAcuity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => {
    const matchesAcuity = filterAcuity === 'all' || 
      (filterAcuity === 'high' && p.acuityLevel.includes('High')) ||
      (filterAcuity === 'medium' && p.acuityLevel.includes('Medium'));
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.includes(searchTerm) ||
      p.roomNumber.includes(searchTerm) ||
      p.admittingDx.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAcuity && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header with Title and Quick Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Ward Dashboard</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              Live Telemetry Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active monitoring for Cardiac ICU • {patients.length} Active Patients • 12 Beds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, bed, MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 w-48 sm:w-56"
            />
          </div>

          {/* Acuity Filter Pills */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => setFilterAcuity('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterAcuity === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Beds
            </button>
            <button
              onClick={() => setFilterAcuity('high')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterAcuity === 'high' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Acuity
            </button>
          </div>

          {/* New Admission Button */}
          <button
            id="btn-ward-admit"
            onClick={onNewAdmission}
            className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Admit Patient
          </button>
        </div>
      </div>

      {/* Grid of Clinical Patient Monitors matching screenshot style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((pt) => {
          const isHighAcuity = pt.acuityLevel.includes('High') || pt.vitals.hrStatus === 'critical';
          const hasAbnormalLab = pt.abnormalAlert && !pt.abnormalAlert.acknowledged;

          return (
            <div
              key={pt.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Top Banner with Room Number & Patient Identity */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${
                      isHighAcuity 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200 ring-2 ring-rose-500/10' 
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}>
                      {pt.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer"
                            onClick={() => {
                              onSelectPatient(pt.id);
                              onSelectTab('patient-360');
                            }}>
                          {pt.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          <BedStatusLogo
                            status={
                              isHighAcuity ? 'critical' :
                              pt.statusTag.toLowerCase().includes('discharge') ? 'freeing-soon' :
                              'occupied'
                            }
                            size="xs"
                          />
                          <span className="text-[11px] font-bold text-slate-700">
                            Bed {pt.roomNumber}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pt.age}yo {pt.gender} • MRN: <span className="font-mono text-slate-700">{pt.mrn}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isHighAcuity ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pt.statusTag}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="truncate">Dx: <strong className="text-slate-800">{pt.admittingDx}</strong></span>
                  <span className="text-slate-500 shrink-0">{pt.los}</span>
                </div>
              </div>

              {/* Live Telemetry Vitals Display — scrolling ECG + vitals that
                  re-randomize every 10s (simulation; see PatientVitalsMonitor) */}
              <PatientVitalsMonitor patient={pt} />

              {/* Abnormal Banner if any */}
              {hasAbnormalLab && (
                <div className="p-3 bg-rose-50 border-t border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold">{pt.abnormalAlert?.message}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectPatient(pt.id);
                      onSelectTab('patient-360');
                    }}
                    className="text-[11px] font-bold text-rose-700 underline shrink-0"
                  >
                    Action
                  </button>
                </div>
              )}

              {/* Card Actions Bottom Toolbar */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenPacs(pt)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  PACS Imaging
                </button>

                <button
                  onClick={() => {
                    onSelectPatient(pt.id);
                    onSelectTab('patient-360');
                  }}
                  className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Patient 360
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};