type ImpactScoreCardProps = {
  label: string;
  value: number;
  tone?: "impact" | "feasibility";
};

export function ImpactScoreCard({ label, value, tone = "impact" }: ImpactScoreCardProps) {
  const color = tone === "impact" ? "#22C55E" : "#10B981";
  return (
    <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#94A3B8]">{label}</p>
        <p className="font-mono text-4xl font-semibold text-[#F8FAFC]">{value}</p>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#0F2A26]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, #6EE7B7)`,
          }}
        />
      </div>
    </div>
  );
}
