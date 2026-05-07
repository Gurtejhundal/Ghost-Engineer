import { AlertTriangle } from "lucide-react";

export function FallbackNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#A3FF12]/40 bg-[#A3FF12]/10 p-4 text-sm text-[#FFFFFF]">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A3FF12]" aria-hidden="true" />
      <div>
        <p className="font-semibold">Fallback Demo Mode</p>
        <p className="mt-1 text-[#CFE7DF]">
          Live analysis is unavailable. Showing demo analysis mode.
        </p>
      </div>
    </div>
  );
}
