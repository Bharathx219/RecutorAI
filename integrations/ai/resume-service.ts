import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface ResumeAnalysisInput {
  resumeText: string;
  requiredSkills?: string;
}

export interface ResumeAnalysisResult {
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  matchScore: number;
}

export interface InterviewQuestionInput {
  candidateName?: string;
  jobTitle?: string;
  requiredSkills?: string;
  matchedSkills?: string;
  missingSkills?: string;
  resumeSummary?: string;
  variationSeed?: string;
}

interface InterviewQuestionResult {
  technicalQuestions: string;
  behavioralQuestions: string;
  scenarioQuestions: string;
  notes: string;
}

const STOPWORDS = new Set([
  "and", "the", "for", "with", "from", "that", "this", "have", "has", "are", "you",
  "your", "our", "not", "but", "can", "will", "was", "were", "been", "into", "their",
  "about", "over", "under", "while", "where", "which", "when", "what", "why", "how",
  "job", "role", "work", "team", "years", "year", "using", "used", "skills", "skill",
  "experience", "developer", "engineer", "resume", "candidate"
]);

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s+#.-]/g, " ");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function parseRequiredSkills(requiredSkills?: string): string[] {
  if (!requiredSkills) return [];
  return unique(
    requiredSkills
      .split(",")
      .map((skill) => skill.toLowerCase())
      .map((skill) => skill.replace(/\s+/g, " ").trim())
  );
}

export function extractPdfTextFromRaw(rawPdf: string): string {
  const contentBlocks = rawPdf.match(/BT[\s\S]*?ET/g) ?? [];
  const output: string[] = [];

  for (const block of contentBlocks) {
    const simpleTextMatches = block.match(/\((?:\\.|[^\\)])*\)\s*Tj/g) ?? [];
    for (const token of simpleTextMatches) {
      const text = token.match(/\((.*)\)\s*Tj/)?.[1] ?? "";
      if (text) output.push(text);
    }

    const arrayTextMatches = block.match(/\[(?:\\.|[^\]])*\]\s*TJ/g) ?? [];
    for (const token of arrayTextMatches) {
      const textParts = token.match(/\((?:\\.|[^\\)])*\)/g) ?? [];
      for (const part of textParts) {
        output.push(part.slice(1, -1));
      }
    }
  }

  return output
    .join(" ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPdfTextFromFile(file: File): Promise<string> {
  // Most reliable browser-side extraction for regular PDFs.
  const pdfJsExtracted = await extractTextWithPdfJs(file);
  if (pdfJsExtracted) return pdfJsExtracted;

  const buffer = await file.arrayBuffer();
  const rawText = new TextDecoder("latin1").decode(buffer);
  const localExtracted = extractPdfTextFromRaw(rawText);
  if (localExtracted) return localExtracted;
  const geminiExtracted = await extractTextWithGemini(file);
  if (geminiExtracted) return geminiExtracted;
  return extractTextWithOcrApi(file);
}

function findTopKeywords(resumeText: string, max = 8): string[] {
  const words = normalizeText(resumeText)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}

export function analyzeResume(input: ResumeAnalysisInput): ResumeAnalysisResult {
  const resumeText = input.resumeText.trim();
  const normalizedResume = normalizeText(resumeText);
  const required = parseRequiredSkills(input.requiredSkills);

  const matchedSkills = required.filter((skill) => normalizedResume.includes(skill));
  const missingSkills = required.filter((skill) => !normalizedResume.includes(skill));

  const coverage = required.length > 0 ? matchedSkills.length / required.length : 0.6;
  const keywordBonus = Math.min(findTopKeywords(resumeText, 12).length / 12, 1) * 0.2;
  const score = Math.round(Math.min(1, coverage * 0.8 + keywordBonus) * 100);
  const matchScore = Math.max(35, score);

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Matched required skills: ${matchedSkills.slice(0, 6).join(", ")}`);
  }
  const topKeywords = findTopKeywords(resumeText, 6);
  if (topKeywords.length > 0) {
    strengths.push(`Resume highlights: ${topKeywords.join(", ")}`);
  }
  if (strengths.length === 0) {
    strengths.push("Resume submitted successfully and parsed for screening.");
  }

  const summarySource = resumeText.replace(/\s+/g, " ").trim();
  const summary =
    summarySource.length > 280 ? `${summarySource.slice(0, 280).trim()}...` : summarySource;

  return {
    summary,
    matchedSkills,
    missingSkills,
    strengths,
    matchScore,
  };
}

function splitSkills(text?: string): string[] {
  if (!text) return [];
  return unique(text.split(",").map((value) => value.trim()));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function createSeededRng(seed: string): () => number {
  let state = hashString(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickMany(source: string[], count: number, rng: () => number): string[] {
  const items = [...source];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, Math.min(count, items.length));
}

export function generateInterviewQuestionSet(input: InterviewQuestionInput) {
  const candidate = input.candidateName || "the candidate";
  const role = input.jobTitle || "this role";
  const required = splitSkills(input.requiredSkills);
  const matched = splitSkills(input.matchedSkills);
  const missing = splitSkills(input.missingSkills);
  const seed =
    input.variationSeed ||
    `${candidate}|${role}|${input.requiredSkills || ""}|${input.matchedSkills || ""}|${input.missingSkills || ""}|${Date.now()}`;
  const rng = createSeededRng(seed);

  const techFocus = (matched.length > 0 ? matched : required).slice(0, 5);
  const gapFocus = missing.slice(0, 4);

  const technicalBank = [
    `Walk me through a project where you used ${techFocus[0] || "your core technical stack"} end-to-end.`,
    `How do you design, debug, and improve performance for systems in ${role}?`,
    `Explain tradeoffs you considered in a recent technical decision and why you chose that approach.`,
    `How do you ensure code quality, testing discipline, and safe releases in your workflow?`,
    `Which part of your resume best demonstrates readiness for ${role}, and why?`,
    `How would you design a production-ready solution for ${techFocus[1] || techFocus[0] || "a core feature"}?`,
    `What monitoring and incident-response practices do you follow after deploying a feature?`,
    `Describe how you would test edge cases for ${techFocus[2] || "an API-heavy workflow"}.`,
  ];

  const behavioralBank = [
    `Tell me about a time you handled conflicting priorities while delivering a critical outcome.`,
    `Describe a situation where you received tough feedback and how you acted on it.`,
    `How do you collaborate with product, design, or non-technical stakeholders under pressure?`,
    `Give an example of mentoring or helping teammates improve execution quality.`,
    `Share a time you disagreed with a team decision and how you handled it constructively.`,
    `Describe a high-ambiguity project and how you created alignment across the team.`,
    `How have you handled a missed deadline while keeping stakeholder trust?`,
  ];

  const scenarioBank = [
    `Imagine you join this role and inherit a delayed project. How would you recover the timeline?`,
    `If requirements are unclear, what steps do you take before implementation begins?`,
    `How would you close gaps in ${gapFocus[0] || "missing domain skills"} during your first 30 days?`,
    `Production errors spike after a release. What is your triage and rollback plan?`,
    `A critical dependency is blocked by another team. How would you de-risk delivery?`,
    `You need to ship fast without sacrificing quality. What tradeoffs do you make and why?`,
  ];

  const technical = pickMany(technicalBank, 5, rng)
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join("\n");

  const behavioral = pickMany(behavioralBank, 4, rng)
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join("\n");

  const scenario = pickMany(scenarioBank, 3, rng)
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join("\n");

  const notes = [
    `Candidate: ${candidate}`,
    `Role: ${role}`,
    techFocus.length > 0 ? `Technical focus: ${techFocus.join(", ")}` : "",
    gapFocus.length > 0 ? `Gap focus: ${gapFocus.join(", ")}` : "",
    input.resumeSummary ? `Resume summary: ${input.resumeSummary}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    technicalQuestions: technical,
    behavioralQuestions: behavioral,
    scenarioQuestions: scenario,
    notes,
  };
}

function getPublicEnv(name: string): string {
  return ((import.meta as ImportMeta).env?.[name] as string) || "";
}

async function extractTextWithOcrApi(file: File): Promise<string> {
  const apiKey = getPublicEnv("PUBLIC_OCR_SPACE_API_KEY");
  if (!apiKey) return "";

  const formData = new FormData();
  formData.append("apikey", apiKey);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("file", file, file.name);

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return "";
    const data = await response.json();
    const parsedText = (data?.ParsedResults || [])
      .map((item: { ParsedText?: string }) => item.ParsedText || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return parsedText;
  } catch {
    return "";
  }
}

async function callOpenAIJson<T>(prompt: string, temperature = 0.2): Promise<T | null> {
  const apiKey = getPublicEnv("PUBLIC_OPENAI_API_KEY");
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getPublicEnv("PUBLIC_OPENAI_MODEL") || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function extractTextWithPdfJs(file: File): Promise<string> {
  try {
    if ((pdfjsLib as { GlobalWorkerOptions?: { workerSrc?: string } }).GlobalWorkerOptions) {
      (pdfjsLib as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerSrc;
    }

    const data = await file.arrayBuffer();
    const loadingTask = (pdfjsLib as { getDocument: (src: unknown) => { promise: Promise<unknown> } }).getDocument({
      data,
      useWorkerFetch: true,
      isEvalSupported: false,
    });

    const pdf = (await loadingTask.promise) as {
      numPages: number;
      getPage: (page: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str?: string }> }> }>;
    };

    const parts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) parts.push(pageText);
    }

    return parts.join(" ").trim();
  } catch {
    return "";
  }
}

async function extractTextWithGemini(file: File): Promise<string> {
  const apiKey = getPublicEnv("PUBLIC_GEMINI_API_KEY");
  if (!apiKey) return "";

  const model = getPublicEnv("PUBLIC_GEMINI_MODEL") || "gemini-1.5-flash";

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64Data = btoa(binary);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: "Extract all readable text from this resume PDF. Return plain text only." },
                {
                  inline_data: {
                    mime_type: file.type || "application/pdf",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
          },
        }),
      }
    );

    if (!response.ok) return "";
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return String(text).replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

async function callGeminiJson<T>(prompt: string, temperature = 0.2): Promise<T | null> {
  const apiKey = getPublicEnv("PUBLIC_GEMINI_API_KEY");
  if (!apiKey) return null;

  const model = getPublicEnv("PUBLIC_GEMINI_MODEL") || "gemini-1.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${prompt}\n\nReturn JSON only.` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function callLlmJson<T>(prompt: string, temperature = 0.2): Promise<T | null> {
  const gemini = await callGeminiJson<T>(prompt, temperature);
  if (gemini) return gemini;
  return callOpenAIJson<T>(prompt, temperature);
}

export async function analyzeResumeSmart(input: ResumeAnalysisInput): Promise<ResumeAnalysisResult> {
  const fallback = analyzeResume(input);
  if (!input.resumeText.trim()) return fallback;

  const prompt = `Analyze this resume for hiring. Return JSON with keys:
summary (string, <=280 chars),
matchedSkills (string[]),
missingSkills (string[]),
strengths (string[]),
matchScore (number 0-100).
Required skills: ${input.requiredSkills || ""}
Resume text:
${input.resumeText.slice(0, 10000)}`;

  const ai = await callLlmJson<ResumeAnalysisResult>(prompt, 0.2);
  if (!ai) return fallback;

  return {
    summary: ai.summary || fallback.summary,
    matchedSkills: Array.isArray(ai.matchedSkills) ? unique(ai.matchedSkills) : fallback.matchedSkills,
    missingSkills: Array.isArray(ai.missingSkills) ? unique(ai.missingSkills) : fallback.missingSkills,
    strengths: Array.isArray(ai.strengths) && ai.strengths.length > 0 ? ai.strengths : fallback.strengths,
    matchScore:
      typeof ai.matchScore === "number" && ai.matchScore >= 0 && ai.matchScore <= 100
        ? Math.round(ai.matchScore)
        : fallback.matchScore,
  };
}

export async function generateInterviewQuestionSetSmart(
  input: InterviewQuestionInput
): Promise<InterviewQuestionResult> {
  const fallback = generateInterviewQuestionSet(input);
  const variationToken =
    input.variationSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const prompt = `Generate interview questions as JSON with keys:
technicalQuestions (string with numbered lines),
behavioralQuestions (string with numbered lines),
scenarioQuestions (string with numbered lines),
notes (string).
Create varied wording and do not reuse the same phrasing across candidates.
Variation token: ${variationToken}
Candidate: ${input.candidateName || ""}
Role: ${input.jobTitle || ""}
Required skills: ${input.requiredSkills || ""}
Matched skills: ${input.matchedSkills || ""}
Missing skills: ${input.missingSkills || ""}
Resume summary: ${input.resumeSummary || ""}`;

  const ai = await callLlmJson<InterviewQuestionResult>(prompt, 0.7);
  if (!ai) return fallback;

  return {
    technicalQuestions: ai.technicalQuestions || fallback.technicalQuestions,
    behavioralQuestions: ai.behavioralQuestions || fallback.behavioralQuestions,
    scenarioQuestions: ai.scenarioQuestions || fallback.scenarioQuestions,
    notes: ai.notes || fallback.notes,
  };
}
