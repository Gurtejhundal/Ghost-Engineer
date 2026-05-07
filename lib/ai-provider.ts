import { getFallbackAnalysis } from "@/lib/fallback-demo";
import { buildAgentPrompt, clampScore, validateAgentReview } from "@/lib/agents";
import type {
  AgentRole,
  AnalysisResult,
  DebateComment,
  FixPlan,
  RepoSummary,
  RiskScore,
} from "@/lib/schemas";
import { agentRoles } from "@/lib/schemas";

const GEMINI_MODEL = "gemini-1.5-flash";
const GROQ_MODEL = "llama-3.1-8b-instant";
const TIMEOUT_MS = 22_000;

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
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("MALFORMED_AI_JSON");
  }
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
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
        },
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
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return compact JSON only. You are a senior engineering council for public GitHub repository review.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`GROQ_${response.status}`);
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("GROQ_EMPTY");
  return extractJson(text);
}

function validateRiskScore(value: unknown): RiskScore {
  const risk = value as Partial<RiskScore>;
  return {
    architectureRisk: clampScore(risk.architectureRisk, 50),
    debuggingComplexity: clampScore(risk.debuggingComplexity, 55),
    securityRisk: clampScore(risk.securityRisk, 40),
    productClarity: clampScore(risk.productClarity, 70),
    overallHealth: clampScore(risk.overallHealth, 65),
  };
}

function validateStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.map(String).filter(Boolean).slice(0, 5);
  return strings.length ? strings : fallback;
}

function validateFixPlan(value: unknown): FixPlan {
  const plan = value as Partial<FixPlan>;
  return {
    understandFirst: validateStringList(plan.understandFirst, [
      "Start with README.md, dependency files, and the detected entry points.",
    ]),
    fixFirst: validateStringList(plan.fixFirst, [
      "Stabilize setup, environment handling, and the riskiest execution path.",
    ]),
    buildNext: validateStringList(plan.buildNext, [
      "Improve the highest-value workflow after the repository is easy to run.",
    ]),
    ignoreForNow: validateStringList(plan.ignoreForNow, [
      "Defer account features, private repo support, and broad rewrites.",
    ]),
  };
}

function validateDebate(value: unknown): AnalysisResult["debate"] {
  const debate = value as {
    comments?: DebateComment[];
    finalDecision?: string;
  };
  const comments = Array.isArray(debate.comments)
    ? debate.comments
        .filter((comment) => agentRoles.includes(comment.role))
        .slice(0, 4)
        .map((comment) => ({
          role: comment.role,
          position: String(comment.position || "No position returned.").slice(0, 180),
          reasoning: String(comment.reasoning || "No reasoning returned.").slice(0, 300),
        }))
    : [];

  return {
    comments:
      comments.length === 4
        ? comments
        : agentRoles.map((role) => ({
            role,
            position: `${role} recommends a focused first pass.`,
            reasoning: "The council should prioritize understanding, reliability, and the highest-risk files first.",
          })),
    finalDecision: String(
      debate.finalDecision ||
        "Read the critical files first, fix reliability risks, then build only the next visible product improvement.",
    ).slice(0, 420),
  };
}

function normalizeAiResult(raw: unknown, summary: RepoSummary): AnalysisResult {
  const value = raw as Partial<AnalysisResult>;
  const returnedAgents = Array.isArray(value.agents) ? value.agents : [];
  const agents = agentRoles.map((role) => {
    const found = returnedAgents.find((item) => (item as { role?: AgentRole }).role === role);
    return validateAgentReview(found, role);
  });

  return {
    mode: "live",
    repo: summary.metadata,
    detectedStack: summary.detectedStack,
    architectureSummary: String(
      value.architectureSummary ||
        "This repository has enough structure to identify entry points and risks, but the live AI summary was incomplete.",
    ).slice(0, 700),
    importantFiles: summary.importantFiles.slice(0, 20),
    riskScore: validateRiskScore(value.riskScore),
    agents,
    debate: validateDebate(value.debate),
    fixPlan: validateFixPlan(value.fixPlan),
  };
}

export async function runAiCouncil(summary: RepoSummary): Promise<AnalysisResult> {
  const prompt = buildAgentPrompt(summary);

  try {
    const raw = await callGemini(prompt);
    return normalizeAiResult(raw, summary);
  } catch {
    try {
      const raw = await callGroq(prompt);
      return normalizeAiResult(raw, summary);
    } catch {
      return getFallbackAnalysis();
    }
  }
}
