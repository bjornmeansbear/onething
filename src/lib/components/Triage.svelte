<script>
	import { MANTRAS } from '$lib/mantras.js';

	export let tasks;
	export let selected;
	export let loadError;
	export let onToggle;
	export let onBuildStack;
</script>

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
				on:change={() => onToggle(i)}
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
		on:click={onBuildStack}
		disabled={selected.size === 0}
	>
		Build Today's Stack →
	</button>
</div>

<hr class="divider" />
<p class="mantra">{MANTRAS[0]}</p>
