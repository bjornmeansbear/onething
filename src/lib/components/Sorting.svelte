<script>
	export let sortError = '';
</script>

<div class="text-center py-16 text-[color:var(--color-text-muted)]">
	<div class="text-4xl mb-4 animate-pulse">■</div>
	Building your stack...
	{#if sortError}
		<div class="text-sm text-[color:var(--color-text-muted)] mt-3">{sortError}</div>
	{/if}
</div>
