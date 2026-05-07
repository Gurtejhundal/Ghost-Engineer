import type {
  ImportantFile,
  RepoMetadata,
  RepoSummary,
  RepoTreeItem,
} from "@/lib/schemas";

const ignoredFolders = [
  ".git/",
  "node_modules/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
  "vendor/",
  "__pycache__/",
  ".cache/",
  ".turbo/",
  "out/",
  "target/",
];

const ignoredExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".mp4",
  ".mov",
  ".avi",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".lock",
  ".exe",
  ".dll",
];

const configFiles = new Set([
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Dockerfile",
  "docker-compose.yml",
  ".env.example",
  "next.config.js",
  "vite.config.ts",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
]);

const entryFileNames = new Set([
  "main.py",
  "server.js",
  "index.js",
  "index.ts",
  "index.tsx",
  "app.py",
  "app/page.tsx",
  "pages/index.tsx",
  "src/main.tsx",
  "src/App.tsx",
]);

function isIgnored(path: string): boolean {
  const normalized = `${path}/`;
  return (
    ignoredFolders.some((folder) => normalized.includes(folder)) ||
    ignoredExtensions.some((extension) => path.toLowerCase().endsWith(extension))
  );
}

function categorize(path: string): ImportantFile["category"] {
  const file = path.split("/").at(-1) ?? path;
  if (file.toLowerCase().startsWith("readme")) return "documentation";
  if (file === ".env.example") return "environment";
  if (file === "package.json" || file === "requirements.txt" || file === "pyproject.toml") {
    return "dependency";
  }
  if (configFiles.has(file) || configFiles.has(path)) return "config";
  if (entryFileNames.has(file) || entryFileNames.has(path) || path.startsWith("app/api/")) {
    return "entry";
  }
  return "source";
}

function reasonFor(path: string, category: ImportantFile["category"]): string {
  if (category === "documentation") return "Explains the repository purpose, setup, and usage.";
  if (category === "environment") return "Documents runtime configuration without exposing live secrets.";
  if (category === "dependency") return "Defines dependencies, scripts, package metadata, or Python project setup.";
  if (category === "config") return "Controls framework, TypeScript, build, or deployment behavior.";
  if (category === "entry") return "Likely entry point for application startup or request handling.";
  if (path.startsWith("components/") || path.includes("/components/")) {
    return "Reusable UI surface that helps explain product composition.";
  }
  return "Representative source file or folder that reveals project organization.";
}

export function filterRepoTree(tree: RepoTreeItem[]): {
  files: RepoTreeItem[];
  ignoredFilesCount: number;
} {
  let ignoredFilesCount = 0;
  const files = tree.filter((item) => {
    const ignored = isIgnored(item.path);
    if (ignored) ignoredFilesCount += 1;
    return !ignored && item.type === "blob";
  });
  return { files, ignoredFilesCount };
}

export function detectImportantFiles(tree: RepoTreeItem[]): ImportantFile[] {
  const { files } = filterRepoTree(tree);
  const scored = files
    .map((file) => {
      const path = file.path;
      const name = path.split("/").at(-1) ?? path;
      let score = 0;
      if (name.toLowerCase() === "readme.md") score += 100;
      if (configFiles.has(name) || configFiles.has(path)) score += 90;
      if (entryFileNames.has(name) || entryFileNames.has(path)) score += 85;
      if (/^(src|app|pages|components|routes|controllers|models)\//.test(path)) score += 48;
      if (path.split("/").length <= 2) score += 12;
      if ((file.size ?? 0) > 100_000) score -= 30;
      return { file, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return scored.map(({ file }) => {
    const category = categorize(file.path);
    return {
      path: file.path,
      category,
      reason: reasonFor(file.path, category),
    };
  });
}

function dependencyText(files: ImportantFile[]): string {
  return files
    .filter((file) => file.contentPreview)
    .map((file) => `${file.path}\n${file.contentPreview}`)
    .join("\n");
}

export function detectTechStack(tree: RepoTreeItem[], importantFiles: ImportantFile[]): string[] {
  const paths = tree.map((item) => item.path);
  const text = dependencyText(importantFiles).toLowerCase();
  const stack = new Set<string>();

  if (paths.includes("package.json")) stack.add("Node.js");
  if (text.includes('"next"') || paths.some((path) => path.startsWith("app/"))) stack.add("Next.js");
  if (text.includes('"react"') || paths.some((path) => path.endsWith(".tsx"))) stack.add("React");
  if (text.includes('"express"')) stack.add("Express");
  if (text.includes('"vite"') || paths.includes("vite.config.ts")) stack.add("Vite");
  if (text.includes("tailwind") || paths.some((path) => path.startsWith("tailwind.config"))) {
    stack.add("Tailwind CSS");
  }
  if (paths.some((path) => path.endsWith(".ts") || path.endsWith(".tsx"))) stack.add("TypeScript");
  if (paths.includes("requirements.txt") && text.includes("fastapi")) stack.add("FastAPI");
  if (paths.includes("requirements.txt") && text.includes("django")) stack.add("Django");
  if (paths.includes("requirements.txt") && text.includes("flask")) stack.add("Flask");
  if (paths.includes("pyproject.toml")) stack.add("Python");
  if (paths.includes("Dockerfile")) stack.add("Docker");
  if (paths.includes("docker-compose.yml")) stack.add("Docker Compose");

  return Array.from(stack);
}

export function summarizeRepo(
  metadata: RepoMetadata,
  tree: RepoTreeItem[],
  readme: string,
  importantFiles: ImportantFile[],
): RepoSummary {
  const { files, ignoredFilesCount } = filterRepoTree(tree);
  const folders = Array.from(
    new Set(
      tree
        .filter((item) => item.type === "tree")
        .map((item) => item.path.split("/")[0])
        .filter(Boolean),
    ),
  ).slice(0, 16);

  const entries = importantFiles
    .filter((file) => file.category === "entry")
    .map((file) => file.path)
    .slice(0, 8);

  const configs = importantFiles
    .filter((file) => ["config", "dependency", "environment"].includes(file.category))
    .map((file) => file.path)
    .slice(0, 10);

  const detectedStack = detectTechStack(tree, importantFiles);

  return {
    metadata,
    detectedStack,
    readmeExcerpt: readme.slice(0, 8000),
    importantFiles: importantFiles.slice(0, 20),
    topLevelFolders: folders,
    possibleEntryPoints: entries,
    configFiles: configs,
    ignoredFilesCount,
    totalFiles: files.length,
  };
}

export function buildCompactPromptSummary(summary: RepoSummary): string {
  return JSON.stringify(
    {
      repo: summary.metadata,
      detectedStack: summary.detectedStack,
      readmeExcerpt: summary.readmeExcerpt.slice(0, 5000),
      topLevelFolders: summary.topLevelFolders,
      possibleEntryPoints: summary.possibleEntryPoints,
      configFiles: summary.configFiles,
      importantFiles: summary.importantFiles.map((file) => ({
        path: file.path,
        category: file.category,
        reason: file.reason,
        contentPreview: file.contentPreview?.slice(0, 1200),
      })),
      totalFiles: summary.totalFiles,
      ignoredFilesCount: summary.ignoredFilesCount,
    },
    null,
    2,
  );
}
