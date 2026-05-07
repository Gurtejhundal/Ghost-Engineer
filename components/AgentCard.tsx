import Link from "next/link";
import { Bug, Crown, ExternalLink, Lightbulb, ShieldCheck } from "lucide-react";
import { agentToSlug } from "@/lib/agent-routing";
import type { AgentReview } from "@/lib/schemas";

const iconMap = {
  Architect: Crown,
  Debugger: Bug,
  "Security Reviewer": ShieldCheck,
  "Product Manager": Lightbulb,
};

const severityClass = {
  low: "border-[#7CFF00]/30 text-[#7CFF00]",
  medium: "border-[#A3FF12]/30 text-[#A3FF12]",
  high: "border-[#FF4D4D]/30 text-[#FF4D4D]",
};

export function AgentCard({ agent }: { agent: AgentReview }) {
  const Icon = iconMap[agent.role];
  const href = `/dashboard/agent/${agentToSlug(agent.role)}`;

  return (
    <article className="group rounded-3xl border border-[#123B35] bg-[#06110F]/75 p-5 shadow-xl shadow-black/20 transition hover:border-[#00D1B2]/50 hover:shadow-[#00D1B2]/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#08201C] text-[#00D1B2]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#FFFFFF]">{agent.role}</h3>
            <p className="font-mono text-xs text-[#55706A]">priority {agent.priorityScore}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#123B35] px-3 py-2 text-right">
          <p className="font-mono text-sm text-[#FFFFFF]">{agent.confidenceScore}%</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#55706A]">confidence</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#CFE7DF]">{agent.summary}</p>

      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">Top Findings</p>
        <ul className="mt-3 space-y-2 text-sm text-[#8FA8A2]">
          {agent.topFindings.map((finding) => (
            <li key={finding} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D1B2]" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">Risks</p>
        {agent.risks.map((risk) => (
          <div key={risk.title} className="rounded-2xl border border-[#0F2A26] bg-[#030807]/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[#FFFFFF]">{risk.title}</p>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${severityClass[risk.severity]}`}
              >
                {risk.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-[#8FA8A2]">{risk.explanation}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55706A]">
          Recommendations
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#CFE7DF]">
          {agent.recommendations.map((recommendation) => (
            <li key={recommendation} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00A88F]" />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A88F] to-[#00D1B2] px-4 text-sm font-semibold text-white shadow-lg shadow-[#00A88F]/20 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#00D1B2]"
        aria-label={`Open ${agent.role} dedicated report in a new window`}
      >
        Open Dedicated Report
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
