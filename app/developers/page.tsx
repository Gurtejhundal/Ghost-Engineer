"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  Code2,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { DownloadImpactReportButton } from "@/components/DownloadImpactReportButton";
import { ImpactDashboardNav } from "@/components/ImpactDashboardNav";
import { useImpactAnalysis } from "@/components/useImpactAnalysis";
import { buildProblemBrief, openProblemQueue } from "@/lib/developer-problems";

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

export default function DevelopersPage() {
  const { analysis, loaded } = useImpactAnalysis();
  const [copied, setCopied] = useState("");

  const flattenedIssues = useMemo(() => {
    if (!analysis) return [];
    return analysis.contributorBoard.flatMap((role) =>
      role.goodFirstIssues.map((issue) => ({
        ...issue,
        role: role.role,
        skills: role.requiredSkills,
        rolePurpose: role.purpose,
      })),
    );
  }, [analysis]);

  async function copyIssue(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1600);
  }

  if (!loaded || !analysis) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#000000] text-white">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#22C55E]/40" />
      </main>
    );
  }

  const blueprint = analysis.impactBlueprint;

  return (
    <main className="min-h-screen bg-[#000000] text-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <BrandLogo showWordmark className="h-12 w-12" />
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Developer Contribution Hub
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold md:text-6xl">
              Pick a problem. Ship a public-good contribution.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#94A3B8]">
              Developers can read the generated problem statement, choose a contributor role, copy
              a starter issue, and begin turning the Impact Blueprint into an open-source project.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <DownloadImpactReportButton
              analysis={analysis}
              variant="developer"
              label="Download Detailed Developer Report"
            />
            <ImpactDashboardNav active="developers" />
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08201C] text-[#22C55E]">
                <Code2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#64748B]">
                  Active Problem
                </p>
                <h2 className="text-2xl font-semibold">{analysis.input.problemTitle}</h2>
              </div>
            </div>
            <p className="mt-5 text-lg leading-8 text-[#F8FAFC]">
              {analysis.input.problemDescription}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64748B]">
                  Project
                </p>
                <p className="mt-2 font-semibold">{blueprint.projectName}</p>
              </div>
              <div className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64748B]">
                  Domain
                </p>
                <p className="mt-2 font-semibold">{analysis.input.domain}</p>
              </div>
              <div className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64748B]">
                  Impact
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold">{blueprint.impactScore}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Contribution boundaries</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#94A3B8]">
              Start with safe, small, reviewable changes. This page does not create GitHub issues
              automatically; it gives developers clean issue drafts they can copy into a repository.
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#CFE7DF]">
              {blueprint.safetyAndTrustConcerns.slice(0, 4).map((concern) => (
                <li key={concern} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
                Open Problem Queue
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Problems developers can pick up next</h2>
            </div>
            <Link
              href="/create"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#06110F]/80 px-4 text-sm font-semibold text-[#CFE7DF] transition hover:border-[#22C55E]/50 hover:text-white"
            >
              Generate a New Problem
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {openProblemQueue.map((problem) => {
              const key = `problem-${problem.title}`;
              return (
                <article key={problem.title} className="rounded-3xl border border-[#123B35] bg-[#06110F]/70 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#86EFAC]">
                      {problem.domain}
                    </span>
                    <span className="rounded-full border border-[#123B35] px-2.5 py-1 font-mono text-[11px] text-[#94A3B8]">
                      open problem
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{problem.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{problem.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {problem.needs.map((need) => (
                      <span key={need} className="rounded-full border border-[#123B35] bg-[#000000]/35 px-3 py-1 text-xs text-[#CFE7DF]">
                        {need}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 rounded-2xl border border-[#0F2A26] bg-[#000000]/40 p-3 text-sm leading-6 text-[#CFE7DF]">
                    {problem.starter}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyIssue(key, buildProblemBrief(problem))}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#030807]/80 px-4 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#22C55E]/50"
                  >
                    {copied === key ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Copied Problem Brief
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" aria-hidden="true" />
                        Copy Problem Brief
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
                Starter Issues
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Copy-ready contribution tasks</h2>
            </div>
            <Link
              href="/launch"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#06110F]/80 px-4 text-sm font-semibold text-[#CFE7DF] transition hover:border-[#22C55E]/50 hover:text-white"
            >
              View GitHub Pack
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {flattenedIssues.map((issue, index) => {
              const key = `${issue.role}-${issue.title}`;
              const markdown = buildIssueMarkdown(blueprint.projectName, issue.role, issue);
              return (
                <article key={key} className="rounded-3xl border border-[#123B35] bg-[#06110F]/70 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[#22C55E]">#{index + 1}</span>
                    <span className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-2 py-1 font-mono text-[11px] text-[#6EE7B7]">
                      {issue.label}
                    </span>
                    <span className="rounded-full border border-[#123B35] px-2 py-1 font-mono text-[11px] text-[#94A3B8]">
                      {issue.estimatedEffort}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{issue.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{issue.description}</p>

                  <div className="mt-4 rounded-2xl border border-[#0F2A26] bg-[#000000]/45 p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-[#22C55E]" aria-hidden="true" />
                      <p className="font-semibold">{issue.role}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{issue.rolePurpose}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {issue.skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-[#123B35] px-2.5 py-1 text-xs text-[#CFE7DF]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void copyIssue(key, markdown)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-4 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/15 transition hover:scale-[1.01]"
                  >
                    {copied === key ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Copied Issue Draft
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" aria-hidden="true" />
                        Copy Issue Draft
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="my-8 grid gap-5 rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Developer Next Step
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Open the launch pack, then create issues in your repo.</h2>
            <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
              The GitHub Pack gives developers the README, roadmap, contribution guide, field testing
              plan, and impact report structure needed to make the problem contributable.
            </p>
          </div>
          <Link
            href="/launch"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
          >
            Continue to Launch Pack
            <FileText className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
