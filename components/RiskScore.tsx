import type { RiskScore as RiskScoreType } from "@/lib/schemas";

const items: { key: keyof RiskScoreType; label: string; inverted?: boolean }[] = [
  { key: "architectureRisk", label: "Architecture Risk" },
  { key: "debuggingComplexity", label: "Debugging Complexity" },
  { key: "securityRisk", label: "Security Risk" },
  { key: "productClarity", label: "Product Clarity", inverted: true },
  { key: "overallHealth", label: "Overall Health", inverted: true },
];

function colorFor(value: number, inverted?: boolean): string {
  const risk = inverted ? 100 - value : value;
  if (risk >= 70) return "#FF4D4D";
  if (risk >= 45) return "#A3FF12";
  return "#7CFF00";
}

export function RiskScore({ riskScore }: { riskScore: RiskScoreType }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
            Risk Score
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#FFFFFF]">Engineering health signal</h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-4xl font-semibold text-[#FFFFFF]">
            {riskScore.overallHealth}
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-[#55706A]">Overall</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {items.map((item) => {
          const value = riskScore[item.key];
          const color = colorFor(value, item.inverted);
          return (
            <div key={item.key} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
              <div className="h-2 rounded-full bg-[#123B35]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, backgroundColor: color }}
                />
              </div>
              <p className="mt-4 font-mono text-2xl text-[#FFFFFF]">{value}</p>
              <p className="mt-1 text-xs leading-4 text-[#8FA8A2]">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
