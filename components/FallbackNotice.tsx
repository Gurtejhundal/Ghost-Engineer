import { AlertTriangle } from "lucide-react";

export function FallbackNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#A3FF12]/40 bg-[#A3FF12]/10 p-4 text-sm text-[#FFFFFF]">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A3FF12]" aria-hidden="true" />
      <div>
        <p className="font-semibold">Fallback Analysis Mode</p>
        <p className="mt-1 text-[#CFE7DF]">
          Live AI analysis is unavailable. Showing a safe fallback report from available repo data.
        </p>
      </div>
    </div>
  );
}
