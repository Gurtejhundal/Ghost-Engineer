import { NextRequest, NextResponse } from "next/server";
import { getDemoImpactAnalysis } from "@/lib/impact-fallback";
import { generateImpactAnalysis } from "@/lib/impact-provider";
import {
  fetchImportantFileContent,
  fetchReadme,
  fetchRepoMetadata,
  fetchRepoTree,
  parseGitHubUrl,
} from "@/lib/github";
import { detectImportantFiles, summarizeRepo } from "@/lib/repo-parser";
import { impactDomains, type ImpactAnalyzeRequest, type ImportantFile, type RepoContext } from "@/lib/schemas";

export const runtime = "nodejs";

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim().slice(0, 2400) : undefined;
}

function validateImpactRequest(value: unknown): ImpactAnalyzeRequest {
  const body = value as Partial<ImpactAnalyzeRequest>;
  const domain = body.domain;
  const problemTitle = text(body.problemTitle);
  const problemDescription = text(body.problemDescription);

  if (!domain || !impactDomains.includes(domain)) {
    throw new Error("INVALID_DOMAIN");
  }
  if (!problemTitle) {
    throw new Error("MISSING_PROBLEM_TITLE");
  }
  if (!problemDescription) {
    throw new Error("MISSING_PROBLEM_DESCRIPTION");
  }

  return {
    domain,
    problemTitle,
    problemDescription,
    affectedUsers: text(body.affectedUsers),
    locationContext: text(body.locationContext),
    currentWorkaround: text(body.currentWorkaround),
    whyExistingSolutionsFail: text(body.whyExistingSolutionsFail),
    availableResources: text(body.availableResources),
    repoUrl: text(body.repoUrl),
    forceDemo: Boolean(body.forceDemo),
  };
}

function withPreview(file: ImportantFile, content: string): ImportantFile {
  return { ...file, contentPreview: content.slice(0, 2200) };
}

function emptyRepoContext(): RepoContext {
  return {
    provided: false,
    importantFiles: [],
    detectedStack: [],
    reusableSignals: [],
    repoSummary: "No repository was provided. Generate recommended open-source components from the social problem.",
  };
}

async function fetchRepoContext(repoUrl?: string): Promise<RepoContext> {
  if (!repoUrl) return emptyRepoContext();

  const { owner, repo } = parseGitHubUrl(repoUrl);
  const metadata = await fetchRepoMetadata(owner, repo);
  const [readme, tree] = await Promise.all([
    fetchReadme(owner, repo),
    fetchRepoTree(owner, repo, metadata.defaultBranch),
  ]);

  const importantFiles = detectImportantFiles(tree);
  const previews = await Promise.allSettled(
    importantFiles.slice(0, 14).map(async (file) => {
      const content = await fetchImportantFileContent(owner, repo, metadata.defaultBranch, file.path);
      return withPreview(file, content);
    }),
  );

  const filesWithPreviews = importantFiles.map((file, index) => {
    const result = previews[index];
    if (result?.status === "fulfilled") return result.value;
    if (file.category === "documentation" && readme) return withPreview(file, readme);
    return file;
  });

  const summary = summarizeRepo(metadata, tree, readme, filesWithPreviews);
  const entrySignals = summary.possibleEntryPoints.map((path) => `Entry point: ${path}`);
  const configSignals = summary.configFiles.map((path) => `Config or dependency file: ${path}`);
  const componentSignals = summary.importantFiles
    .filter((file) => file.category === "source" || file.category === "entry")
    .slice(0, 5)
    .map((file) => `Reusable area: ${file.path}`);

  return {
    provided: true,
    repo: metadata,
    readmePreview: readme.slice(0, 5000),
    importantFiles: summary.importantFiles,
    detectedStack: summary.detectedStack,
    reusableSignals: [...entrySignals, ...configSignals, ...componentSignals].slice(0, 12),
    repoSummary: `${metadata.fullName} contains ${summary.totalFiles} analyzed files. Detected stack: ${
      summary.detectedStack.join(", ") || "unknown"
    }. Important files: ${summary.importantFiles.map((file) => file.path).slice(0, 8).join(", ") || "none"}.`,
  };
}

function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json({ error: code, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.");
  }

  let impactRequest: ImpactAnalyzeRequest;
  try {
    impactRequest = validateImpactRequest(body);
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_REQUEST";
    if (code === "INVALID_DOMAIN") return errorResponse(code, "Select a valid MVP domain.");
    if (code === "MISSING_PROBLEM_TITLE") return errorResponse(code, "Add a short problem title.");
    return errorResponse(
      "MISSING_PROBLEM_DESCRIPTION",
      "Add a clear problem description so Ghost Engineer can generate an Impact Blueprint.",
    );
  }

  if (impactRequest.forceDemo) {
    return NextResponse.json(getDemoImpactAnalysis("FORCE_DEMO"));
  }

  let repoContext = emptyRepoContext();
  try {
    repoContext = await fetchRepoContext(impactRequest.repoUrl);
  } catch (error) {
    if (impactRequest.repoUrl && error instanceof Error && error.message === "INVALID_REPO_URL") {
      return errorResponse(
        "INVALID_GITHUB_URL",
        "Enter a valid public GitHub repository URL, or leave the field empty.",
      );
    }
    repoContext = emptyRepoContext();
    repoContext.repoSummary = "GitHub context was unavailable. Continuing with problem-only impact analysis.";
  }

  try {
    const analysis = await generateImpactAnalysis(impactRequest, repoContext);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(getDemoImpactAnalysis("IMPACT_ANALYSIS_FAILED"));
  }
}
