<script>
	export let doneCount;
	export let onReset;
</script>

<div class="text-center py-16 px-8">
	<div class="text-6xl mb-4">■</div>
	<p class="text-3xl font-bold mb-4">Stack complete.</p>
	<p class="text-base text-[color:var(--color-text-muted)] mb-8">
		{doneCount} task{doneCount !== 1 ? 's' : ''} done today. Everything else can wait.
	</p>
	<button class="btn" on:click={onReset}>Start a new stack →</button>
</div>
