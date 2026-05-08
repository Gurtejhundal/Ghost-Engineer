"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Download, Layers3 } from "lucide-react";
import Link from "next/link";
import { AgentCard } from "@/components/AgentCard";
import { BrandLogo } from "@/components/BrandLogo";
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

function graphNode(
  id: string,
  label: string,
  x: number,
  y: number,
  color: string,
  radius = 34,
  subtitle = "",
) {
  const width = id === "repo" ? 230 : Math.max(138, Math.min(188, radius * 3.4));
  const height = id === "repo" ? 92 : 72;
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
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return `
    <g class="edge" data-from="${escapeHtml(fromId)}" data-to="${escapeHtml(toId)}">
      <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
      <text x="${midX}" y="${midY - 5}" text-anchor="middle">${escapeHtml(label)}</text>
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
            svg.classList.remove("is-hovering");
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
              svg.classList.add("is-hovering");
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

function buildRelationshipGraph(analysis: AnalysisResult): string {
  const center = { x: 575, y: 365 };
  const techNodes = analysis.detectedStack.slice(0, 6).map((stack, index) => ({
    id: `stack-${index}`,
    label: stack,
    subtitle: "stack",
    x: 135 + index * 155,
    y: 110,
    color: "#06231F",
    radius: 45,
  }));
  const fileNodes = analysis.importantFiles.slice(0, 8).map((file, index) => ({
    id: `file-${index}`,
    label: file.path,
    subtitle: file.category,
    x: 135 + (index % 4) * 195,
    y: 585 + Math.floor(index / 4) * 86,
    color: "#031713",
    radius: 50,
  }));
  const agentNodes = analysis.agents.map((agent, index) => ({
    id: `agent-${index}`,
    label: agent.role,
    subtitle: `priority ${agent.priorityScore}`,
    x: 1080,
    y: 245 + index * 96,
    color: index % 2 === 0 ? "#06352F" : "#14310B",
    radius: 48,
  }));
  const riskNodes = [
    { id: "risk-architecture", label: "Architecture Risk", subtitle: `${analysis.riskScore.architectureRisk}`, x: 875, y: 110, color: "#341B12", radius: 45 },
    { id: "risk-debugging", label: "Debugging Complexity", subtitle: `${analysis.riskScore.debuggingComplexity}`, x: 1030, y: 110, color: "#341B12", radius: 45 },
    { id: "risk-security", label: "Security Risk", subtitle: `${analysis.riskScore.securityRisk}`, x: 1185, y: 110, color: "#341B12", radius: 45 },
  ];
  const planNodes = [
    { id: "plan-understand", label: "Understand First", subtitle: "read", x: 845, y: 675, color: "#06231F", radius: 50 },
    { id: "plan-fix", label: "Fix First", subtitle: "stabilize", x: 1015, y: 675, color: "#14310B", radius: 50 },
    { id: "plan-build", label: "Build Next", subtitle: "ship", x: 1185, y: 675, color: "#06231F", radius: 50 },
  ];

  const allNodes = [...techNodes, ...fileNodes, ...agentNodes, ...riskNodes, ...planNodes];
  const edges = [
    ...techNodes.map((node) => graphEdge("repo", center, node.id, node, "uses")),
    ...fileNodes.map((node) => graphEdge("repo", center, node.id, node, "contains")),
    ...agentNodes.map((node) => graphEdge("repo", center, node.id, node, "reviewed by")),
    ...riskNodes.map((node) => graphEdge("repo", center, node.id, node, "scores")),
    ...planNodes.map((node) => graphEdge("repo", center, node.id, node, "leads to")),
    ...analysis.agents.flatMap((agent, index) => {
      const agentNode = agentNodes[index];
      const riskNode = riskNodes[index % riskNodes.length];
      const planNode = planNodes[index % planNodes.length];
      return [
        graphEdge(agentNode.id, agentNode, riskNode.id, riskNode, "flags"),
        graphEdge(agentNode.id, agentNode, planNode.id, planNode, "recommends"),
      ];
    }),
  ].join("");

  return `
    <section class="panel graph-panel">
      <div class="graph-heading">
        <div>
          <p class="eyebrow">Repository Relationship Graph</p>
          <h2>Module and decision map</h2>
        </div>
        <p>This Graphify-style map links repository modules, stack signals, AI agents, risk areas, and fix-plan actions.</p>
      </div>
      <svg class="relationship-graph" viewBox="0 0 1260 760" role="img" aria-label="Repository module relationship graph">
        <defs>
          <radialGradient id="repoGlow" cx="50%" cy="50%" r="50%">
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
        <rect width="1260" height="760" rx="30" fill="url(#graphBg)" />
        <path d="M90 145 H1170 M90 365 H1170 M90 585 H1170" stroke="#0F2A26" stroke-opacity=".22" />
        <circle cx="${center.x}" cy="${center.y}" r="160" fill="#00D1B2" opacity=".05" />
        ${edges}
        ${graphNode("repo", analysis.repo.fullName, center.x, center.y, "url(#repoGlow)", 78, "repository")}
        ${allNodes.map((node) => graphNode(node.id, node.label, node.x, node.y, node.color, node.radius, node.subtitle)).join("")}
      </svg>
      <div class="legend">
        <span><b class="dot teal"></b>Repository and stack</span>
        <span><b class="dot lime"></b>Agents and fix plan</span>
        <span><b class="dot amber"></b>Risk clusters</span>
      </div>
    </section>
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
      .graph-panel { overflow: hidden; }
      .graph-heading { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: end; }
      .graph-panel { position: relative; }
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
      .legend { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 14px; color: #8FA8A2; font-size: 13px; }
      .dot { display: inline-block; width: 10px; height: 10px; border-radius: 999px; margin-right: 8px; }
      .dot.teal { background: #00D1B2; } .dot.lime { background: #7CFF00; } .dot.amber { background: #A3FF12; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #123B35; padding: 12px; text-align: left; vertical-align: top; }
      th { color: #00D1B2; font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
      @media (max-width: 760px) { h1 { font-size: 36px; } .grid, .graph-heading { grid-template-columns: 1fr; } }
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
      ${buildRelationshipGraph(analysis)}
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
    ${relationshipGraphScript()}
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
            <div className="mt-5 flex items-center gap-4">
              <BrandLogo className="h-14 w-14" />
              <h1 className="text-4xl font-semibold md:text-5xl">Ghost Council Report</h1>
            </div>
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
            {analysis.mode === "live" ? "Live Analysis" : "Fallback Analysis"}
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
