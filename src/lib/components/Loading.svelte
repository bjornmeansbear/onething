<script>
	export let error = '';
	export let empty = false;
	export let sorting = false;
	export let onRetry;
</script>

<div class="text-center py-16">
	{#if error}
		<p class="mb-4">{error}</p>
		<button class="btn" on:click={onRetry}>Try again →</button>
	{:else}
		<div class="text-4xl mb-4" class:animate-pulse={sorting} aria-hidden="true">■</div>
		{#if sorting}
			Building your stack...
		{:else if empty}
			Nothing incomplete in Notion right now. Nice.
		{:else}
			Loading from Notion...
		{/if}
	{/if}
</div>
