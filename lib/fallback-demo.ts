import demoAnalysis from "@/data/demo-analysis.json";
import type { AnalysisResult } from "@/lib/schemas";

export function getFallbackAnalysis(): AnalysisResult {
  return {
    ...(demoAnalysis as AnalysisResult),
    mode: "fallback",
  };
}
