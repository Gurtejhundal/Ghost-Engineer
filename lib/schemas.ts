export type RepoMetadata = {
  name: string;
  owner: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  openIssues: number;
  updatedAt: string;
  url: string;
};

export type ImportantFile = {
  path: string;
  category:
    | "documentation"
    | "config"
    | "dependency"
    | "entry"
    | "source"
    | "environment";
  reason: string;
  contentPreview?: string;
};

export type RiskScore = {
  architectureRisk: number;
  debuggingComplexity: number;
  securityRisk: number;
  productClarity: number;
  overallHealth: number;
};

export type AgentRole =
  | "Architect"
  | "Debugger"
  | "Security Reviewer"
  | "Product Manager";

export type AgentReview = {
  role: AgentRole;
  summary: string;
  topFindings: string[];
  risks: {
    title: string;
    severity: "low" | "medium" | "high";
    explanation: string;
  }[];
  recommendations: string[];
  priorityScore: number;
  confidenceScore: number;
};

export type DebateComment = {
  role: AgentRole;
  position: string;
  reasoning: string;
};

export type FixPlan = {
  understandFirst: string[];
  fixFirst: string[];
  buildNext: string[];
  ignoreForNow: string[];
};

export type AnalysisResult = {
  mode: "live" | "fallback";
  repo: RepoMetadata;
  detectedStack: string[];
  architectureSummary: string;
  importantFiles: ImportantFile[];
  riskScore: RiskScore;
  agents: AgentReview[];
  debate: {
    comments: DebateComment[];
    finalDecision: string;
  };
  fixPlan: FixPlan;
};

export type RepoTreeItem = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

export type RepoSummary = {
  metadata: RepoMetadata;
  detectedStack: string[];
  readmeExcerpt: string;
  importantFiles: ImportantFile[];
  topLevelFolders: string[];
  possibleEntryPoints: string[];
  configFiles: string[];
  ignoredFilesCount: number;
  totalFiles: number;
};

export const agentRoles: AgentRole[] = [
  "Architect",
  "Debugger",
  "Security Reviewer",
  "Product Manager",
];

export type ImpactDomain =
  | "Agriculture"
  | "Education"
  | "Healthcare"
  | "Environment"
  | "Local Governance";

export type ImpactAnalyzeRequest = {
  domain: ImpactDomain;
  problemTitle: string;
  problemDescription: string;
  affectedUsers?: string;
  locationContext?: string;
  currentWorkaround?: string;
  whyExistingSolutionsFail?: string;
  availableResources?: string;
  repoUrl?: string;
  forceDemo?: boolean;
};

export type RepoContext = {
  provided: boolean;
  repo?: RepoMetadata;
  readmePreview?: string;
  importantFiles: ImportantFile[];
  detectedStack: string[];
  reusableSignals: string[];
  repoSummary: string;
};

export type ImpactBlueprint = {
  projectName: string;
  mission: string;
  problemSummary: string;
  targetUsers: string[];
  openSourceOpportunity: string;
  mvpFeatures: string[];
  technicalApproach: string[];
  reusableParts: string[];
  missingParts: string[];
  recommendedOpenSourceComponents: string[];
  impactScore: number;
  feasibilityScore: number;
  difficultyLevel: "low" | "medium" | "high";
  safetyAndTrustConcerns: string[];
};

export type ImpactAgentRole =
  | "Open-Source Architect"
  | "Feasibility Reviewer"
  | "Safety & Trust Reviewer"
  | "Impact Product Manager";

export type ImpactAgentReview = {
  role: ImpactAgentRole;
  summary: string;
  topFindings: string[];
  risks: {
    title: string;
    severity: "low" | "medium" | "high";
    explanation: string;
  }[];
  recommendations: string[];
  priorityScore: number;
  confidenceScore: number;
};

export type ImpactDebateComment = {
  role: ImpactAgentRole;
  position: string;
  reasoning: string;
};

export type CouncilDebate = {
  comments: ImpactDebateComment[];
  finalDecision: string;
};

export type ContributorRole = {
  role: string;
  purpose: string;
  tasks: string[];
  goodFirstIssues: {
    title: string;
    description: string;
    label: string;
    estimatedEffort: string;
  }[];
  requiredSkills: string[];
  estimatedEffort: string;
};

export type GitHubPackFile = {
  fileName:
    | "README.md"
    | "CONTRIBUTING.md"
    | "LICENSE.md"
    | "ROADMAP.md"
    | "ISSUES.md"
    | "FIELD_TESTING.md"
    | "IMPACT_REPORT.md";
  purpose: string;
  suggestedContent?: string;
};

export type PilotPlan = {
  pilotUsers: string;
  locationContext: string;
  successMetrics: string[];
  testingSteps: string[];
  safetyChecklist: string[];
  sevenDayPlan: {
    day: number;
    title: string;
    tasks: string[];
  }[];
  postPilotNextSteps: string[];
};

export type ImpactAnalysisResult = {
  mode: "live" | "fallback";
  fallbackReason?: string;
  input: {
    domain: ImpactDomain;
    problemTitle: string;
    problemDescription: string;
    repoProvided: boolean;
  };
  repoContext: RepoContext;
  impactBlueprint: ImpactBlueprint;
  agents: ImpactAgentReview[];
  debate: CouncilDebate;
  contributorBoard: ContributorRole[];
  githubPack: GitHubPackFile[];
  pilotPlan: PilotPlan;
};

export const impactDomains: ImpactDomain[] = [
  "Agriculture",
  "Education",
  "Healthcare",
  "Environment",
  "Local Governance",
];

export const impactAgentRoles: ImpactAgentRole[] = [
  "Open-Source Architect",
  "Feasibility Reviewer",
  "Safety & Trust Reviewer",
  "Impact Product Manager",
];
