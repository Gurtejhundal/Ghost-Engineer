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
