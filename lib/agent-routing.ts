import { agentRoles, type AgentRole } from "@/lib/schemas";

export function agentToSlug(role: AgentRole): string {
  return role.toLowerCase().replace(/\s+/g, "-");
}

export function slugToAgent(slug: string): AgentRole | null {
  const normalized = slug.toLowerCase();
  return agentRoles.find((role) => agentToSlug(role) === normalized) ?? null;
}
