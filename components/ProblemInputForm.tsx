"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GitBranch, Leaf, Loader2, Sparkles } from "lucide-react";
import fallbackImpactData from "@/data/demo-impact-analysis.json";
import { impactDomains, type ImpactAnalysisResult, type ImpactAnalyzeRequest, type ImpactDomain } from "@/lib/schemas";

const storageKey = "ghost-engineer:impact-analysis";

function subscribeToHydration() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

const demoRequest: ImpactAnalyzeRequest = {
  domain: "Agriculture",
  problemTitle: "Irregular electricity alerts for tube-well irrigation",
  problemDescription:
    "Small farmers do not know when electricity is available for tube-well irrigation motors, so they waste time repeatedly visiting fields and may miss irrigation windows.",
  affectedUsers: "Small and marginal farmers using electric tube-well motors",
  locationContext: "Rural villages where electricity supply is irregular and internet access may be limited",
  currentWorkaround: "Farmers manually visit fields or ask neighbors to check electricity availability.",
  whyExistingSolutionsFail:
    "Most systems are expensive, internet-dependent, or not designed for low-resource rural deployment.",
  availableResources:
    "Low-cost GSM module, relay, microcontroller, local electrician support, basic web dashboard.",
  forceDemo: true,
};

const loadingSteps = [
  "Understanding problem context",
  "Mapping open-source opportunity",
  "Running impact agents",
  "Building contributor board",
  "Preparing pilot plan",
];

function isValidOptionalGitHubUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      url.hostname.toLowerCase() === "github.com" &&
      parts.length === 2 &&
      /^[A-Za-z0-9_.-]+$/.test(parts[0]) &&
      /^[A-Za-z0-9_.-]+(?:\.git)?$/.test(parts[1])
    );
  } catch {
    return false;
  }
}

export function ProblemInputForm() {
  const mounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const router = useRouter();
  const [form, setForm] = useState<ImpactAnalyzeRequest>({
    domain: "Agriculture",
    problemTitle: "",
    problemDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const completion = useMemo(() => {
    const fields = [
      form.problemTitle,
      form.problemDescription,
      form.affectedUsers,
      form.locationContext,
      form.currentWorkaround,
      form.whyExistingSolutionsFail,
      form.availableResources,
    ];
    return Math.round((fields.filter((field) => field?.trim()).length / fields.length) * 100);
  }, [form]);

  function update(field: keyof ImpactAnalyzeRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function runAnalysis(payload: ImpactAnalyzeRequest) {
    setLoading(true);
    setActiveStep(0);
    const stepTimer = window.setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, loadingSteps.length - 1));
    }, 700);

    try {
      const response = await fetch("/api/impact/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Could not generate impact blueprint.");
      }
      const result = (await response.json()) as ImpactAnalysisResult;
      localStorage.setItem(storageKey, JSON.stringify(result));
    } catch (apiError) {
      if (payload.forceDemo) {
        localStorage.setItem(storageKey, JSON.stringify(fallbackImpactData));
      } else {
        setError(apiError instanceof Error ? apiError.message : "Could not generate impact blueprint.");
        return;
      }
    } finally {
      window.clearInterval(stepTimer);
      setActiveStep(loadingSteps.length - 1);
      setLoading(false);
    }

    router.push("/blueprint");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.problemTitle.trim()) {
      setError("Add a short problem title.");
      return;
    }
    if (!form.problemDescription.trim()) {
      setError("Add a clear problem description.");
      return;
    }
    if (!isValidOptionalGitHubUrl(form.repoUrl || "")) {
      setError("Enter a valid public GitHub repository URL, or leave it empty.");
      return;
    }
    void runAnalysis({ ...form, forceDemo: false });
  }

  if (!mounted) {
    return <div className="h-[740px] rounded-3xl border border-[#123B35] bg-[#030807]/80" />;
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#123B35] bg-[#030807]/90 p-6 shadow-2xl shadow-[#00A88F]/10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08201C] text-[#22C55E]">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Impact Engine Running
            </p>
            <h2 className="text-2xl font-semibold">Generating project kit</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-3">
          {loadingSteps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                index <= activeStep
                  ? "border-[#22C55E]/45 bg-[#22C55E]/10 text-[#F8FAFC]"
                  : "border-[#123B35] bg-[#06110F]/70 text-[#64748B]"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#000000]/60 font-mono text-xs">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[#123B35] bg-[#030807]/88 p-5 shadow-2xl shadow-[#00A88F]/10 backdrop-blur"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
            Problem Intake
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Create an Impact Blueprint</h2>
        </div>
        <div className="rounded-full border border-[#123B35] bg-[#06110F] px-4 py-2 font-mono text-xs text-[#94A3B8]">
          {completion}% context filled
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#CFE7DF]">Domain</span>
          <select
            value={form.domain}
            onChange={(event) => update("domain", event.target.value as ImpactDomain)}
            className="min-h-12 rounded-2xl border border-[#123B35] bg-[#000000] px-4 text-sm text-[#FFFFFF] outline-none focus:border-[#22C55E]"
          >
            {impactDomains.map((domain) => (
              <option key={domain}>{domain}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#CFE7DF]">Problem title</span>
          <input
            value={form.problemTitle}
            onChange={(event) => update("problemTitle", event.target.value)}
            placeholder="Irregular electricity alerts for irrigation"
            autoComplete="off"
            spellCheck={false}
            className="min-h-12 rounded-2xl border border-[#123B35] bg-[#000000] px-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#55706A] focus:border-[#22C55E]"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-medium text-[#CFE7DF]">Problem description</span>
        <textarea
          value={form.problemDescription}
          onChange={(event) => update("problemDescription", event.target.value)}
          placeholder="Describe the real-world pain, who faces it, and what happens today..."
          rows={5}
          className="rounded-2xl border border-[#123B35] bg-[#000000] px-4 py-3 text-sm leading-6 text-[#FFFFFF] outline-none placeholder:text-[#55706A] focus:border-[#22C55E]"
        />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          ["affectedUsers", "Who is affected?", "Small and marginal farmers"],
          ["locationContext", "Where does this happen?", "Rural villages with irregular electricity supply"],
          ["currentWorkaround", "Current workaround", "Farmers manually visit fields to check power"],
          ["whyExistingSolutionsFail", "Why existing solutions fail", "Existing tools are costly or internet-dependent"],
          ["availableResources", "Available resources", "GSM module, local electrician, basic web dashboard"],
        ].map(([field, label, placeholder]) => (
          <label key={field} className="grid gap-2">
            <span className="text-sm font-medium text-[#CFE7DF]">{label}</span>
            <input
              value={String(form[field as keyof ImpactAnalyzeRequest] || "")}
              onChange={(event) => update(field as keyof ImpactAnalyzeRequest, event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className="min-h-12 rounded-2xl border border-[#123B35] bg-[#000000] px-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#55706A] focus:border-[#22C55E]"
            />
          </label>
        ))}
        <label className="grid gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-[#CFE7DF]">
            <GitBranch className="h-4 w-4 text-[#6EE7B7]" aria-hidden="true" />
            Optional open-source repo URL
          </span>
          <input
            value={form.repoUrl || ""}
            onChange={(event) => update("repoUrl", event.target.value)}
            placeholder="https://github.com/owner/repo"
            autoComplete="off"
            spellCheck={false}
            className="min-h-12 rounded-2xl border border-[#123B35] bg-[#000000] px-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#55706A] focus:border-[#22C55E]"
          />
          <span className="text-xs leading-5 text-[#64748B]">
            Leave blank to generate from the problem only.
          </span>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[#F59E0B]">{error}</p> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
        >
          Generate Impact Blueprint
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => void runAnalysis(demoRequest)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#08201C]/80 px-5 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#22C55E]/70 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
        >
          <Sparkles className="h-4 w-4 text-[#A3FF12]" aria-hidden="true" />
          Use Agriculture Demo
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#123B35] bg-[#06110F]/60 p-4 text-sm leading-6 text-[#94A3B8]">
        <Leaf className="h-5 w-5 shrink-0 text-[#22C55E]" aria-hidden="true" />
        A repo is optional. Ghost Engineer starts with the problem, then uses code only as reusable support.
      </div>
    </form>
  );
}
