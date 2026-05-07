import { CheckCircle2, Clock3, Eye, Wrench } from "lucide-react";
import type { FixPlan } from "@/lib/schemas";

const groups: { key: keyof FixPlan; label: string; icon: typeof Eye; color: string }[] = [
  { key: "understandFirst", label: "Understand First", icon: Eye, color: "#2EF5D0" },
  { key: "fixFirst", label: "Fix First", icon: Wrench, color: "#A3FF12" },
  { key: "buildNext", label: "Build Next", icon: CheckCircle2, color: "#7CFF00" },
  { key: "ignoreForNow", label: "Ignore For Now", icon: Clock3, color: "#55706A" },
];

export function FixPlanPanel({ fixPlan }: { fixPlan: FixPlan }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">Fix Plan</p>
      <h2 className="mt-2 text-xl font-semibold text-[#FFFFFF]">Council execution order</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.key} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: group.color }} aria-hidden="true" />
                <h3 className="font-semibold text-[#FFFFFF]">{group.label}</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-5 text-[#8FA8A2]">
                {fixPlan[group.key].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
