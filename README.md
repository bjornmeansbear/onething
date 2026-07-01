# One Thing

A personal executive-functioning tool — a focusing lens on top of a Notion task database that surfaces ONE task at a time. See [CLAUDE-CODE-HANDOFF.md](./CLAUDE-CODE-HANDOFF.md) for the full product spec, build status, and design principles.

## Stack

- SvelteKit (Svelte 5) + Tailwind CSS
- Notion API (read/write tasks)
- Claude API (`claude-sonnet-4-20250514`) for AI-powered task sorting
- Deploy target: Cloudflare Pages (`@sveltejs/adapter-cloudflare`)

## Setup

```bash
npm install
cp .env.example .env   # fill in NOTION_TOKEN, NOTION_DATABASE_ID, ANTHROPIC_API_KEY
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run preview` — production build / preview
- `npm run check` — svelte-check + type checking

## Env vars

| Var | Purpose |
|---|---|
| `NOTION_TOKEN` | Notion integration token (read tasks, mark done) |
| `NOTION_DATABASE_ID` | Tasks database ID |
| `ANTHROPIC_API_KEY` | Claude API key for `/api/sort` |
