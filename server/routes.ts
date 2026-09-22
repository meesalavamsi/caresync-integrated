import type { Express, Request, Response } from 'express';
import snClient from './servicenow.js';
import { sendEmail, emailConfigured } from './email.js';
import { evaluateHandoff, predictBed, familyVoiceReply, aiConfigured } from './ai.js';
import approvalManager from './approvals.js';
import { resolveDeptEmail } from './departments.js';

const PORT = Number(process.env.PORT) || 3000;

// OTP store — in-memory (see README known-limitations).
const otpStore: Record<string, string> = {};

/**
 * Shared staff-approval routine. Both the email-link approval and the Admin
 * panel approval call this, so approving from either place does the same real
 * work (create sys_user + assign role) — fixing the SOURCE bug where the admin
 * path only mutated in-memory state.
 */
async function approveStaffAccount(requestData: any) {
  const userRes = await snClient.createRecord('sys_user', {
    first_name: requestData.firstName,
    last_name: requestData.lastName,
    email: requestData.email,
    user_name: requestData.uniqueUserId,
    employee_number: requestData.password,
    mobile_phone: requestData.phone,
    title: requestData.role,
    active: true,
  });
  await snClient.assignRole(userRes.sys_id, requestData.role);
  approvalManager.reviewAccount(requestData.id, 'approve');
  await sendEmail(
    requestData.email,
    'CareSync Account Approved',
    `Your User ID is: ${requestData.uniqueUserId}`,
  );
  return userRes;
}

// Normalize a ServiceNow incident row → the shape the React UI already expects.
function mapIncident(r: any) {
  const dv = (v: any) => (v && typeof v === 'object' ? v.display_value : v);
  return {
    id: r.sys_id,
    number: r.number,
    sysId: r.sys_id,
    title: r.short_description || 'Incident',
    category: dv(r.category) || 'Biomedical Equipment',
    priority: dv(r.priority) || '3 - Moderate',
    state: dv(r.state) || 'New',
    caller: dv(r.caller_id) || 'CareSync',
    assignedGroup: dv(r.assignment_group) || 'Unassigned',
    assignedTo: dv(r.assigned_to) || 'Unassigned',
    location: dv(r.location) || '',
    impactBed: r.u_impact_bed || '',
    created: dv(r.opened_at) || 'Recently',
    updated: dv(r.sys_updated_on) || 'Recently',
    description: r.description || '',
    workNotes: r.work_notes ? String(r.work_notes).split('\n').filter(Boolean) : [],
    slaStatus: 'Within SLA',
    slaTimeLeft: '—',
  };
}

export function registerRoutes(app: Express) {
  // ── Health / connection status (truthful) ────────────────────────────────
  app.get('/api/health', async (_req: Request, res: Response) => {
    const sn = await snClient.ping();
    res.json({
      status: 'healthy',
      system: 'CareSync Clinical Command Center',
      serviceNow: { connected: sn.ok, message: sn.message, configured: snClient.configured },
      ai: aiConfigured,
      email: { configured: emailConfigured },
      timestamp: new Date().toISOString(),
    });
  });

  // ── AUTH ──────────────────────────────────────────────────────────────────
  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    await sendEmail(
      email,
      'Your CareSync Verification Code',
      `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    );
    // In a credential-less dev environment we surface the OTP so the flow is testable.
    res.json({ success: true, message: 'OTP sent.', devOtp: emailConfigured ? undefined : otp });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, role, dept, password, otp } = req.body;
    if (otpStore[email] !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    try {
      const existing = await snClient.findUserByEmail(email);
      if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

      const uniqueUserId = 'CS-' + Math.floor(10000 + Math.random() * 90000);

      if (role === 'patient') {
        const userRes = await snClient.createRecord('sys_user', {
          first_name: firstName,
          last_name: lastName,
          email,
          user_name: uniqueUserId,
          employee_number: password,
          mobile_phone: phone,
          title: role,
          active: true,
        });
        await snClient.assignRole(userRes.sys_id, 'patient');
        await snClient.createRecord('x_snc_caresync_1_patient', {
          patient_name: `${firstName} ${lastName}`,
          department: dept,
          active: true,
        });
        delete otpStore[email];
        await sendEmail(
          email,
          'Welcome to CareSync - Your Login ID',
          `Hello ${firstName},\n\nYour unique User ID for logging in is: ${uniqueUserId}\n\nPlease save this ID to sign in.`,
        );
        return res.json({ success: true, pendingApproval: false, userId: uniqueUserId });
      }

      // Staff → pending approval
      const reqId = approvalManager.addRequest({
        firstName, lastName, email, phone, role, dept, password, uniqueUserId,
      });
      delete otpStore[email];
      const adminEmail = process.env.EMAIL_USER || email;
      const approveUrl = `http://localhost:${PORT}/api/auth/approveViaEmail?id=${reqId}&action=approve`;
      const rejectUrl = `http://localhost:${PORT}/api/auth/approveViaEmail?id=${reqId}&action=reject`;
      await sendEmail(
        adminEmail,
        'ACTION REQUIRED: New CareSync Staff',
        `A new ${role} has registered.\n\nAPPROVE: ${approveUrl}\nREJECT: ${rejectUrl}`,
      );
      return res.json({ success: true, pendingApproval: true, requestId: reqId });
    } catch (error: any) {
      console.error('[Registration Error]', error?.message);
      res.status(500).json({ success: false, message: 'Failed to process registration.' });
    }
  });

  app.get('/api/auth/approveViaEmail', async (req: Request, res: Response) => {
    const { id, action } = req.query as { id: string; action: string };
    const requestData = approvalManager.getRequest(id);
    if (!requestData) return res.send('<h1>Error: Request not found.</h1>');
    try {
      if (action === 'approve') {
        await approveStaffAccount(requestData);
        res.send('<h1 style="color:green;">Account Approved and Role Assigned successfully!</h1>');
      } else {
        approvalManager.reviewAccount(id, 'reject');
        await sendEmail(requestData.email, 'CareSync Account Rejected', 'Your request was declined.');
        res.send('<h1 style="color:red;">Account Rejected.</h1>');
      }
    } catch (err: any) {
      console.error('[Approval Error]', err?.message);
      res.send('<h1>Error communicating with ServiceNow.</h1>');
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { userId, password } = req.body;
    try {
      const snUser = await snClient.findUserByUsername(userId);
      if (!snUser) return res.status(401).json({ success: false, message: 'User not found.' });
      if (snUser.employee_number !== password) {
        return res.status(401).json({ success: false, message: 'Invalid Password.' });
      }
      res.json({
        success: true,
        user: {
          sys_id: snUser.sys_id,
          userId: snUser.user_name,
          name: `${snUser.first_name || ''} ${snUser.last_name || ''}`.trim(),
          email: snUser.email,
          role: snUser.title ? String(snUser.title).toLowerCase() : 'patient',
          dept: snUser.department ? snUser.department.display_value : '',
        },
      });
    } catch {
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  });

  app.get('/api/users/:userId', async (req: Request, res: Response) => {
    try {
      const snUser = await snClient.findUserByUsername(req.params.userId);
      if (!snUser) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, name: `${snUser.first_name || ''} ${snUser.last_name || ''}`.trim() });
    } catch {
      res.status(500).json({ success: false, message: 'Lookup failed.' });
    }
  });

  // ── PATIENTS ────────────────────────────────────────────────────────────
  app.get('/api/patients', async (_req: Request, res: Response) => {
    try {
      const patients = await snClient.getTableRecords('x_snc_caresync_1_patient');
      res.json({ success: true, patients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
    }
  });

  app.put('/api/patients/:sys_id', async (req: Request, res: Response) => {
    try {
      const updated = await snClient.updateRecord('x_snc_caresync_1_patient', req.params.sys_id, req.body);
      res.json({ success: true, patient: updated });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update patient.' });
    }
  });

  // ── HANDOFFS / CLINICAL TASKS ─────────────────────────────────────────────
  app.get('/api/handoffs', async (_req: Request, res: Response) => {
    try {
      const tasks = await snClient.getTableRecords('x_snc_caresync_1_clinical_task');
      res.json({ success: true, tasks });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch clinical tasks.' });
    }
  });

  app.post('/api/handoffs/ai-evaluate', async (req: Request, res: Response) => {
    try {
      const aiAnalysis = await evaluateHandoff(req.body.dictation || '');
      res.json({ success: true, aiAnalysis });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'AI Analysis failed.', detail: error?.message });
    }
  });

  app.post('/api/handoffs/final-submit', async (req: Request, res: Response) => {
    const {
      patientId, patientName, submitterId, submitterName, assignedDoctor,
      taskType, assignedDept, priority, urgencyReason, instruction,
    } = req.body;
    try {
      const snRecord = await snClient.createRecord('x_snc_caresync_1_clinical_task', {
        u_patient_id: patientId,
        u_patient_name: patientName,
        u_submitter_id: submitterId,
        u_submitter_name: submitterName,
        u_assigned_doctor: assignedDoctor,
        task_type: taskType,
        assigned_dept: assignedDept,
        priority,
        urgency_reason: (urgencyReason || '') + '\n\nAI Instruction: ' + (instruction || ''),
        capability_source: 'Gemini AI',
      });
      res.json({ success: true, recordId: snRecord.sys_id });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to save to ServiceNow.' });
    }
  });

  // ── BEDS ──────────────────────────────────────────────────────────────────
  app.get('/api/beds', async (_req: Request, res: Response) => {
    try {
      // 'all' (not just true) is required here: the `patient` field is a
      // REFERENCE to x_snc_caresync_1_patient. sysparm_display_value=true
      // doesn't reliably flatten scoped-app reference fields to a plain
      // string — it can still come back as {value, link}. 'all' guarantees
      // we get { value: <sys_id>, display_value: <name> } for every field,
      // so the frontend mapper can always read display_value directly.
      const beds = await snClient.getTableRecords('x_snc_caresync_1_bed_management', '', 'all');
      res.json({ success: true, beds });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch bed data.' });
    }
  });

  app.post('/api/beds/predict/:sys_id', async (req: Request, res: Response) => {
    try {
      const aiData = await predictBed(req.body);
      await snClient.updateRecord('x_snc_caresync_1_bed_management', req.params.sys_id, {
        // Technical field name in x_snc_caresync_1_bed_management is
        // u_prediction_available_time (confirmed from the instance's form view) —
        // writing to the un-prefixed name was silently a no-op.
        u_prediction_available_time: aiData.eta,
        bottleneck_flag: aiData.isBottleneck,
        bottleneck_department: aiData.bottleneckDept,
        prediction_confidence: aiData.confidence,
      });
      res.json({ success: true, aiAnalysis: aiData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'AI Prediction failed.', detail: error?.message });
    }
  });

  // Notify the department named as the bottleneck in a bed's AI prediction.
  // Does two real things, not just a toast: (1) writes an audit-trail task into
  // ServiceNow's clinical_task table so there's a record any staff can see, and
  // (2) emails that department's distribution list (server/departments.ts) so a
  // human actually gets pinged to prioritize freeing the bed.
  app.post('/api/beds/notify-bottleneck/:sys_id', async (req: Request, res: Response) => {
    const { bedNumber, bottleneckDept, eta, confidence, requestedBy } = req.body;
    if (!bottleneckDept) {
      return res.status(400).json({ success: false, message: 'No bottleneck department provided.' });
    }
    const message = `Bed ${bedNumber || req.params.sys_id} is predicted free in ${eta || 'an unknown time'} ` +
      `(${confidence ? confidence + '%' : 'unscored'} confidence), and CareSync's predictive bed intelligence has ` +
      `flagged ${bottleneckDept} as the cross-department bottleneck. Please prioritize this patient's ` +
      `${bottleneckDept} step so the bed can turn over for the next admission.`;

    let snTaskId: string | null = null;
    let emailSent = false;
    try {
      const task = await snClient.createRecord('x_snc_caresync_1_clinical_task', {
        u_patient_name: '',
        u_submitter_id: requestedBy || 'system',
        u_submitter_name: requestedBy || 'CareSync Predictive Bed Intelligence',
        task_type: String(bottleneckDept).toLowerCase(),
        assigned_dept: bottleneckDept,
        priority: 'STAT',
        urgency_reason: message,
        capability_source: 'CareSync Predictive Bed Intelligence',
      });
      snTaskId = task?.sys_id || null;
    } catch (err: any) {
      console.warn('[Notify Bottleneck] ServiceNow task creation failed:', err?.message);
    }
    try {
      const to = resolveDeptEmail(bottleneckDept);
      if (to) {
        emailSent = await sendEmail(to, `🔔 Bed Turnover Alert: ${bottleneckDept} bottleneck on Bed ${bedNumber || ''}`, message);
      }
    } catch (err: any) {
      console.warn('[Notify Bottleneck] Email send failed:', err?.message);
    }
    res.json({ success: true, snTaskId, emailSent, emailConfigured });
  });

  // ── FAMILY VOICE ──────────────────────────────────────────────────────────
  app.post('/api/family-voice/chat', async (req: Request, res: Response) => {
    const { userPatientId, query, language } = req.body;
    try {
      let patientData: any = null;
      if (userPatientId && userPatientId !== 'test_patient_id') {
        const rows = await snClient.getTableRecords(
          'x_snc_caresync_1_patient', `sys_id=${userPatientId}`, true, 1,
        );
        patientData = rows[0];
      }
      if (!patientData) {
        const rows = await snClient.getTableRecords('x_snc_caresync_1_patient', '', true, 1);
        patientData = rows[0];
      }
      const safeContext = {
        patientName: patientData ? patientData.patient_name : 'Patient',
        status: (patientData && patientData.status) || 'Stable / In Recovery',
        department: (patientData && patientData.department) || 'General Ward',
        room: (patientData && patientData.room_number) || '14B',
        nextUpdate: '4:00 PM today',
      };
      const { reply, source } = await familyVoiceReply(safeContext, query, language);
      res.json({ success: true, reply, source });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Voice assistant temporarily unavailable.' });
    }
  });

  // ── MEDICATION SAFETY ─────────────────────────────────────────────────────
  app.post('/api/medications/verify', async (req: Request, res: Response) => {
    const { patientId, scannedBarcode, expectedBarcode } = req.body;
    try {
      const isMatch = String(scannedBarcode).trim() === String(expectedBarcode).trim();
      let mismatchReasonText = '';
      if (!isMatch) {
        mismatchReasonText = `Scanned: ${scannedBarcode} | Expected: ${expectedBarcode} (Mismatch Escalated)`;
        await sendEmail(
          process.env.EMAIL_USER || '',
          '🚨 CRITICAL SLA ESCALATION: Medication Mismatch Detected!',
          `Warning: A medication mismatch was caught at the bedside for Patient ID: ${patientId}.\n\nScanned Medication: ${scannedBarcode}\nExpected Medication: ${expectedBarcode}\n\nAction Required: Charge nurse and attending staff have been immediately alerted.`,
        );
      }
      await snClient.createRecord('x_snc_caresync_1_medication_administration_record', {
        patient: patientId || '',
        medication_name: expectedBarcode,
        dosage: 'Standard Dose',
        dose_status: isMatch ? 'administered' : 'mismatch_flagged',
        barcode_verified: isMatch,
        mismatch_reason: mismatchReasonText,
        administered_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      res.json({
        success: true,
        match: isMatch,
        escalated: !isMatch,
        message: isMatch
          ? 'Barcode verified successfully. Logged to Medication Administration Record.'
          : 'MISMATCH DETECTED! Recorded to MAR table and charge nurse alerted via SLA escalation.',
      });
    } catch {
      res.status(500).json({ success: false, message: 'Verification service unavailable.' });
    }
  });

  // ── APPROVALS (Admin panel) ───────────────────────────────────────────────
  app.get('/api/approvals', (_req: Request, res: Response) => {
    res.json({ success: true, approvals: approvalManager.getPending() });
  });

  app.post('/api/approvals/:id', async (req: Request, res: Response) => {
    const requestData = approvalManager.getRequest(req.params.id);
    if (!requestData) return res.status(404).json({ success: false, message: 'Request not found.' });
    try {
      if (req.body.action === 'approve') {
        await approveStaffAccount(requestData);
        return res.json({ success: true, action: 'approve', requestId: req.params.id });
      }
      approvalManager.reviewAccount(req.params.id, 'reject');
      await sendEmail(requestData.email, 'CareSync Account Rejected', 'Your request was declined.');
      res.json({ success: true, action: 'reject', requestId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Approval failed.', detail: err?.message });
    }
  });

  // ── INCIDENTS (real ServiceNow `incident` table when configured) ──────────
  app.get('/api/incidents', async (_req: Request, res: Response) => {
    try {
      if (!snClient.configured) {
        return res.json({ success: true, configured: false, incidents: [] });
      }
      const rows = await snClient.getTableRecords('incident', 'active=true', true, 50);
      res.json({ success: true, configured: true, incidents: rows.map(mapIncident) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch incidents.' });
    }
  });

  app.post('/api/incidents', async (req: Request, res: Response) => {
    try {
      const { title, description, priority, category, location } = req.body;
      const created = await snClient.createRecord('incident', {
        short_description: title || '[CareSync] Clinical incident',
        description: description || '',
        category: category || 'Biomedical Equipment',
        urgency: String(priority || '').startsWith('1') ? '1' : '3',
        location: location || '',
      });
      res.status(201).json({ success: true, incident: mapIncident(created) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create incident.' });
    }
  });

  app.patch('/api/incidents/:sys_id', async (req: Request, res: Response) => {
    try {
      const payload: Record<string, any> = {};
      if (req.body.state) payload.state = req.body.state;
      if (req.body.workNote) payload.work_notes = req.body.workNote;
      const updated = await snClient.updateRecord('incident', req.params.sys_id, payload);
      res.json({ success: true, incident: mapIncident(updated) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update incident.' });
    }
  });
}