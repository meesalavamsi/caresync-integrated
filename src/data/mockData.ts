import { 
  Patient, 
  Bed, 
  CareTask, 
  MedicationSafetyAlert, 
  PendingAdministration, 
  LiveAuditLog, 
  ServiceNowIncident, 
  ServiceNowITRequest 
} from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pt-1',
    name: 'Marcus Reynolds',
    initials: 'MR',
    mrn: '994-11A-8B',
    dob: '12/04/1958',
    age: 65,
    gender: 'Male',
    bedId: 'bed-402',
    roomNumber: '402',
    admittingDx: 'Acute Decompensated Heart Failure',
    allergies: ['Penicillin'],
    attendingPhysician: 'Dr. S. Chen',
    primaryNurse: 'Sarah Jenkins, RN',
    emergencyContact: '+1 415 555 0132',
    los: 'Day 4',
    codeStatus: 'Full',
    statusTag: 'Post-Op CABG Day 2',
    acuityLevel: 'High (Level 3)',
    isTelemetryActive: true,
    admittedDate: 'Oct 24, 08:30',
    estDischargeDate: 'Oct 29',
    vitals: {
      hr: 72,
      hrStatus: 'stable',
      bpSystolic: 110,
      bpDiastolic: 70,
      bpStatus: 'stable',
      spO2: 97,
      spO2Status: 'stable',
      respRate: 16,
      respStatus: 'stable',
      temp: 98.6,
      lastUpdated: 'Live from Bed Monitor',
      hrTrend: [68, 70, 74, 78, 75, 72, 71, 72],
      bpTrend: [115, 112, 110, 108, 112, 110]
    },
    carePlanGoals: [
      {
        id: 'cp-1',
        title: 'Daily Weights',
        description: 'Completed at 06:00 AM (82.5 kg)',
        status: 'Completed',
        progressPercent: 100,
        completed: true
      },
      {
        id: 'cp-2',
        title: 'Strict I&O Monitoring',
        description: 'Q4H assessment required. Next due: 12:00 PM',
        status: 'Pending',
        progressPercent: 40,
        completed: false
      },
      {
        id: 'cp-3',
        title: 'Consult Cardiology',
        description: 'Page Dr. Reyes for review of new Echo.',
        status: 'Pending',
        progressPercent: 20,
        completed: false
      }
    ],
    recentImaging: {
      id: 'img-1',
      title: 'Portable AP Chest Radiograph (CXR)',
      modality: 'CXR',
      date: 'Today, 07:15 AM',
      findings: 'Mild bilateral interstitial prominence consistent with pulmonary congestion, improving from baseline. No pneumothorax.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    },
    clinicalTimeline: [
      {
        id: 'tl-1',
        time: '08:30 AM',
        date: 'Today',
        type: 'lab',
        title: 'Complete Blood Count (CBC) Resulted',
        clinician: 'Central Hematology Lab',
        labResults: [
          { test: 'WBC', result: '11.2', flag: 'H', refRange: '4.5 - 11.0 10^3/uL' },
          { test: 'HGB', result: '13.5', flag: undefined, refRange: '13.5 - 17.5 g/dL' },
          { test: 'Potassium', result: '5.8', flag: 'C', refRange: '3.5 - 5.0 mEq/L' }
        ]
      },
      {
        id: 'tl-2',
        time: '21:00 PM',
        date: 'Yesterday',
        type: 'medication',
        title: 'Medication Administered: Furosemide 40mg IV',
        description: 'Administered by Nrs. J. Smith. Urine output monitored post-dose.',
        clinician: 'Nrs. J. Smith'
      },
      {
        id: 'tl-3',
        time: '14:30 PM',
        date: 'Yesterday',
        type: 'assessment',
        title: 'Bedside Echocardiogram Complete',
        description: 'LVEF 40-45%, mild mitral regurgitation noted.',
        clinician: 'Dr. S. Chen'
      }
    ],
    abnormalAlert: {
      id: 'alert-1',
      type: 'Abnormal Lab Result',
      severity: 'critical',
      message: 'Potassium levels elevated (5.8 mEq/L). Drawn 1hr ago.',
      timestamp: '08:30 AM',
      acknowledged: false
    }
  },
  {
    id: 'pt-2',
    name: 'Raj Sharma',
    initials: 'RS',
    mrn: '893-4421',
    dob: '05/12/1959',
    age: 64,
    gender: 'Male',
    bedId: 'bed-402-b',
    roomNumber: '402',
    admittingDx: 'Post-CABG x3 (Post-operative Recovery)',
    allergies: ['Penicillin'],
    attendingPhysician: 'Dr. Sarah Chen',
    primaryNurse: 'Robert Johnson, RN',
    emergencyContact: '+1 415 555 0148',
    los: 'Day 2',
    codeStatus: 'Full',
    statusTag: 'Post-CABG Day 2',
    acuityLevel: 'High (Level 3)',
    isTelemetryActive: true,
    admittedDate: 'Oct 23, 11:00',
    estDischargeDate: 'Oct 28',
    vitals: {
      hr: 84,
      hrStatus: 'stable',
      bpSystolic: 118,
      bpDiastolic: 76,
      bpStatus: 'stable',
      spO2: 98,
      spO2Status: 'stable',
      respRate: 16,
      respStatus: 'stable',
      temp: 99.1,
      lastUpdated: 'Live from Bed Monitor',
      hrTrend: [80, 82, 85, 86, 84, 84],
      bpTrend: [120, 118, 116, 118, 118]
    },
    carePlanGoals: [
      {
        id: 'cpg-1',
        title: 'Early Mobilization',
        description: 'OOB to chair 3x daily. Walk hall 1x.',
        status: 'On Track',
        progressPercent: 75,
        completed: false
      },
      {
        id: 'cpg-2',
        title: 'Pain Management',
        description: 'Maintain pain score < 4.',
        status: 'Controlled',
        progressPercent: 90,
        completed: true
      }
    ],
    recentImaging: {
      id: 'img-2',
      title: 'Post-Surgical Chest Radiograph',
      modality: 'CXR',
      date: 'Yesterday, 16:00',
      findings: 'Sternal wires in stable alignment. Mediastinal drains in situ. Lungs clear.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    },
    clinicalTimeline: [
      {
        id: 'tl-4',
        time: '08:30 AM',
        date: 'Today',
        type: 'assessment',
        title: 'Post-Op Assessment',
        description: 'Patient alert and oriented. Incisions clean, dry, intact. Chest tubes draining minimally. Pain well controlled on current regimen.',
        clinician: 'Nurse Emily Davis'
      },
      {
        id: 'tl-5',
        time: '18:15 PM',
        date: 'Yesterday',
        type: 'medication',
        title: 'Medication Adjusted',
        description: 'Heparin drip titrated per protocol based on recent aPTT results.',
        clinician: 'Dr. Sarah Chen'
      },
      {
        id: 'tl-6',
        time: '14:00 PM',
        date: 'Yesterday',
        type: 'lab',
        title: 'Lab Results: BMP & CBC',
        clinician: 'Central Lab',
        labResults: [
          { test: 'WBC', result: '8.4', flag: undefined, refRange: '4.5 - 11.0' },
          { test: 'Hgb', result: '11.2', flag: 'L', refRange: '13.5 - 17.5' },
          { test: 'K+', result: '4.1', flag: undefined, refRange: '3.5 - 5.0' }
        ]
      }
    ]
  },
  {
    id: 'pt-3',
    name: 'Robert Harrison',
    initials: 'RH',
    mrn: '88392-A',
    dob: '08/19/1956',
    age: 68,
    gender: 'Male',
    bedId: 'bed-402',
    roomNumber: '402',
    admittingDx: 'Post-Op CABG Day 2',
    allergies: ['Sulfa drugs'],
    attendingPhysician: 'Dr. S. Chen',
    primaryNurse: 'J. Smith, RN',
    emergencyContact: '+1 415 555 0119',
    los: 'Day 2',
    codeStatus: 'Full',
    statusTag: 'Post-Op CABG Day 2',
    acuityLevel: 'High (Level 3)',
    isTelemetryActive: true,
    admittedDate: 'Oct 24, 08:30',
    estDischargeDate: 'Oct 29',
    vitals: {
      hr: 88,
      hrStatus: 'elevated',
      bpSystolic: 124,
      bpDiastolic: 78,
      bpStatus: 'stable',
      spO2: 96,
      spO2Status: 'stable',
      respRate: 18,
      respStatus: 'stable',
      temp: 99.4,
      lastUpdated: 'Live from Bed Monitor',
      hrTrend: [75, 80, 84, 88, 86],
      bpTrend: [130, 128, 124, 126]
    },
    carePlanGoals: [
      {
        id: 'cpg-3',
        title: 'Telemetry Monitoring',
        description: 'Continuous continuous ST-segment tracking',
        status: 'On Track',
        progressPercent: 80,
        completed: false
      }
    ],
    recentImaging: {
      id: 'img-3',
      title: 'Post-Op CXR',
      modality: 'CXR',
      date: 'Today, 06:00',
      findings: 'Stable post-operative changes.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    },
    clinicalTimeline: []
  },
  {
    id: 'pt-4',
    name: 'Eleanor Vance',
    initials: 'EV',
    mrn: '912-8831',
    dob: '03/14/1971',
    age: 53,
    gender: 'Female',
    bedId: 'bed-412',
    roomNumber: '412',
    admittingDx: 'Cardiac Arrhythmia / Atrial Fibrillation',
    allergies: ['Latex'],
    attendingPhysician: 'Dr. Sarah Chen',
    primaryNurse: 'Marcus Reed, RN',
    emergencyContact: '+1 415 555 0176',
    los: 'Day 3',
    codeStatus: 'Full',
    statusTag: 'Continuous Monitor',
    acuityLevel: 'Medium (Level 2)',
    isTelemetryActive: true,
    admittedDate: 'Oct 22, 14:00',
    estDischargeDate: 'Oct 26',
    vitals: {
      hr: 82,
      hrStatus: 'stable',
      bpSystolic: 122,
      bpDiastolic: 74,
      bpStatus: 'stable',
      spO2: 96,
      spO2Status: 'stable',
      respRate: 15,
      respStatus: 'stable',
      temp: 98.4,
      lastUpdated: 'Live from Bed Monitor',
      hrTrend: [92, 88, 85, 83, 82],
      bpTrend: [126, 124, 122, 122]
    },
    carePlanGoals: [
      {
        id: 'cpg-4',
        title: 'Rate Control Verification',
        description: 'Maintain resting HR < 85 bpm',
        status: 'On Track',
        progressPercent: 95,
        completed: true
      }
    ],
    recentImaging: {
      id: 'img-4',
      title: 'Transthoracic Echocardiogram',
      modality: 'Echo',
      date: 'Yesterday, 11:30',
      findings: 'Normal LV cavity size with preserved EF 55%. Mild LA enlargement.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    },
    clinicalTimeline: []
  },
  {
    id: 'pt-5',
    name: 'Alice Wright',
    initials: 'AW',
    mrn: '744-9021',
    dob: '11/30/1962',
    age: 61,
    gender: 'Female',
    bedId: 'bed-402',
    roomNumber: '402',
    admittingDx: 'Sepsis Protocol - Urosepsis',
    allergies: ['Ciprofloxacin'],
    attendingPhysician: 'Dr. Sarah Chen',
    primaryNurse: 'Sarah Jenkins, RN',
    emergencyContact: '+1 415 555 0163',
    los: 'Day 1',
    codeStatus: 'Full',
    statusTag: 'Sepsis Escalation',
    acuityLevel: 'High (Level 3)',
    isTelemetryActive: true,
    admittedDate: 'Oct 24, 04:00',
    estDischargeDate: 'Oct 30',
    vitals: {
      hr: 104,
      hrStatus: 'elevated',
      bpSystolic: 92,
      bpDiastolic: 58,
      bpStatus: 'dropping',
      spO2: 94,
      spO2Status: 'low',
      respRate: 22,
      respStatus: 'tachypneic',
      temp: 101.8,
      lastUpdated: 'Live from Bed Monitor',
      hrTrend: [95, 98, 102, 106, 104],
      bpTrend: [105, 98, 94, 92]
    },
    carePlanGoals: [
      {
        id: 'cpg-5',
        title: '3-Hour Sepsis Bundle',
        description: 'Lactate redraw, Blood cultures x2, Broad spectrum Abx, 30ml/kg crystalloid',
        status: 'On Track',
        progressPercent: 70,
        completed: false
      }
    ],
    recentImaging: {
      id: 'img-5',
      title: 'CT Abdomen/Pelvis with Contrast',
      modality: 'CT',
      date: 'Today, 05:30',
      findings: 'Right perinephric fat stranding consistent with acute pyelonephritis.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    },
    clinicalTimeline: []
  }
];

export const INITIAL_BEDS: Bed[] = [
  {
    id: '401',
    number: '401',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-6',
      name: 'John Doe',
      mrn: '772-9182',
      condition: 'Stable',
      assignedNurse: 'Sarah Jenkins, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8821', status: 'online' },
      { name: 'Alaris Infusion Pump #4', serviceNowAssetId: 'AST-BME-3319', status: 'online' }
    ],
    lastCleaned: 'Yesterday 18:00'
  },
  {
    id: '402',
    number: '402',
    ward: 'Cardiac ICU - Ward 4',
    status: 'critical',
    patient: {
      id: 'pt-1',
      name: 'Marcus Reynolds',
      mrn: '994-11A-8B',
      condition: 'Critical',
      assignedNurse: 'Sarah Jenkins, RN',
      urgencyTag: 'Critical'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8822', status: 'warning' },
      { name: 'Hamilton-G5 Ventilator', serviceNowAssetId: 'AST-BME-1102', status: 'warning' }
    ],
    lastCleaned: 'Oct 23 14:00'
  },
  {
    id: '403',
    number: '403',
    ward: 'Cardiac ICU - Ward 4',
    status: 'freeing-soon',
    patient: {
      id: 'pt-7',
      name: 'A. Johnson',
      mrn: '661-8291',
      condition: 'Discharge D/C',
      assignedNurse: 'Marcus Reed, RN',
      urgencyTag: 'Discharge D/C'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8823', status: 'online' }
    ],
    lastCleaned: 'Oct 22 09:00'
  },
  {
    id: '404',
    number: '404',
    ward: 'Cardiac ICU - Ward 4',
    status: 'available',
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8824', status: 'online' }
    ],
    lastCleaned: 'Today 10:42 AM'
  },
  {
    id: '405',
    number: '405',
    ward: 'Cardiac ICU - Ward 4',
    status: 'freeing-soon',
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8825', status: 'online' }
    ],
    lastCleaned: 'Today 07:00 AM'
  },
  {
    id: '406',
    number: '406',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-8',
      name: 'Patient 406',
      mrn: '881-2294',
      condition: 'Stable',
      assignedNurse: 'Marcus Reed, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8826', status: 'online' }
    ]
  },
  {
    id: '407',
    number: '407',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-9',
      name: 'Patient 407',
      mrn: '773-1002',
      condition: 'Stable',
      assignedNurse: 'Sarah Jenkins, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8827', status: 'online' }
    ]
  },
  {
    id: '408',
    number: '408',
    ward: 'Cardiac ICU - Ward 4',
    status: 'available',
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8828', status: 'online' }
    ]
  },
  {
    id: '409',
    number: '409',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-10',
      name: 'Patient 409',
      mrn: '902-1849',
      condition: 'Stable',
      assignedNurse: 'Marcus Reed, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8829', status: 'online' }
    ]
  },
  {
    id: '410',
    number: '410',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-11',
      name: 'Patient 410',
      mrn: '654-8291',
      condition: 'Stable',
      assignedNurse: 'Sarah Jenkins, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8830', status: 'online' }
    ]
  },
  {
    id: '411',
    number: '411',
    ward: 'Cardiac ICU - Ward 4',
    status: 'critical',
    patient: {
      id: 'pt-12',
      name: 'Patient 411',
      mrn: '918-2731',
      condition: 'Critical',
      assignedNurse: 'Marcus Reed, RN',
      urgencyTag: 'Critical'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8831', status: 'online' }
    ]
  },
  {
    id: '412',
    number: '412',
    ward: 'Cardiac ICU - Ward 4',
    status: 'occupied',
    patient: {
      id: 'pt-4',
      name: 'Eleanor Vance',
      mrn: '912-8831',
      condition: 'Stable',
      assignedNurse: 'Marcus Reed, RN',
      urgencyTag: 'Stable'
    },
    equipment: [
      { name: 'Mindray N15 Monitor', serviceNowAssetId: 'AST-ICU-8832', status: 'online' }
    ]
  }
];

export const INITIAL_CARE_TASKS: CareTask[] = [
  {
    id: 'task-1',
    time: '09:15',
    relativeTime: '-45m',
    priority: 'STAT',
    category: 'MEDICATION ADMINISTRATION',
    title: 'Administer Furosemide (Lasix) 40mg IV Push',
    patientName: 'Sharma, R.',
    mrn: '882910',
    bedNumber: 'Bed 402-A',
    notes: 'Post-op fluid overload. Monitor BP closely.',
    slaMinutesRemaining: -45,
    isOverdue: true,
    status: 'pending',
    assignedTo: 'Sarah Jenkins, RN',
    serviceNowSync: {
      taskSysId: 'sys_tsk_881920',
      serviceRequestNumber: 'SR-MED-4091'
    }
  },
  {
    id: 'task-2',
    time: '10:30',
    relativeTime: 'in 30m',
    priority: 'Routine',
    category: 'VITALS & ASSESSMENT',
    title: 'Neurological Check (Q4H) & Vitals',
    patientName: 'Kumar, A.',
    mrn: '771234',
    bedNumber: 'Bed 405-B',
    notes: 'GCS baseline: 14. Note pupil reactivity and motor symmetry.',
    slaMinutesRemaining: 30,
    isOverdue: false,
    status: 'pending',
    assignedTo: 'Marcus Reed, RN',
    serviceNowSync: {
      taskSysId: 'sys_tsk_881921',
      serviceRequestNumber: 'SR-NUR-1102'
    }
  },
  {
    id: 'task-3',
    time: '11:00',
    relativeTime: 'in 1h',
    priority: 'Scheduled',
    category: 'WOUND CARE',
    title: 'Dressing Change - Surgical Site (Abdomen)',
    patientName: 'Patel, S.',
    mrn: '994512',
    bedNumber: 'Bed 410-A',
    notes: 'Supplies requested from central supply. Sterile technique.',
    slaMinutesRemaining: 60,
    isOverdue: false,
    status: 'pending',
    assignedTo: 'Sarah Jenkins, RN'
  },
  {
    id: 'task-4',
    time: '11:30',
    relativeTime: 'in 1h 30m',
    priority: 'STAT',
    category: 'LAB DRAW',
    title: 'Repeat Arterial Blood Gas (ABG) & Lactate',
    patientName: 'Wright, A.',
    mrn: '744902',
    bedNumber: 'Bed 402',
    notes: 'Sepsis bundle hour 2 evaluation. Send on ice to stat lab.',
    slaMinutesRemaining: 90,
    isOverdue: false,
    status: 'pending',
    assignedTo: 'Robert Johnson, RN'
  },
  {
    id: 'task-5',
    time: '12:00',
    relativeTime: 'in 2h',
    priority: 'Routine',
    category: 'CONSULT',
    title: 'Cardiology Tele-Echo Review with Dr. Reyes',
    patientName: 'Reynolds, M.',
    mrn: '99411A',
    bedNumber: 'Bed 402',
    notes: 'Discuss weaning inotrope support.',
    slaMinutesRemaining: 120,
    isOverdue: false,
    status: 'pending',
    assignedTo: 'Dr. Sarah Chen'
  }
];

export const INITIAL_MED_ALERTS: MedicationSafetyAlert[] = [
  {
    id: 'med-alert-1',
    type: 'SEVERE INTERACTION',
    severity: 'critical',
    timestamp: '2 mins ago',
    medicationName: 'Warfarin & Aspirin',
    patientName: 'John Doe',
    patientId: 'pt-6',
    bedNumber: 'Bed 4A',
    details: 'Concurrent use significantly increases risk of major bleeding events. Consider alternative antiplatelet or adjusted dosage.',
    pharmacologyNote: 'Combined inhibition of platelet aggregation and coagulation factor synthesis results in synergistic hemorrhagic risk.',
    status: 'active'
  },
  {
    id: 'med-alert-2',
    type: 'DOSAGE MISMATCH',
    severity: 'warning',
    timestamp: '15 mins ago',
    medicationName: 'Vancomycin',
    patientName: 'Maria Silva',
    patientId: 'pt-13',
    bedNumber: 'Bed 2B',
    details: 'Ordered dose (1500mg) exceeds recommended protocol based on recent eGFR (35 mL/min).',
    dosageDetails: {
      ordered: '1500mg q12h',
      suggested: '1000mg q24h',
      reason: 'Renal clearance impairment (eGFR 35 mL/min)'
    },
    status: 'active'
  }
];

export const INITIAL_PENDING_ADMINS: PendingAdministration[] = [
  {
    id: 'padmin-1',
    medication: 'Heparin Infusion',
    patientName: 'Robert Chen',
    patientId: 'pt-14',
    bedNumber: 'Bed 8C',
    type: 'Infusion',
    currentRate: '1200 units/hr',
    lastLab: '42 sec (Low)',
    protocolSuggestion: 'Increase by 2 units/kg/hr',
    timeDue: 'Continuous'
  },
  {
    id: 'padmin-2',
    medication: 'Insulin Glargine',
    patientName: 'Anita Patel',
    patientId: 'pt-15',
    bedNumber: 'Bed 12A',
    type: 'Scheduled Dose',
    scheduledDose: '24 units SC',
    timeDue: '21:00 (In 30 mins)',
    lastBloodGlucose: '142 mg/dL'
  }
];

export const INITIAL_AUDIT_LOGS: LiveAuditLog[] = [
  {
    id: 'aud-1',
    time: 'Just now',
    actor: 'Nrs. J. Smith',
    actorRole: 'ICU Staff Nurse',
    action: 'administered',
    target: 'Pantoprazole 40mg IV to Bed 4A',
    verifiedMethod: 'Barcode Verified',
    isAlert: false
  },
  {
    id: 'aud-2',
    time: '12 mins ago',
    actor: 'Dr. S. Chen',
    actorRole: 'Attending Intensivist',
    action: 'modified order for',
    target: 'Furosemide',
    notes: 'Renal dosage adjustment',
    isAlert: false
  },
  {
    id: 'aud-3',
    time: '45 mins ago',
    actor: 'Dr. M. Lee',
    actorRole: 'Resident Physician',
    action: 'overridden interaction alert for',
    target: 'Amiodarone/Digoxin',
    notes: '"Patient stabilized on current regimen; monitoring levels."',
    isAlert: true
  },
  {
    id: 'aud-4',
    time: '1 hr ago',
    actor: 'System (CareSync Engine)',
    actorRole: 'Automated Clinical Logic',
    action: 'flagged missed dose for',
    target: 'Bed 12A',
    isAlert: true
  }
];

export const INITIAL_SERVICENOW_INCIDENTS: ServiceNowIncident[] = [
  {
    id: 'inc-1',
    number: 'INC0010482',
    sysId: 'sys_id_8182937401a',
    title: 'Ventilator V-04 telemetry gateway dropped connection (Bed 402)',
    category: 'Biomedical Equipment',
    priority: '1 - Critical',
    state: 'In Progress',
    caller: 'Dr. Sarah Chen',
    assignedGroup: 'Biomedical Clinical Engineering',
    assignedTo: 'David Zhang (BME Tech)',
    location: 'Hospital West Wing - Cardiac ICU - Bed 402',
    impactBed: 'Bed 402',
    created: 'Today 10:15 AM',
    updated: '10 mins ago',
    description: 'Ventilator Hamilton-G5 in Bed 402 stopped broadcasting waveform packets to central telemetry station. Patient currently stable, monitor alarming locally.',
    workNotes: [
      '10:15 AM - Automated incident created via CareSync Telemetry Health Check webhook.',
      '10:20 AM - Assigned to Biomedical Rapid Response Team.',
      '10:32 AM - Tech David Zhang dispatched with backup telemetry bridge module (BME-MOD-44).'
    ],
    slaStatus: 'Within SLA',
    slaTimeLeft: '38 mins remaining (4-hr resolution)',
    autoCreatedFromAlertId: 'bme-alert-402'
  },
  {
    id: 'inc-2',
    number: 'INC0010499',
    sysId: 'sys_id_9928172635b',
    title: 'Epic EHR HL7 Lab Result feed latency exceeding 120s threshold',
    category: 'EHR / Epic Bridge',
    priority: '2 - High',
    state: 'In Progress',
    caller: 'Sarah Jenkins, RN',
    assignedGroup: 'EHR Integration & Interoperability',
    assignedTo: 'Ramesh Patel (Integration Architect)',
    location: 'Enterprise Datacenter / Interface Engine',
    created: 'Today 08:45 AM',
    updated: '25 mins ago',
    description: 'Stat potassium and CBC results taking up to 12 minutes to populate bedside CareSync flowsheet from Core Lab analyzer.',
    workNotes: [
      '08:45 AM - Incident logged from Clinical Operations desk.',
      '09:05 AM - Interface queue analyzed: backlog of 1,420 unparsed HL7 messages cleared on Broker 2.'
    ],
    slaStatus: 'Within SLA',
    slaTimeLeft: '1h 15m remaining'
  },
  {
    id: 'inc-3',
    number: 'INC0010512',
    sysId: 'sys_id_3321894451c',
    title: 'PACS Image Gateway timeout loading Bedside CXR studies',
    category: 'PACS / Imaging',
    priority: '3 - Moderate',
    state: 'New',
    caller: 'Dr. Sarah Chen',
    assignedGroup: 'Radiology Informatics',
    assignedTo: 'Unassigned (Triage)',
    location: 'Cardiac ICU - Workstation 3',
    created: 'Today 07:30 AM',
    updated: '1 hr ago',
    description: 'High-resolution DICOM slices experiencing 8-10 second buffer delay when launched from Patient 360 viewer.',
    workNotes: [
      '07:30 AM - Ticket generated from CareSync UI telemetry logger.'
    ],
    slaStatus: 'Within SLA',
    slaTimeLeft: '3h 45m remaining'
  },
  {
    id: 'inc-4',
    number: 'INC0010530',
    sysId: 'sys_id_4491028374d',
    title: 'Pyxis MedStation 4000 drawer #3 solenoid latch stuck',
    category: 'Pharmacy Pyxis',
    priority: '2 - High',
    state: 'Resolved',
    caller: 'Marcus Reed, RN',
    assignedGroup: 'Pharmacy Automation Support',
    assignedTo: 'Elena Rostova (Pharmacy Tech)',
    location: 'Cardiac ICU - Medication Room 4A',
    created: 'Yesterday 22:00',
    updated: 'Today 06:15 AM',
    description: 'Drawer 3 containing IV Heparin vials failing to release upon badge scan override.',
    workNotes: [
      '22:00 - Emergency manual key override used.',
      '06:15 - Solenoid assembly replaced and tested successfully with test dispense.'
    ],
    slaStatus: 'Within SLA',
    slaTimeLeft: 'Resolved in 8h 15m'
  }
];

export const INITIAL_SERVICENOW_REQUESTS: ServiceNowITRequest[] = [
  {
    id: 'req-1',
    reqNumber: 'REQ0084910',
    ritmNumber: 'RITM0091823',
    item: 'Additional Wireless Barcode Scanner for Bed 408',
    requestedFor: 'Sarah Jenkins, RN',
    department: 'Cardiac ICU - Ward 4',
    stage: 'Fulfillment',
    requestedDate: 'Yesterday',
    estimatedCompletion: 'Today by 15:00',
    details: 'Zebra TC52-HC scanner paired with CareSync Medication Administration module.'
  },
  {
    id: 'req-2',
    reqNumber: 'REQ0084915',
    ritmNumber: 'RITM0091830',
    item: 'Emergency Room Terminal Disinfection / Bed Clean Request',
    requestedFor: 'Automated Discharge Trigger',
    department: 'Environmental Services (EVS)',
    stage: 'Delivered',
    requestedDate: 'Today 10:30 AM',
    estimatedCompletion: 'Today 10:45 AM',
    details: 'Bed 404 terminal UV-C cleaning protocol completed post-discharge.'
  }
];
