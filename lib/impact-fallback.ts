import demoImpactData from "@/data/demo-impact-analysis.json";
import type {
  ContributorRole,
  GitHubPackFile,
  ImpactAnalysisResult,
  ImpactAnalyzeRequest,
  ImpactBlueprint,
  ImpactDomain,
  ImpactAgentReview,
  PilotPlan,
  RepoContext,
} from "@/lib/schemas";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function compact(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function listFrom(value: string | undefined, fallback: string): string[] {
  return value
    ? value
        .split(/,|\n/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [fallback];
}

export function getDemoImpactAnalysis(reason?: string): ImpactAnalysisResult {
  return {
    ...(demoImpactData as ImpactAnalysisResult),
    fallbackReason: reason || (demoImpactData as ImpactAnalysisResult).fallbackReason,
  };
}

function projectNameFor(domain: ImpactDomain, title: string): string {
  const cleaned = title
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 2)
    .join("");
  const suffix = cleaned || domain.replace(/\s+/g, "");
  return `Open${suffix} Kit`;
}

function buildBlueprint(request: ImpactAnalyzeRequest, repoContext: RepoContext): ImpactBlueprint {
  const impactBoost = request.affectedUsers ? 8 : 0;
  const feasibilityPenalty = request.availableResources ? 0 : 8;
  const repoBoost = repoContext.provided ? 5 : 0;
  const hasSafetySignal = /health|electric|medical|children|water|food|safety/i.test(
    `${request.problemDescription} ${request.locationContext ?? ""}`,
  );

  return {
    projectName: projectNameFor(request.domain, request.problemTitle),
    mission: `Turn "${request.problemTitle}" into a field-testable open-source project for ${compact(
      request.affectedUsers,
      "the affected community",
    )}.`,
    problemSummary: request.problemDescription,
    targetUsers: listFrom(request.affectedUsers, "People directly affected by this problem"),
    openSourceOpportunity: repoContext.provided
      ? "Use the optional repository as a reusable starting point, then add public-good documentation, contributor tasks, field testing, and impact reporting."
      : "Create a public project kit that developers, designers, field partners, and documentation contributors can adapt without needing private infrastructure.",
    mvpFeatures: [
      "Problem intake and local context capture",
      "Smallest useful workflow for the affected users",
      "Contributor-friendly documentation and starter issues",
      "Pilot metrics collection",
      "Safety and trust checklist"
    ],
    technicalApproach: repoContext.provided
      ? [
          "Extract reusable modules from the supplied repository",
          "Add missing public-good workflow screens or services",
          "Document setup, contribution, and field-testing paths",
          "Keep deployment simple and low-cost"
        ]
      : [
          "Start with a lightweight web or mobile-first prototype",
          "Use simple forms, alerts, maps, or dashboards only where they directly support the field workflow",
          "Keep data collection minimal and consent-based",
          "Publish docs and starter issues before expanding scope"
        ],
    reusableParts: repoContext.reusableSignals,
    missingParts: [
      "Problem-specific README",
      "Contributor task board",
      "Pilot field-testing guide",
      "Impact report template",
      "Safety and trust checklist"
    ],
    recommendedOpenSourceComponents: repoContext.provided
      ? []
      : [
          "Next.js or Vite starter",
          "Static documentation templates",
          "Open-source form and dashboard components",
          "CSV/JSON-based pilot reporting"
        ],
    impactScore: clampScore(78 + impactBoost + (hasSafetySignal ? 4 : 0)),
    feasibilityScore: clampScore(76 + repoBoost - feasibilityPenalty),
    difficultyLevel: hasSafetySignal ? "medium" : "low",
    safetyAndTrustConcerns: [
      "Protect personal data and consent records",
      "Do not automate high-risk decisions in the MVP",
      "Clearly document failure modes and manual fallback",
      "Pilot with a small user group before scaling"
    ],
  };
}

function buildAgents(blueprint: ImpactBlueprint, request: ImpactAnalyzeRequest, repoContext: RepoContext): ImpactAgentReview[] {
  return [
    {
      role: "Open-Source Architect",
      summary: "Package the idea as a contributor-friendly public-good repository with docs, issues, pilot guide, and a narrow MVP module.",
      topFindings: [
        repoContext.provided ? "Existing repo signals can become reusable components." : "No repo was provided, so architecture should start from a clean public-good kit.",
        "The GitHub Pack is part of the product, not a later documentation chore.",
        "Keep field workflow, docs, and implementation modules separated."
      ],
      risks: [
        {
          title: "Contributor confusion",
          severity: "medium",
          explanation: "Without clear file structure and good-first-issues, open-source contributors will not know where to start."
        }
      ],
      recommendations: [
        "Create README, ROADMAP, ISSUES, and FIELD_TESTING before adding advanced features.",
        "Label beginner tasks by role.",
        "Keep the MVP workflow small enough to explain in one diagram."
      ],
      priorityScore: 82,
      confidenceScore: repoContext.provided ? 78 : 72
    },
    {
      role: "Feasibility Reviewer",
      summary: "The project is feasible if it solves one painful workflow first and uses the available resources instead of expanding into a platform.",
      topFindings: [
        `Available resources: ${compact(request.availableResources, "not specified")}.`,
        "A 7-day build should prove the core workflow only.",
        "Pilot metrics must be simple enough to collect manually."
      ],
      risks: [
        {
          title: "Scope creep",
          severity: "medium",
          explanation: "Trying to solve the entire domain problem will make the MVP too large for a hackathon or first pilot."
        }
      ],
      recommendations: [
        "Pick one user action to improve.",
        "Use manual operations where automation is risky.",
        "Treat pilot feedback as the success condition."
      ],
      priorityScore: 78,
      confidenceScore: 76
    },
    {
      role: "Safety & Trust Reviewer",
      summary: "Trust depends on minimizing data collection, documenting failures, and avoiding automation that could harm vulnerable users.",
      topFindings: [
        "Consent and data minimization are required even for a prototype.",
        "The MVP should warn users when output is advisory.",
        "Safety checklist belongs in the GitHub Pack."
      ],
      risks: [
        {
          title: "User harm from unreliable output",
          severity: "high",
          explanation: "If users rely on the system in real-world conditions, failures can waste time, money, or create safety risks."
        }
      ],
      recommendations: [
        "Add a safety checklist to FIELD_TESTING.md.",
        "Avoid high-risk automation in MVP.",
        "Document manual fallback steps clearly."
      ],
      priorityScore: 86,
      confidenceScore: 74
    },
    {
      role: "Impact Product Manager",
      summary: "The strongest product story is a focused public-good kit that shows who benefits, what changes for them, and how the pilot proves value.",
      topFindings: [
        `Target domain: ${request.domain}.`,
        `Core user group: ${compact(request.affectedUsers, "needs clearer definition")}.`,
        "Impact should be measured with behavior change, not only app usage."
      ],
      risks: [
        {
          title: "Weak pilot proof",
          severity: "medium",
          explanation: "If the team cannot measure a before/after change, judges and partners may see it as only an idea."
        }
      ],
      recommendations: [
        "Use one clear success metric in the demo.",
        "Name the project mission in plain language.",
        "Defer community platform features."
      ],
      priorityScore: blueprint.impactScore,
      confidenceScore: 80
    }
  ];
}

function buildContributorBoard(domain: ImpactDomain): ContributorRole[] {
  const fieldRole = domain === "Agriculture" ? "Field Tester" : "Community Partner";
  return [
    {
      role: "Frontend Developer",
      purpose: "Build the user-facing prototype and pilot dashboard.",
      tasks: ["Create core workflow UI", "Show pilot metrics", "Make mobile layout usable"],
      goodFirstIssues: [
        {
          title: "Create impact score card",
          description: "Build a reusable card for impact and feasibility scores.",
          label: "frontend",
          estimatedEffort: "3 hours"
        }
      ],
      requiredSkills: ["React", "CSS", "accessibility"],
      estimatedEffort: "1-2 days"
    },
    {
      role: "Backend Developer",
      purpose: "Create the minimum API or data flow needed for the MVP.",
      tasks: ["Define data schema", "Implement basic API route", "Add validation and fallback handling"],
      goodFirstIssues: [
        {
          title: "Add request validation",
          description: "Validate required fields and return clear errors.",
          label: "backend",
          estimatedEffort: "2 hours"
        }
      ],
      requiredSkills: ["TypeScript", "API routes", "JSON schemas"],
      estimatedEffort: "1-2 days"
    },
    {
      role: "Documentation Writer",
      purpose: "Make the open-source project understandable and safe to contribute to.",
      tasks: ["Draft README", "Write CONTRIBUTING", "Prepare FIELD_TESTING guide"],
      goodFirstIssues: [
        {
          title: "Draft project README",
          description: "Explain mission, setup, MVP scope, and pilot plan.",
          label: "documentation",
          estimatedEffort: "3 hours"
        }
      ],
      requiredSkills: ["Markdown", "technical writing", "clarity"],
      estimatedEffort: "1 day"
    },
    {
      role: fieldRole,
      purpose: "Validate that the project matches real user context.",
      tasks: ["Recruit pilot users", "Collect feedback", "Track success metrics"],
      goodFirstIssues: [
        {
          title: "Create pilot feedback checklist",
          description: "Write simple questions to test whether the MVP helps real users.",
          label: "field-testing",
          estimatedEffort: "2 hours"
        }
      ],
      requiredSkills: ["local context", "communication", "basic research"],
      estimatedEffort: "1 week pilot"
    }
  ];
}

function buildGitHubPack(projectName: string): GitHubPackFile[] {
  return [
    ["README.md", "Explain mission, users, MVP, setup, and pilot goal."],
    ["CONTRIBUTING.md", "Guide developers, designers, documentation writers, and field partners."],
    ["LICENSE.md", "Clarify open-source reuse terms."],
    ["ROADMAP.md", "Show MVP, pilot, and post-pilot milestones."],
    ["ISSUES.md", "Preview good-first-issues and role-based tasks."],
    ["FIELD_TESTING.md", "Define field users, consent, safety checklist, and testing steps."],
    ["IMPACT_REPORT.md", "Track pilot metrics and real-world outcomes."]
  ].map(([fileName, purpose]) => ({
    fileName: fileName as GitHubPackFile["fileName"],
    purpose,
    suggestedContent: fileName === "README.md" ? `# ${projectName}\n\nOpen-source public-good project kit generated by Ghost Engineer.` : purpose,
  }));
}

function buildPilotPlan(request: ImpactAnalyzeRequest): PilotPlan {
  return {
    pilotUsers: compact(request.affectedUsers, "5-10 affected users from the target community"),
    locationContext: compact(request.locationContext, "One controlled local pilot context"),
    successMetrics: [
      "Number of target users who complete the core workflow",
      "Time, cost, or effort reduced compared with current workaround",
      "User-reported trust and usefulness",
      "Number of actionable improvements discovered"
    ],
    testingSteps: [
      "Validate the problem with two target users",
      "Run the MVP with a small pilot group",
      "Record failures and manual workarounds",
      "Collect feedback after each test",
      "Update the GitHub Pack with pilot learnings"
    ],
    safetyChecklist: [
      "Collect only required data",
      "Ask for consent before storing user information",
      "Avoid high-risk automation",
      "Provide manual fallback instructions",
      "Document known limitations"
    ],
    sevenDayPlan: [
      { day: 1, title: "Define MVP and safety limits", tasks: ["Freeze scope", "Write problem and user notes"] },
      { day: 2, title: "Build core prototype", tasks: ["Create main workflow", "Add basic data model"] },
      { day: 3, title: "Add open-source structure", tasks: ["Write README", "Create starter issues"] },
      { day: 4, title: "Build pilot metrics view", tasks: ["Add score cards", "Add feedback log"] },
      { day: 5, title: "Test failure cases", tasks: ["Run manual tests", "Write fallback instructions"] },
      { day: 6, title: "Prepare GitHub Pack", tasks: ["Draft docs", "Add contribution guide"] },
      { day: 7, title: "Run pilot demo", tasks: ["Test with users", "Record impact report"] }
    ],
    postPilotNextSteps: [
      "Prioritize fixes from field feedback",
      "Recruit contributors for missing modules",
      "Publish pilot results",
      "Scale only after safety and usefulness are validated"
    ]
  };
}

export function buildLocalImpactAnalysis(
  request: ImpactAnalyzeRequest,
  repoContext: RepoContext,
  reason = "LOCAL_IMPACT_FALLBACK",
): ImpactAnalysisResult {
  const blueprint = buildBlueprint(request, repoContext);
  return {
    mode: "fallback",
    fallbackReason: reason,
    input: {
      domain: request.domain,
      problemTitle: request.problemTitle,
      problemDescription: request.problemDescription,
      repoProvided: repoContext.provided,
    },
    repoContext,
    impactBlueprint: blueprint,
    agents: buildAgents(blueprint, request, repoContext),
    debate: {
      comments: [
        {
          role: "Open-Source Architect",
          position: "Make the project kit contributor-friendly before adding features.",
          reasoning: "Open-source impact depends on clear docs, issues, and modular ownership."
        },
        {
          role: "Feasibility Reviewer",
          position: "The first build must prove one real-world workflow.",
          reasoning: "A narrow MVP can be piloted and judged faster than a broad platform."
        },
        {
          role: "Safety & Trust Reviewer",
          position: "Avoid risky automation in the first pilot.",
          reasoning: "Trust is earned through transparent limits, consent, and failure handling."
        },
        {
          role: "Impact Product Manager",
          position: "Measure behavior change, not just prototype completion.",
          reasoning: "The demo becomes stronger when it shows how impact will be tested."
        }
      ],
      finalDecision: "Build a narrow open-source MVP, publish the GitHub Pack, recruit role-based contributors, and pilot with a small target-user group before expanding scope."
    },
    contributorBoard: buildContributorBoard(request.domain),
    githubPack: buildGitHubPack(blueprint.projectName),
    pilotPlan: buildPilotPlan(request),
  };
}
