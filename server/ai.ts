import axios from 'axios';

/**
 * Minimal Gemini REST helper. We call the Generative Language REST endpoint
 * directly with axios instead of pulling in an SDK, so there's no SDK-version
 * coupling and the two keys (main vs. voice) can isolate quota exactly as the
 * SOURCE project intended.
 *
 * Model name is env-configurable because model availability changes over time.
 * Set GEMINI_MODEL to whatever your Google AI Studio account currently exposes.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const KEY_MAIN = process.env.GEMINI_API_KEY_MAIN || process.env.GEMINI_API_KEY || '';
const KEY_VOICE = process.env.GEMINI_API_KEY_VOICE || process.env.GEMINI_API_KEY || '';

export const aiConfigured = {
  main: Boolean(KEY_MAIN),
  voice: Boolean(KEY_VOICE),
};

async function generate(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('Gemini API key not configured');
  const url = `${BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const { data } = await axios.post(
    url,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
  );
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Gemini returned no text');
  return text;
}

function parseJsonLoose(raw: string): any {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

// ── AI Handoff evaluation (main key) ─────────────────────────────────────────
export async function evaluateHandoff(dictation: string) {
  const prompt = `
    Analyze the following clinical dictation and extract structured data: "${dictation}"
    Respond ONLY with valid JSON:
    {
      "taskType": "Choose one (lowercase): medication, physiotherapy, dietetics, radiology, general",
      "assignedDept": "Choose one (lowercase): nursing, pharmacy, physiotherapy, radiology",
      "priority": "1 (Critical), 2 (High), 3 (Medium), 4 (Low)",
      "urgencyReason": "Brief reason for priority",
      "instruction": "Clean summary of tasks"
    }`;
  const text = await generate(prompt, KEY_MAIN);
  return parseJsonLoose(text);
}

// ── Predictive bed ETA (main key) ────────────────────────────────────────────
export async function predictBed(input: {
  bedNumber?: string;
  age?: string | number;
  diagnosis?: string;
  currentStatus?: string;
  pendingTasks?: string;
}) {
  const { bedNumber, age, diagnosis, currentStatus, pendingTasks } = input;
  const prompt = `
    You are a hospital predictive intelligence AI.
    Patient Profile: Age ${age}, Diagnosis: ${diagnosis}. Current Status: ${currentStatus}. Pending Tasks/Delays: ${pendingTasks}.
    Estimate the time until the bed (${bedNumber}) is physically empty. Identify if there is a cross-department bottleneck.
    Respond ONLY with valid JSON:
    {
      "eta": "String like '~2h' or '~45m'",
      "isBottleneck": boolean (true or false),
      "bottleneckDept": "Department name or empty string",
      "confidence": "Number representing % confidence (e.g., 88)"
    }`;
  const text = await generate(prompt, KEY_MAIN);
  return parseJsonLoose(text);
}

// ── Family Voice (voice key, with graceful multilingual fallback) ────────────
export async function familyVoiceReply(
  safeContext: {
    patientName: string;
    status: string;
    department: string;
    room: string;
    nextUpdate: string;
  },
  query: string,
  language: string,
): Promise<{ reply: string; source: 'ai' | 'fallback' }> {
  const prompt = `
    You are 'Family Voice', a compassionate, secure hospital voice assistant built for CareSync.

    STRICT SECURITY RULES:
    - You are speaking with the family member of patient: ${safeContext.patientName}.
    - You ONLY have access to these safe status fields: Status: ${safeContext.status}, Ward/Room: ${safeContext.room}, Next Update: ${safeContext.nextUpdate}.
    - ABSOLUTELY PROHIBITED: Do not share specific clinical details, lab results, medications, or doctor notes. If asked about restricted details, politely state: "For detailed clinical information, please speak directly with the attending nurse or doctor."
    - MULTILINGUAL REQUIREMENT: Respond entirely in this requested language: "${language || 'English'}". Keep your response natural and conversational so it can be spoken aloud easily.

    Patient Safe Context: ${JSON.stringify(safeContext)}
    Family Member Query: "${query}"
  `;
  try {
    const text = await generate(prompt, KEY_VOICE);
    return { reply: text.trim(), source: 'ai' };
  } catch {
    // Deterministic multilingual fallback identical in spirit to the SOURCE app.
    let reply: string;
    if (language === 'Hindi') {
      reply = `नमस्ते! सुरक्षित रिकॉर्ड के अनुसार, ${safeContext.patientName} की स्थिति ${safeContext.status} है। कमरा नंबर ${safeContext.room} है। अगली अपडेट शाम 4:00 बजे होगी।`;
    } else if (language === 'Telugu') {
      reply = `నమస్తే! సురక్షిత రికార్డుల ప్రకారం, ${safeContext.patientName} గారి పరిస్థితి ${safeContext.status}గా ఉంది. గది నంబర్ ${safeContext.room}. తదుపరి అప్‌డేట్ సాయంత్రం 4:00 గంటలకు ఉంటుంది.`;
    } else {
      reply = `Hello! Based on secure hospital records, ${safeContext.patientName} is currently ${safeContext.status} in room ${safeContext.room}. The next scheduled family update is at ${safeContext.nextUpdate}.`;
    }
    return { reply, source: 'fallback' };
  }
}
