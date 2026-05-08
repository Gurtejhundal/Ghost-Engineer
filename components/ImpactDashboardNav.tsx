import Link from "next/link";
import { Code2, FileText, GitBranch, LayoutDashboard, Users } from "lucide-react";

const links = [
  { href: "/blueprint", label: "Blueprint", icon: LayoutDashboard },
  { href: "/contributors", label: "Contributors", icon: Users },
  { href: "/developers", label: "Developers", icon: Code2 },
  { href: "/launch", label: "Launch Pack", icon: FileText },
  { href: "/create", label: "New Problem", icon: GitBranch },
];

export function ImpactDashboardNav({
  active,
}: {
  active: "blueprint" | "contributors" | "developers" | "launch";
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const selected =
          (active === "blueprint" && link.href === "/blueprint") ||
          (active === "contributors" && link.href === "/contributors") ||
          (active === "developers" && link.href === "/developers") ||
          (active === "launch" && link.href === "/launch");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
              selected
                ? "border-[#22C55E]/50 bg-[#22C55E]/15 text-[#F8FAFC]"
                : "border-[#123B35] bg-[#06110F]/70 text-[#94A3B8] hover:border-[#22C55E]/50 hover:text-white"
            }`}
          >
            <link.icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
