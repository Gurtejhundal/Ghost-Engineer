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
import { BrandLogo } from "@/components/BrandLogo";
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

function graphNode(
  id: string,
  label: string,
  x: number,
  y: number,
  color: string,
  radius = 34,
  subtitle = "",
) {
  const width = id === "agent" ? 220 : Math.max(150, Math.min(210, radius * 3.5));
  const height = id === "agent" ? 92 : 72;
  const left = x - width / 2;
  const top = y - height / 2;

  return `
    <g class="node" data-node="${escapeHtml(id)}">
      <rect class="node-halo" x="${left - 8}" y="${top - 8}" width="${width + 16}" height="${height + 16}" rx="24" fill="${color}" />
      <rect class="node-shell" x="${left}" y="${top}" width="${width}" height="${height}" rx="20" fill="${color}" />
      <circle class="node-orb" cx="${left + 27}" cy="${top + 26}" r="7" />
      <foreignObject x="${left + 44}" y="${top + 15}" width="${width - 58}" height="${height - 25}">
        <div xmlns="http://www.w3.org/1999/xhtml" class="node-content">
          <div class="node-title">${escapeHtml(label)}</div>
          ${subtitle ? `<div class="node-subline">${escapeHtml(subtitle)}</div>` : ""}
        </div>
      </foreignObject>
      <title>${escapeHtml(label)}${subtitle ? ` - ${escapeHtml(subtitle)}` : ""}</title>
    </g>
  `;
}

function graphEdge(
  fromId: string,
  from: { x: number; y: number },
  toId: string,
  to: { x: number; y: number },
  label: string,
) {
  return `
    <g class="edge" data-from="${escapeHtml(fromId)}" data-to="${escapeHtml(toId)}">
      <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
      <text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 5}" text-anchor="middle">${escapeHtml(label)}</text>
    </g>
  `;
}

function relationshipGraphScript(): string {
  return `
    <script>
      (() => {
        document.querySelectorAll(".graph-panel").forEach((panel) => {
          const svg = panel.querySelector(".relationship-graph");
          if (!svg) return;
          const tooltip = document.createElement("div");
          tooltip.className = "graph-tooltip";
          panel.appendChild(tooltip);

          const nodes = [...svg.querySelectorAll(".node")];
          const edges = [...svg.querySelectorAll(".edge")];

          function clearGraph() {
            tooltip.classList.remove("visible");
            nodes.forEach((node) => node.classList.remove("is-active", "is-dim", "is-neighbor"));
            edges.forEach((edge) => edge.classList.remove("is-active", "is-dim"));
          }

          function showTooltip(event, text) {
            const rect = panel.getBoundingClientRect();
            tooltip.textContent = text;
            tooltip.style.left = (event.clientX - rect.left + 14) + "px";
            tooltip.style.top = (event.clientY - rect.top + 14) + "px";
            tooltip.classList.add("visible");
          }

          nodes.forEach((node) => {
            const id = node.dataset.node;
            const title = node.querySelector("title")?.textContent || id || "Graph node";

            node.addEventListener("mouseenter", (event) => {
              const connected = new Set([id]);
              edges.forEach((edge) => {
                const active = edge.dataset.from === id || edge.dataset.to === id;
                edge.classList.toggle("is-active", active);
                edge.classList.toggle("is-dim", !active);
                if (active) {
                  connected.add(edge.dataset.from);
                  connected.add(edge.dataset.to);
                }
              });
              nodes.forEach((candidate) => {
                const active = candidate.dataset.node === id;
                const neighbor = connected.has(candidate.dataset.node);
                candidate.classList.toggle("is-active", active);
                candidate.classList.toggle("is-neighbor", !active && neighbor);
                candidate.classList.toggle("is-dim", !neighbor);
              });
              showTooltip(event, title);
            });

            node.addEventListener("mousemove", (event) => showTooltip(event, title));
            node.addEventListener("mouseleave", clearGraph);
          });

          svg.addEventListener("mouseleave", clearGraph);
        });
      })();
    </script>
  `;
}

function buildAgentRelationshipGraph(analysis: AnalysisResult, agent: AgentReview): string {
  const center = { x: 510, y: 300 };
  const risks = agent.risks.slice(0, 4).map((risk, index) => ({
    id: `risk-${index}`,
    label: risk.title,
    subtitle: risk.severity,
    x: 190,
    y: 135 + index * 100,
    color: risk.severity === "high" ? "#351111" : risk.severity === "medium" ? "#2D3308" : "#12360A",
    radius: 52,
  }));
  const findings = agent.topFindings.slice(0, 4).map((finding, index) => ({
    id: `finding-${index}`,
    label: finding,
    subtitle: "finding",
    x: 830,
    y: 135 + index * 100,
    color: "#06231F",
    radius: 56,
  }));
  const files = analysis.importantFiles.slice(0, 4).map((file, index) => ({
    id: `file-${index}`,
    label: file.path,
    subtitle: file.category,
    x: 210 + index * 205,
    y: 555,
    color: "#031713",
    radius: 54,
  }));
  const recommendations = agent.recommendations.slice(0, 3).map((item, index) => ({
    id: `action-${index}`,
    label: item,
    subtitle: "action",
    x: 330 + index * 205,
    y: 74,
    color: "#14310B",
    radius: 54,
  }));
  const nodes = [...risks, ...findings, ...files, ...recommendations];
  const edges = [
    ...risks.map((node) => graphEdge("agent", center, node.id, node, "flags")),
    ...findings.map((node) => graphEdge("agent", center, node.id, node, "observes")),
    ...files.map((node) => graphEdge("agent", center, node.id, node, "reads")),
    ...recommendations.map((node) => graphEdge("agent", center, node.id, node, "recommends")),
  ].join("");

  return `
    <section class="panel graph-panel">
      <div class="graph-heading">
        <div>
          <p class="eyebrow">Agent Relationship Graph</p>
          <h2>${escapeHtml(agent.role)} decision map</h2>
        </div>
        <p>This graph links the agent to repository files, findings, risks, and recommended actions.</p>
      </div>
      <svg class="relationship-graph" viewBox="0 0 1020 650" role="img" aria-label="${escapeHtml(agent.role)} relationship graph">
        <defs>
          <radialGradient id="agentGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00D1B2" stop-opacity=".95" />
            <stop offset="100%" stop-color="#003B32" stop-opacity=".72" />
          </radialGradient>
          <linearGradient id="graphBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#000000" />
            <stop offset="52%" stop-color="#020807" />
            <stop offset="100%" stop-color="#00120F" />
          </linearGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="1020" height="650" rx="30" fill="url(#graphBg)" />
        <path d="M70 105 H950 M70 300 H950 M70 555 H950" stroke="#0F2A26" stroke-opacity=".22" />
        <circle cx="${center.x}" cy="${center.y}" r="150" fill="#00D1B2" opacity=".05" />
        ${edges}
        ${graphNode("agent", agent.role, center.x, center.y, "url(#agentGlow)", 76, `priority ${agent.priorityScore}`)}
        ${nodes.map((node) => graphNode(node.id, node.label, node.x, node.y, node.color, node.radius, node.subtitle)).join("")}
      </svg>
    </section>
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
      .graph-panel { overflow: hidden; position: relative; }
      .graph-heading { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: end; }
      .relationship-graph { width: 100%; height: auto; margin-top: 20px; border: 1px solid #123B35; border-radius: 30px; background: #000; box-shadow: inset 0 0 80px rgba(0,209,178,.06); }
      .edge, .node { transition: opacity .18s ease, filter .18s ease; }
      .edge line { stroke: #00D1B2; stroke-opacity: .24; stroke-width: 1.3; transition: stroke .18s ease, stroke-opacity .18s ease, stroke-width .18s ease; }
      .edge text { opacity: 0; fill: #BFFFEF; font-size: 10px; font-family: ui-monospace, monospace; paint-order: stroke; stroke: #000; stroke-width: 5px; transition: opacity .18s ease; }
      .node { cursor: pointer; transform-box: fill-box; transform-origin: center; transition: opacity .18s ease, transform .18s ease, filter .18s ease; }
      .node-halo { opacity: .13; filter: url(#glow); transition: opacity .18s ease; }
      .node-shell { fill-opacity: .86; stroke: #00D1B2; stroke-opacity: .52; stroke-width: 1.2; filter: drop-shadow(0 8px 24px rgba(0, 209, 178, .12)); transition: stroke .18s ease, fill-opacity .18s ease, filter .18s ease; }
      .node-orb { fill: #7CFF00; opacity: .9; filter: url(#glow); }
      .node-content { height: 100%; min-width: 0; color: #FFFFFF; font-family: Inter, Arial, sans-serif; }
      .node-title { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 800; line-height: 1.2; text-shadow: 0 1px 14px rgba(255,255,255,.28); }
      .node-subline { margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #9EB7AF; font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
      .node.is-active { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(124,255,0,.28)); }
      .node.is-active .node-shell { stroke: #7CFF00; fill-opacity: .98; }
      .node.is-active .node-halo, .node.is-neighbor .node-halo { opacity: .3; }
      .node.is-neighbor { transform: scale(1.03); }
      .node.is-dim, .edge.is-dim { opacity: .16; }
      .edge.is-active line { stroke: #7CFF00; stroke-opacity: .9; stroke-width: 2.5; }
      .edge.is-active text { opacity: 1; }
      .graph-tooltip { position: absolute; z-index: 5; max-width: 280px; pointer-events: none; opacity: 0; transform: translateY(6px); transition: opacity .16s ease, transform .16s ease; border: 1px solid #00D1B2; border-radius: 14px; background: rgba(0, 0, 0, .9); box-shadow: 0 0 28px rgba(0,209,178,.22); color: #FFFFFF; padding: 10px 12px; font-size: 12px; line-height: 1.4; }
      .graph-tooltip.visible { opacity: 1; transform: translateY(0); }
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
      ${buildAgentRelationshipGraph(analysis, agent)}
      <section class="panel grid">
        <div>${scoreBar("Priority Score", agent.priorityScore)}</div>
        <div>${scoreBar("Confidence Score", agent.confidenceScore)}</div>
      </section>
      <section class="panel"><h2>Risk Graph</h2>${riskBars}</section>
      <section class="panel"><h2>Top Findings</h2><ul>${agent.topFindings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section class="panel"><h2>Risks</h2>${risks}</section>
      <section class="panel"><h2>Recommendations</h2><ul>${agent.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    </main>
    ${relationshipGraphScript()}
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
              <BrandLogo className="h-14 w-14" />
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
