import { agentRoles, type AgentReview, type AgentRole, type RepoSummary } from "@/lib/schemas";

export const agents: {
  role: AgentRole;
  focus: string[];
}[] = [
  {
    role: "Architect",
    focus: ["structure", "folders", "entry points", "maintainability", "architecture risks"],
  },
  {
    role: "Debugger",
    focus: [
      "likely bugs",
      "broken setup",
      "fragile execution paths",
      "missing error handling",
      "runtime risks",
    ],
  },
  {
    role: "Security Reviewer",
    focus: [
      "exposed secrets",
      ".env handling",
      "unsafe APIs",
      "dependency risks",
      "auth/security concerns if present",
    ],
  },
  {
    role: "Product Manager",
    focus: [
      "what the repo is trying to do",
      "user value",
      "unclear features",
      "demo weakness",
      "what should be built next",
    ],
  },
];

export function validateAgentReview(value: unknown, role: AgentRole): AgentReview {
  const item = value as Partial<AgentReview>;
  const roleValue = agentRoles.includes(item.role as AgentRole) ? (item.role as AgentRole) : role;

  return {
    role: roleValue,
    summary: String(item.summary || `${role} review is unavailable.`).slice(0, 420),
    topFindings: Array.isArray(item.topFindings)
      ? item.topFindings.map(String).slice(0, 5)
      : ["Review output was incomplete."],
    risks: Array.isArray(item.risks)
      ? item.risks.slice(0, 5).map((risk) => {
          const riskItem = risk as {
            title?: unknown;
            severity?: unknown;
            explanation?: unknown;
          };
          const severity = ["low", "medium", "high"].includes(String(riskItem.severity))
            ? (String(riskItem.severity) as "low" | "medium" | "high")
            : "medium";
          return {
            title: String(riskItem.title || "Unspecified risk").slice(0, 100),
            severity,
            explanation: String(riskItem.explanation || "No explanation provided.").slice(0, 360),
          };
        })
      : [
          {
            title: "Incomplete review",
            severity: "medium",
            explanation: "The provider did not return a complete risk list.",
          },
        ],
    recommendations: Array.isArray(item.recommendations)
      ? item.recommendations.map(String).slice(0, 5)
      : ["Retry live analysis or use the local fallback report."],
    priorityScore: clampScore(item.priorityScore, 70),
    confidenceScore: clampScore(item.confidenceScore, 65),
  };
}

export function clampScore(value: unknown, fallback: number): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

export function buildAgentPrompt(summary: RepoSummary): string {
  return `You are Ghost Engineer, a senior AI engineering council.

Analyze this public GitHub repository summary only. Do not ask for more files. Do not invent private data.
Return JSON only. No markdown, no code fences, no prose outside JSON.

You must use exactly these four agents: Architect, Debugger, Security Reviewer, Product Manager.
Do not create any extra agents or alternate role names.

Output shape:
{
  "architectureSummary": "2 concise sentences.",
  "riskScore": {
    "architectureRisk": 0-100,
    "debuggingComplexity": 0-100,
    "securityRisk": 0-100,
    "productClarity": 0-100,
    "overallHealth": 0-100
  },
  "agents": [
    {
      "role": "Architect",
      "summary": "Short review.",
      "topFindings": ["Finding 1", "Finding 2", "Finding 3"],
      "risks": [{"title": "Risk name", "severity": "medium", "explanation": "Why this matters."}],
      "recommendations": ["Action 1", "Action 2"],
      "priorityScore": 80,
      "confidenceScore": 75
    }
  ],
  "debate": {
    "comments": [
      {"role": "Architect", "position": "Trade-off position.", "reasoning": "Brief reasoning."}
    ],
    "finalDecision": "One concise final council decision."
  },
  "fixPlan": {
    "understandFirst": ["Action"],
    "fixFirst": ["Action"],
    "buildNext": ["Action"],
    "ignoreForNow": ["Action"]
  }
}

Repository summary:
${JSON.stringify(summary, null, 2)}`;
}
