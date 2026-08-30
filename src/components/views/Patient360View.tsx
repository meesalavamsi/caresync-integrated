import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckSquare, 
  UserCheck, 
  FileText, 
  Pill, 
  Bed, 
  Share2, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  Radio, 
  Server,
  User,
  Phone
} from 'lucide-react';
import { Patient, NavTab } from '../../types';
import { useSimulatedVitals, toSparklinePoints } from '../../hooks/useSimulatedVitals';

interface Patient360ViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenPacs: (patient: Patient) => void;
  onOpenNewOrder: (patient: Patient) => void;
  onOpenTransferModal: (patient: Patient) => void;
  onAcknowledgeAlert: (patientId: string) => void;
  onToggleCareGoal: (patientId: string, goalId: string) => void;
}

export const Patient360View: React.FC<Patient360ViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onSelectTab,
  onOpenPacs,
  onOpenNewOrder,
  onOpenTransferModal,
  onAcknowledgeAlert,
  onToggleCareGoal
}) => {
  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const [activeSubTab, setActiveSubTab] = useState<'flowsheet' | 'timeline' | 'careplan' | 'labs'>('flowsheet');

  // Live-updating vitals — same simulation + 10s cadence as the Ward
  // Dashboard telemetry cards (see hooks/useSimulatedVitals).
  const liveVitals = useSimulatedVitals(patient);

  if (!patient) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Patient Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {patients.map(pt => {
          const isSelected = pt.id === patient.id;
          return (
            <button
              key={pt.id}
              onClick={() => onSelectPatient(pt.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-teal-800 text-white border-teal-900 shadow-xs ring-2 ring-teal-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isSelected ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {pt.initials}
              </div>
              <span>{pt.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                isSelected ? 'bg-teal-900/80 text-teal-200' : 'bg-slate-100 text-slate-500'
              }`}>
                Bed {pt.roomNumber}
              </span>
            </button>
          );
        })}
      </div>

      {/* Patient Profile Header Card (Matching Images 9 & 11) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Name + Demographics */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 text-white font-black text-xl flex items-center justify-center shadow-md ring-4 ring-teal-50">
              {patient.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                  Bed {patient.roomNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  {patient.statusTag}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                  Code Status: <strong>{patient.codeStatus}</strong>
                </span>
              </div>

              {/* Demographics Row */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <span>DOB: <strong className="text-slate-800">{patient.dob} ({patient.age}yo)</strong></span>
                <span>Gender: <strong className="text-slate-800">{patient.gender}</strong></span>
                <span>MRN: <strong className="font-mono text-slate-800">{patient.mrn}</strong></span>
                <span>LOS: <strong className="text-teal-700">{patient.los}</strong></span>
                {patient.emergencyContact && (
                  <span>Contact: <strong className="font-mono text-slate-800">{patient.emergencyContact}</strong></span>
                )}
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Allergies: {patient.allergies.join(', ') || 'NKDA'}
                </span>
              </div>

              {/* Diagnosis and Team Row */}
              <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-4">
                <span>Admitting Dx: <strong className="text-slate-900">{patient.admittingDx}</strong></span>
                <span>Attending: <strong className="text-slate-800">{patient.attendingPhysician}</strong></span>
                <span>Nurse: <strong className="text-slate-800">{patient.primaryNurse}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {patient.emergencyContact ? (
              <a
                href={`tel:${patient.emergencyContact.replace(/[^\d+]/g, '')}`}
                title={`Call ${patient.emergencyContact}`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                Call Patient
              </a>
            ) : (
              <button
                disabled
                title="No contact number on file for this patient"
                className="px-3.5 py-2 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 cursor-not-allowed"
              >
                <Phone className="w-4 h-4" />
                No Contact Number
              </button>
            )}
            <button
              onClick={() => onOpenNewOrder(patient)}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Pill className="w-4 h-4" />
              Order Medication
            </button>
            <button
              onClick={() => onOpenPacs(patient)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Eye className="w-4 h-4 text-teal-600" />
              PACS Imaging
            </button>
            <button
              onClick={() => onOpenTransferModal(patient)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Bed className="w-4 h-4" />
              Transfer Bed
            </button>
          </div>
        </div>
      </div>

      {/* Abnormal Alert Banner (if potassium/lab elevated) */}
      {patient.abnormalAlert && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          patient.abnormalAlert.acknowledged 
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              patient.abnormalAlert.acknowledged ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">
                  {patient.abnormalAlert.type}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {patient.abnormalAlert.timestamp}
                </span>
                {patient.abnormalAlert.acknowledged && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Acknowledged by Dr. S. Chen
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5">{patient.abnormalAlert.message}</p>
            </div>
          </div>

          {!patient.abnormalAlert.acknowledged && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAcknowledgeAlert(patient.id)}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                Acknowledge Alert
              </button>
              <button
                onClick={() => onOpenNewOrder(patient)}
                className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-semibold rounded-xl text-xs border border-rose-300"
              >
                Order Protocol
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4 Real-time Vitals Metric Cards with Sparklines (Matching Image 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{liveVitals.hr}</span>
            <span className="text-xs font-medium text-slate-400">bpm</span>
          </div>
          <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Normal Sinus Rhythm
          </div>
          {/* Sparkline */}
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full text-rose-400" viewBox="0 0 100 24" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={toSparklinePoints(liveVitals.hrTrend)}
              />
            </svg>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Blood Pressure</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{liveVitals.bpSystolic}/{liveVitals.bpDiastolic}</span>
            <span className="text-xs font-medium text-slate-400">mmHg</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            MAP: <strong className="text-slate-800">{Math.round((2 * liveVitals.bpDiastolic + liveVitals.bpSystolic) / 3)} mmHg</strong> (Target: &gt;65)
          </div>
          {/* Sparkline */}
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full text-teal-500" viewBox="0 0 100 24" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={toSparklinePoints(liveVitals.bpTrend)}
              />
            </svg>
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Oxygen Saturation</span>
            <Radio className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{liveVitals.spO2}%</span>
            <span className="text-xs font-medium text-slate-400">SpO2</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Flow: <strong className="text-slate-800">2L Nasal Cannula</strong>
          </div>
          {/* Sparkline */}
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full text-cyan-500" viewBox="0 0 100 24" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={toSparklinePoints(liveVitals.spO2Trend)}
              />
            </svg>
          </div>
        </div>

        {/* Respiratory Rate & Temp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Resp Rate & Temp</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{liveVitals.respRate}</span>
            <span className="text-xs font-medium text-slate-400">/min • {patient.vitals.temp}°F</span>
          </div>
          <div className="text-[11px] font-medium text-emerald-600">
            Unlabored respiration
          </div>
          {/* Sparkline */}
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full text-amber-500" viewBox="0 0 100 24" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={toSparklinePoints(liveVitals.respTrend)}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Care Plan + PACS / Radiology vs Clinical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Care Plan Goals + PACS Imaging Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Care Plan Goals Card (Matching Image 9) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                Active Care Plan & Nursing Orders
              </h3>
              <span className="text-xs font-semibold text-teal-700">
                {patient.carePlanGoals.filter(g => g.completed).length}/{patient.carePlanGoals.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {patient.carePlanGoals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => onToggleCareGoal(patient.id, goal.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    goal.completed
                      ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-teal-400 shadow-2xs'
                  }`}
                >
                  <button
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      goal.completed
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'border-slate-300 bg-white hover:border-teal-600'
                    }`}
                  >
                    {goal.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold text-xs ${goal.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {goal.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        goal.status === 'Completed' || goal.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {goal.completed ? 'Completed' : goal.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radiology & PACS Viewer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Latest Radiology Studies (PACS DICOM Gateway)
              </h3>
              <button
                onClick={() => onOpenPacs(patient)}
                className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
              >
                Launch DICOM Viewer <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              onClick={() => onOpenPacs(patient)}
              className="p-4 rounded-xl bg-slate-900 text-white cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="w-24 h-24 rounded-lg bg-black overflow-hidden relative shrink-0 border border-slate-700">
                <img
                  src={patient.recentImaging.imageUrl}
                  alt="Chest X-Ray"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-teal-400">
                  {patient.recentImaging.modality}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-200 text-sm">{patient.recentImaging.title}</div>
                <div className="text-slate-400 text-[11px]">Acquired: {patient.recentImaging.date}</div>
                <p className="text-slate-300 line-clamp-2 italic">
                  "{patient.recentImaging.findings}"
                </p>
                <div className="text-teal-400 text-[11px] font-semibold pt-1 flex items-center gap-1">
                  <span>Click to open high-res DICOM viewer with window/level tools</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Clinical Timeline & Lab Results (Matching Image 11) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Clinical Timeline
              </h3>
              <span className="text-[11px] text-slate-400">Last 24 Hours</span>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {patient.clinicalTimeline.map(item => (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-600 shadow-xs group-hover:scale-125 transition-transform" />

                  <div className="text-[11px] font-semibold text-slate-400 mb-0.5">
                    {item.time} • {item.date}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Lab Results table if included */}
                  {item.labResults && (
                    <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden text-[11px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100/80 text-slate-500 font-semibold">
                          <tr>
                            <th className="p-1.5">Test</th>
                            <th className="p-1.5">Result</th>
                            <th className="p-1.5">Ref Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {item.labResults.map((lr, i) => (
                            <tr key={i} className="hover:bg-white">
                              <td className="p-1.5 font-medium text-slate-800">{lr.test}</td>
                              <td className={`p-1.5 font-bold ${
                                lr.flag === 'C' ? 'text-rose-600' : lr.flag === 'H' ? 'text-amber-600' : 'text-slate-800'
                              }`}>
                                {lr.result} {lr.flag && `(${lr.flag})`}
                              </td>
                              <td className="p-1.5 text-slate-400">{lr.refRange}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {item.clinician && (
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                      Logged by: {item.clinician}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};