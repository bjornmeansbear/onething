<script>
	export let ctx;
	export let onSubmit;
</script>

<div class="space-y-6">
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
		<button class="btn btn-black" on:click={onSubmit}>
			Load my tasks →
		</button>
	</div>
</div>
