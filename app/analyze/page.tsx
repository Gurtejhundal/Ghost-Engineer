"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanningSequence } from "@/components/ScanningSequence";
import { FallbackNotice } from "@/components/FallbackNotice";
import fallbackData from "@/data/demo-analysis.json";
import type { AnalysisResult } from "@/lib/schemas";

const storageKey = "ghost-engineer:analysis";

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [fallback, setFallback] = useState(false);

  const request = useMemo(() => {
    const repoUrl =
      searchParams.get("repoUrl") ||
      (typeof window !== "undefined" ? localStorage.getItem("ghost-engineer:repoUrl") : "") ||
      "";
    const forceDemo =
      searchParams.get("forceDemo") === "1" ||
      (typeof window !== "undefined" &&
        localStorage.getItem("ghost-engineer:forceDemo") === "true");
    return { repoUrl, forceDemo };
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, 5));
    }, 650);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 32_000);

    async function analyze() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error("API_FAILED");
        const result = (await response.json()) as AnalysisResult;
        if (cancelled) return;
        setFallback(result.mode === "fallback");
        localStorage.setItem(storageKey, JSON.stringify(result));
      } catch {
        if (cancelled) return;
        const result = fallbackData as AnalysisResult;
        setFallback(true);
        localStorage.setItem(storageKey, JSON.stringify(result));
      } finally {
        clearTimeout(timeout);
        if (!cancelled) {
          setActiveStep(5);
          setTimeout(() => router.push("/dashboard"), 950);
        }
      }
    }

    analyze();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [request, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#000000] px-5 py-10 text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,168,143,0.22),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(0,209,178,0.12),transparent_30%)]" />
      <div className="relative z-10 w-full">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#00D1B2]">
            Council Scan In Progress
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Summoning the Ghost Council</h1>
          <p className="mt-4 text-sm leading-6 text-[#8FA8A2]">
            Repository context is being compressed before the four agents generate a structured
            engineering review.
          </p>
        </div>
        <ScanningSequence activeStep={activeStep} />
        {fallback ? (
          <div className="mx-auto mt-5 max-w-4xl">
            <FallbackNotice />
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#000000] text-[#FFFFFF]">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#00D1B2]/40" />
        </main>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
