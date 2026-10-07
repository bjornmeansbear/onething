<script>
	export let card;
	export let onSkip = () => {};
	export let onDone = () => {};
	// Set only on the departing copy of a card: 'done' slams the stamp on,
	// 'skip' pops the tab up.
	export let mark = null;
</script>

<div class="card">
	{#if card.skipped || mark === 'skip'}
		<span class="tab" class:fresh={mark === 'skip'}>Skipped</span>
	{/if}

	<div class="body">
		<p class="label-upper label">{card.skipped ? 'Back around' : 'Do this now'}</p>
		<h2 class="title">{card.name}</h2>
		{#if card.dueDate}
			<p class="due">Due: {card.dueDate}</p>
		{/if}
		{#if card.reason}
			<p class="reason">↳ {card.reason}</p>
		{/if}
	</div>

	<div class="actions">
		<button class="skip" on:click={onSkip}>← Skip</button>
		<button class="done" on:click={onDone}>✓ Done</button>
	</div>

	{#if mark === 'done'}
		<span class="stamp" aria-hidden="true">✓ Done</span>
	{/if}
</div>

<style>
	.card {
		position: relative;
		border: 2px solid var(--color-text);
		background: var(--color-bg);
	}

	.body {
		padding: 2.5rem;
	}

	.label {
		margin-bottom: 0.75rem;
	}

	/* Fluid between the phone and desktop sizes — rem endpoints, so it still
	   follows the reader's font-size setting. */
	.title {
		font-size: clamp(2.25rem, 1.25rem + 4vw, 4rem);
		line-height: 1.1;
		font-weight: bold;
		margin-bottom: 0.75rem;
		text-wrap: balance;
		overflow-wrap: anywhere;
	}

	.due {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.reason {
		font-style: italic;
		color: var(--color-text-muted);
		border-top: 2px solid var(--color-text);
		padding-top: 0.75rem;
		margin-top: 1rem;
	}

	.actions {
		display: flex;
		border-top: 2px solid var(--color-text);
	}

	.actions button {
		flex: 1;
		padding: 1rem;
		font-weight: bold;
	}

	.skip {
		color: var(--color-text);
	}

	.skip:active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.done {
		border-left: 2px solid var(--color-text);
		background: var(--color-accent);
		color: var(--color-bg);
	}

	.done:active {
		background: var(--color-accent-hover);
	}

	/* Hover only where there's a real pointer — on touch it sticks after a
	   tap and bleeds onto the next card. */
	@media (hover: hover) {
		.skip:hover {
			background: var(--color-text);
			color: var(--color-bg);
		}
		.done:hover {
			background: var(--color-accent-hover);
		}
	}

	/* Skipped: a folder tab on the left, the Skip side. It stays on the card
	   for as long as the card is in the pile. */
	.tab {
		position: absolute;
		bottom: 100%;
		left: 1rem;
		padding: 0.125rem 0.625rem;
		background: var(--color-text);
		color: var(--color-bg);
		font-size: 0.75rem;
		line-height: 1.125rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.tab.fresh {
		animation: tab-up 180ms ease-out backwards;
	}

	/* Done: a sticker slapped on the right corner, the Done side. */
	.stamp {
		position: absolute;
		top: -1.5rem;
		right: -0.5rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--color-text);
		background: var(--color-accent);
		color: var(--color-bg);
		font-size: 1.5rem;
		line-height: 1.5rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transform: rotate(8deg);
		animation: stamp-on 220ms cubic-bezier(0.2, 1.4, 0.4, 1) backwards;
	}

	@keyframes stamp-on {
		from {
			opacity: 0;
			transform: rotate(8deg) scale(2.6);
		}
	}

	@keyframes tab-up {
		from {
			transform: translateY(100%);
		}
	}

	@media (min-width: 40rem) {
		.body {
			padding: 3.5rem;
		}
		.stamp {
			font-size: 2rem;
			line-height: 2rem;
			padding: 0.75rem 1.25rem;
		}
	}

	@media (min-width: 55rem) {
		.body {
			padding: 4.5rem;
			min-height: 20rem;
		}
		.label {
			font-size: 1rem;
		}
		.due {
			font-size: 1.125rem;
		}
		.reason {
			font-size: 1.25rem;
			line-height: 1.875rem;
		}
		.actions button {
			padding: 1.5rem;
			font-size: 1.25rem;
		}
		.tab {
			font-size: 0.875rem;
			line-height: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stamp,
		.tab.fresh {
			animation: none;
		}
	}
</style>
