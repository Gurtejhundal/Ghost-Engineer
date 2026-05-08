import { buildAgentPrompt, clampScore, validateAgentReview } from "@/lib/agents";
import type {
  AgentReview,
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

function compactList(items: string[], fallback: string, limit = 3): string {
  const selected = items.filter(Boolean).slice(0, limit);
  return selected.length ? selected.join(", ") : fallback;
}

function severityFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function buildLocalArchitectureSummary(summary: RepoSummary): string {
  const stack = compactList(summary.detectedStack, summary.metadata.primaryLanguage || "unclassified code");
  const folders = compactList(summary.topLevelFolders, "root-level files");
  const entries = compactList(summary.possibleEntryPoints, "the README and detected important files");

  return `${summary.metadata.fullName} appears to be a ${stack} repository organized around ${folders}. Start analysis at ${entries}, then use the detected configuration and source files to confirm setup, execution path, and project intent.`;
}

function buildLocalRiskScore(summary: RepoSummary): RiskScore {
  const hasReadme = Boolean(summary.readmeExcerpt.trim());
  const hasEntries = summary.possibleEntryPoints.length > 0;
  const hasConfig = summary.configFiles.length > 0;
  const hasEnvExample = summary.configFiles.includes(".env.example");
  const hasDependencyManifest = summary.configFiles.some((path) =>
    ["package.json", "requirements.txt", "pyproject.toml"].includes(path),
  );
  const hasHtmlOnly =
    summary.detectedStack.includes("Static Website") &&
    !summary.detectedStack.some((stack) => ["Node.js", "React", "Next.js"].includes(stack));
  const scaleRisk = summary.totalFiles > 500 ? 14 : summary.totalFiles > 120 ? 8 : 0;

  const architectureRisk = clampScore(34 + scaleRisk + (hasEntries ? 0 : 18) + (hasConfig ? 0 : 8), 50);
  const debuggingComplexity = clampScore(
    32 + scaleRisk + (hasReadme ? 0 : 16) + (hasDependencyManifest || hasHtmlOnly ? 0 : 10),
    55,
  );
  const securityRisk = clampScore(
    26 + (hasDependencyManifest ? 8 : 0) + (hasEnvExample ? 2 : 7) + (hasHtmlOnly ? -6 : 0),
    40,
  );
  const productClarity = clampScore(74 + (summary.metadata.description ? 8 : 0) + (hasReadme ? 8 : -14), 70);
  const averageRisk = (architectureRisk + debuggingComplexity + securityRisk) / 3;
  const overallHealth = clampScore(100 - averageRisk * 0.65 + productClarity * 0.22, 65);

  return {
    architectureRisk,
    debuggingComplexity,
    securityRisk,
    productClarity,
    overallHealth,
  };
}

function localAgentReview(
  role: AgentRole,
  summary: RepoSummary,
  riskScore: RiskScore,
): AgentReview {
  const stack = compactList(summary.detectedStack, summary.metadata.primaryLanguage || "Unknown");
  const entries = compactList(summary.possibleEntryPoints, "No clear entry file detected");
  const configs = compactList(summary.configFiles, "No major config file detected");
  const files = summary.importantFiles.map((file) => file.path);
  const firstFiles = compactList(files, "README and root files");
  const hasReadme = Boolean(summary.readmeExcerpt.trim());

  if (role === "Architect") {
    return {
      role,
      summary: `Architecture fallback review based on repository metadata, tree, README, and important files. The clearest stack signal is ${stack}, with likely entry points at ${entries}.`,
      topFindings: [
        `Detected stack: ${stack}.`,
        `Primary read path: ${entries}.`,
        `Important structural files: ${firstFiles}.`,
      ],
      risks: [
        {
          title: "Entry point ambiguity",
          severity: severityFromScore(riskScore.architectureRisk),
          explanation: summary.possibleEntryPoints.length
            ? "Entry files were detected, but the architecture should still be verified against setup instructions."
            : "No obvious entry point was detected, which makes first-time understanding slower.",
        },
        {
          title: "Structure depends on file conventions",
          severity: "medium",
          explanation: "This local fallback uses repository signals instead of full code execution, so architecture confidence depends on consistent naming and folder layout.",
        },
      ],
      recommendations: [
        `Read ${entries} first.`,
        `Confirm project boundaries using ${configs}.`,
        "Document the run path and ownership of major folders.",
      ],
      priorityScore: clampScore(riskScore.architectureRisk + 28, 74),
      confidenceScore: 72,
    };
  }

  if (role === "Debugger") {
    return {
      role,
      summary: `Debugging fallback review found ${summary.totalFiles} analyzable files after ignoring generated assets. Setup confidence comes from ${configs}.`,
      topFindings: [
        hasReadme ? "README is available for setup verification." : "README is missing or empty, so setup may be unclear.",
        summary.configFiles.length ? `Config/dependency files found: ${configs}.` : "No dependency or config manifest was detected.",
        summary.ignoredFilesCount
          ? `${summary.ignoredFilesCount} generated or binary files were ignored.`
          : "No generated or binary files needed to be ignored.",
      ],
      risks: [
        {
          title: "Unverified runtime path",
          severity: severityFromScore(riskScore.debuggingComplexity),
          explanation: "Ghost Engineer does not execute repository code, so runtime failures must be confirmed by running the documented commands locally.",
        },
        {
          title: "Setup drift",
          severity: summary.configFiles.length ? "low" : "medium",
          explanation: "Missing or sparse config files make it harder to reproduce the repository environment.",
        },
      ],
      recommendations: [
        "Check README setup commands before installing dependencies.",
        `Inspect ${configs} for scripts, versions, and environment requirements.`,
        "Add a small smoke test or documented manual verification path.",
      ],
      priorityScore: clampScore(riskScore.debuggingComplexity + 25, 76),
      confidenceScore: 70,
    };
  }

  if (role === "Security Reviewer") {
    return {
      role,
      summary: `Security fallback review focused on public repository signals, environment handling, dependency manifests, and exposed configuration files.`,
      topFindings: [
        summary.configFiles.includes(".env.example")
          ? ".env.example exists, which is safer than committing live secrets."
          : "No .env.example was detected, so required secrets may be undocumented.",
        summary.configFiles.some((path) => ["package.json", "requirements.txt", "pyproject.toml"].includes(path))
          ? "Dependency manifests should be reviewed for outdated or risky packages."
          : "No dependency manifest was detected in the important-file set.",
        "No private repository or OAuth access is used by the MVP flow.",
      ],
      risks: [
        {
          title: "Secret handling uncertainty",
          severity: severityFromScore(riskScore.securityRisk),
          explanation: "Public tree analysis can identify environment examples, but cannot prove that secrets are absent from every file.",
        },
        {
          title: "Dependency visibility",
          severity: summary.configFiles.length ? "medium" : "low",
          explanation: "Dependency and build files should be reviewed before deployment or production use.",
        },
      ],
      recommendations: [
        "Search for committed credentials before deploying.",
        "Keep provider keys server-side and document required environment variables.",
        "Run dependency auditing in the project-specific package manager.",
      ],
      priorityScore: clampScore(riskScore.securityRisk + 26, 68),
      confidenceScore: 68,
    };
  }

  return {
    role,
    summary: `Product fallback review uses repository description, README, and visible structure to infer purpose. The product story is strongest when the first-run path and core value are obvious.`,
    topFindings: [
      summary.metadata.description
        ? `Repository description: ${summary.metadata.description}`
        : "Repository description is missing.",
      hasReadme ? "README provides product/setup context." : "README context is missing or very small.",
      `A reviewer should start with ${firstFiles}.`,
    ],
    risks: [
      {
        title: "Unclear first impression",
        severity: severityFromScore(100 - riskScore.productClarity),
        explanation: "If README, demo path, or entry files do not explain the user value quickly, the repository may feel harder to evaluate.",
      },
      {
        title: "Scope expansion pressure",
        severity: "medium",
        explanation: "Keep the next build focused on the visible workflow instead of adding account or platform features too early.",
      },
    ],
    recommendations: [
      "Make the README explain the problem, demo path, and expected output in under one minute.",
      "Prioritize the smallest improvement that makes the repo easier to run or judge.",
      "Defer broad product expansion until setup and core flow are solid.",
    ],
    priorityScore: clampScore(100 - riskScore.productClarity + 48, 72),
    confidenceScore: 70,
  };
}

function buildLocalFallbackAnalysis(summary: RepoSummary): AnalysisResult {
  const riskScore = buildLocalRiskScore(summary);
  const agents = agentRoles.map((role) => localAgentReview(role, summary, riskScore));
  const entries = summary.possibleEntryPoints.length
    ? summary.possibleEntryPoints
    : summary.importantFiles.slice(0, 3).map((file) => file.path);
  const configs = summary.configFiles.length
    ? summary.configFiles
    : summary.importantFiles
        .filter((file) => ["documentation", "entry", "source"].includes(file.category))
        .map((file) => file.path)
        .slice(0, 3);

  return {
    mode: "fallback",
    repo: summary.metadata,
    detectedStack: summary.detectedStack.length
      ? summary.detectedStack
      : [summary.metadata.primaryLanguage || "Unknown"],
    architectureSummary: buildLocalArchitectureSummary(summary),
    importantFiles: summary.importantFiles.slice(0, 20),
    riskScore,
    agents,
    debate: {
      comments: [
        {
          role: "Architect",
          position: "Confirm the repository shape before changing code.",
          reasoning: `The current evidence points to ${compactList(summary.detectedStack, "a small repository")} and ${compactList(entries, "root files")} as the safest first read.`,
        },
        {
          role: "Debugger",
          position: "Stabilize the run path first.",
          reasoning: `Setup confidence depends on ${compactList(configs, "clear documentation")} and a reproducible local command path.`,
        },
        {
          role: "Security Reviewer",
          position: "Treat configuration and secrets as the first security boundary.",
          reasoning: "Public repository analysis can flag obvious environment patterns, but committed secrets and dependency risks still need targeted checks.",
        },
        {
          role: "Product Manager",
          position: "Make the repo understandable before expanding features.",
          reasoning: "A strong hackathon or production repo explains value, setup, and the next action quickly.",
        },
      ],
      finalDecision:
        "Use the detected entry files and configuration to verify the core run path, document any missing setup details, then improve only the highest-risk or highest-value workflow.",
    },
    fixPlan: {
      understandFirst: [
        `Read ${compactList(entries, "README.md and root files")} to confirm the main workflow.`,
        `Inspect ${compactList(configs, "configuration files")} for setup, scripts, and environment requirements.`,
        "Compare README promises against the files that actually exist in the tree.",
      ],
      fixFirst: [
        "Add or correct setup instructions if the first-run path is unclear.",
        "Clarify missing entry points, dependency manifests, or environment examples.",
        "Remove misleading framework assumptions from docs or generated reports.",
      ],
      buildNext: [
        "Add a small demo path or smoke-test checklist for reviewers.",
        "Improve file-level explanations for the most important modules.",
        "Keep report generation tied to real repository signals.",
      ],
      ignoreForNow: [
        "Private repository support.",
        "Accounts, profiles, payments, and saved report history.",
        "Automatic code modification or pull request creation.",
      ],
    },
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
      return buildLocalFallbackAnalysis(summary);
    }
  }
}
