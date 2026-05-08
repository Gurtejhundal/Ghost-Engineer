"use client";

import { CalendarDays, CheckCircle2, FileText, MapPin, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ImpactDashboardNav } from "@/components/ImpactDashboardNav";
import { useImpactAnalysis } from "@/components/useImpactAnalysis";

export default function LaunchPage() {
  const { analysis, loaded } = useImpactAnalysis();

  if (!loaded || !analysis) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#000000] text-white">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#22C55E]/40" />
      </main>
    );
  }

  const pilot = analysis.pilotPlan;

  return (
    <main className="min-h-screen bg-[#000000] text-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-5 border-b border-[#0F2A26] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <BrandLogo showWordmark className="h-12 w-12" />
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Pilot and GitHub Pack
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Make the project launchable.</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#94A3B8]">
              GitHub-ready files, seven-day build order, pilot users, success metrics, and safety
              checks for {analysis.impactBlueprint.projectName}.
            </p>
          </div>
          <ImpactDashboardNav active="launch" />
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">GitHub Pack Preview</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {analysis.githubPack.map((file) => (
                <article key={file.fileName} className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-mono text-sm text-[#6EE7B7]">{file.fileName}</h3>
                    <span className="rounded-full border border-[#22C55E]/20 px-2 py-1 font-mono text-[11px] text-[#94A3B8]">
                      preview
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#CFE7DF]">{file.purpose}</p>
                  {file.suggestedContent ? (
                    <pre className="mt-3 overflow-hidden rounded-xl border border-[#0F2A26] bg-[#000000]/70 p-3 text-xs leading-5 text-[#94A3B8]">
                      {file.suggestedContent}
                    </pre>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <section className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
                <h2 className="text-2xl font-semibold">7-Day Build Plan</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {pilot.sevenDayPlan.map((day) => (
                  <div key={day.day} className="grid gap-3 rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4 md:grid-cols-[90px_1fr]">
                    <div className="font-mono text-sm text-[#6EE7B7]">Day {day.day}</div>
                    <div>
                      <h3 className="font-semibold">{day.title}</h3>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-[#94A3B8]">
                        {day.tasks.map((task) => (
                          <li key={task}>- {task}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Pilot Context</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#CFE7DF]">{pilot.pilotUsers}</p>
            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">{pilot.locationContext}</p>
          </div>
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <h2 className="text-xl font-semibold">Success Metrics</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
              {pilot.successMetrics.map((metric) => (
                <li key={metric} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" aria-hidden="true" />
                  {metric}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Safety Checklist</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CFE7DF]">
              {pilot.safetyChecklist.map((check) => (
                <li key={check} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="my-8 rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
            Council Final Decision
          </p>
          <p className="mt-3 text-lg leading-8 text-[#F8FAFC]">{analysis.debate.finalDecision}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {analysis.debate.comments.map((comment) => (
              <article key={`${comment.role}-${comment.position}`} className="rounded-2xl border border-[#123B35] bg-[#030807]/70 p-4">
                <h3 className="font-semibold">{comment.role}</h3>
                <p className="mt-2 text-sm text-[#6EE7B7]">{comment.position}</p>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{comment.reasoning}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
