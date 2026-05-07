import { MessagesSquare } from "lucide-react";
import type { AnalysisResult } from "@/lib/schemas";

export function DebatePanel({ debate }: { debate: AnalysisResult["debate"] }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#08201C] text-[#00A88F]">
          <MessagesSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00A88F]">
            Agent Debate
          </p>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Trade-off room</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {debate.comments.map((comment) => (
          <div key={comment.role} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
            <p className="font-mono text-sm text-[#00D1B2]">{comment.role}</p>
            <p className="mt-2 font-semibold text-[#FFFFFF]">{comment.position}</p>
            <p className="mt-2 text-sm leading-6 text-[#8FA8A2]">{comment.reasoning}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-[#00A88F]/35 bg-[#00A88F]/10 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#A3FF12]">
          Final Decision
        </p>
        <p className="mt-2 text-sm leading-6 text-[#FFFFFF]">{debate.finalDecision}</p>
      </div>
    </section>
  );
}
