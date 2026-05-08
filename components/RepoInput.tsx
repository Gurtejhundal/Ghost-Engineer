"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GitBranch, Sparkles } from "lucide-react";

const demoRepo = "https://github.com/demo-labs/signal-board";

function subscribeToHydration() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function isValidGitHubRepoUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      url.hostname.toLowerCase() === "github.com" &&
      parts.length === 2 &&
      /^[A-Za-z0-9_.-]+$/.test(parts[0]) &&
      /^[A-Za-z0-9_.-]+(?:\.git)?$/.test(parts[1])
    );
  } catch {
    return false;
  }
}

export function RepoInput({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  function startAnalysis(forceDemo: boolean, value = repoUrl) {
    if (!forceDemo && !isValidGitHubRepoUrl(value)) {
      setError("Paste a public GitHub repo URL like https://github.com/owner/repo.");
      return;
    }

    const nextUrl = forceDemo ? demoRepo : value.trim();
    localStorage.setItem("ghost-engineer:repoUrl", nextUrl);
    localStorage.setItem("ghost-engineer:forceDemo", String(forceDemo));
    router.push(
      `/analyze?repoUrl=${encodeURIComponent(nextUrl)}${forceDemo ? "&forceDemo=1" : ""}`,
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startAnalysis(false);
  }

  if (!mounted) {
    return (
      <div className={compact ? "w-full" : "mx-auto w-full max-w-3xl"}>
        <div className="rounded-3xl border border-[#123B35]/80 bg-[#030807]/80 p-2 shadow-2xl shadow-[#00A88F]/10 backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#0F2A26] bg-[#000000]/80 px-4">
              <GitBranch className="h-5 w-5 shrink-0 text-[#00D1B2]" aria-hidden="true" />
              <div className="h-4 w-full rounded-full bg-[#0F2A26]" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex">
              <div className="min-h-12 rounded-2xl bg-[#00A88F]/70 px-5 md:w-48" />
              <div className="min-h-12 rounded-2xl border border-[#123B35] bg-[#08201C]/80 px-5 md:w-44" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "w-full" : "mx-auto w-full max-w-3xl"}>
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-[#123B35]/80 bg-[#030807]/80 p-2 shadow-2xl shadow-[#00A88F]/10 backdrop-blur"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#0F2A26] bg-[#000000]/80 px-4 text-[#8FA8A2]">
            <GitBranch className="h-5 w-5 shrink-0 text-[#00D1B2]" aria-hidden="true" />
            <input
              value={repoUrl}
              onChange={(event) => {
                setRepoUrl(event.target.value);
                setError("");
              }}
              placeholder="Paste a public GitHub repo URL..."
              className="h-12 w-full bg-transparent text-sm text-[#FFFFFF] outline-none placeholder:text-[#55706A] md:text-base"
              aria-label="GitHub repository URL"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A88F] to-[#00D1B2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#00A88F]/20 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#00D1B2]"
            >
              Summon Council
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => startAnalysis(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#08201C]/80 px-5 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#00D1B2]/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00A88F]"
            >
              <Sparkles className="h-4 w-4 text-[#A3FF12]" aria-hidden="true" />
              Use Demo Repo
            </button>
          </div>
        </div>
      </form>
      {error ? <p className="mt-3 text-sm text-[#A3FF12]">{error}</p> : null}
    </div>
  );
}
