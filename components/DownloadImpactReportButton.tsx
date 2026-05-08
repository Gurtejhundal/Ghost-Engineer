"use client";

import { Download } from "lucide-react";
import { buildProblemBrief, openProblemQueue } from "@/lib/developer-problems";
import type { ImpactAnalysisResult } from "@/lib/schemas";

type DownloadImpactReportButtonProps = {
  analysis: ImpactAnalysisResult;
  variant: "full" | "developer";
  label?: string;
};

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

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function scoreBlock(label: string, value: number): string {
  return `
    <div class="metric">
      <div class="metric-row"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>
      <div class="track"><div class="fill" style="width:${value}%"></div></div>
    </div>
  `;
}

function buildIssueMarkdown(
  projectName: string,
  role: string,
  issue: {
    title: string;
    description: string;
    label: string;
    estimatedEffort: string;
  },
) {
  return `# ${issue.title}

Project: ${projectName}
Role: ${role}
Label: ${issue.label}
Estimated effort: ${issue.estimatedEffort}

## Problem
${issue.description}

## Contribution Goal
Create a focused pull request that moves this public-good project closer to field testing.

## Definition of Done
- The change is small and reviewable.
- The README or related docs are updated if behavior changes.
- Safety or field limitations are documented when relevant.
`;
}

function baseStyles(): string {
  return `
    body { margin: 0; background: #000; color: #f8fafc; font-family: Inter, Segoe UI, Arial, sans-serif; }
    main { max-width: 1120px; margin: 0 auto; padding: 48px 24px; }
    .eyebrow { color: #6ee7b7; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
    h1 { margin: 12px 0; font-size: 52px; line-height: 1.02; }
    h2 { margin: 0 0 12px; font-size: 26px; }
    h3 { margin: 22px 0 8px; }
    p, li, td { color: #cfe7df; line-height: 1.65; }
    .panel { border: 1px solid #123b35; background: #030807; border-radius: 24px; padding: 24px; margin-top: 20px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .metric-row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .track { height: 10px; border-radius: 999px; background: #0f2a26; overflow: hidden; margin-top: 8px; }
    .fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #16a34a, #10b981, #6ee7b7); }
    .chip { display: inline-block; margin: 0 8px 8px 0; border: 1px solid #123b35; border-radius: 999px; padding: 6px 10px; color: #cfe7df; font-size: 12px; }
    .issue, .file, .agent { border: 1px solid #123b35; border-radius: 18px; padding: 16px; background: #06110f; margin-top: 12px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #123b35; border-radius: 16px; background: #000; padding: 14px; color: #cfe7df; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #123b35; padding: 12px; text-align: left; vertical-align: top; }
    th { color: #6ee7b7; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
    @media (max-width: 760px) { h1 { font-size: 36px; } .grid { grid-template-columns: 1fr; } }
  `;
}

function buildFullReportHtml(analysis: ImpactAnalysisResult): string {
  const blueprint = analysis.impactBlueprint;
  const agents = analysis.agents
    .map(
      (agent) => `
        <article class="agent">
          <h3>${escapeHtml(agent.role)}</h3>
          <p>${escapeHtml(agent.summary)}</p>
          <div class="grid">
            ${scoreBlock("Priority", agent.priorityScore)}
            ${scoreBlock("Confidence", agent.confidenceScore)}
          </div>
          <h4>Top Findings</h4>
          <ul>${htmlList(agent.topFindings)}</ul>
          <h4>Recommendations</h4>
          <ul>${htmlList(agent.recommendations)}</ul>
        </article>
      `,
    )
    .join("");

  const contributors = analysis.contributorBoard
    .map(
      (role) => `
        <article class="issue">
          <h3>${escapeHtml(role.role)}</h3>
          <p>${escapeHtml(role.purpose)}</p>
          <p><strong>Effort:</strong> ${escapeHtml(role.estimatedEffort)}</p>
          <h4>Tasks</h4>
          <ul>${htmlList(role.tasks)}</ul>
          <h4>Skills</h4>
          <p>${role.requiredSkills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</p>
        </article>
      `,
    )
    .join("");

  const files = analysis.githubPack
    .map(
      (file) => `
        <tr>
          <td>${escapeHtml(file.fileName)}</td>
          <td>${escapeHtml(file.purpose)}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(blueprint.projectName)} - Ghost Engineer Impact Report</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Ghost Engineer Complete Impact Report</p>
      <h1>${escapeHtml(blueprint.projectName)}</h1>
      <p>${escapeHtml(blueprint.mission)}</p>
      <section class="panel">
        <h2>Problem Summary</h2>
        <p>${escapeHtml(blueprint.problemSummary)}</p>
        <h3>Target Users</h3>
        <p>${blueprint.targetUsers.map((user) => `<span class="chip">${escapeHtml(user)}</span>`).join("")}</p>
      </section>
      <section class="panel">
        <h2>Scores</h2>
        <div class="grid">
          ${scoreBlock("Impact Score", blueprint.impactScore)}
          ${scoreBlock("Feasibility Score", blueprint.feasibilityScore)}
        </div>
      </section>
      <section class="panel">
        <h2>Impact Blueprint</h2>
        <h3>Open-source Opportunity</h3><p>${escapeHtml(blueprint.openSourceOpportunity)}</p>
        <h3>MVP Features</h3><ul>${htmlList(blueprint.mvpFeatures)}</ul>
        <h3>Technical Approach</h3><ul>${htmlList(blueprint.technicalApproach)}</ul>
        <h3>Missing Parts</h3><ul>${htmlList(blueprint.missingParts)}</ul>
        <h3>Safety and Trust Concerns</h3><ul>${htmlList(blueprint.safetyAndTrustConcerns)}</ul>
      </section>
      <section class="panel">
        <h2>Four-Agent Review</h2>
        ${agents}
      </section>
      <section class="panel">
        <h2>Contributor Board</h2>
        ${contributors}
      </section>
      <section class="panel">
        <h2>GitHub Pack</h2>
        <table><thead><tr><th>File</th><th>Purpose</th></tr></thead><tbody>${files}</tbody></table>
      </section>
      <section class="panel">
        <h2>Pilot Plan</h2>
        <p><strong>Users:</strong> ${escapeHtml(analysis.pilotPlan.pilotUsers)}</p>
        <p><strong>Location:</strong> ${escapeHtml(analysis.pilotPlan.locationContext)}</p>
        <h3>Success Metrics</h3><ul>${htmlList(analysis.pilotPlan.successMetrics)}</ul>
        <h3>Testing Steps</h3><ul>${htmlList(analysis.pilotPlan.testingSteps)}</ul>
        <h3>Safety Checklist</h3><ul>${htmlList(analysis.pilotPlan.safetyChecklist)}</ul>
        <h3>Post-Pilot Next Steps</h3><ul>${htmlList(analysis.pilotPlan.postPilotNextSteps)}</ul>
      </section>
    </main>
  </body>
</html>`;
}

function buildDeveloperReportHtml(analysis: ImpactAnalysisResult): string {
  const blueprint = analysis.impactBlueprint;
  const problemCards = openProblemQueue
    .map(
      (problem) => `
        <article class="issue">
          <h3>${escapeHtml(problem.title)}</h3>
          <p><span class="chip">${escapeHtml(problem.domain)}</span></p>
          <p>${escapeHtml(problem.summary)}</p>
          <p>${problem.needs.map((need) => `<span class="chip">${escapeHtml(need)}</span>`).join("")}</p>
          <pre>${escapeHtml(buildProblemBrief(problem))}</pre>
        </article>
      `,
    )
    .join("");

  const issueDrafts = analysis.contributorBoard
    .flatMap((role) =>
      role.goodFirstIssues.map(
        (issue) => `
          <article class="issue">
            <h3>${escapeHtml(issue.title)}</h3>
            <p><strong>Role:</strong> ${escapeHtml(role.role)} | <strong>Label:</strong> ${escapeHtml(issue.label)} | <strong>Effort:</strong> ${escapeHtml(issue.estimatedEffort)}</p>
            <p>${escapeHtml(issue.description)}</p>
            <pre>${escapeHtml(buildIssueMarkdown(blueprint.projectName, role.role, issue))}</pre>
          </article>
        `,
      ),
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(blueprint.projectName)} - Developer Contribution Report</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Ghost Engineer Developer Contribution Report</p>
      <h1>${escapeHtml(analysis.input.problemTitle)}</h1>
      <p>${escapeHtml(analysis.input.problemDescription)}</p>
      <section class="panel">
        <h2>Active Project</h2>
        <div class="grid">
          ${scoreBlock("Impact Score", blueprint.impactScore)}
          ${scoreBlock("Feasibility Score", blueprint.feasibilityScore)}
        </div>
        <p><strong>Project:</strong> ${escapeHtml(blueprint.projectName)}</p>
        <p><strong>Domain:</strong> ${escapeHtml(analysis.input.domain)}</p>
      </section>
      <section class="panel">
        <h2>Contribution Boundaries</h2>
        <ul>${htmlList(blueprint.safetyAndTrustConcerns)}</ul>
      </section>
      <section class="panel">
        <h2>Open Problem Queue</h2>
        ${problemCards}
      </section>
      <section class="panel">
        <h2>Copy-Ready Issue Drafts</h2>
        ${issueDrafts}
      </section>
    </main>
  </body>
</html>`;
}

function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DownloadImpactReportButton({
  analysis,
  variant,
  label,
}: DownloadImpactReportButtonProps) {
  function onDownload() {
    const reportSlug = slug(analysis.impactBlueprint.projectName);
    if (variant === "developer") {
      downloadHtml(
        `ghost-engineer-${reportSlug}-developer-report.html`,
        buildDeveloperReportHtml(analysis),
      );
      return;
    }
    downloadHtml(`ghost-engineer-${reportSlug}-full-impact-report.html`, buildFullReportHtml(analysis));
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#22C55E]/35 bg-[#22C55E]/10 px-4 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#22C55E]/70 hover:bg-[#22C55E]/15 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label || (variant === "developer" ? "Download Developer Report" : "Download Full Report")}
    </button>
  );
}
