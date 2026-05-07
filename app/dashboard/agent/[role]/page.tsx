"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Bug,
  Crown,
  Download,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { RepoInput } from "@/components/RepoInput";
import { slugToAgent } from "@/lib/agent-routing";
import type { AgentReview, AgentRole, AnalysisResult } from "@/lib/schemas";

const storageKey = "ghost-engineer:analysis";

const iconMap = {
  Architect: Crown,
  Debugger: Bug,
  "Security Reviewer": ShieldCheck,
  "Product Manager": Lightbulb,
};

const severityValue = {
  low: 34,
  medium: 66,
  high: 100,
};

const severityColor = {
  low: "#7CFF00",
  medium: "#A3FF12",
  high: "#FF4D4D",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function scoreBar(label: string, value: number) {
  return `
    <div class="metric">
      <div class="metric-row"><span>${escapeHtml(label)}</span><strong>${value}%</strong></div>
      <div class="track"><div class="fill" style="width:${value}%"></div></div>
    </div>
  `;
}

function buildDownloadHtml(analysis: AnalysisResult, agent: AgentReview): string {
  const risks = agent.risks
    .map(
      (risk) => `
        <article class="risk">
          <div><strong>${escapeHtml(risk.title)}</strong><span class="${risk.severity}">${risk.severity}</span></div>
          <p>${escapeHtml(risk.explanation)}</p>
        </article>
      `,
    )
    .join("");

  const riskBars = agent.risks
    .map(
      (risk) => `
        <div class="bar">
          <span>${escapeHtml(risk.title)}</span>
          <svg viewBox="0 0 100 10" preserveAspectRatio="none">
            <rect width="100" height="10" rx="5" fill="#0F2A26" />
            <rect width="${severityValue[risk.severity]}" height="10" rx="5" fill="${severityColor[risk.severity]}" />
          </svg>
        </div>
      `,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(agent.role)} Report - ${escapeHtml(analysis.repo.fullName)}</title>
    <style>
      body { margin: 0; background: #000; color: #fff; font-family: Inter, Arial, sans-serif; }
      main { max-width: 980px; margin: 0 auto; padding: 48px 24px; }
      .eyebrow { color: #00D1B2; font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
      h1 { font-size: 48px; margin: 12px 0; }
      h2 { margin-top: 32px; }
      p, li { color: #CFE7DF; line-height: 1.65; }
      .panel { border: 1px solid #123B35; background: #030807; border-radius: 24px; padding: 24px; margin-top: 20px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .metric-row, .risk div { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
      .track { height: 10px; border-radius: 999px; background: #0F2A26; overflow: hidden; margin-top: 8px; }
      .fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00A88F, #7CFF00); }
      .risk { border: 1px solid #0F2A26; border-radius: 18px; padding: 16px; margin: 12px 0; }
      .risk span { border: 1px solid currentColor; border-radius: 999px; padding: 4px 8px; font-size: 12px; font-family: ui-monospace, monospace; }
      .low { color: #7CFF00; } .medium { color: #A3FF12; } .high { color: #FF4D4D; }
      .bar { margin: 14px 0; }
      .bar span { display: block; margin-bottom: 8px; color: #CFE7DF; }
      svg { width: 100%; height: 12px; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Ghost Engineer Agent Report</p>
      <h1>${escapeHtml(agent.role)}</h1>
      <p>${escapeHtml(analysis.repo.fullName)} · ${escapeHtml(analysis.mode)} analysis</p>
      <section class="panel"><h2>Summary</h2><p>${escapeHtml(agent.summary)}</p></section>
      <section class="panel grid">
        <div>${scoreBar("Priority Score", agent.priorityScore)}</div>
        <div>${scoreBar("Confidence Score", agent.confidenceScore)}</div>
      </section>
      <section class="panel"><h2>Risk Graph</h2>${riskBars}</section>
      <section class="panel"><h2>Top Findings</h2><ul>${agent.topFindings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section class="panel"><h2>Risks</h2>${risks}</section>
      <section class="panel"><h2>Recommendations</h2><ul>${agent.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    </main>
  </body>
</html>`;
}

function ScoreGraph({ agent }: { agent: AgentReview }) {
  const metrics = [
    ["Priority", agent.priorityScore],
    ["Confidence", agent.confidenceScore],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
          <div className="flex items-end justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">{label}</p>
            <p className="font-mono text-3xl text-[#FFFFFF]">{value}%</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#0F2A26]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00A88F] to-[#7CFF00]"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskGraph({ agent }: { agent: AgentReview }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-[#00D1B2]" aria-hidden="true" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#00D1B2]">
            Risk Graph
          </p>
          <h2 className="text-xl font-semibold">Severity spread</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        {agent.risks.map((risk) => (
          <div key={risk.title}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[#CFE7DF]">{risk.title}</p>
              <span
                className="rounded-full border px-2 py-1 font-mono text-xs"
                style={{
                  color: severityColor[risk.severity],
                  borderColor: `${severityColor[risk.severity]}55`,
                }}
              >
                {risk.severity}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#0F2A26]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${severityValue[risk.severity]}%`,
                  backgroundColor: severityColor[risk.severity],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AgentReportPage() {
  const params = useParams<{ role: string }>();
  const role = useMemo(() => slugToAgent(params.role), [params.role]);
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

  const agent = useMemo(() => {
    if (!analysis || !role) return null;
    return analysis.agents.find((item) => item.role === role) ?? null;
  }, [analysis, role]);

  function downloadReport() {
    if (!analysis || !agent) return;
    const html = buildDownloadHtml(analysis, agent);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ghost-engineer-${agent.role.toLowerCase().replace(/\s+/g, "-")}-report.html`;
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

  if (!analysis || !agent || !role) {
    return (
      <main className="min-h-screen bg-[#000000] px-5 py-10 text-[#FFFFFF]">
        <div className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center">
          <div className="w-full rounded-3xl border border-[#123B35] bg-[#030807]/80 p-6 text-center">
            <h1 className="text-3xl font-semibold">Agent report unavailable</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8FA8A2]">
              Generate a Ghost Council report first, then open an agent report from the dashboard.
            </p>
            <div className="mt-6">
              <RepoInput />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const Icon = iconMap[role as AgentRole];

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,168,143,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(124,255,0,0.08),transparent_24%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[#8FA8A2] transition hover:text-[#FFFFFF]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to council dashboard
            </Link>
            <div className="mt-6 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#08201C] text-[#00D1B2]">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
                  Dedicated Agent Report
                </p>
                <h1 className="text-4xl font-semibold md:text-5xl">{agent.role}</h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#8FA8A2]">
              Focused report for {analysis.repo.fullName}. This page isolates the agent&apos;s
              summary, risks, recommendations, and score graphs.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A88F] to-[#00D1B2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#00A88F]/20 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#00D1B2]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Report
          </button>
        </header>

        <div className="mt-6 grid gap-6">
          <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00A88F]">
              Executive Summary
            </p>
            <p className="mt-3 text-lg leading-8 text-[#FFFFFF]">{agent.summary}</p>
          </section>

          <ScoreGraph agent={agent} />
          <RiskGraph agent={agent} />

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#123B35] bg-[#06110F]/75 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">
                Top Findings
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
                {agent.topFindings.map((finding) => (
                  <li key={finding} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D1B2]" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#123B35] bg-[#06110F]/75 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">
                Recommendations
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
                {agent.recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7CFF00]" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">
              Detailed Risks
            </p>
            <div className="mt-4 grid gap-3">
              {agent.risks.map((risk) => (
                <article key={risk.title} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#FFFFFF]">{risk.title}</h2>
                    <span
                      className="rounded-full border px-2 py-0.5 font-mono text-xs"
                      style={{
                        color: severityColor[risk.severity],
                        borderColor: `${severityColor[risk.severity]}55`,
                      }}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#8FA8A2]">{risk.explanation}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
