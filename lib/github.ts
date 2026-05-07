import type { RepoMetadata, RepoTreeItem } from "@/lib/schemas";

const GITHUB_API = "https://api.github.com";

type GitHubRepo = {
  name: string;
  owner: { login: string };
  full_name: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  open_issues_count: number;
  updated_at: string;
  html_url: string;
};

type GitHubTreeResponse = {
  tree?: { path: string; type: "blob" | "tree"; size?: number }[];
  truncated?: boolean;
};

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
};

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: headers(),
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    const rateLimited =
      response.status === 403 &&
      response.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(rateLimited ? "GITHUB_RATE_LIMITED" : `GITHUB_${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  try {
    const parsed = new URL(url.trim());
    const isGithub = parsed.hostname.toLowerCase() === "github.com";
    const [owner, repo, extra] = parsed.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.replace(/\.git$/, ""));

    if (!isGithub || !owner || !repo || extra) {
      throw new Error("INVALID_REPO_URL");
    }

    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
      throw new Error("INVALID_REPO_URL");
    }

    return { owner, repo };
  } catch {
    throw new Error("INVALID_REPO_URL");
  }
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
): Promise<RepoMetadata> {
  const data = await githubFetch<GitHubRepo>(`${GITHUB_API}/repos/${owner}/${repo}`);

  return {
    name: data.name,
    owner: data.owner.login,
    fullName: data.full_name,
    description: data.description,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
    forks: data.forks_count,
    primaryLanguage: data.language,
    openIssues: data.open_issues_count,
    updatedAt: data.updated_at,
    url: data.html_url,
  };
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<RepoTreeItem[]> {
  const data = await githubFetch<GitHubTreeResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
      branch,
    )}?recursive=1`,
  );

  return (data.tree ?? []).map((item) => ({
    path: item.path,
    type: item.type,
    size: item.size,
  }));
}

function decodeBase64(content?: string): string {
  if (!content) return "";
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const data = await githubFetch<GitHubContentResponse>(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
    );
    return decodeBase64(data.content);
  } catch {
    return "";
  }
}

export async function fetchImportantFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<string> {
  const data = await githubFetch<GitHubContentResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(
      /%2F/g,
      "/",
    )}?ref=${encodeURIComponent(branch)}`,
  );
  return decodeBase64(data.content);
}
