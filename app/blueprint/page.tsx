"use client";

import { AlertTriangle, ArrowRight, BadgeCheck, Boxes, GitBranch, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { DownloadImpactReportButton } from "@/components/DownloadImpactReportButton";
import { ImpactDashboardNav } from "@/components/ImpactDashboardNav";
import { ImpactScoreCard } from "@/components/ImpactScoreCard";
import { useImpactAnalysis } from "@/components/useImpactAnalysis";

function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3 py-1.5 text-sm text-[#CFE7DF]">
          {item}
        </span>
      ))}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BlueprintPage() {
  const { analysis, loaded } = useImpactAnalysis();

  if (!loaded || !analysis) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#000000] text-white">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#22C55E]/40" />
      </main>
    );
  }

  const blueprint = analysis.impactBlueprint;
  const repoProvided = analysis.repoContext.provided;

  return (
    <main className="min-h-screen bg-[#000000] text-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,197,94,0.18),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <BrandLogo showWordmark className="h-12 w-12" />
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Impact Blueprint
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">{blueprint.projectName}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#94A3B8]">{blueprint.mission}</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#22C55E]/35 bg-[#22C55E]/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-[#86EFAC]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {analysis.mode === "live" ? "Live Impact Analysis" : "Fallback Analysis"}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <DownloadImpactReportButton analysis={analysis} variant="full" />
              <DownloadImpactReportButton
                analysis={analysis}
                variant="developer"
                label="Download Detailed Report"
              />
            </div>
            <ImpactDashboardNav active="blueprint" />
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
                Problem Summary
              </p>
            </div>
            <p className="mt-4 text-lg leading-8 text-[#F8FAFC]">{blueprint.problemSummary}</p>
            <div className="mt-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-[#64748B]">
                Target Users
              </p>
              <PillList items={blueprint.targetUsers} />
            </div>
          </div>

          <div className="grid gap-5">
            <ImpactScoreCard label="Impact Score" value={blueprint.impactScore} />
            <ImpactScoreCard label="Feasibility Score" value={blueprint.feasibilityScore} tone="feasibility" />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-5">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Open-source opportunity</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#CFE7DF]">{blueprint.openSourceOpportunity}</p>
          </div>
          <div className="rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-5">
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-xl font-semibold">{repoProvided ? "Reusable Parts" : "Recommended Components"}</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
              {(repoProvided ? blueprint.reusableParts : blueprint.recommendedOpenSourceComponents).map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <ListCard title="MVP Features" items={blueprint.mvpFeatures} />
          <ListCard title="Technical Approach" items={blueprint.technicalApproach} />
          <ListCard title="Missing Parts" items={blueprint.missingParts} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Safety and trust concerns</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
              {blueprint.safetyAndTrustConcerns.map((concern) => (
                <li key={concern} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Four-Agent Review
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {analysis.agents.map((agent) => (
                <article key={agent.role} className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{agent.role}</h3>
                    <span className="font-mono text-xs text-[#6EE7B7]">{agent.priorityScore}%</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{agent.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="my-8 flex justify-end">
          <Link
            href="/contributors"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
          >
            Open Contributor Board
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
