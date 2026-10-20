<script>
	import { onMount } from 'svelte';
	import { MANTRAS } from '$lib/mantras.js';
	import Window from '$lib/components/Window.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Focus from '$lib/components/Focus.svelte';
	import { byUrgency, STACK_SIZE } from '$lib/priority.js';

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
	// The whole stack as dealt, done cards included — the pile sizes to it.
	let hand = [];
	let doneCount = 0;

	// Notion writes still in flight — dealing the next stack waits on these,
	// so a card just checked off can't be dealt again.
	let pendingWrites = [];

	// Errors
	let loadError = '';
	// The stack was sorted without the AI (unreachable, out of credit):
	// still tier-ordered, just not hand-ranked within a tier.
	let aiOff = false;

	// Mantras rotate
	let mantraIdx = 0;
	$: mantraText = MANTRAS[mantraIdx % MANTRAS.length];

	async function startSession() {
		phase = 'loading';
		loadError = '';
		loaded = false;
		aiOff = false;
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
		try {
			const res = await fetch('/api/sort', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tasks })
			});
			if (!res.ok) throw new Error(await res.text());
			const { ai, picks } = await res.json();
			aiOff = !ai;
			// Ignore any pick that doesn't point at a real task
			const real = picks.filter((x) => tasks[x.index - 1]);
			stack = deal(real.map((x) => ({ ...tasks[x.index - 1], reason: x.reason })));
		} catch (e) {
			// The sort endpoint itself failed: same tier + due-date order, here.
			console.error('sort failed', e);
			aiOff = true;
			stack = deal(byUrgency(tasks).slice(0, STACK_SIZE).map((t) => ({ ...t, reason: '' })));
		}
		hand = stack;
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
			// Fire-and-forget — don't block the UI on the Notion write. If it
			// fails, the task is still open in Notion and simply comes back.
			pendingWrites.push(
				fetch('/api/done', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ pageId: card.id })
				})
					.then((res) => res.ok || console.error('done: Notion write failed', res.status))
					.catch((e) => console.error('done: Notion write failed', e))
			);
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

<div class="overflow-x-clip pb-16">
	<Window>
		{#if phase === 'focus'}
			<Focus {stack} {hand} {doneCount} {mantraText} onAdvance={advance} onNext={startNewStack} />
		{:else}
			<Loading
				error={loadError}
				empty={loaded && !tasks.length}
				sorting={phase === 'sorting'}
				onRetry={startSession}
			/>
		{/if}
	</Window>

	<!-- Status pinned to the bottom corners, out of the cards' way: how the
	     stack was sorted on the left, done count on the right — the side the
	     Done button and the leaving card go. -->
	{#if aiOff}
		<p class="corner corner-left" role="status">AI off · sorted by priority instead</p>
	{/if}
	{#if phase === 'focus' && doneCount}
		<p class="corner corner-right">{doneCount} done</p>
	{/if}

</div>

<style>
	/* Secondary text, not chrome: small, in the ground's ink (no muted tone
	   passes on the gray — see app.css). */
	.corner {
		position: fixed;
		bottom: max(1.5rem, env(safe-area-inset-bottom));
		z-index: 10;
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.125rem;
		/* ground behind it so a card scrolled underneath can't show through */
		background: var(--color-bg);
	}

	.corner-left {
		left: max(1.5rem, env(safe-area-inset-left));
		/* leave room for the done count on narrow phones */
		max-width: calc(100% - 8rem);
	}

	.corner-right {
		right: max(1.5rem, env(safe-area-inset-right));
	}
</style>
