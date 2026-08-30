import { useEffect, useRef, useState } from 'react';
import { Patient } from '../types';

/**
 * Shared "live vitals" simulation, used by both the Ward Dashboard telemetry
 * cards (PatientVitalsMonitor) and the Patient 360 vitals cards, so both
 * views tick on the same cadence and jitter logic instead of drifting apart.
 *
 * This is a UI simulation only — ServiceNow has no live device-telemetry
 * table (see README known-limitations). Nothing here reads from or writes
 * to the backend; it only animates numbers already loaded onto `patient`.
 */

export interface SimulatedVitals {
  hr: number;
  bpSystolic: number;
  bpDiastolic: number;
  spO2: number;
  respRate: number;
  lastUpdated: string;
  // Rolling recent-history arrays, most-recent value last — feed these
  // straight into a sparkline.
  hrTrend: number[];
  bpTrend: number[];
  spO2Trend: number[];
  respTrend: number[];
}

const TREND_LENGTH = 8;

function jitter(base: number, spread: number, min: number, max: number): number {
  const next = base + (Math.random() * 2 - 1) * spread;
  return Math.round(Math.min(max, Math.max(min, next)));
}

function timeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function makeInitial(base: {
  hr: number;
  bpSystolic: number;
  bpDiastolic: number;
  spO2: number;
  respRate: number;
}): SimulatedVitals {
  return {
    ...base,
    lastUpdated: timeNow(),
    hrTrend: Array(TREND_LENGTH).fill(base.hr),
    bpTrend: Array(TREND_LENGTH).fill(base.bpSystolic),
    spO2Trend: Array(TREND_LENGTH).fill(base.spO2),
    respTrend: Array(TREND_LENGTH).fill(base.respRate),
  };
}

const ZERO_BASELINE = { hr: 0, bpSystolic: 0, bpDiastolic: 0, spO2: 0, respRate: 0 };

export function useSimulatedVitals(patient: Patient | null | undefined, intervalMs = 10000): SimulatedVitals {
  const baseline = useRef(
    patient
      ? {
          hr: patient.vitals.hr,
          bpSystolic: patient.vitals.bpSystolic,
          bpDiastolic: patient.vitals.bpDiastolic,
          spO2: patient.vitals.spO2,
          respRate: patient.vitals.respRate,
        }
      : ZERO_BASELINE,
  );

  const [vitals, setVitals] = useState<SimulatedVitals>(() => makeInitial(baseline.current));

  useEffect(() => {
    if (!patient) return;

    // Re-baseline if this hook is now watching a different patient record.
    baseline.current = {
      hr: patient.vitals.hr,
      bpSystolic: patient.vitals.bpSystolic,
      bpDiastolic: patient.vitals.bpDiastolic,
      spO2: patient.vitals.spO2,
      respRate: patient.vitals.respRate,
    };
    setVitals(makeInitial(baseline.current));

    const isCritical = patient.vitals.hrStatus === 'critical';

    const tick = () => {
      const b = baseline.current;
      const next = {
        hr: jitter(b.hr, isCritical ? 6 : 3, 40, 180),
        bpSystolic: jitter(b.bpSystolic, isCritical ? 8 : 4, 70, 200),
        bpDiastolic: jitter(b.bpDiastolic, isCritical ? 5 : 3, 40, 120),
        spO2: jitter(b.spO2, isCritical ? 3 : 1, 82, 100),
        respRate: jitter(b.respRate, isCritical ? 3 : 1, 8, 40),
      };
      setVitals((prev) => ({
        ...next,
        lastUpdated: timeNow(),
        hrTrend: [...prev.hrTrend.slice(1), next.hr],
        bpTrend: [...prev.bpTrend.slice(1), next.bpSystolic],
        spO2Trend: [...prev.spO2Trend.slice(1), next.spO2],
        respTrend: [...prev.respTrend.slice(1), next.respRate],
      }));
    };

    const interval = setInterval(tick, intervalMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id, patient?.vitals.hr, patient?.vitals.hrStatus, intervalMs]);

  return vitals;
}

/** Faster heart rate → faster ECG sweep, clamped to a sane visual range. */
export function sweepSecondsForHr(hr: number): number {
  return Math.max(1.2, Math.min(6, 300 / Math.max(hr, 30)));
}

/**
 * Turns a small array of recent readings into an SVG polyline `points`
 * string on a 0–100 x 0–24 viewBox, normalized to the values' own min/max
 * (with a little padding) so every sparkline stays visually legible
 * regardless of the vital's absolute scale (HR vs SpO2 vs RESP).
 */
export function toSparklinePoints(values: number[], width = 100, height = 24, pad = 3): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - pad * 2;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = pad + usableHeight - ((v - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}