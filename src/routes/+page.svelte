<script>
	import { onMount } from 'svelte';
	import { MANTRAS } from '$lib/mantras.js';
	import Window from '$lib/components/Window.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Sorting from '$lib/components/Sorting.svelte';
	import Focus from '$lib/components/Focus.svelte';
	import Done from '$lib/components/Done.svelte';

	// ── phases: loading → sorting → focus → done
	// The AI picks AND ranks — there is no manual task-selection step, and
	// no questions to answer first. Open the app, see the pick.
	let phase = 'loading';

	// Tasks
	let tasks = [];
	let loaded = false;

	// Stack — a queue: stack[0] is always the current card. Skipping moves
	// it to the back instead of dropping it, so it comes back around.
	let stack = [];
	let doneCount = 0;
	let skippedCount = 0;

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
			stack = order.map((x) => ({ ...tasks[x.index - 1], reason: x.reason }));
		} catch (e) {
			sortError = e.message ?? 'Sort failed — showing the first 5 instead.';
			stack = tasks.slice(0, 5).map((t) => ({ ...t, reason: '' }));
		}
		doneCount = 0;
		skippedCount = 0;
		mantraIdx = Math.floor(Math.random() * MANTRAS.length);
		phase = 'focus';
	}

	async function advance(completed) {
		const card = stack[0];
		if (completed) {
			if (card?.id) {
				// Fire-and-forget — don't block UI on Notion write
				fetch('/api/done', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ pageId: card.id })
				}).catch(() => {});
			}
			doneCount++;
			stack = stack.slice(1);
			if (stack.length === 0) {
				phase = 'done';
				return;
			}
		} else {
			skippedCount++;
			stack = [...stack.slice(1), card];
		}
		mantraIdx++;
	}

	function startNewStack() {
		tasks = [];
		stack = [];
		doneCount = 0;
		skippedCount = 0;
		startSession();
	}

	onMount(startSession);

	$: behind = Math.min(stack.length - 1, 8);
</script>

<div class="min-h-screen bg-[color:var(--color-bg)] font-mac text-base text-[color:var(--color-text)] pb-16">

	{#if phase === 'loading'}
		<Window>
			<Loading error={loadError} empty={loaded && tasks.length === 0} onRetry={startSession} />
		</Window>
	{/if}

	{#if phase === 'sorting'}
		<Window><Sorting {sortError} /></Window>
	{/if}

	{#if phase === 'focus' && stack[0]}
		<Window>
			<Focus {stack} {behind} {mantraText} onAdvance={advance} />
			<svelte:fragment slot="footer">
				<span>{doneCount} done{skippedCount ? ` · ${skippedCount} skipped` : ''}</span>
			</svelte:fragment>
		</Window>
	{/if}

	{#if phase === 'done'}
		<Window><Done {doneCount} onReset={startNewStack} /></Window>
	{/if}

</div>
