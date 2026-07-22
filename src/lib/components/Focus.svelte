<script>
	export let stack;
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
	<div class="relative border-2 border-[color:var(--color-text)] bg-[color:var(--color-bg)] z-10">
		<div class="p-10">
			<p class="label-upper mb-3">Do this now</p>
			<h2 class="text-4xl font-bold leading-tight mb-3">{stack[0].name}</h2>
			{#if stack[0].dueDate}
				<p class="text-sm text-[color:var(--color-text-muted)]">Due: {stack[0].dueDate}</p>
			{/if}
			{#if stack[0].reason}
				<p class="text-base text-[color:var(--color-text-muted)] italic border-t-2 border-[color:var(--color-text)] pt-3 mt-4">
					↳ {stack[0].reason}
				</p>
			{/if}
		</div>

		<div class="flex border-t-2 border-[color:var(--color-text)]">
			<button
				class="flex-1 py-4 text-base font-bold text-[color:var(--color-text)] hover:bg-[color:var(--color-text)] hover:text-[color:var(--color-bg)] active:bg-[color:var(--color-text)] active:text-[color:var(--color-bg)]"
				on:click={() => onAdvance(false)}
			>
				Skip →
			</button>
			<button
				class="flex-1 py-4 text-base font-bold border-l-2 border-[color:var(--color-text)] bg-[color:var(--color-accent)] text-[color:var(--color-bg)] hover:bg-[color:var(--color-accent-hover)] active:bg-[color:var(--color-accent-hover)]"
				on:click={() => onAdvance(true)}
			>
				✓ Done
			</button>
		</div>
	</div>
</div>

<p class="mantra mt-6">{mantraText}</p>
