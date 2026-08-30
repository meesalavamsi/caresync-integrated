import React, { useState, useEffect } from 'react';
import { 
  NavTab, 
  WardLocation, 
  Patient, 
  Bed as BedType, 
  CareTask, 
  MedicationSafetyAlert, 
  PendingAdministration, 
  LiveAuditLog, 
  ServiceNowIncident, 
  ServiceNowITRequest 
} from './types';
import { api, SessionUser } from './services/api';
import { mapPatients, mapBeds } from './services/mappers';
import { tabsForRole } from './services/rbac';
import { AuthScreen } from './components/auth/AuthScreen';
import { 
  INITIAL_PATIENTS, 
  INITIAL_BEDS, 
  INITIAL_CARE_TASKS, 
  INITIAL_MED_ALERTS, 
  INITIAL_PENDING_ADMINS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SERVICENOW_INCIDENTS, 
  INITIAL_SERVICENOW_REQUESTS 
} from './data/mockData';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ServiceNowStatusModal } from './components/layout/ServiceNowStatusModal';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';

// Views
import { OverviewView } from './components/views/OverviewView';
import { WardDashboardView } from './components/views/WardDashboardView';
import { CareTasksView } from './components/views/CareTasksView';
import { Patient360View } from './components/views/Patient360View';
import { MedicationSafetyView } from './components/views/MedicationSafetyView';
import { BedManagementView } from './components/views/BedManagementView';
import { FamilyPortalView } from './components/views/FamilyPortalView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AdministrationView } from './components/views/AdministrationView';

// Modals
import { NewIncidentModal } from './components/modals/NewIncidentModal';
import { NewAdmissionModal } from './components/modals/NewAdmissionModal';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { PacsViewerModal } from './components/modals/PacsViewerModal';
import { TransferPatientModal } from './components/modals/TransferPatientModal';
import { ReviewOrderModal } from './components/modals/ReviewOrderModal';

export default function App() {
  // Navigation & Location state
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedLocation, setSelectedLocation] = useState<WardLocation>('Cardiac ICU - Ward 4');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals & Drawers state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isServiceNowModalOpen, setIsServiceNowModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isNewAdmissionOpen, setIsNewAdmissionOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isPacsOpen, setIsPacsOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReviewOrderOpen, setIsReviewOrderOpen] = useState(false);

  // Active Patient / Selection state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pt-1');
  const [activePacsPatient, setActivePacsPatient] = useState<Patient | null>(null);
  const [activeOrderPatient, setActiveOrderPatient] = useState<Patient | null>(null);
  const [activeTransferPatient, setActiveTransferPatient] = useState<Patient | null>(null);
  const [activeReviewAlert, setActiveReviewAlert] = useState<MedicationSafetyAlert | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Data State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = useState<BedType[]>(INITIAL_BEDS);
  const [careTasks, setCareTasks] = useState<CareTask[]>(INITIAL_CARE_TASKS);
  const [medAlerts, setMedAlerts] = useState<MedicationSafetyAlert[]>(INITIAL_MED_ALERTS);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdministration[]>(INITIAL_PENDING_ADMINS);
  const [auditLogs, setAuditLogs] = useState<LiveAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [incidents, setIncidents] = useState<ServiceNowIncident[]>(INITIAL_SERVICENOW_INCIDENTS);
  const [requests, setRequests] = useState<ServiceNowITRequest[]>(INITIAL_SERVICENOW_REQUESTS);

  // Session, connection, and data-source state
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [serviceNowConnected, setServiceNowConnected] = useState<boolean | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo');

  const allowedTabs = tabsForRole(currentUser?.role);

  // Health check on mount — drives the truthful connection indicator.
  useEffect(() => {
    api.health()
      .then((h) => setServiceNowConnected(h.serviceNow.connected))
      .catch(() => setServiceNowConnected(false));
  }, []);

  // Load real data from ServiceNow once authenticated; keep mock as a labelled fallback.
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const [p, b] = await Promise.all([api.getPatients(), api.getBeds()]);
        const mappedPatients = p.patients?.length ? mapPatients(p.patients) : patients;
        if (p.patients?.length) setPatients(mappedPatients);
        if (b.beds?.length) setBeds(mapBeds(b.beds, mappedPatients));
        try {
          const inc = await api.getIncidents();
          if (inc.configured && inc.incidents?.length) {
            setIncidents(inc.incidents as ServiceNowIncident[]);
          }
        } catch { /* incidents optional */ }
        setDataSource('live');
        showToast('Loaded live records from ServiceNow.');
      } catch {
        setDataSource('demo');
        showToast('ServiceNow unreachable — showing demo data.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Keep the active tab within what the role is allowed to see.
  useEffect(() => {
    if (currentUser && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Handler: Care Task Complete Toggle
  const handleToggleTaskComplete = (taskId: string) => {
    setCareTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          showToast(`Task marked completed: ${t.title}`);
        }
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Handler: Add Care Task
  const handleAddTask = (newTask: Partial<CareTask>) => {
    setCareTasks(prev => [newTask as CareTask, ...prev]);
    showToast(`Care task scheduled & synced with ServiceNow: ${newTask.title}`);
  };

  // Handler: Acknowledge Abnormal Alert in Patient 360
  const handleAcknowledgeAlert = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId && p.abnormalAlert) {
        return {
          ...p,
          abnormalAlert: {
            ...p.abnormalAlert,
            acknowledged: true
          }
        };
      }
      return p;
    }));
    showToast('Critical lab alert acknowledged by Dr. Sarah Chen');
  };

  // Handler: Toggle Care Goal in Patient 360
  const handleToggleCareGoal = (patientId: string, goalId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          carePlanGoals: p.carePlanGoals.map(g => {
            if (g.id === goalId) {
              const next = !g.completed;
              return {
                ...g,
                completed: next,
                status: next ? 'Completed' : 'On Track'
              };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // Handler: Acknowledge / Override Medication Safety Alert
  const handleAcknowledgeMedAlert = (alertId: string) => {
    const alert = medAlerts.find(a => a.id === alertId);
    setMedAlerts(prev => prev.filter(a => a.id !== alertId));
    if (alert) {
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}`,
          time: 'Just now',
          actor: 'Dr. Sarah Chen',
          actorRole: 'Attending Intensivist',
          action: 'overridden interaction alert for',
          target: alert.medicationName,
          notes: 'Clinically justified; telemetry continuous monitoring active.',
          isAlert: true
        },
        ...prev
      ]);
      showToast(`Medication alert overridden with clinical justification: ${alert.medicationName}`);
    }
  };

  // Handler: Administer Medication via Barcode Verification
  const handleAdministerMedication = (padminId: string) => {
    const padmin = pendingAdmins.find(p => p.id === padminId);
    if (!padmin) return;

    setPendingAdmins(prev => prev.filter(p => p.id !== padminId));
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        time: 'Just now',
        actor: 'Sarah Jenkins, RN',
        actorRole: 'ICU Staff Nurse',
        action: 'administered',
        target: `${padmin.medication} to ${padmin.patientName} (${padmin.bedNumber})`,
        verifiedMethod: 'Barcode 5-Rights Verified',
        isAlert: false
      },
      ...prev
    ]);
    showToast(`Administered & Verified: ${padmin.medication}`);
  };

  // Handler: Modify Order from Alert
  const handleConfirmOrderAdjustment = (alertId: string, adjustedDose: string) => {
    const alert = medAlerts.find(a => a.id === alertId);
    setMedAlerts(prev => prev.filter(a => a.id !== alertId));
    if (alert) {
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}`,
          time: 'Just now',
          actor: 'Dr. Sarah Chen',
          actorRole: 'Attending Intensivist',
          action: 'modified order for',
          target: `${alert.medicationName} (${adjustedDose})`,
          notes: 'Renal clearance protocol adjustment.',
          isAlert: false
        },
        ...prev
      ]);
      showToast(`Order modified: ${alert.medicationName} -> ${adjustedDose}`);
    }
  };

  // Handler: CPOE New Order Submit
  const handleCpoeOrderSubmit = (order: {
    medication: string;
    dose: string;
    route: string;
    frequency: string;
    indication: string;
  }) => {
    if (!activeOrderPatient) return;
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        time: 'Just now',
        actor: 'Dr. Sarah Chen',
        actorRole: 'Attending Intensivist',
        action: 'ordered',
        target: `${order.medication} ${order.dose} ${order.route} (${order.frequency}) for ${activeOrderPatient.name}`,
        notes: `Indication: ${order.indication}`,
        isAlert: false
      },
      ...prev
    ]);
    showToast(`Order signed & transmitted to Pharmacy Pyxis: ${order.medication}`);
  };

  // Handler: Admit Patient
  const handleAdmitPatient = (newPt: Partial<Patient>, bedNumber: string) => {
    const patientObj = newPt as Patient;
    setPatients(prev => [patientObj, ...prev]);
    setBeds(prev => prev.map(b => {
      if (b.number === bedNumber) {
        return {
          ...b,
          status: 'occupied',
          patient: {
            id: patientObj.id,
            name: patientObj.name,
            mrn: patientObj.mrn,
            condition: 'Stable',
            assignedNurse: patientObj.primaryNurse,
            urgencyTag: patientObj.statusTag
          }
        };
      }
      return b;
    }));
    setSelectedPatientId(patientObj.id);
    setActiveTab('patient-360');
    showToast(`Patient ${patientObj.name} admitted to Bed ${bedNumber}`);
  };

  // Handler: Transfer Patient
  const handleConfirmTransfer = (patientId: string, targetBedNumber: string) => {
    const pt = patients.find(p => p.id === patientId);
    if (!pt) return;

    const prevBed = pt.roomNumber;

    // Update patient record
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          bedId: `bed-${targetBedNumber}`,
          roomNumber: targetBedNumber
        };
      }
      return p;
    }));

    // Update beds: vacate previous bed (freeing-soon/clean) and occupy new bed
    setBeds(prev => prev.map(b => {
      if (b.number === prevBed) {
        return {
          ...b,
          status: 'freeing-soon',
          patient: undefined,
          lastCleaned: 'EVS Dispatched'
        };
      }
      if (b.number === targetBedNumber) {
        return {
          ...b,
          status: 'occupied',
          patient: {
            id: pt.id,
            name: pt.name,
            mrn: pt.mrn,
            condition: 'Stable',
            assignedNurse: pt.primaryNurse,
            urgencyTag: pt.statusTag
          }
        };
      }
      return b;
    }));

    // Add EVS request in ServiceNow
    setRequests(prev => [
      {
        id: `req-${Date.now()}`,
        reqNumber: `REQ00${Math.floor(84920 + Math.random() * 800)}`,
        ritmNumber: `RITM00${Math.floor(91840 + Math.random() * 800)}`,
        item: `EVS Terminal Clean for Vacated Bed ${prevBed}`,
        requestedFor: 'Automated Bed Transfer Trigger',
        department: 'Environmental Services (EVS)',
        stage: 'Fulfillment',
        requestedDate: 'Just now',
        estimatedCompletion: 'In 20 mins',
        details: `Bed ${prevBed} vacated by ${pt.name} -> transferred to Bed ${targetBedNumber}.`
      },
      ...prev
    ]);

    showToast(`${pt.name} transferred to Bed ${targetBedNumber}. ServiceNow EVS ticket generated.`);
  };

  // Handler: Discharge Bed
  const handleDischargeBed = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed) return;

    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'freeing-soon',
          patient: undefined
        };
      }
      return b;
    }));

    setRequests(prev => [
      {
        id: `req-${Date.now()}`,
        reqNumber: `REQ00${Math.floor(84950 + Math.random() * 800)}`,
        ritmNumber: `RITM00${Math.floor(91870 + Math.random() * 800)}`,
        item: `Discharge Terminal Sanitization - Bed ${bed.number}`,
        requestedFor: 'Discharge Coordinator',
        department: 'Environmental Services (EVS)',
        stage: 'Fulfillment',
        requestedDate: 'Just now',
        estimatedCompletion: 'In 15 mins',
        details: `Bed ${bed.number} flagged for deep UV-C and chemical sanitization post-discharge.`
      },
      ...prev
    ]);

    showToast(`Bed ${bed.number} discharged. EVS cleaning dispatched via ServiceNow.`);
  };

  // Handler: Mark Bed as Clean Complete
  const handleCleanBed = (bedId: string) => {
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'available',
          patient: undefined,
          lastCleaned: 'Just now'
        };
      }
      return b;
    }));
    showToast('Bed marked clean & ready for immediate patient intake.');
  };

  // Handler: ServiceNow New Incident Created
  const handleNewServiceNowIncident = async (incident: Partial<ServiceNowIncident>) => {
    if (serviceNowConnected) {
      try {
        const res = await api.createIncident({
          title: incident.title,
          description: incident.description,
          priority: incident.priority,
          category: incident.category,
          location: incident.location,
        });
        setIncidents(prev => [res.incident as ServiceNowIncident, ...prev]);
        showToast(`ServiceNow Incident ${res.incident.number} created.`);
      } catch {
        showToast('ServiceNow incident creation failed — not logged.');
      }
      return;
    }
    setIncidents(prev => [incident as ServiceNowIncident, ...prev]);
    showToast(`Incident ${incident.number} logged (demo data).`);
  };

  // Handler: ServiceNow State Update
  const handleUpdateIncidentState = async (incidentId: string, newState: 'In Progress' | 'On Hold' | 'Resolved' | 'Closed') => {
    const target = incidents.find(i => i.id === incidentId);
    if (serviceNowConnected && target?.sysId) {
      try {
        await api.updateIncident(target.sysId, { state: newState });
      } catch {
        showToast('ServiceNow state update failed.');
        return;
      }
    }
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? {
      ...inc,
      state: newState,
      updated: 'Just now',
      workNotes: [`Just now - State changed to "${newState}" by ${currentUser?.name || 'Clinician'}.`, ...inc.workNotes]
    } : inc));
    showToast(`Incident state updated to ${newState}`);
  };

  // Handler: ServiceNow Add Work Note
  const handleAddWorkNote = async (incidentId: string, note: string) => {
    const target = incidents.find(i => i.id === incidentId);
    if (serviceNowConnected && target?.sysId) {
      try {
        await api.updateIncident(target.sysId, { workNote: note });
      } catch {
        showToast('Work note failed to post to ServiceNow.');
        return;
      }
    }
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? {
      ...inc,
      updated: 'Just now',
      workNotes: [note, ...inc.workNotes]
    } : inc));
    showToast('Work note posted to ServiceNow activity stream.');
  };

  // Handler: Simulate automated P1 Telemetry ticket
  const handleTriggerTestIncident = () => {
    const incNumber = `INC00${Math.floor(10600 + Math.random() * 300)}`;
    const newInc: ServiceNowIncident = {
      id: `inc-${Date.now()}`,
      number: incNumber,
      sysId: `sys_${Date.now()}`,
      title: 'Mindray Central Telemetry Hub dropped 3 lead channels on Bed 402',
      category: 'Bedside Telemetry',
      priority: '1 - Critical',
      state: 'New',
      caller: 'CareSync Telemetry Health Check Daemon',
      assignedGroup: 'Biomedical Rapid Response Team',
      assignedTo: 'Unassigned (Auto-Paged)',
      location: 'Cardiac ICU - Bed 402',
      impactBed: 'Bed 402',
      created: 'Just now',
      updated: 'Just now',
      description: 'CareSync daemon detected 3 consecutive dropped waveform packets from monitor AST-ICU-8822.',
      workNotes: [
        'Just now - Auto-created via CareSync Gateway Webhook.',
        'Just now - Critical on-call engineer paged.'
      ],
      slaStatus: 'Within SLA',
      slaTimeLeft: '59 mins remaining'
    };
    setIncidents(prev => [newInc, ...prev]);
    showToast(`Automated P1 Ticket Created: ${incNumber}`);
  };

  // Gate the whole app behind authentication.
  if (!currentUser) {
    return <AuthScreen onAuthenticated={setCurrentUser} serviceNowConnected={serviceNowConnected} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-1">✕</button>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        patients={patients}
        onSelectPatient={setSelectedPatientId}
        careTasks={careTasks}
        incidents={incidents}
      />

      <ServiceNowStatusModal
        isOpen={isServiceNowModalOpen}
        onClose={() => setIsServiceNowModalOpen(false)}
        incidents={incidents}
        requests={requests}
        onTriggerTestIncident={handleTriggerTestIncident}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectTab={setActiveTab}
        onOpenPatient={(id) => {
          setSelectedPatientId(id);
          setActiveTab('patient-360');
        }}
      />

      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onSubmit={handleNewServiceNowIncident}
      />

      <NewAdmissionModal
        isOpen={isNewAdmissionOpen}
        onClose={() => setIsNewAdmissionOpen(false)}
        availableBeds={beds.filter(b => b.status === 'available')}
        onAdmit={handleAdmitPatient}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        patient={activeOrderPatient}
        onSubmitOrder={handleCpoeOrderSubmit}
      />

      <PacsViewerModal
        isOpen={isPacsOpen}
        onClose={() => setIsPacsOpen(false)}
        patient={activePacsPatient}
      />

      <TransferPatientModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        patient={activeTransferPatient}
        availableBeds={beds.filter(b => b.status === 'available')}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <ReviewOrderModal
        isOpen={isReviewOrderOpen}
        onClose={() => setIsReviewOrderOpen(false)}
        alert={activeReviewAlert}
        onConfirmAdjustment={handleConfirmOrderAdjustment}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          incidentCount={incidents.filter(i => i.state !== 'Resolved' && i.state !== 'Closed').length}
          alertCount={medAlerts.length}
          allowedTabs={allowedTabs}
          serviceNowConnected={serviceNowConnected}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Header Bar */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenServiceNowModal={() => setIsServiceNowModalOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            unreadAlertCount={3}
            currentUser={currentUser ? { name: currentUser.name, role: currentUser.role, email: currentUser.email } : null}
            onLogout={handleLogout}
          />

          {/* Main View Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                onSelectTab={setActiveTab}
                patients={patients}
                onSelectPatient={setSelectedPatientId}
                beds={beds}
                careTasks={careTasks}
                medAlerts={medAlerts}
                incidents={incidents}
                onNewIncident={() => setIsNewIncidentOpen(true)}
                onNewAdmission={() => setIsNewAdmissionOpen(true)}
              />
            )}

            {activeTab === 'ward-dashboard' && (
              <WardDashboardView
                patients={patients}
                onSelectPatient={setSelectedPatientId}
                onSelectTab={setActiveTab}
                beds={beds}
                onNewAdmission={() => setIsNewAdmissionOpen(true)}
                onOpenPacs={(pt) => {
                  setActivePacsPatient(pt);
                  setIsPacsOpen(true);
                }}
              />
            )}

            {activeTab === 'care-tasks' && (
              <CareTasksView
                careTasks={careTasks}
                onToggleTaskComplete={handleToggleTaskComplete}
                onAddTask={handleAddTask}
              />
            )}

            {activeTab === 'patient-360' && (
              <Patient360View
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onSelectTab={setActiveTab}
                onOpenPacs={(pt) => {
                  setActivePacsPatient(pt);
                  setIsPacsOpen(true);
                }}
                onOpenNewOrder={(pt) => {
                  setActiveOrderPatient(pt);
                  setIsNewOrderOpen(true);
                }}
                onOpenTransferModal={(pt) => {
                  setActiveTransferPatient(pt);
                  setIsTransferModalOpen(true);
                }}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onToggleCareGoal={handleToggleCareGoal}
              />
            )}

            {activeTab === 'medication-safety' && (
              <MedicationSafetyView
                medAlerts={medAlerts}
                pendingAdmins={pendingAdmins}
                auditLogs={auditLogs}
                onAcknowledgeAlert={handleAcknowledgeMedAlert}
                onAdministerMedication={handleAdministerMedication}
                onOpenReviewOrder={(alert) => {
                  setActiveReviewAlert(alert);
                  setIsReviewOrderOpen(true);
                }}
              />
            )}

            {activeTab === 'bed-management' && (
              <BedManagementView
                beds={beds}
                patients={patients}
                onSelectBed={(bed) => {
                  const pt = patients.find(p => p.roomNumber === bed.number);
                  if (pt) {
                    setSelectedPatientId(pt.id);
                  }
                }}
                onNewAdmission={() => setIsNewAdmissionOpen(true)}
                onDischargeBed={handleDischargeBed}
                onCleanBed={handleCleanBed}
                onSelectTab={setActiveTab}
                onSelectPatient={setSelectedPatientId}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'family-portal' && (
              <FamilyPortalView
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView />
            )}

            {activeTab === 'administration' && (
              <AdministrationView
                incidents={incidents}
                requests={requests}
                onNewIncident={() => setIsNewIncidentOpen(true)}
                onUpdateIncidentState={handleUpdateIncidentState}
                onAddWorkNote={handleAddWorkNote}
                onOpenServiceNowModal={() => setIsServiceNowModalOpen(true)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}