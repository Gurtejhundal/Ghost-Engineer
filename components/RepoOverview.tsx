import { GitFork, Star, CircleDot, CalendarDays } from "lucide-react";
import type { RepoMetadata } from "@/lib/schemas";

export function RepoOverview({ repo }: { repo: RepoMetadata }) {
  const stats = [
    { label: "Stars", value: repo.stars.toLocaleString(), icon: Star },
    { label: "Forks", value: repo.forks.toLocaleString(), icon: GitFork },
    { label: "Issues", value: repo.openIssues.toLocaleString(), icon: CircleDot },
    {
      label: "Updated",
      value: new Date(repo.updatedAt).toLocaleDateString(),
      icon: CalendarDays,
    },
  ];

  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
            Repository Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#FFFFFF]">{repo.fullName}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8FA8A2]">
            {repo.description || "No repository description provided."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#8FA8A2]">
            <span className="rounded-full border border-[#123B35] px-3 py-1">
              {repo.primaryLanguage || "Unknown language"}
            </span>
            <span className="rounded-full border border-[#123B35] px-3 py-1">
              branch: {repo.defaultBranch}
            </span>
          </div>
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#123B35] px-4 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#00D1B2]"
        >
          Open GitHub
        </a>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 p-4">
            <stat.icon className="h-4 w-4 text-[#00D1B2]" aria-hidden="true" />
            <p className="mt-3 font-mono text-xl text-[#FFFFFF]">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[#55706A]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
