"use client";

import { useEffect, useState } from "react";
import fallbackImpactData from "@/data/demo-impact-analysis.json";
import type { ImpactAnalysisResult } from "@/lib/schemas";

const storageKey = "ghost-engineer:impact-analysis";

export function useImpactAnalysis() {
  const [analysis, setAnalysis] = useState<ImpactAnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        setAnalysis(stored ? (JSON.parse(stored) as ImpactAnalysisResult) : (fallbackImpactData as ImpactAnalysisResult));
      } catch {
        setAnalysis(fallbackImpactData as ImpactAnalysisResult);
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return { analysis, loaded };
}
