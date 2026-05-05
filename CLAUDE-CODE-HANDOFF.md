# One Thing — Claude Code Handoff

## What is this?

Read the full product spec in Notion first:
https://www.notion.so/35455aa28d7181d7a1e8fc0466dc1cc2

"One Thing" is a personal executive functioning tool — a focusing lens that sits on top of a Notion task database and surfaces ONE task at a time. It's not a task manager. It pulls tasks from Notion, uses AI to sort them using 4 priority questions, and presents them as a visual card stack. You complete one, it shows you the next. The stack shrinks as you go.

## Tech stack

- SvelteKit + Tailwind CSS
- Notion API for read/write (tasks database)
- Claude API (claude-sonnet-4-20250514) for AI-powered task sorting
- Mobile-first PWA (needs to work on phone home screen)
- Aesthetic: Mac OS 9 Finder — black and white, functional, no visual fluff

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

## Future features (not now)

- Google Calendar integration (scan today's events for priority signals)
- Gmail integration (surface high-signal emails)
- Learning loop (track override patterns, surface weekly insights)
- "Interruption" button for emergencies
- Evening/morning mode distinction
