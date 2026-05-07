"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Download, Layers3 } from "lucide-react";
import Link from "next/link";
import { AgentCard } from "@/components/AgentCard";
import { DebatePanel } from "@/components/DebatePanel";
import { FixPlanPanel } from "@/components/FixPlanPanel";
import { RepoInput } from "@/components/RepoInput";
import { RepoOverview } from "@/components/RepoOverview";
import { RiskScore } from "@/components/RiskScore";
import { StartHereFiles } from "@/components/StartHereFiles";
import type { AnalysisResult } from "@/lib/schemas";

const storageKey = "ghost-engineer:analysis";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlList(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function scoreBar(label: string, value: number) {
  return `
    <div class="metric">
      <div class="metric-row"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>
      <div class="track"><div class="fill" style="width:${value}%"></div></div>
    </div>
  `;
}

function buildOverallReportHtml(analysis: AnalysisResult): string {
  const risk = analysis.riskScore;
  const agents = analysis.agents
    .map(
      (agent) => `
        <section class="panel">
          <h2>${escapeHtml(agent.role)}</h2>
          <p>${escapeHtml(agent.summary)}</p>
          <div class="grid">
            ${scoreBar("Priority", agent.priorityScore)}
            ${scoreBar("Confidence", agent.confidenceScore)}
          </div>
          <h3>Top Findings</h3>
          <ul>${htmlList(agent.topFindings)}</ul>
          <h3>Recommendations</h3>
          <ul>${htmlList(agent.recommendations)}</ul>
        </section>
      `,
    )
    .join("");

  const files = analysis.importantFiles
    .map(
      (file) => `
        <tr>
          <td>${escapeHtml(file.path)}</td>
          <td>${escapeHtml(file.category)}</td>
          <td>${escapeHtml(file.reason)}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Ghost Council Report - ${escapeHtml(analysis.repo.fullName)}</title>
    <style>
      body { margin: 0; background: #000; color: #fff; font-family: Inter, Arial, sans-serif; }
      main { max-width: 1120px; margin: 0 auto; padding: 48px 24px; }
      .eyebrow { color: #00D1B2; font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
      h1 { font-size: 52px; margin: 12px 0; }
      h2 { margin: 0 0 12px; }
      h3 { margin: 24px 0 8px; color: #fff; }
      p, li, td { color: #CFE7DF; line-height: 1.65; }
      .panel { border: 1px solid #123B35; background: #030807; border-radius: 24px; padding: 24px; margin-top: 20px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .metric-row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
      .track { height: 10px; border-radius: 999px; background: #0F2A26; overflow: hidden; margin-top: 8px; }
      .fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00A88F, #7CFF00); }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #123B35; padding: 12px; text-align: left; vertical-align: top; }
      th { color: #00D1B2; font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
      @media (max-width: 760px) { h1 { font-size: 36px; } .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Ghost Engineer Overall Report</p>
      <h1>${escapeHtml(analysis.repo.fullName)}</h1>
      <p>${escapeHtml(analysis.repo.description || "No repository description provided.")}</p>
      <section class="panel">
        <h2>Architecture Summary</h2>
        <p>${escapeHtml(analysis.architectureSummary)}</p>
      </section>
      <section class="panel">
        <h2>Risk Score</h2>
        <div class="grid">
          ${scoreBar("Architecture Risk", risk.architectureRisk)}
          ${scoreBar("Debugging Complexity", risk.debuggingComplexity)}
          ${scoreBar("Security Risk", risk.securityRisk)}
          ${scoreBar("Product Clarity", risk.productClarity)}
          ${scoreBar("Overall Health", risk.overallHealth)}
        </div>
      </section>
      <section class="panel">
        <h2>Start Here Files</h2>
        <table>
          <thead><tr><th>Path</th><th>Category</th><th>Reason</th></tr></thead>
          <tbody>${files}</tbody>
        </table>
      </section>
      ${agents}
      <section class="panel">
        <h2>Agent Debate Final Decision</h2>
        <p>${escapeHtml(analysis.debate.finalDecision)}</p>
      </section>
      <section class="panel">
        <h2>Fix Plan</h2>
        <h3>Understand First</h3><ul>${htmlList(analysis.fixPlan.understandFirst)}</ul>
        <h3>Fix First</h3><ul>${htmlList(analysis.fixPlan.fixFirst)}</ul>
        <h3>Build Next</h3><ul>${htmlList(analysis.fixPlan.buildNext)}</ul>
        <h3>Ignore For Now</h3><ul>${htmlList(analysis.fixPlan.ignoreForNow)}</ul>
      </section>
    </main>
  </body>
</html>`;
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setAnalysis(JSON.parse(stored) as AnalysisResult);
      } catch {
        setAnalysis(null);
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  function downloadOverallReport() {
    if (!analysis) return;
    const html = buildOverallReportHtml(analysis);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ghost-engineer-${analysis.repo.fullName.replace("/", "-")}-overall-report.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#000000] text-[#FFFFFF]">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#00D1B2]/40" />
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="min-h-screen bg-[#000000] px-5 py-10 text-[#FFFFFF]">
        <div className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center">
          <div className="w-full rounded-3xl border border-[#123B35] bg-[#030807]/80 p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#08201C] text-[#00D1B2]">
              <Layers3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold">No council report yet</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8FA8A2]">
              Paste a public GitHub repository URL or launch demo mode to generate the dashboard.
            </p>
            <div className="mt-6">
              <RepoInput />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(0,168,143,0.18),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(0,209,178,0.12),transparent_24%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#8FA8A2] transition hover:text-[#FFFFFF]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Analyze another repo
            </Link>
            <h1 className="mt-5 text-4xl font-semibold md:text-5xl">Ghost Council Report</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8FA8A2]">
              Multi-agent engineering review generated from repository structure and metadata.
            </p>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] ${
              analysis.mode === "live"
                ? "border-[#7CFF00]/40 bg-[#7CFF00]/10 text-[#86EFAC]"
                : "border-[#A3FF12]/40 bg-[#A3FF12]/10 text-[#FCD34D]"
            }`}
          >
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            {analysis.mode === "live" ? "Live Analysis" : "Fallback Demo Mode"}
          </div>
        </header>

        <div className="mt-6 grid gap-6">
          <RepoOverview repo={analysis.repo} />

          <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
              Detected Stack
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.detectedStack.map((stack) => (
                <span
                  key={stack}
                  className="rounded-full border border-[#00D1B2]/30 bg-[#00D1B2]/10 px-3 py-1.5 font-mono text-xs text-[#BAE6FD]"
                >
                  {stack}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00A88F]">
              Architecture Summary
            </p>
            <p className="mt-3 text-lg leading-8 text-[#FFFFFF]">{analysis.architectureSummary}</p>
          </section>

          <RiskScore riskScore={analysis.riskScore} />
          <StartHereFiles files={analysis.importantFiles} />

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
                  Four Agents
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Specialist reviews</h2>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {analysis.agents.map((agent) => (
                <AgentCard key={agent.role} agent={agent} />
              ))}
            </div>
          </section>

          <DebatePanel debate={analysis.debate} />
          <FixPlanPanel fixPlan={analysis.fixPlan} />

          <section className="mb-10 rounded-3xl border border-[#123B35] bg-[#06110F]/70 p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
                  Overall Report
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Download complete council report</h2>
                <p className="mt-3 text-sm leading-6 text-[#8FA8A2]">
                  Export repository overview, risk graphs, start-here files, agent findings,
                  debate, and fix plan as one standalone HTML report.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadOverallReport}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A88F] to-[#00D1B2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#00A88F]/20 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#00D1B2]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Overall Report
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
