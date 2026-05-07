import {
  ArrowRight,
  Bot,
  Braces,
  Gauge,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HeroSpline } from "@/components/HeroSpline";
import { RepoInput } from "@/components/RepoInput";

const features = [
  {
    title: "Repo Understanding",
    description:
      "Detect stack, structure, entry points, and important files before AI analysis.",
    icon: GitBranch,
  },
  {
    title: "Expert Agents",
    description:
      "Architect, Debugger, Security Reviewer, and Product Manager review the same repository.",
    icon: Bot,
  },
  {
    title: "Fix Plan",
    description: "Convert analysis into what to read, fix, build, and ignore.",
    icon: Gauge,
  },
];

const agents = ["Architect", "Debugger", "Security Reviewer", "Product Manager"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#000000] text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,168,143,0.2),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(0,209,178,0.13),transparent_25%)]" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#123B35] bg-[#06110F] text-[#00D1B2]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-wide">Ghost Engineer</span>
        </div>
        <a
          href="#summon"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#123B35] px-4 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#00D1B2]"
        >
          Summon Council
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      <section id="summon" className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:min-h-[calc(100vh-92px)] lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:py-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#00D1B2]">
            AI Engineering Council
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-[#FFFFFF] md:text-7xl">
            Summon an AI engineering council for any GitHub repo.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8FA8A2]">
            Ghost Engineer analyzes a public repository through architecture, debugging,
            security, and product perspectives, then turns the review into a fix plan.
          </p>
          <div className="mt-8">
            <RepoInput />
          </div>
        </div>
        <HeroSpline />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5 backdrop-blur transition hover:border-[#00D1B2]/50"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#08201C] text-[#00D1B2]">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#8FA8A2]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-12 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00A88F]">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-semibold">From repository URL to senior review.</h2>
          <p className="mt-4 text-sm leading-7 text-[#8FA8A2]">
            The app fetches public metadata, README, the file tree, and selected important
            files. It compresses that context before routing it through four focused agents.
          </p>
        </div>
        <div className="grid gap-3">
          {[
            "Validate public GitHub repository URL",
            "Fetch README, metadata, tree, and important files",
            "Detect stack, folders, entry points, and config",
            "Generate dashboard-ready council output",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-4 rounded-2xl border border-[#123B35] bg-[#06110F]/65 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#08201C] font-mono text-sm text-[#00D1B2]">
                {index + 1}
              </span>
              <span className="text-sm text-[#CFE7DF]">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00D1B2]">
                Agent Preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Exactly four expert perspectives.</h2>
            </div>
            <Braces className="h-9 w-9 text-[#00A88F]" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {agents.map((agent) => (
              <div key={agent} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
                <ShieldCheck className="h-5 w-5 text-[#00D1B2]" aria-hidden="true" />
                <p className="mt-4 font-semibold">{agent}</p>
                <p className="mt-2 text-sm text-[#55706A]">Structured review, risks, and actions.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-5 rounded-3xl border border-[#123B35] bg-[#06110F]/70 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#A3FF12]">
              Demo Reliable
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Live when possible. Complete when not.</h2>
            <p className="mt-3 text-sm leading-6 text-[#8FA8A2]">
              If GitHub or AI providers fail, Ghost Engineer continues with an intentional
              fallback report instead of leaving the user stuck.
            </p>
          </div>
          <RepoInput compact />
        </div>
      </section>
    </main>
  );
}
