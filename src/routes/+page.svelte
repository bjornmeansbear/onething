<script>
	import { onMount } from 'svelte';
	import { MANTRAS } from '$lib/mantras.js';
	import Window from '$lib/components/Window.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Sorting from '$lib/components/Sorting.svelte';
	import Focus from '$lib/components/Focus.svelte';

	// ── phases: loading → sorting → focus
	// (an emptied stack stays in focus: the sticker under the pile deals the next one)
	// The AI picks AND ranks — there is no manual task-selection step, and
	// no questions to answer first. Open the app, see the pick.
	let phase = 'loading';

	// Tasks
	let tasks = [];
	let loaded = false;

	// Stack — a queue: stack[0] is always the current card. Skipping moves
	// it to the back instead of dropping it, flagged, so it comes back around.
	let stack = [];
	let doneCount = 0;
	$: skippedCount = stack.filter((c) => c.skipped).length;

	// Notion writes still in flight — dealing the next stack waits on these,
	// so a card just checked off can't be dealt again.
	let pendingWrites = [];

	// Errors
	let loadError = '';
	let sortError = '';

	// Mantras rotate
	let mantraIdx = 0;
	$: mantraText = MANTRAS[mantraIdx % MANTRAS.length];

	async function startSession() {
		phase = 'loading';
		loadError = '';
		loaded = false;
		try {
			const res = await fetch('/api/tasks');
			if (!res.ok) throw new Error(await res.text());
			tasks = await res.json();
		} catch (e) {
			loadError = e.message ?? 'Failed to load tasks.';
			loaded = true;
			return;
		}
		if (!tasks.length) {
			loaded = true;
			return;
		}
		await buildStack();
	}

	async function buildStack() {
		phase = 'sorting';
		sortError = '';
		try {
			const res = await fetch('/api/sort', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tasks })
			});
			if (!res.ok) throw new Error(await res.text());
			const order = await res.json();
			// Ignore any pick that doesn't point at a real task
			const picks = order.filter((x) => tasks[x.index - 1]);
			stack = deal(picks.map((x) => ({ ...tasks[x.index - 1], reason: x.reason })));
		} catch (e) {
			sortError = e.message ?? 'Sort failed — showing the first 5 instead.';
			stack = deal(tasks.slice(0, 5).map((t) => ({ ...t, reason: '' })));
		}
		doneCount = 0;
		mantraIdx = Math.floor(Math.random() * MANTRAS.length);
		phase = 'focus';
	}

	// Each card gets its own slight tilt for as long as it's in the pile —
	// alternating sides so neighbours never line up.
	function deal(cards) {
		return cards.map((c, i) => ({ ...c, tilt: (i % 2 ? 1 : -1) * (1.5 + Math.random() * 2.5) }));
	}

	function advance(completed) {
		const card = stack[0];
		if (completed) {
			if (card?.id) {
				// Fire-and-forget — don't block UI on Notion write
				pendingWrites.push(
					fetch('/api/done', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ pageId: card.id })
					}).catch(() => {})
				);
			}
			doneCount++;
			stack = stack.slice(1);
		} else {
			stack = [...stack.slice(1), { ...card, skipped: true }];
		}
		mantraIdx++;
	}

	async function startNewStack() {
		phase = 'loading';
		await Promise.all(pendingWrites);
		pendingWrites = [];
		startSession();
	}

	onMount(startSession);
</script>

<div class="min-h-screen overflow-x-clip bg-[color:var(--color-bg)] font-mac text-base text-[color:var(--color-text)] pb-16">

	{#if phase === 'loading'}
		<Window>
			<Loading error={loadError} empty={loaded && tasks.length === 0} onRetry={startSession} />
		</Window>
	{/if}

	{#if phase === 'sorting'}
		<Window><Sorting {sortError} /></Window>
	{/if}

	{#if phase === 'focus'}
		<Window>
			<Focus {stack} {doneCount} {mantraText} onAdvance={advance} onNext={startNewStack} />
			<!-- Skipped on the left, done on the right — same sides as the buttons -->
			<svelte:fragment slot="footer">
				{#if skippedCount}
					<span class="tally">
						<span class="tab-key" aria-hidden="true"></span>
						{skippedCount} skipped, coming back around
					</span>
				{/if}
				{#if doneCount}
					<span class="tally ml-auto">
						{#each Array(doneCount) as _}
							<span class="mark" aria-hidden="true">✓</span>
						{/each}
						{doneCount} done
					</span>
				{/if}
			</svelte:fragment>
		</Window>
	{/if}

</div>

<style>
	.tally {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.tab-key {
		width: 1rem;
		height: 0.75rem;
		background: var(--color-text);
	}

	/* One mark per card done — only ever earned ones, never empty slots. */
	.mark {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		background: var(--color-accent);
		color: var(--color-bg);
		font-weight: bold;
		transform: rotate(-7deg);
		animation: mark-on 220ms cubic-bezier(0.2, 1.4, 0.4, 1) 150ms backwards;
	}

	.mark:nth-child(even) {
		transform: rotate(6deg);
	}

	@keyframes mark-on {
		from {
			opacity: 0;
			scale: 2.4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mark {
			animation: none;
		}
	}
</style>
