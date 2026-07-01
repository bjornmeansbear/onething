<script>
	import { MANTRAS } from '$lib/mantras.js';

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
	const mantra = () => MANTRAS[mantraIdx % MANTRAS.length];

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

	<!-- ── ONBOARDING ── -->
	{#if phase === 'onboarding'}
		<div class="win">
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body space-y-6">
				<p class="text-2xl font-bold">Before we begin —</p>
				<p class="text-base text-[color:var(--color-text-muted)]">Three quick questions to help sort your day.</p>

				<div class="space-y-4">
					<label class="block">
						<span class="block text-base font-bold mb-2">Anything you already know is important today?</span>
						<input
							type="text"
							bind:value={ctx.important}
							placeholder="e.g. finish proposal draft, call with client"
							class="w-full border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)] px-3 py-2 text-base focus:outline-none font-mac"
						/>
					</label>

					<label class="block">
						<span class="block text-base font-bold mb-2">What meetings do you have today?</span>
						<input
							type="text"
							bind:value={ctx.meetings}
							placeholder="e.g. 2pm team standup, 4pm client review"
							class="w-full border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)] px-3 py-2 text-base focus:outline-none font-mac"
						/>
					</label>

					<label class="block">
						<span class="block text-base font-bold mb-2">Anything from yesterday you didn't get to?</span>
						<input
							type="text"
							bind:value={ctx.carried}
							placeholder="e.g. that email, the expense report"
							class="w-full border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)] px-3 py-2 text-base focus:outline-none font-mac"
						/>
					</label>
				</div>

				<div class="flex justify-end pt-4">
					<button class="btn btn-black" on:click={startSession}>
						Load my tasks →
					</button>
				</div>
			</div>
			<div class="win-footer">
				<span>One Thing</span>
				<span>executive focus tool</span>
			</div>
		</div>
	{/if}

	<!-- ── LOADING ── -->
	{#if phase === 'loading'}
		<div class="win">
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body text-center py-16 text-[color:var(--color-text-muted)]">
				<div class="text-4xl mb-4">■</div>
				Loading from Notion...
			</div>
		</div>
	{/if}

	<!-- ── TRIAGE ── -->
	{#if phase === 'triage'}
		<div class="win">
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body">
				<p class="text-2xl font-bold mb-2">What needs your attention today?</p>
				<p class="text-base text-[color:var(--color-text-muted)] mb-6">Not "is this important" — just "does it need to be today?"</p>

				{#if loadError}
					<div class="border-2 border-[color:var(--color-danger)] bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)] px-4 py-3 text-base mb-6">
						{loadError}
					</div>
				{/if}

				<div class="max-h-[420px] overflow-y-auto border-2 border-[color:var(--color-text)] p-2">
					{#each tasks as task, i}
						<label class="flex items-start gap-3 px-2 py-3 border-b-2 border-[color:var(--color-text)] last:border-b-0 cursor-pointer hover:bg-[color:var(--color-accent-subtle)]">
							<input
								type="checkbox"
								checked={selected.has(i)}
								on:change={() => toggle(i)}
								class="mt-1 cursor-pointer"
							/>
							<span class="flex-1 leading-snug">
								<span class:font-bold={task.important}>{task.name}</span>
								{#if task.dueDate}
									<span class="text-sm text-[color:var(--color-text-muted)] ml-1">due {task.dueDate}</span>
								{/if}
								{#if task.urgent}
									<span class="text-xs bg-black text-white px-1.5 py-0.5 ml-1">URGENT</span>
								{/if}
								{#if task.timeEstimate}
									<span class="text-xs text-[color:var(--color-text-muted)] ml-1">{task.timeEstimate}</span>
								{/if}
							</span>
						</label>
					{:else}
						<div class="text-center py-8 text-[color:var(--color-text-muted)]">No incomplete tasks found.</div>
					{/each}
				</div>

				<div class="flex justify-between items-center mt-4">
					<span class="text-sm text-[color:var(--color-text-muted)]">Aim for 3–7. Less is more.</span>
					<button
						class="btn btn-black"
						on:click={buildStack}
						disabled={selected.size === 0}
					>
						Build Today's Stack →
					</button>
				</div>

				<hr class="divider" />
				<p class="mantra">{MANTRAS[0]}</p>
			</div>
			<div class="win-footer">
				<span>{selected.size} selected</span>
				<span>{tasks.length} total</span>
			</div>
		</div>
	{/if}

	<!-- ── SORTING ── -->
	{#if phase === 'sorting'}
		<div class="win">
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body text-center py-16 text-[color:var(--color-text-muted)]">
				<div class="text-4xl mb-4 animate-pulse">■</div>
				Building your stack...
				{#if sortError}
					<div class="text-sm text-[color:var(--color-text-muted)] mt-3">{sortError}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- ── FOCUS ── -->
	{#if phase === 'focus' && stack[idx]}
		{#if !emailUnlocked}
			<div class="mx-auto mt-8 max-w-[640px] w-[calc(100%-32px)] bg-[color:var(--color-accent)] text-[color:var(--color-bg)] text-center py-3 text-sm font-bold tracking-[0.05em]">
				Your focus is protected. No email until task 1 is done.
			</div>
		{/if}

		<div class="win" class:mt-0={!emailUnlocked}>
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body">
				<!-- Card stack -->
				<div
					class="relative"
					style="margin-bottom: {behind * 4 + 16}px; margin-right: {behind * 4}px;"
				>
					<!-- Background cards -->
					{#each Array(behind) as _, bi}
						{@const depth = behind - bi}
						<div
							class="absolute border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)]"
							style="
								top: {depth * 4}px;
								left: {depth * 4}px;
								right: -{depth * 4}px;
								bottom: -{depth * 4}px;
							"
						></div>
					{/each}

					<!-- Front card -->
					<div class="relative border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)] p-10 z-10">
						<p class="label-upper mb-3">Do this now</p>
						<h2 class="text-4xl font-bold leading-tight mb-3">{stack[idx].name}</h2>
						{#if stack[idx].dueDate}
							<p class="text-sm text-[color:var(--color-text-muted)]">Due: {stack[idx].dueDate}</p>
						{/if}
						{#if stack[idx].reason}
							<p class="text-base text-[color:var(--color-text-muted)] italic border-t-2 border-[color:var(--color-text)] pt-3 mt-4">
								↳ {stack[idx].reason}
							</p>
						{/if}
					</div>
				</div>

				<div class="flex justify-center gap-3 mt-6">
					<button class="btn" on:click={() => advance(false)}>Skip →</button>
					<button class="btn btn-black" on:click={() => advance(true)}>✓ Done</button>
				</div>

				<hr class="divider" />
				<p class="mantra">{mantra()}</p>
			</div>
			<div class="win-footer">
				<span>{doneCount} done</span>
				<span>{emailUnlocked ? 'unlocked' : 'locked'}</span>
			</div>
		</div>
	{/if}

	<!-- ── DONE ── -->
	{#if phase === 'done'}
		<div class="win">
			<div class="win-titlebar">
				<span class="win-title">One Thing</span>
			</div>
			<div class="win-body text-center py-16 px-8">
				<div class="text-6xl mb-4">■</div>
				<p class="text-3xl font-bold mb-4">Stack complete.</p>
				<p class="text-base text-[color:var(--color-text-muted)] mb-8">
					{doneCount} task{doneCount !== 1 ? 's' : ''} done today. Everything else can wait.
				</p>
				<button class="btn" on:click={resetToTriage}>Start a new stack →</button>
			</div>
		</div>
	{/if}

</div>
