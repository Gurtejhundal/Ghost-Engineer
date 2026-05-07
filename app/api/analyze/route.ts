import { NextRequest, NextResponse } from "next/server";
import { runAiCouncil } from "@/lib/ai-provider";
import { getFallbackAnalysis } from "@/lib/fallback-demo";
import {
  fetchImportantFileContent,
  fetchReadme,
  fetchRepoMetadata,
  fetchRepoTree,
  parseGitHubUrl,
} from "@/lib/github";
import {
  buildCompactPromptSummary,
  detectImportantFiles,
  summarizeRepo,
} from "@/lib/repo-parser";
import type { ImportantFile } from "@/lib/schemas";

export const runtime = "nodejs";

type AnalyzeRequest = {
  repoUrl?: string;
  forceDemo?: boolean;
};

function withPreview(file: ImportantFile, content: string): ImportantFile {
  return {
    ...file,
    contentPreview: content.slice(0, 4000),
  };
}

export async function POST(request: NextRequest) {
  let body: AnalyzeRequest;

  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Request body must be valid JSON.",
          recoverable: false,
        },
      },
      { status: 400 },
    );
  }

  if (body.forceDemo) {
    return NextResponse.json(getFallbackAnalysis());
  }

  let owner = "";
  let repo = "";

  try {
    if (!body.repoUrl) throw new Error("INVALID_REPO_URL");
    const parsed = parseGitHubUrl(body.repoUrl);
    owner = parsed.owner;
    repo = parsed.repo;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REPO_URL",
          message: "Paste a public GitHub repository URL like https://github.com/owner/repo.",
          recoverable: true,
        },
      },
      { status: 400 },
    );
  }

  try {
    const metadata = await fetchRepoMetadata(owner, repo);
    const [readme, tree] = await Promise.all([
      fetchReadme(owner, repo),
      fetchRepoTree(owner, repo, metadata.defaultBranch),
    ]);

    const importantFiles = detectImportantFiles(tree);
    const previewResults = await Promise.allSettled(
      importantFiles.slice(0, 20).map(async (file) => {
        const content = await fetchImportantFileContent(
          owner,
          repo,
          metadata.defaultBranch,
          file.path,
        );
        return withPreview(file, content);
      }),
    );

    const filesWithPreviews = importantFiles.map((file, index) => {
      const result = previewResults[index];
      if (result?.status === "fulfilled") return result.value;
      if (file.category === "documentation" && readme) {
        return withPreview(file, readme);
      }
      return file;
    });

    const summary = summarizeRepo(metadata, tree, readme, filesWithPreviews);
    buildCompactPromptSummary(summary);
    const analysis = await runAiCouncil(summary);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(getFallbackAnalysis());
  }
}
