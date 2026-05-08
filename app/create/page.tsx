import { ArrowLeft, ClipboardList, GitBranch, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ProblemInputForm } from "@/components/ProblemInputForm";

const previewItems = [
  {
    title: "Impact Blueprint",
    body: "Mission, target users, MVP features, technical approach, and impact scores.",
    icon: ClipboardList,
  },
  {
    title: "Contributor Board",
    body: "Role-based tasks, good-first-issues, required skills, and effort estimates.",
    icon: GitBranch,
  },
  {
    title: "Pilot Plan",
    body: "Pilot users, success metrics, safety checklist, and a 7-day build path.",
    icon: MapPin,
  },
  {
    title: "Safety Review",
    body: "Trust, privacy, field risks, and what should not be automated in the MVP.",
    icon: ShieldCheck,
  },
];

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_26%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6">
        <header className="flex items-center justify-between border-b border-[#0F2A26] pb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <BrandLogo showWordmark className="h-11 w-11" />
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <ProblemInputForm />
          <aside className="rounded-3xl border border-[#123B35] bg-[#06110F]/72 p-5 backdrop-blur lg:sticky lg:top-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6EE7B7]">
              Output Preview
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Problem to public-good project kit.</h1>
            <p className="mt-4 text-sm leading-7 text-[#94A3B8]">
              Fill the form with a real social problem. Ghost Engineer will turn it into an
              open-source blueprint, contributor plan, GitHub Pack, and pilot plan.
            </p>
            <div className="mt-6 grid gap-3">
              {previewItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#123B35] bg-[#030807]/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#08201C] text-[#22C55E]">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-[#94A3B8]">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
