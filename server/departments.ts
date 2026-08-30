/**
 * Resolves a department name (as returned by the Gemini bed-prediction
 * bottleneck field, e.g. "Physiotherapy") to the email address that should
 * be notified when that department is blocking a bed turnover.
 *
 * Each department can be pointed at a real distribution list via env vars
 * (DEPT_EMAIL_PHYSIOTHERAPY, DEPT_EMAIL_PHARMACY, …) without touching code.
 * Anything not explicitly configured falls back to EMAIL_USER so the demo
 * still sends *something* visible in a credential-less environment.
 */

// Normalizes "Physiotherapy", "physio-therapy", "PHYSIOTHERAPY " → "physiotherapy"
function normalizeDept(dept: string): string {
  return dept.trim().toLowerCase().replace(/[^a-z]/g, '');
}

// Known departments this hospital's bottleneck predictions commonly name.
// Extend this list any time a new department starts appearing in predictions.
const DEPT_ENV_KEYS: Record<string, string> = {
  physiotherapy: 'DEPT_EMAIL_PHYSIOTHERAPY',
  pharmacy: 'DEPT_EMAIL_PHARMACY',
  radiology: 'DEPT_EMAIL_RADIOLOGY',
  dietetics: 'DEPT_EMAIL_DIETETICS',
  nursing: 'DEPT_EMAIL_NURSING',
  biomedical: 'DEPT_EMAIL_BIOMEDICAL',
  evs: 'DEPT_EMAIL_EVS',
  housekeeping: 'DEPT_EMAIL_EVS',
  discharge: 'DEPT_EMAIL_DISCHARGE',
  laboratory: 'DEPT_EMAIL_LAB',
  lab: 'DEPT_EMAIL_LAB',
};

export function resolveDeptEmail(dept: string): string {
  const key = DEPT_ENV_KEYS[normalizeDept(dept)];
  const configured = key ? process.env[key] : undefined;
  return configured || process.env.EMAIL_USER || '';
}
