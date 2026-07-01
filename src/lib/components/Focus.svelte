<script>
	export let stack;
	export let idx;
	export let behind;
	export let mantraText;
	export let onAdvance;
</script>

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
	<button class="btn" on:click={() => onAdvance(false)}>Skip →</button>
	<button class="btn btn-black" on:click={() => onAdvance(true)}>✓ Done</button>
</div>

<hr class="divider" />
<p class="mantra">{mantraText}</p>
