# Ghost Engineer

Ghost Engineer is a hackathon MVP that turns a public GitHub repository URL into a senior-style engineering review dashboard.

The app fetches public repo metadata, README content, the file tree, and selected important files. It detects the stack and sends compact context through exactly four AI agents:

- Architect
- Debugger
- Security Reviewer
- Product Manager

The dashboard shows repository overview, detected stack, architecture summary, risk score, start-here files, agent reviews, agent debate, and a fix plan.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill any available keys.

```txt
GEMINI_API_KEY=
GROQ_API_KEY=
GITHUB_TOKEN=
NEXT_PUBLIC_SPLINE_SCENE_URL=
```

`GITHUB_TOKEN` is optional. AI keys stay server-side. The app still works without keys by returning the local fallback demo report.

## Routes

- `/` landing and repo input
- `/analyze` scanning flow
- `/dashboard` Ghost Council report
- `/api/analyze` stateless analysis API

## MVP Boundaries

This build intentionally excludes login, database persistence, payments, profiles, saved history, private repository access, GitHub OAuth, comments, settings, pull request creation, and automatic code modification.
