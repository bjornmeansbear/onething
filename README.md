# One Thing

A personal executive-functioning tool — a focusing lens on top of a Notion task database that surfaces ONE task at a time. See [CLAUDE-CODE-HANDOFF.md](./CLAUDE-CODE-HANDOFF.md) for the full product spec, build status, and design principles.

Hopefully I can figure out how to automate this a bit more. Trying to use AI to make my life more analog, simple, clear, productive - productive in the sense that I do MORE of what I want to the way I want.

Go get stuff done. Make art. be amazing.

## Personal software

I built this for myself, on top of a Notion task tracker I was already using. The tracker held everything I needed to do. It did not help me pick what to do next, and picking is the part I am bad at. One Thing reads that tracker and does the picking.

It fits my Notion setup and nobody else's. Fork it if it is useful to you. I can't offer support.

## How it works

1. Open the app. It pulls every unfinished task from the Notion database.
2. Claude reads the whole list, picks at most five for today, and ranks them. You choose nothing.
3. You see one card. The rest of the pile sits behind it.
4. **Done** checks the task off in Notion and shows the next card.
5. **Skip** sends the card to the back of the pile with a tab on it. It comes back around.
6. Finish the pile and a sticker offers to deal the next five.

Claude ranks with four questions:

1. What breaks if I don't do this today?
2. Does this make other things easier?
3. Can I finish this in one sitting?
4. What's the best thing that happens if I do this?

## Rules the design follows

- One task on screen. No task list anywhere.
- The app decides. Any step that asks you to choose or rank defeats the purpose.
- No red badges, no overdue warnings, no guilt.
- Progress is the pile getting smaller.
- Skipping is allowed. A skipped card is marked and returns.
- A line at the bottom of each card repeats something I need to hear. Those live in `src/lib/mantras.js`. Swap in your own.

## What you need

- Node and npm
- A Notion account, with a tasks database shaped like the one below
- A Notion internal integration, connected to that database, with permission to read and update content
- An Anthropic API key
- A Cloudflare account, if you want it on your phone. Any host that runs SvelteKit works if you change the adapter.

### The Notion database

The app looks for these properties by exact name, capitals and spaces included.

| Property | Type | Needed | What the app does with it |
|---|---|---|---|
| `Name` | Title | Yes | The text on the card |
| `Done` | Checkbox | Yes | Only unchecked tasks load. **Done** checks it. |
| `Urgent` | Checkbox | Yes | Sets the deal order (below) |
| `Important` | Checkbox | Yes | Sets the deal order (below) |
| `Due Date` | Date | No | Shown on the card. Sets the deal order. Passed to Claude. |
| `Effort` | Select | No | Passed to Claude |
| `Impact` | Select | No | Passed to Claude |
| `Time Estimate` | Select | No | Passed to Claude |

Tasks are dealt in a fixed order, set in `src/lib/priority.js`:

1. Important and urgent, with a due date
2. Important and urgent
3. Important only
4. Urgent only
5. Everything else

A later group never comes up while an earlier one still has tasks. Claude only orders tasks inside a group, and picks which ones make the stack when a group has more than five.

The three selects can hold any options you like. Claude reads the option names as written. Other properties in the database are ignored.

To use a different to-do app, rewrite `src/routes/api/tasks/+server.js` (load the tasks) and `src/routes/api/done/+server.js` (check one off). Everything else only needs a list of tasks that each have an `id` and a `name`.

## Setup

```bash
npm install
cp .env.example .env   # then fill in the three values
npm run dev
```

| Var | What it is |
|---|---|
| `NOTION_TOKEN` | The integration's secret |
| `NOTION_DATABASE_ID` | The ID of the tasks database, from its URL |
| `ANTHROPIC_API_KEY` | Claude API key, used by `/api/sort` |

Keep all three out of git. `.env` and `.dev.vars` are already ignored.

## Deploying

The app has no login, on purpose. It is one person's tool, run by that person with their own tasks. That also means anyone who has the URL of a deployed copy can read the tasks and mark them done. If that matters to you, put the deployment behind something like Cloudflare Access.

For Cloudflare Pages: build command `npm run build`, output directory `.svelte-kit/cloudflare`, and the same three variables set as secrets in the Pages project. `npm run preview:cf` runs the Cloudflare runtime locally and reads `.dev.vars`.

## Stack

- SvelteKit (Svelte 5) + Tailwind CSS
- Notion API, to read tasks and mark them done
- Claude API, to pick and rank. The model is set in `src/routes/api/sort/+server.js`.
- Cloudflare Pages (`@sveltejs/adapter-cloudflare`)

Built working with Claude Code.

## Scripts

- `npm run dev`: local dev server
- `npm run build` / `npm run preview`: production build and preview
- `npm run preview:cf`: build, then run the Cloudflare Pages runtime locally
- `npm run deploy`: build and deploy with Wrangler
