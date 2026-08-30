# Migration Audit — SOURCE functionality → TARGET UI

Golden rule honored: TARGET React UI preserved; SOURCE business logic + ServiceNow
integration restored behind it. No view was redesigned; no old HTML UI copied in.

## New files
- `server/servicenow.ts` — one authenticated ServiceNow Table API client (get/getRecord/create/update/delete/assignRole/ping).
- `server/ai.ts` — Gemini via REST: `evaluateHandoff`, `predictBed`, `familyVoiceReply` (multilingual fallback), two-key quota isolation, env-configurable model.
- `server/email.ts` — Nodemailer, no-op + log when unconfigured.
- `server/approvals.ts` — staff-approval store **with the `addRequest`/`getRequest` fix**.
- `server/routes.ts` — every SOURCE route + real `incident` bridge + truthful `/api/health`.
- `src/services/api.ts` — typed frontend API layer (no scattered fetch()).
- `src/services/mappers.ts` — thin ServiceNow rows → rich UI `Patient`/`Bed`.
- `src/services/rbac.ts` — role → allowed tabs.
- `src/components/auth/AuthScreen.tsx` — login / register / OTP / pending, in the TARGET design language.
- `.env.example`, `README.md`, this file.

## Modified files
- `server.ts` — replaced the mock (hardcoded incidents, always-"CONNECTED" health) with cors + json + real routes + Vite/static.
- `src/App.tsx` — auth gate; health check; live patient/bed/incident load with labelled demo fallback; RBAC nav gating; incident create/update/work-note now call the backend when connected.
- `src/components/layout/Sidebar.tsx` — role-filtered tabs; **truthful** ServiceNow status (Connected/Offline/Checking, Live/Demo).
- `src/components/layout/Header.tsx` — real session name/role/email + working Sign Out.
- `src/components/views/FamilyPortalView.tsx` — message box now calls the privacy-safe Family Voice AI.
- `src/components/views/MedicationSafetyView.tsx` — barcode scan performs a real 5-Rights verify → MAR table.
- `src/components/views/BedManagementView.tsx` — added a compact **Run AI Prediction** control (ETA/bottleneck/confidence, written back to ServiceNow).
- `src/components/views/CareTasksView.tsx` — **AI Evaluate (Gemini triage)** in the New Task modal; submit writes to `clinical_task`.
- `package.json` — added axios, cors, nodemailer (+ types); kept all TARGET UI deps and React 19.

## SOURCE feature checklist
- Auth: send-otp / register / login / users lookup — INTEGRATED
- Patient registration (create sys_user + patient + role) — INTEGRATED
- Staff registration + approval (email link **and** admin API, one shared `approveStaffAccount`) — INTEGRATED
- RBAC (patient/nurse/doctor/admin) — INTEGRATED (nav + route guards)
- Patients GET/PUT — INTEGRATED (GET wired to UI; PUT endpoint ready)
- AI Handoff evaluate + final-submit — INTEGRATED (Care Tasks modal)
- Beds GET + AI predict — INTEGRATED (Bed Management inspector)
- Family Voice chat (EN/HI/TE + privacy) — INTEGRATED (Family Portal)
- Medication verify + MAR + mismatch escalation — INTEGRATED (Medication Safety)
- Approvals GET/POST — BACKEND INTEGRATED; email-link flow wired. **Remaining:** an
  Administration-panel list UI (backend ready; add a table bound to `api.getApprovals` / `api.reviewApproval`).
- ServiceNow incidents — INTEGRATED (real `incident` table when connected, demo otherwise).

## Genuinely remaining (backend ready, UI polish only)
1. **Approvals panel** in `AdministrationView` — bind to `api.getApprovals()` / `api.reviewApproval()`.
2. **Patient 360 edit → PUT** — `api.updatePatient()` exists; wire the edit action.
3. **Care Plan module** (`x_snc_caresync_1_care_plan`) — schema present, no routes/UI yet.

## Verified here
- `tsc --noEmit` clean · `npm run build` (Vite + esbuild) clean · server boots in dev and prod ·
  `/api/health`, `/api/incidents`, `/api/approvals`, SPA index all respond.
- NOT verified here (network-restricted sandbox): live ServiceNow/Gemini/Gmail round-trips — run those on your machine.
