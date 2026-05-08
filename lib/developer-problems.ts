export const openProblemQueue = [
  {
    domain: "Agriculture",
    title: "Electricity alerts for irrigation pumps",
    summary:
      "Small farmers miss irrigation windows because electricity availability is irregular and checking pumps manually wastes time.",
    needs: ["Embedded Developer", "Field Tester", "Documentation Writer"],
    starter: "Prototype an SMS alert flow and write FIELD_TESTING.md safety notes.",
  },
  {
    domain: "Education",
    title: "Offline homework support for low-connectivity students",
    summary:
      "Students in low-connectivity areas cannot reliably access homework help or teacher feedback after school.",
    needs: ["Frontend Developer", "Content Designer", "Teacher Partner"],
    starter: "Design an offline-first assignment packet and a teacher feedback checklist.",
  },
  {
    domain: "Healthcare",
    title: "Medication reminder kits for rural clinics",
    summary:
      "Community clinics need a simple consent-based reminder workflow for recurring medication schedules.",
    needs: ["Backend Developer", "Safety Reviewer", "Documentation Writer"],
    starter: "Draft privacy-safe reminder data schema and safety limitations.",
  },
  {
    domain: "Environment",
    title: "Neighborhood waste reporting without app installs",
    summary:
      "Residents need a lightweight way to report recurring waste hotspots without downloading a heavy app.",
    needs: ["Frontend Developer", "Local Governance Partner", "Designer"],
    starter: "Create a mobile web report flow and public status board concept.",
  },
];

export type DeveloperProblem = (typeof openProblemQueue)[number];

export function buildProblemBrief(problem: DeveloperProblem) {
  return `# ${problem.title}

Domain: ${problem.domain}

## Problem
${problem.summary}

## Contributors Needed
${problem.needs.map((need) => `- ${need}`).join("\n")}

## Starter Contribution
${problem.starter}
`;
}
