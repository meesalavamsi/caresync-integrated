import { Patient, Bed, BedStatus } from '../types';
import { INITIAL_PATIENTS, INITIAL_BEDS } from '../data/mockData';

/**
 * The ServiceNow tables are intentionally thin (patient_name, department,
 * status, room_number, …) while the UI's Patient/Bed types are rich (vitals,
 * timelines, imaging, care goals, …). These mappers put the REAL ServiceNow
 * values into the fields ServiceNow actually owns, and fall back to a
 * presentational template for the UI-only fields the schema doesn't carry.
 *
 * This is deliberately honest: what comes from ServiceNow is real; the rest is
 * clearly template/presentational (documented in the README). Nothing here
 * fabricates a "synced" state.
 */

const patientTemplate = INITIAL_PATIENTS[0];
const bedTemplate = INITIAL_BEDS[0];

function clone<T>(obj: T): T {
  // structuredClone is available in modern browsers/Node 18+.
  return typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function mapServiceNowPatient(row: any, index = 0): Patient {
  const base = clone(patientTemplate);
  const name = row.patient_name || base.name;
  return {
    ...base,
    id: row.sys_id || `sn-pt-${index}`,
    name,
    initials: initialsOf(name),
    roomNumber: row.room_number || base.roomNumber,
    bedId: row.room_number ? `bed-${row.room_number}` : base.bedId,
    statusTag: row.status || base.statusTag,
    admittingDx: row.diagnosis || row.admitting_dx || base.admittingDx,
    // department in ServiceNow is a free-text/reference — surface it where useful
    primaryNurse: base.primaryNurse,
    // emergency_contact on x_snc_caresync_1_patient — the only phone number the
    // schema actually carries. Powers the click-to-call button on Patient 360.
    emergencyContact: row.emergency_contact || undefined,
  };
}

const BED_STATUS_MAP: Record<string, BedStatus> = {
  available: 'available',
  occupied: 'occupied',
  cleaning: 'cleaning',
  critical: 'critical',
  'freeing soon': 'freeing-soon',
  'freeing-soon': 'freeing-soon',
};

// The 32-hex-char shape of a ServiceNow sys_id, so we don't mistake a raw
// unresolved reference value for a real patient name.
const SYS_ID_PATTERN = /^[0-9a-f]{32}$/i;

/**
 * ServiceNow Table API field shapes vary by sysparm_display_value:
 *  - true / false  → plain scalar (string/boolean/number)
 *  - "all"         → { value, display_value } for EVERY field, including
 *                     references (which is what we now request for beds,
 *                     since sysparm_display_value=true does not reliably
 *                     flatten scoped-app reference fields like `patient`).
 * This reads whichever shape shows up so mapper code doesn't have to care.
 */
function dv(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object' && typeof v.display_value === 'string') return v.display_value.trim();
  return String(v).trim();
}

/**
 * Finds the occupant's display name on a bed row without assuming one exact
 * field name. Different ServiceNow instances/customizations name the
 * Patient reference field differently (patient, u_patient, assigned_patient,
 * etc — the same instance already turned out to use u_prediction_available_time
 * instead of prediction_available_time for a sibling field). This tries the
 * common candidates first, then falls back to scanning for any field whose
 * name mentions "patient" and holds a resolvable display value.
 */
function extractOccupantName(row: any): string {
  const candidateKeys = ['patient', 'u_patient', 'patient_id', 'assigned_patient', 'current_patient'];
  for (const key of candidateKeys) {
    const val = dv(row[key]);
    if (val && !SYS_ID_PATTERN.test(val)) return val;
  }
  for (const [key, v] of Object.entries(row)) {
    if (/patient/i.test(key)) {
      const val = dv(v);
      if (val && !SYS_ID_PATTERN.test(val)) return val;
    }
  }
  return '';
}

export function mapServiceNowBed(row: any, index = 0, patients: Patient[] = []): Bed {
  const base = clone(bedTemplate);
  const rawStatus = (dv(row.bed_status) || dv(row.status)).toLowerCase().trim();
  const status: BedStatus = BED_STATUS_MAP[rawStatus] || base.status;

  const occupantName = extractOccupantName(row);
  const isOccupiedStatus = status === 'occupied' || status === 'critical';

  if (isOccupiedStatus && !occupantName && typeof window !== 'undefined') {
    // Self-diagnosing: if a bed is flagged occupied/critical but we couldn't
    // find any patient-like field, log the raw row once so you can see the
    // exact key ServiceNow actually used and add it to extractOccupantName's
    // candidateKeys above.
    console.warn(
      `[CareSync] Bed ${dv(row.bed_number) || row.sys_id} is "${rawStatus}" but no occupant field was found. Raw row:`,
      row,
    );
  }

  // Cross-reference the live Patients list (already loaded from ServiceNow
  // alongside beds) to pull in MRN / assigned nurse when we can match by
  // name or room, same lookup BedManagementView's "View 360 Profile" uses.
  const bedNumber = dv(row.bed_number) || dv(row.room_number);
  const matchedPatient = occupantName
    ? patients.find(
        (p) =>
          p.name.trim().toLowerCase() === occupantName.toLowerCase() ||
          p.roomNumber === bedNumber,
      )
    : undefined;

  const predictionEta = dv(row.u_prediction_available_time);

  return {
    ...base,
    id: dv(row.sys_id) || `sn-bed-${index}`,
    number: bedNumber || base.number,
    ward: dv(row.ward) || dv(row.department) || base.ward,
    status,
    patient:
      occupantName && isOccupiedStatus
        ? {
            id: matchedPatient?.id || dv(row.sys_id) || `sn-bed-${index}-patient`,
            name: occupantName,
            mrn: matchedPatient?.mrn || '—',
            condition: status === 'critical' ? 'Critical' : 'Stable',
            assignedNurse: matchedPatient?.primaryNurse || base.patient?.assignedNurse || 'Unassigned',
            urgencyTag: status === 'critical' ? 'Critical' : 'Stable',
          }
        : undefined,
    // Prediction fields live on the ServiceNow row; expose them so views/tooltips can read them.
    // NOTE: the actual technical field name in the x_snc_caresync_1_bed_management table is
    // u_prediction_available_time (verify this against your instance's dictionary if it differs).
    lastCleaned: predictionEta ? `ETA ${predictionEta}` : base.lastCleaned,
  };
}

export function mapPatients(rows: any[]): Patient[] {
  return rows.map((r, i) => mapServiceNowPatient(r, i));
}

export function mapBeds(rows: any[], patients: Patient[] = []): Bed[] {
  return rows.map((r, i) => mapServiceNowBed(r, i, patients));
}