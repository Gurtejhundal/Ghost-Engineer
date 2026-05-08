import { buildLocalImpactAnalysis } from "@/lib/impact-fallback";
import { impactAgentRoles, type ImpactAnalysisResult, type ImpactAnalyzeRequest, type ImpactAgentReview, type ImpactBlueprint, type RepoContext } from "@/lib/schemas";

const GEMINI_MODEL = "gemini-1.5-flash";
const GROQ_MODEL = "llama-3.1-8b-instant";
const TIMEOUT_MS = 24_000;

function timeoutSignal(ms = TIMEOUT_MS): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("MALFORMED_AI_JSON");
  }
}

function promptFor(request: ImpactAnalyzeRequest, repoContext: RepoContext): string {
  return `You are Ghost Engineer, an open-source impact lab.

Mission: turn real-world social problems into buildable open-source project kits.

Return compact JSON only. No markdown, no prose outside JSON.

Use exactly these four agents:
- Open-Source Architect
- Feasibility Reviewer
- Safety & Trust Reviewer
- Impact Product Manager

Do not create extra agents. Do not turn this into a repo summarizer. GitHub context is optional support only.

Required JSON shape:
{
  "impactBlueprint": {
    "projectName": "Short open-source project name",
    "mission": "One sentence",
    "problemSummary": "One concise paragraph",
    "targetUsers": ["user"],
    "openSourceOpportunity": "Why open source helps",
    "mvpFeatures": ["feature"],
    "technicalApproach": ["approach"],
    "reusableParts": ["from repo if any"],
    "missingParts": ["missing module"],
    "recommendedOpenSourceComponents": ["component"],
    "impactScore": 0-100,
    "feasibilityScore": 0-100,
    "difficultyLevel": "low|medium|high",
    "safetyAndTrustConcerns": ["concern"]
  },
  "agents": [
    {
      "role": "Open-Source Architect",
      "summary": "Short dashboard-ready review.",
      "topFindings": ["Finding"],
      "risks": [{"title": "Risk", "severity": "medium", "explanation": "Why it matters"}],
      "recommendations": ["Action"],
      "priorityScore": 0-100,
      "confidenceScore": 0-100
    }
  ],
  "debate": {
    "comments": [{"role": "Open-Source Architect", "position": "Position", "reasoning": "Reasoning"}],
    "finalDecision": "Actionable decision"
  },
  "contributorBoard": [
    {
      "role": "Frontend Developer",
      "purpose": "Purpose",
      "tasks": ["Task"],
      "goodFirstIssues": [{"title": "Issue", "description": "Description", "label": "good first issue", "estimatedEffort": "2 hours"}],
      "requiredSkills": ["Skill"],
      "estimatedEffort": "1 day"
    }
  ],
  "githubPack": [
    {"fileName": "README.md", "purpose": "Purpose", "suggestedContent": "Short content"}
  ],
  "pilotPlan": {
    "pilotUsers": "Who",
    "locationContext": "Where",
    "successMetrics": ["Metric"],
    "testingSteps": ["Step"],
    "safetyChecklist": ["Check"],
    "sevenDayPlan": [{"day": 1, "title": "Title", "tasks": ["Task"]}],
    "postPilotNextSteps": ["Step"]
  }
}

Problem request:
${JSON.stringify(request, null, 2)}

Optional repo context:
${JSON.stringify(repoContext, null, 2)}`;
}

async function callGemini(prompt: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_NOT_CONFIGURED");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      signal: timeoutSignal(),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.24, responseMimeType: "application/json" },
      }),
    },
  );
  if (!response.ok) throw new Error(`GEMINI_${response.status}`);
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("GEMINI_EMPTY");
  return extractJson(text);
}

async function callGroq(prompt: string): Promise<unknown> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_NOT_CONFIGURED");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal: timeoutSignal(),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.24,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return concise JSON only for a public-good open-source project kit." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`GROQ_${response.status}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("GROQ_EMPTY");
  return extractJson(text);
}

function clamp(value: unknown, fallback: number): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function list(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map(String).filter(Boolean).slice(0, 7);
  return items.length ? items : fallback;
}

function normalizeAgent(value: unknown, role: ImpactAgentReview["role"]): ImpactAgentReview {
  const item = value as Partial<ImpactAgentReview>;
  return {
    role,
    summary: String(item.summary || `${role} review is unavailable.`).slice(0, 420),
    topFindings: list(item.topFindings, ["Review the MVP scope and contributor path."]).slice(0, 5),
    risks: Array.isArray(item.risks)
      ? item.risks.slice(0, 4).map((risk) => {
          const riskItem = risk as { title?: unknown; severity?: unknown; explanation?: unknown };
          const severity = ["low", "medium", "high"].includes(String(riskItem.severity))
            ? (String(riskItem.severity) as "low" | "medium" | "high")
            : "medium";
          return {
            title: String(riskItem.title || "Unspecified risk").slice(0, 100),
            severity,
            explanation: String(riskItem.explanation || "No explanation provided.").slice(0, 360),
          };
        })
      : [{ title: "Incomplete review", severity: "medium", explanation: "The AI provider returned an incomplete risk list." }],
    recommendations: list(item.recommendations, ["Keep the MVP narrow and field-testable."]).slice(0, 5),
    priorityScore: clamp(item.priorityScore, 75),
    confidenceScore: clamp(item.confidenceScore, 70),
  };
}

function normalize(raw: unknown, request: ImpactAnalyzeRequest, repoContext: RepoContext): ImpactAnalysisResult {
  const local = buildLocalImpactAnalysis(request, repoContext);
  const value = raw as Partial<ImpactAnalysisResult>;
  const blueprint = (value.impactBlueprint || {}) as Partial<ImpactBlueprint>;
  const agents = impactAgentRoles.map((role) => {
    const found = Array.isArray(value.agents)
      ? value.agents.find((agent) => (agent as { role?: string }).role === role)
      : undefined;
    return normalizeAgent(found, role);
  });

  return {
    ...local,
    mode: "live",
    fallbackReason: undefined,
    impactBlueprint: {
      ...local.impactBlueprint,
      projectName: String(blueprint.projectName || local.impactBlueprint.projectName).slice(0, 80),
      mission: String(blueprint.mission || local.impactBlueprint.mission).slice(0, 240),
      problemSummary: String(blueprint.problemSummary || local.impactBlueprint.problemSummary).slice(0, 500),
      targetUsers: list(blueprint.targetUsers, local.impactBlueprint.targetUsers),
      openSourceOpportunity: String(blueprint.openSourceOpportunity || local.impactBlueprint.openSourceOpportunity).slice(0, 500),
      mvpFeatures: list(blueprint.mvpFeatures, local.impactBlueprint.mvpFeatures),
      technicalApproach: list(blueprint.technicalApproach, local.impactBlueprint.technicalApproach),
      reusableParts: list(blueprint.reusableParts, local.impactBlueprint.reusableParts),
      missingParts: list(blueprint.missingParts, local.impactBlueprint.missingParts),
      recommendedOpenSourceComponents: list(blueprint.recommendedOpenSourceComponents, local.impactBlueprint.recommendedOpenSourceComponents),
      impactScore: clamp(blueprint.impactScore, local.impactBlueprint.impactScore),
      feasibilityScore: clamp(blueprint.feasibilityScore, local.impactBlueprint.feasibilityScore),
      difficultyLevel: ["low", "medium", "high"].includes(String(blueprint.difficultyLevel))
        ? (String(blueprint.difficultyLevel) as "low" | "medium" | "high")
        : local.impactBlueprint.difficultyLevel,
      safetyAndTrustConcerns: list(blueprint.safetyAndTrustConcerns, local.impactBlueprint.safetyAndTrustConcerns),
    },
    agents,
    debate: value.debate?.comments && value.debate.finalDecision ? value.debate : local.debate,
    contributorBoard: Array.isArray(value.contributorBoard) && value.contributorBoard.length ? value.contributorBoard.slice(0, 8) : local.contributorBoard,
    githubPack: Array.isArray(value.githubPack) && value.githubPack.length ? value.githubPack.slice(0, 7) : local.githubPack,
    pilotPlan: value.pilotPlan?.sevenDayPlan?.length ? value.pilotPlan : local.pilotPlan,
  };
}

export async function generateImpactAnalysis(
  request: ImpactAnalyzeRequest,
  repoContext: RepoContext,
): Promise<ImpactAnalysisResult> {
  const prompt = promptFor(request, repoContext);
  try {
    const raw = await callGemini(prompt);
    return normalize(raw, request, repoContext);
  } catch {
    try {
      const raw = await callGroq(prompt);
      return normalize(raw, request, repoContext);
    } catch {
      return buildLocalImpactAnalysis(request, repoContext, "AI_PROVIDER_FAILED_LOCAL_ANALYSIS");
    }
  }
}
