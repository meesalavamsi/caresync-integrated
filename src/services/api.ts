/**
 * Single typed API layer for the React app. Components call these helpers
 * instead of scattering fetch() everywhere. Everything is same-origin (/api/*)
 * because the Express server serves both the API and the Vite app.
 */

export interface HealthStatus {
  status: string;
  serviceNow: { connected: boolean; message: string; configured: boolean };
  ai: { main: boolean; voice: boolean };
  email: { configured: boolean };
  timestamp: string;
}

export interface SessionUser {
  sys_id: string;
  userId: string;
  name: string;
  email: string;
  role: 'patient' | 'nurse' | 'doctor' | 'admin' | string;
  dept: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  // Health / connection
  health: () => request<HealthStatus>('/api/health'),

  // Auth
  sendOtp: (email: string) =>
    request<{ success: boolean; devOtp?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  register: (payload: Record<string, any>) =>
    request<{ success: boolean; pendingApproval: boolean; userId?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (userId: string, password: string) =>
    request<{ success: boolean; user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    }),

  // Patients
  getPatients: () => request<{ success: boolean; patients: any[] }>('/api/patients'),
  updatePatient: (sysId: string, body: Record<string, any>) =>
    request<{ success: boolean; patient: any }>(`/api/patients/${sysId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Handoffs / clinical tasks
  getHandoffs: () => request<{ success: boolean; tasks: any[] }>('/api/handoffs'),
  evaluateHandoff: (dictation: string) =>
    request<{ success: boolean; aiAnalysis: any }>('/api/handoffs/ai-evaluate', {
      method: 'POST',
      body: JSON.stringify({ dictation }),
    }),
  submitHandoff: (payload: Record<string, any>) =>
    request<{ success: boolean; recordId: string }>('/api/handoffs/final-submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Beds
  getBeds: () => request<{ success: boolean; beds: any[] }>('/api/beds'),
  predictBed: (sysId: string, payload: Record<string, any>) =>
    request<{ success: boolean; aiAnalysis: any }>(`/api/beds/predict/${sysId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  notifyBottleneck: (sysId: string, payload: { bedNumber?: string; bottleneckDept: string; eta?: string; confidence?: string; requestedBy?: string }) =>
    request<{ success: boolean; snTaskId: string | null; emailSent: boolean; emailConfigured: boolean }>(`/api/beds/notify-bottleneck/${sysId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Family voice
  familyVoice: (payload: { userPatientId?: string; query: string; language: string }) =>
    request<{ success: boolean; reply: string; source: 'ai' | 'fallback' }>('/api/family-voice/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Medication safety
  verifyMedication: (payload: { patientId: string; scannedBarcode: string; expectedBarcode: string }) =>
    request<{ success: boolean; match: boolean; escalated: boolean; message: string }>('/api/medications/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Approvals
  getApprovals: () => request<{ success: boolean; approvals: any[] }>('/api/approvals'),
  reviewApproval: (id: string, action: 'approve' | 'reject') =>
    request<{ success: boolean; action: string }>(`/api/approvals/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // Incidents (real ServiceNow incident table when configured)
  getIncidents: () => request<{ success: boolean; configured: boolean; incidents: any[] }>('/api/incidents'),
  createIncident: (payload: Record<string, any>) =>
    request<{ success: boolean; incident: any }>('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateIncident: (sysId: string, body: { state?: string; workNote?: string }) =>
    request<{ success: boolean; incident: any }>(`/api/incidents/${sysId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export default api;
