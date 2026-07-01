<script>
	let className = '';
	export { className as class };
	export let title = 'One Thing';
</script>

<div class="win {className}">
	<!-- <div class="win-titlebar">
		<span class="win-title">{title}</span>
	</div> -->
	<div class="win-body">
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="win-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>
