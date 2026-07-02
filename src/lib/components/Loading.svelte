<script>
	export let error = '';
	export let empty = false;
	export let onRetry;
</script>

{#if error}
	<div class="text-center py-16">
		<p class="text-[color:var(--color-danger)] mb-4">{error}</p>
		<button class="btn" on:click={onRetry}>Try again →</button>
	</div>
{:else if empty}
	<div class="text-center py-16 text-[color:var(--color-text-muted)]">
		<div class="text-4xl mb-4">■</div>
		Nothing incomplete in Notion right now. Nice.
	</div>
{:else}
	<div class="text-center py-16 text-[color:var(--color-text-muted)]">
		<div class="text-4xl mb-4">■</div>
		Loading from Notion...
	</div>
{/if}
