import {
  ArrowRight,
  ClipboardList,
  Code2,
  FileText,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { HeroSpline } from "@/components/HeroSpline";

const features = [
  {
    title: "Impact Blueprint",
    description:
      "Convert a real-world problem into mission, target users, MVP features, impact score, and feasibility score.",
    icon: ClipboardList,
  },
  {
    title: "Contributor Board",
    description:
      "Generate open-source roles, good-first-issues, required skills, and tasks for code and non-code contributors.",
    icon: Users,
  },
  {
    title: "Pilot Launch Plan",
    description: "Define field users, success metrics, safety checks, GitHub files, and a 7-day build path.",
    icon: MapPin,
  },
];

const trustBadges = [
  "No login required",
  "Problem-first workflow",
  "Optional GitHub repo",
  "Fallback demo ready",
];

const workflow = [
  {
    title: "Enter the problem",
    body: "Capture domain, affected users, current workaround, failure points, and available resources.",
  },
  {
    title: "Map the opportunity",
    body: "Identify the smallest public-good project that contributors can actually build and pilot.",
  },
  {
    title: "Generate the kit",
    body: "Produce blueprint, agent reviews, contributor roles, GitHub Pack, and launch plan.",
  },
  {
    title: "Pilot in the field",
    body: "Define users, metrics, safety checks, seven-day build plan, and next steps.",
  },
];

const agents = [
  {
    role: "Open-Source Architect",
    focus: "Shapes repo structure, reusable modules, missing parts, and contributor-friendly docs.",
  },
  {
    role: "Feasibility Reviewer",
    focus: "Cuts the MVP down to what a team can build, demo, and pilot in one week.",
  },
  {
    role: "Safety & Trust Reviewer",
    focus: "Flags privacy, reliability, vulnerable-user, and field-deployment risks.",
  },
  {
    role: "Impact Product Manager",
    focus: "Defines users, value, pilot metrics, demo story, and what to ignore for now.",
  },
];

const githubPack = [
  "README.md",
  "CONTRIBUTING.md",
  "ROADMAP.md",
  "ISSUES.md",
  "FIELD_TESTING.md",
  "IMPACT_REPORT.md",
];

const developerProblems = [
  {
    domain: "Agriculture",
    title: "Electricity alerts for irrigation pumps",
    need: "Firmware, SMS flow, field testing",
  },
  {
    domain: "Education",
    title: "Offline homework support for low-connectivity students",
    need: "Mobile UI, content workflow, teacher feedback",
  },
  {
    domain: "Healthcare",
    title: "Medication reminder kits for rural clinics",
    need: "Privacy review, alert UX, pilot metrics",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#000000] text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,168,143,0.2),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(0,209,178,0.13),transparent_25%)]" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <BrandLogo showWordmark className="h-11 w-11" />
        <Link
          href="/create"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#123B35] px-4 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#00D1B2]"
        >
          Create Impact Blueprint
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section id="summon" className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:min-h-[calc(100vh-92px)] lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:py-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#00D1B2]">
            Open-Source Impact Lab
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-[#FFFFFF] md:text-7xl">
            Fork open-source code into real-world impact.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8FA8A2]">
            Ghost Engineer turns society problems into buildable open-source blueprints with
            contributor tasks, GitHub-ready files, impact scores, and pilot plans.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
            >
              Create Impact Blueprint
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/create"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#123B35] bg-[#08201C]/80 px-5 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#22C55E]/70"
            >
              View Demo Problem
              <Leaf className="h-4 w-4 text-[#A3FF12]" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <HeroSpline />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-2">
        <div className="grid gap-3 rounded-3xl border border-[#123B35] bg-[#030807]/70 p-3 backdrop-blur md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex min-h-14 items-center gap-3 rounded-2xl bg-[#06110F]/80 px-4">
              <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_18px_rgba(34,197,94,0.75)]" />
              <span className="text-sm font-medium text-[#CFE7DF]">{badge}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
              Output System
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Not an idea generator. A launch kit.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#94A3B8]">
              Ghost Engineer turns messy social context into a practical open-source package:
              what to build, who should help, what files to publish, and how to test impact safely.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["91", "Impact target"],
                ["7 days", "Build plan"],
                ["4 agents", "Impact review"],
                ["0 login", "Demo friction"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[#123B35] bg-[#06110F]/80 p-4">
                  <p className="font-mono text-2xl font-semibold text-[#F8FAFC]">{value}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#64748B]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-5 backdrop-blur transition hover:border-[#22C55E]/55 hover:bg-[#092018]/80"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#08201C] text-[#22C55E] transition group-hover:scale-105">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#64748B]">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{feature.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#10B981]">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Real problem to pilot path.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#94A3B8]">
            The repo analyzer is still available, but it no longer drives the product. The problem
            does. Code only enters when it helps the public-good build.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {workflow.map((step, index) => (
            <article
              key={step.title}
              className="relative overflow-hidden rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#22C55E]/10 blur-2xl" />
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#08201C] font-mono text-sm text-[#6EE7B7]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-6 rounded-3xl border border-[#123B35] bg-[#030807]/82 p-5 md:p-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#08201C] text-[#22C55E]">
              <HeartHandshake className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
              Impact Council
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Four agents, one field-ready decision.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#94A3B8]">
              Each agent reviews the same problem through a different public-good lens. The final
              result is structured output, not a chat transcript.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {agents.map((agent) => (
              <article key={agent.role} className="rounded-2xl border border-[#123B35] bg-[#06110F]/70 p-4">
                <ShieldCheck className="h-5 w-5 text-[#22C55E]" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{agent.role}</h3>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{agent.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#A3FF12]">
              GitHub Pack
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Files that make an idea contributable.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {githubPack.map((file) => (
                <div key={file} className="flex items-center gap-3 rounded-2xl border border-[#123B35] bg-[#030807]/70 p-4">
                  <FileText className="h-4 w-4 shrink-0 text-[#6EE7B7]" aria-hidden="true" />
                  <span className="font-mono text-sm text-[#CFE7DF]">{file}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#123B35] bg-[#030807]/82 p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
              Pilot Ready
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Built for the judge demo and the field.</h2>
            <p className="mt-4 text-sm leading-7 text-[#94A3B8]">
              If AI or GitHub support fails, Ghost Engineer continues with a complete agriculture
              demo so the story never collapses during presentation.
            </p>
            <Link
              href="/create"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
            >
              Start Impact Blueprint
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8">
        <div className="grid gap-6 rounded-3xl border border-[#123B35] bg-[#030807]/86 p-6 md:p-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#08201C] text-[#22C55E]">
              <Code2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
              For Developers
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Browse problems. Pick an issue. Contribute with purpose.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#94A3B8]">
              The developer hub turns every Impact Blueprint into copy-ready issue drafts, roles,
              skills, safety limits, and GitHub Pack files so contributors can start quickly.
            </p>
            <Link
              href="/developers"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#10B981] px-5 text-sm font-semibold text-white shadow-lg shadow-[#22C55E]/20"
            >
              Open Developer Hub
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3">
            {developerProblems.map((problem) => (
              <article key={problem.title} className="rounded-2xl border border-[#123B35] bg-[#06110F]/72 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#86EFAC]">
                    {problem.domain}
                  </span>
                  <span className="font-mono text-xs text-[#64748B]">open problem</span>
                </div>
                <h3 className="mt-3 font-semibold">{problem.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{problem.need}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
