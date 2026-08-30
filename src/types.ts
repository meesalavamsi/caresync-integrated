export type NavTab = 
  | 'overview'
  | 'ward-dashboard'
  | 'care-tasks'
  | 'patient-360'
  | 'medication-safety'
  | 'bed-management'
  | 'family-portal'
  | 'analytics'
  | 'administration';

export type WardLocation = 
  | 'Cardiac ICU - Ward 4'
  | 'Neuro ICU - Ward 2'
  | 'Surgical Stepdown - Ward 6'
  | 'Emergency Dept - Pod A'
  | 'Pediatric ICU - Ward 3';

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'critical' | 'freeing-soon';

export interface Patient {
  id: string;
  name: string;
  initials: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  bedId: string;
  roomNumber: string;
  admittingDx: string;
  allergies: string[];
  attendingPhysician: string;
  primaryNurse: string;
  emergencyContact?: string;
  los: string;
  codeStatus: 'Full' | 'DNR' | 'DNI' | 'Limited';
  statusTag: string;
  acuityLevel: 'High (Level 3)' | 'Medium (Level 2)' | 'Low (Level 1)';
  isTelemetryActive: boolean;
  admittedDate: string;
  estDischargeDate: string;
  vitals: {
    hr: number;
    hrStatus: 'stable' | 'elevated' | 'critical';
    bpSystolic: number;
    bpDiastolic: number;
    bpStatus: 'stable' | 'elevated' | 'dropping';
    spO2: number;
    spO2Status: 'stable' | 'low';
    respRate: number;
    respStatus: 'stable' | 'tachypneic';
    temp: number;
    lastUpdated: string;
    hrTrend: number[];
    bpTrend: number[];
  };
  carePlanGoals: {
    id: string;
    title: string;
    description: string;
    status: 'On Track' | 'Controlled' | 'Pending' | 'Completed';
    progressPercent: number;
    completed?: boolean;
  }[];
  recentImaging: {
    id: string;
    title: string;
    modality: 'CXR' | 'CT' | 'Echo' | 'MRI';
    date: string;
    findings: string;
    imageUrl: string;
  };
  clinicalTimeline: {
    id: string;
    time: string;
    date: string;
    type: 'assessment' | 'medication' | 'lab' | 'order' | 'event';
    title: string;
    description?: string;
    clinician?: string;
    labResults?: {
      test: string;
      result: string;
      flag?: 'H' | 'L' | 'C';
      refRange: string;
    }[];
  }[];
  abnormalAlert?: {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  };
}

export interface Bed {
  id: string;
  number: string;
  ward: string;
  status: BedStatus;
  patient?: {
    id: string;
    name: string;
    mrn: string;
    condition: 'Stable' | 'Critical' | 'Discharge D/C' | 'Sepsis Protocol' | 'Post-op Cardiac';
    assignedNurse: string;
    photoUrl?: string;
    urgencyTag?: string;
  };
  equipment: {
    name: string;
    serviceNowAssetId: string;
    status: 'online' | 'warning' | 'error';
  }[];
  lastCleaned?: string;
}

export interface CareTask {
  id: string;
  time: string;
  relativeTime: string;
  priority: 'STAT' | 'Routine' | 'Scheduled';
  category: 'MEDICATION ADMINISTRATION' | 'VITALS & ASSESSMENT' | 'WOUND CARE' | 'LAB DRAW' | 'CONSULT';
  title: string;
  patientName: string;
  mrn: string;
  bedNumber: string;
  notes: string;
  slaMinutesRemaining: number;
  isOverdue: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  serviceNowSync?: {
    taskSysId: string;
    serviceRequestNumber: string;
  };
}

export interface MedicationSafetyAlert {
  id: string;
  type: 'SEVERE INTERACTION' | 'DOSAGE MISMATCH' | 'MISSED DOSE' | 'RENAL ADJUSTMENT';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  medicationName: string;
  patientName: string;
  patientId: string;
  bedNumber: string;
  details: string;
  pharmacologyNote?: string;
  dosageDetails?: {
    ordered: string;
    suggested: string;
    reason: string;
  };
  status: 'active' | 'acknowledged' | 'overridden' | 'modified';
}

export interface PendingAdministration {
  id: string;
  medication: string;
  patientName: string;
  patientId: string;
  bedNumber: string;
  type: 'Infusion' | 'Scheduled Dose' | 'IV Push' | 'Oral';
  currentRate?: string;
  lastLab?: string;
  protocolSuggestion?: string;
  scheduledDose?: string;
  timeDue: string;
  lastBloodGlucose?: string;
}

export interface LiveAuditLog {
  id: string;
  time: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  verifiedMethod?: string;
  notes?: string;
  isAlert?: boolean;
}

export interface ServiceNowIncident {
  id: string;
  number: string; // e.g. INC0010482
  sysId: string;
  title: string;
  category: 'Biomedical Equipment' | 'EHR / Epic Bridge' | 'PACS / Imaging' | 'Bedside Telemetry' | 'Pharmacy Pyxis' | 'Network / Wi-Fi';
  priority: '1 - Critical' | '2 - High' | '3 - Moderate' | '4 - Low';
  state: 'New' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  caller: string;
  assignedGroup: string;
  assignedTo: string;
  location: string;
  impactBed?: string;
  created: string;
  updated: string;
  description: string;
  workNotes: string[];
  slaStatus: 'Within SLA' | 'At Risk' | 'Breached';
  slaTimeLeft: string;
  autoCreatedFromAlertId?: string;
}

export interface ServiceNowITRequest {
  id: string;
  reqNumber: string; // e.g. REQ008491
  ritmNumber: string; // e.g. RITM009182
  item: string;
  requestedFor: string;
  department: string;
  stage: 'Submitted' | 'Approval' | 'Fulfillment' | 'Delivered';
  requestedDate: string;
  estimatedCompletion: string;
  details: string;
}
