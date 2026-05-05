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

<div class="min-h-screen bg-[#c0c0c0] font-mac text-[12px] text-black pb-8">

	<!-- ── ONBOARDING ── -->
	{#if phase === 'onboarding'}
		<div class="win">
			<div class="win-titlebar">
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body space-y-4">
				<p class="font-bold text-[13px]">Before we begin —</p>
				<p class="text-[10px] text-[#666]">Three quick questions to help sort your day.</p>

				<div class="space-y-3">
					<label class="block">
						<span class="block text-[11px] font-bold mb-1">Anything you already know is important today?</span>
						<input
							type="text"
							bind:value={ctx.important}
							placeholder="e.g. finish proposal draft, call with client"
							class="w-full border-2 border-black bg-white px-2 py-1 text-[12px] focus:outline-none font-mac"
						/>
					</label>

					<label class="block">
						<span class="block text-[11px] font-bold mb-1">What meetings do you have today?</span>
						<input
							type="text"
							bind:value={ctx.meetings}
							placeholder="e.g. 2pm team standup, 4pm client review"
							class="w-full border-2 border-black bg-white px-2 py-1 text-[12px] focus:outline-none font-mac"
						/>
					</label>

					<label class="block">
						<span class="block text-[11px] font-bold mb-1">Anything from yesterday you didn't get to?</span>
						<input
							type="text"
							bind:value={ctx.carried}
							placeholder="e.g. that email, the expense report"
							class="w-full border-2 border-black bg-white px-2 py-1 text-[12px] focus:outline-none font-mac"
						/>
					</label>
				</div>

				<div class="flex justify-end pt-2">
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
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body text-center py-10 text-[#666]">
				<div class="text-[20px] mb-3">■</div>
				Loading from Notion...
			</div>
		</div>
	{/if}

	<!-- ── TRIAGE ── -->
	{#if phase === 'triage'}
		<div class="win">
			<div class="win-titlebar">
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body">
				<p class="font-bold text-[13px] mb-1">What needs your attention today?</p>
				<p class="text-[10px] text-[#666] mb-3">Not "is this important" — just "does it need to be today?"</p>

				{#if loadError}
					<div class="border-2 border-black bg-[#fff0f0] px-3 py-2 text-[11px] mb-3">
						{loadError}
					</div>
				{/if}

				<div class="max-h-[380px] overflow-y-auto border border-[#ccc] bg-[#fafafa] p-1">
					{#each tasks as task, i}
						<label class="flex items-start gap-2 px-1 py-[5px] border-b border-dotted border-[#ddd] cursor-pointer hover:bg-[#f0f0f0]">
							<input
								type="checkbox"
								checked={selected.has(i)}
								on:change={() => toggle(i)}
								class="mt-[2px] cursor-pointer"
							/>
							<span class="flex-1 leading-tight">
								<span class:font-bold={task.important}>{task.name}</span>
								{#if task.dueDate}
									<span class="text-[10px] text-[#888] ml-1">due {task.dueDate}</span>
								{/if}
								{#if task.urgent}
									<span class="text-[9px] bg-black text-white px-1 ml-1">URGENT</span>
								{/if}
								{#if task.timeEstimate}
									<span class="text-[9px] text-[#aaa] ml-1">{task.timeEstimate}</span>
								{/if}
							</span>
						</label>
					{:else}
						<div class="text-center py-8 text-[#888]">No incomplete tasks found.</div>
					{/each}
				</div>

				<div class="flex justify-between items-center mt-3">
					<span class="text-[10px] text-[#888]">Aim for 3–7. Less is more.</span>
					<button
						class="btn btn-black"
						on:click={buildStack}
						disabled={selected.size === 0}
					>
						Build Today's Stack →
					</button>
				</div>

				<hr class="divider mt-3" />
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
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body text-center py-10 text-[#666]">
				<div class="text-[20px] mb-3 animate-pulse">■</div>
				Building your stack...
				{#if sortError}
					<div class="text-[10px] text-[#888] mt-2">{sortError}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- ── FOCUS ── -->
	{#if phase === 'focus' && stack[idx]}
		{#if !emailUnlocked}
			<div class="mx-auto mt-4 max-w-[520px] w-[calc(100%-32px)] bg-black text-white text-center py-2 text-[11px] font-bold tracking-[0.05em]">
				Your focus is protected. No email until task 1 is done.
			</div>
		{/if}

		<div class="win" class:mt-0={!emailUnlocked}>
			<div class="win-titlebar">
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body">
				<!-- Card stack -->
				<div
					class="relative"
					style="margin-bottom: {behind * 3 + 12}px; margin-right: {behind * 3}px;"
				>
					<!-- Background cards -->
					{#each Array(behind) as _, bi}
						{@const depth = behind - bi}
						<div
							class="absolute border-2 border-black"
							style="
								top: {depth * 3}px;
								left: {depth * 3}px;
								right: -{depth * 3}px;
								bottom: -{depth * 3}px;
								background: {depth <= 2 ? '#f2f2f2' : '#e4e4e4'};
							"
						></div>
					{/each}

					<!-- Front card -->
					<div class="relative border-2 border-black bg-white p-6 z-10">
						<p class="label-upper mb-2">Do this now</p>
						<h2 class="text-[20px] font-bold leading-tight mb-2">{stack[idx].name}</h2>
						{#if stack[idx].dueDate}
							<p class="text-[10px] text-[#888]">Due: {stack[idx].dueDate}</p>
						{/if}
						{#if stack[idx].reason}
							<p class="text-[11px] text-[#555] italic border-t border-[#ddd] pt-2 mt-3">
								↳ {stack[idx].reason}
							</p>
						{/if}
					</div>
				</div>

				<div class="flex justify-center gap-2 mt-2">
					<button class="btn" on:click={() => advance(false)}>Skip →</button>
					<button class="btn btn-black" on:click={() => advance(true)}>✓ Done</button>
				</div>

				<hr class="divider mt-4" />
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
				<div class="win-dot"></div>
				<span class="win-title">One Thing</span>
				<div style="width:12px"></div>
			</div>
			<div class="win-body text-center py-10 px-5">
				<div class="text-[28px] mb-3">■</div>
				<p class="text-[14px] font-bold mb-2">Stack complete.</p>
				<p class="text-[12px] text-[#666] mb-6">
					{doneCount} task{doneCount !== 1 ? 's' : ''} done today. Everything else can wait.
				</p>
				<button class="btn" on:click={resetToTriage}>Start a new stack →</button>
			</div>
		</div>
	{/if}

</div>
