<script>
	import { MANTRAS } from '$lib/mantras.js';
	import Window from '$lib/components/Window.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Triage from '$lib/components/Triage.svelte';
	import Sorting from '$lib/components/Sorting.svelte';
	import Focus from '$lib/components/Focus.svelte';
	import Done from '$lib/components/Done.svelte';

	// ── phases: onboarding → loading → triage → sorting → focus → done
	let phase = 'onboarding';

	// Onboarding
	let ctx = { important: '', meetings: '', carried: '' };

	// Tasks
	let tasks = [];
	let selected = new Set();

	// Stack
	let stack = [];
	let idx = 0;
	let doneCount = 0;
	let emailUnlocked = false;

	// Errors
	let loadError = '';
	let sortError = '';

	// Mantras rotate
	let mantraIdx = 0;
	$: mantraText = MANTRAS[mantraIdx % MANTRAS.length];

	function toggle(i) {
		const next = new Set(selected);
		next.has(i) ? next.delete(i) : next.add(i);
		selected = next;
	}

	async function startSession() {
		phase = 'loading';
		loadError = '';
		try {
			const res = await fetch('/api/tasks');
			if (!res.ok) throw new Error(await res.text());
			tasks = await res.json();
			selected = new Set();
		} catch (e) {
			loadError = e.message ?? 'Failed to load tasks.';
		}
		phase = 'triage';
	}

	async function buildStack() {
		const picks = tasks.filter((_, i) => selected.has(i));
		if (!picks.length) return;
		phase = 'sorting';
		sortError = '';
		try {
			const res = await fetch('/api/sort', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tasks: picks, context: ctx })
			});
			if (!res.ok) throw new Error(await res.text());
			const order = await res.json();
			stack = order.map((x) => ({ ...picks[x.index - 1], reason: x.reason }));
		} catch (e) {
			sortError = e.message ?? 'Sort failed — using your selection order.';
			stack = picks.map((t) => ({ ...t, reason: '' }));
		}
		idx = 0;
		doneCount = 0;
		emailUnlocked = false;
		mantraIdx = Math.floor(Math.random() * MANTRAS.length);
		phase = 'focus';
	}

	async function advance(completed) {
		if (completed && stack[idx]?.id) {
			// Fire-and-forget — don't block UI on Notion write
			fetch('/api/done', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pageId: stack[idx].id })
			}).catch(() => {});
			doneCount++;
		}
		if (!emailUnlocked) emailUnlocked = true;
		if (idx + 1 >= stack.length) {
			phase = 'done';
		} else {
			idx++;
			mantraIdx++;
		}
	}

	function resetToTriage() {
		phase = 'triage';
		selected = new Set();
		stack = [];
		idx = 0;
		doneCount = 0;
		emailUnlocked = false;
	}

	$: remaining = stack.length - idx;
	$: behind = Math.min(remaining - 1, 8);
</script>

<div class="min-h-screen bg-[color:var(--color-bg)] font-mac text-base text-[color:var(--color-text)] pb-16">

	{#if phase === 'onboarding'}
		<Window>
			<Onboarding {ctx} onSubmit={startSession} />
			<svelte:fragment slot="footer">
				<span>One Thing</span>
				<span>executive focus tool</span>
			</svelte:fragment>
		</Window>
	{/if}

	{#if phase === 'loading'}
		<Window><Loading /></Window>
	{/if}

	{#if phase === 'triage'}
		<Window>
			<Triage {tasks} {selected} {loadError} onToggle={toggle} onBuildStack={buildStack} />
			<svelte:fragment slot="footer">
				<span>{selected.size} selected</span>
				<span>{tasks.length} total</span>
			</svelte:fragment>
		</Window>
	{/if}

	{#if phase === 'sorting'}
		<Window><Sorting {sortError} /></Window>
	{/if}

	{#if phase === 'focus' && stack[idx]}
		{#if !emailUnlocked}
			<div class="mx-auto mt-8 max-w-[640px] w-[calc(100%-32px)] bg-[color:var(--color-accent)] text-[color:var(--color-bg)] text-center py-3 text-sm font-bold tracking-[0.05em]">
				Your focus is protected. No email until task 1 is done.
			</div>
		{/if}

		<Window class={!emailUnlocked ? 'mt-0' : ''}>
			<Focus {stack} {idx} {behind} {mantraText} onAdvance={advance} />
			<svelte:fragment slot="footer">
				<span>{doneCount} done</span>
				<span>{emailUnlocked ? 'unlocked' : 'locked'}</span>
			</svelte:fragment>
		</Window>
	{/if}

	{#if phase === 'done'}
		<Window><Done {doneCount} onReset={resetToTriage} /></Window>
	{/if}

</div>
