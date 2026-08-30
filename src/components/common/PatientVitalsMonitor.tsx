import React from 'react';
import { Heart } from 'lucide-react';
import { Patient } from '../../types';
import { useSimulatedVitals, sweepSecondsForHr } from '../../hooks/useSimulatedVitals';

// One ECG complex pattern (a stylised P-QRS-T sawtooth), 300 units wide.
// It starts and ends at the same baseline point — (0,20) and (300,20) — so
// two copies placed side by side tile with no visible seam when scrolled.
const ECG_UNIT_PATH =
  'M0,20 L30,20 L35,10 L40,30 L45,5 L50,35 L55,20 L90,20 L95,10 L100,30 L105,5 L110,35 L115,20 ' +
  'L150,20 L155,10 L160,30 L165,5 L170,35 L175,20 L210,20 L215,10 L220,30 L225,5 L230,35 L235,20 ' +
  'L270,20 L275,10 L280,30 L285,5 L290,35 L300,20';

/**
 * Live-looking telemetry block for one patient card: a continuously
 * scrolling ECG waveform (pure CSS animation — moves every frame,
 * independent of the data refresh) plus HR / BP / SpO2 / RESP numbers that
 * re-randomize every 10 seconds via the shared useSimulatedVitals hook.
 *
 * This is a UI simulation only — ServiceNow has no live device-telemetry
 * table, so there's nothing real to poll (see README known-limitations).
 */
export const PatientVitalsMonitor: React.FC<{ patient: Patient }> = ({ patient }) => {
  const vitals = useSimulatedVitals(patient);
  const sweepSeconds = sweepSecondsForHr(vitals.hr);

  return (
    <div className="p-4 space-y-3 bg-slate-900 text-white rounded-b-none">
      <div className="flex items-center justify-between text-[11px] text-teal-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          MINDRAY TELEMETRY • LEAD II
        </span>
        <span>{vitals.lastUpdated}</span>
      </div>

      {/* Continuously scrolling ECG waveform */}
      <div className="h-10 w-full overflow-hidden">
        <svg
          className="h-full text-teal-400 ecg-track"
          style={{ width: '200%', animationDuration: `${sweepSeconds}s` }}
          viewBox="0 0 600 40"
          preserveAspectRatio="none"
        >
          <path
            d={ECG_UNIT_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path
            d={ECG_UNIT_PATH}
            transform="translate(300,0)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
        </svg>
      </div>

      {/* 4 Metric Readouts */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-400 font-sans uppercase">HR</div>
          <div
            className={`text-base font-black flex items-center justify-center gap-1 ${
              patient.vitals.hrStatus === 'critical' ? 'text-rose-400' : 'text-teal-300'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-500" />
            {vitals.hr}
          </div>
          <div className="text-[9px] text-slate-400">bpm</div>
        </div>

        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-400 font-sans uppercase">BP</div>
          <div className="text-sm font-black text-white">
            {vitals.bpSystolic}/{vitals.bpDiastolic}
          </div>
          <div className="text-[9px] text-slate-400">mmHg</div>
        </div>

        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-400 font-sans uppercase">SpO2</div>
          <div className="text-base font-black text-cyan-300">{vitals.spO2}%</div>
          <div className="text-[9px] text-slate-400">Room Air</div>
        </div>

        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
          <div className="text-[10px] text-slate-400 font-sans uppercase">RESP</div>
          <div className="text-base font-black text-amber-300">{vitals.respRate}</div>
          <div className="text-[9px] text-slate-400">/min</div>
        </div>
      </div>
    </div>
  );
};

export default PatientVitalsMonitor;