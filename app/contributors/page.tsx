"use client";

import { ArrowRight, CheckCircle2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ImpactDashboardNav } from "@/components/ImpactDashboardNav";
import { useImpactAnalysis } from "@/components/useImpactAnalysis";

export default function ContributorsPage() {
  const { analysis, loaded } = useImpactAnalysis();

  if (!loaded || !analysis) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#000000] text-white">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#22C55E]/40" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.11),transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <BrandLogo showWordmark className="h-12 w-12" />
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Contributor Board
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Open-source roles with real tasks.</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#94A3B8]">
              {analysis.impactBlueprint.projectName} is broken into contributor paths, starter issues,
              skills, and effort estimates so people can help immediately.
            </p>
          </div>
          <ImpactDashboardNav active="contributors" />
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {analysis.contributorBoard.map((role) => (
            <article key={role.role} className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08201C] text-[#22C55E]">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{role.role}</h2>
                    <p className="mt-1 text-sm text-[#94A3B8]">{role.purpose}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3 py-1.5 font-mono text-xs text-[#86EFAC]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {role.estimatedEffort}
                </span>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#64748B]">Tasks</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#CFE7DF]">
                    {role.tasks.map((task) => (
                      <li key={task} className="flex gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" aria-hidden="true" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#64748B]">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.requiredSkills.map((skill) => (
                      <span key={skill} className="rounded-full border border-[#123B35] bg-[#06110F] px-3 py-1 text-xs text-[#CFE7DF]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#6EE7B7]">
                  Good First Issues
                </p>
                <div className="mt-3 grid gap-3">
                  {role.goodFirstIssues.map((issue, index) => (
                    <div key={issue.title} className="rounded-2xl border border-[#0F2A26] bg-[#000000]/50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-[#22C55E]">#{index + 1}</span>
                        <h3 className="font-semibold">{issue.title}</h3>
                        <span className="rounded-full border border-[#22C55E]/25 px-2 py-0.5 font-mono text-[11px] text-[#6EE7B7]">
                          {issue.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{issue.description}</p>
                      <p className="mt-2 font-mono text-xs text-[#64748B]">{issue.estimatedEffort}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="my-8 flex justify-end">
          <Link
            href="/developers"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
          >
            Open Developer Contribution Hub
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
