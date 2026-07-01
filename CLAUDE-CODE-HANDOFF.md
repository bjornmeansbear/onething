# One Thing — Claude Code Handoff

## Status (updated as we go)

- Done: scaffold, Notion read/write, triage screen, AI sorting, focus screen + card stack, onboarding questions (build priorities 1–6).
- Done: color palette — OKLCH scales + semantic tokens (`--color-bg`, `--color-accent`, etc.) live in `src/app.css`, applied throughout `+page.svelte`. Accent (pink) used on primary CTAs and the "focus protected" banner; URGENT badge intentionally left black/white (no red badges, per design principles). See `palette-docs.html` for the reference tool this was derived from.
- Done: visual style moved away from literal Mac OS 9 chrome — plain system font (no bitmap typeface), no title-bar/dot/shadow, bigger type, more whitespace, structure carried by solid black rules instead of boxed "windows." Reference points: bjornpaedia.wjerk.shop and a.wjerk.shop (plain sans-serif, thin black rules, no decoration). Muted/subtle text tokens were also fixed — they were failing WCAG AA (as low as 2.7:1) against the light background; `--color-text-muted` is now gray-6 (7.3:1) and all borders/dividers use `--color-text` (near-black) instead of pale grays, since low-contrast gray-on-gray was flagged as a real accessibility problem, not just a style note.
- Done: PWA icons — `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180), `favicon.png` + `favicon.svg` all live in `static/`, wired into `manifest.json` and `app.html`. No service worker yet (not required for install/home-screen use).
- Not started: first live Cloudflare Pages deploy (local Cloudflare-runtime testing is confirmed working — see "Local development & deploy" below).
- See `README.md` for stack/setup.

## Local development & deploy

Three levels of "run it locally," fastest to most accurate:

- `npm run dev` — Vite dev server. Fastest iteration; reads secrets from `.env`.
- `npm run preview` — production build + Vite preview (not the real Workers runtime).
- `npm run preview:cf` — builds, then runs the **actual Cloudflare Pages Functions runtime locally** via `wrangler pages dev` (Miniflare). Reads secrets from `.dev.vars` (gitignored — copy `.dev.vars.example` and fill in real values, same vars as `.env`). This is the closest thing to production and is confirmed working end-to-end against the real Notion database.

To deploy for real, two options:

1. **Git-connected Pages project (recommended for ongoing use)** — in the Cloudflare dashboard: Workers & Pages → Create → Pages → Connect to Git → this repo. Build command `npm run build`, build output directory `.svelte-kit/cloudflare`. Add `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `ANTHROPIC_API_KEY` as environment variables/secrets in the Pages project settings (these are separate from `.dev.vars` — they don't get uploaded automatically). Every push to `main` auto-deploys after this is set up.
2. **One-off CLI deploy** — `npx wrangler login` once, then `npm run deploy` (builds and runs `wrangler pages deploy`). Still need to set the same three secrets in the dashboard (or via `wrangler pages secret put <NAME>`) for the deployed environment.

Wrangler is currently v3.114 (devDependency pinned to `^3.0.0`); a v4 upgrade is available but untested here.

## Decisions log

- **Docs live in `README.md` (setup/stack) + this file's Status section (current build state)** rather than a separate docs file — avoids doc sprawl since this handoff doc already existed with a build-priorities checklist.
- **Color palette accent (pink-5/6) applied to primary CTAs and the "focus protected" banner only** — everything else relies on the near-black text/border color, not additional hues. The `palette-*.html` files in the repo root are a scratch OKLCH color-scale generator (saved from an earlier `/tmp` session, not derived from any external design system) — `palette-docs.html`'s semantic token table is the source of truth for what each `--color-*` variable in `src/app.css` maps to.
- **URGENT badge kept plain black/white, not red** — the design principles explicitly rule out red badges/guilt mechanics, so this stayed monochrome even after the accent color was introduced elsewhere.
- **Dropped the literal Mac OS 9 window chrome (bitmap font, title-bar gradient, dot, drop shadow) in favor of a plainer look** — plain system font, bigger type, generous whitespace, black rules/borders instead of boxed chrome. Also collapsed `--color-surface`/`--color-surface-2` down to the same value as `--color-bg`, and `--color-border`/`--color-border-subtle` down to `--color-text` — the previous pale-gray borders and mid-gray "muted"/"subtle" text were real WCAG failures (as low as 1.2:1 for borders, 2.7:1 for subtle text against the light background), not just a style preference. If adding new UI, keep text/border colors to `--color-text` (near-black) or `--color-text-muted` (gray-6, 7.3:1) — don't reintroduce mid-gray (gray-3/4/5) as text or border color against this background.

## What is this?

Read the full product spec in Notion first:
https://www.notion.so/35455aa28d7181d7a1e8fc0466dc1cc2

"One Thing" is a personal executive functioning tool — a focusing lens that sits on top of a Notion task database and surfaces ONE task at a time. It's not a task manager. It pulls tasks from Notion, uses AI to sort them using 4 priority questions, and presents them as a visual card stack. You complete one, it shows you the next. The stack shrinks as you go.

## Tech stack

- SvelteKit + Tailwind CSS
- Notion API for read/write (tasks database)
- Claude API (claude-sonnet-4-20250514) for AI-powered task sorting
- Mobile-first PWA (needs to work on phone home screen)
- Aesthetic: plain, black-and-white, functional, no visual fluff — originally modeled on Mac OS 9 Finder chrome, since simplified toward a plainer look (see Decisions log); "no visual fluff" still holds

## Key Notion details

- Tasks database data source: `collection://13055aa2-8d71-81d2-aa64-000b8f7dbfac`
- Database view URL: `https://app.notion.com/p/13055aa28d7181f6a5bbc0d59cc62ded?v=13055aa2-8d71-8155-a2f9-000cb5a2d29b`
- Key fields: Name (title), Done (checkbox), Important (checkbox), Urgent (checkbox), Due Date (date), Effort (select), Impact (select), Time Estimate (select), Project (relation), Delegate To (multi_select)
- To mark a task done: update the "Done" checkbox to "__YES__"

## The 4 sorting questions (used by AI to rank tasks)

1. What breaks if I don't do this today? — consequences, urgency
2. Does this make other things easier? — leverage, unlocking
3. Can I finish this in one sitting? — sizing
4. What's the best thing that happens if I DO this? — positive value

## App flow

### Onboarding (start of session)
Before showing the triage list, ask 3 quick questions:
- "Is there anything you already know is important today?"
- "What meetings do you have today?"
- "Anything from yesterday you didn't get to?"
These seed the AI's sorting context.

### Triage screen
- Pull incomplete tasks from Notion
- User checks which ones need attention TODAY (not "is this important" — "does it need to be today?")
- Aim for 3-7 tasks
- Hit "Build Today's Stack" → AI sorts them

### Focus screen
- Shows ONE card at a time
- Visual card stack behind it (3px offset per card, up to 8 visible)
- Stack shrinks as you complete tasks
- "Your focus is protected. No email until task 1 is done."
- ✓ Done button marks it done in Notion AND advances to next card
- Skip button advances without marking done
- Bridge belief mantras at bottom

### Done screen
- "Stack complete. X tasks done today. Everything else can wait."
- Option to start a new stack

## Design principles (from the product spec)

- Accessibility (WCAG AA minimum) is a standing requirement, checked as color/type decisions are made — not eyeballed after. See [ADA web guidance](https://www.ada.gov/resources/web-guidance/), [WCAG](https://www.wcag.com/), [A11y Project](https://www.a11yproject.com/). This is a global rule (see `~/.claude/CLAUDE.md`), called out here because it already caught a real contrast failure once — see Decisions log.
- No visible task lists anywhere
- No red badges, no overdue warnings, no guilt mechanics
- Stack resets without judgment
- Progress = shrinking stack, not empty progress bar
- "No email" is framed as protection, not restriction
- The app is a focusing lens, not a task manager

## Reference prototype

See `one-thing-prototype.jsx` — this is a working React prototype built during our design session. Use it as a reference for the UI behavior and card stack component, but rebuild everything in SvelteKit + Tailwind.

## Build priorities (in order)

1. Scaffold SvelteKit + Tailwind project
2. Notion API integration — read tasks AND mark them done
3. Triage screen with checkboxes
4. AI sorting via Claude API
5. Focus screen with visual card stack
6. Onboarding questions at start of session
7. PWA config (manifest, service worker, icons)
8. Deploy (Cloudflare Pages)

## Known issues (not fixed yet)

- **Silent failure on "Done" write to Notion** — `advance(true)` in `+page.svelte` fires `POST /api/done` as fire-and-forget (`.catch(() => {})`) so the card always advances immediately without waiting on the Notion write. If that PATCH fails (bad token, network blip, rate limit), the task disappears from the local stack but stays unchecked in Notion, with no error shown. Worth adding a retry or at least a visible failure indicator (e.g. a quiet toast, or a locally-queued retry) before this becomes a trust problem.

## Future features (not now)

- Google Calendar integration (scan today's events for priority signals)
- Gmail integration (surface high-signal emails)
- Learning loop (track override patterns, surface weekly insights)
- "Interruption" button for emergencies
- Evening/morning mode distinction
