<script>
	import { onDestroy, tick } from 'svelte';
	import Card from './Card.svelte';
	import Sticker from './Sticker.svelte';

	export let stack;
	export let doneCount;
	export let mantraText;
	export let onAdvance;
	export let onNext;

	// The card just acted on lingers on top as a ghost — stamped or tabbed —
	// then leaves toward the side of the button that was pressed. The stack
	// itself has already moved on underneath it.
	const LEAVE_MS = { done: 950, skip: 480 };
	let ghost = null;
	let ghostTimer;
	let sticker;
	let announce = '';

	// Cards under the front one, deepest first so nearer ones paint on top.
	// nth = how many skipped cards sit above this one; it spaces the tabs.
	$: under = stack
		.slice(1)
		.map((card, i, rest) => ({
			card,
			depth: i + 1,
			nth: rest.slice(0, i).filter((c) => c.skipped).length
		}))
		.reverse();

	async function act(mark) {
		if (ghost) return;
		const card = stack[0];
		ghost = { card, mark };
		ghostTimer = setTimeout(() => (ghost = null), LEAVE_MS[mark]);
		onAdvance(mark === 'done');

		await tick();
		const what = mark === 'done' ? 'Done' : 'Skipped, it comes back around';
		const next = stack[0] ? `Next: ${stack[0].name}.` : 'Stack complete.';
		announce = `${what}: ${card.name}. ${next}`;
		if (!stack.length) sticker?.focus();
	}

	onDestroy(() => clearTimeout(ghostTimer));
</script>

<div class="pile" class:front-tabbed={stack[0]?.skipped}>
	{#if stack[0]}
		{#each under as { card, depth, nth }}
			<div class="under" style="--tilt: {card.tilt}deg; --depth: {depth};">
				{#if card.skipped}
					<span class="tab" style="--nth: {nth};"></span>
				{/if}
			</div>
		{/each}

		<div class="front" style="--tilt: {stack[0].tilt}deg;">
			<Card card={stack[0]} onSkip={() => act('skip')} onDone={() => act('done')} />
		</div>
	{:else}
		<Sticker bind:this={sticker} {doneCount} {onNext} />
	{/if}

	{#if ghost}
		<div class="ghost {ghost.mark}" style="--leave: {LEAVE_MS[ghost.mark]}ms;" inert aria-hidden="true">
			<div class="front" style="--tilt: {ghost.card.tilt}deg;">
				<Card card={ghost.card} mark={ghost.mark} />
			</div>
		</div>
	{/if}
</div>

<p class="mantra mt-6">{mantraText}</p>
<p class="sr-only" aria-live="polite">{announce}</p>

<style>
	/* Room above for skipped tabs and the tilted corners of the pile. */
	.pile {
		position: relative;
		margin-top: 1.5rem;
		margin-bottom: min(4.5rem, 1rem + 4vw);
		/* blank tabs start after the front card's lettered one, if it has one */
		--tab-start: 1rem;
	}

	.pile.front-tabbed {
		--tab-start: 8rem;
	}

	/* Every card keeps its own tilt (set in deal()); the one being read shows
	   a third of it. Tilts pivot near the top-left, where the tabs sit, so
	   the tabs stay put and the far corners do the fanning out. */
	.under,
	.front {
		transform-origin: 25% 0;
	}

	.front {
		transform: rotate(calc(var(--tilt) * 0.3));
	}

	.under {
		--drop: calc(var(--depth) * 3px);
		position: absolute;
		inset: 0;
		border: 2px solid var(--color-text);
		background: var(--color-bg);
		transform: translate(var(--drop), var(--drop)) rotate(var(--tilt));
	}

	.tab {
		position: absolute;
		bottom: 100%;
		left: calc(var(--tab-start) + var(--nth) * 2.25rem);
		width: 1.75rem;
		/* taller by however far its card sits below the front one */
		height: calc(1.5rem + var(--drop));
		background: var(--color-text);
	}

	.ghost {
		position: absolute;
		inset: 0 0 auto;
		animation: var(--leave) ease-in forwards;
	}

	.ghost.done {
		animation-name: leave-done;
	}

	.ghost.skip {
		animation-name: leave-skip;
	}

	@keyframes leave-done {
		0%,
		60% {
			transform: none;
			opacity: 1;
		}
		100% {
			transform: translate(60%, -10%) rotate(10deg);
			opacity: 0;
		}
	}

	@keyframes leave-skip {
		0%,
		45% {
			transform: none;
			opacity: 1;
		}
		100% {
			transform: translate(-40%, 6%) rotate(-6deg);
			opacity: 0;
		}
	}

	/* Reduced motion: the stamp or tab still shows, then the card is simply
	   gone — nothing flies. */
	@media (prefers-reduced-motion: reduce) {
		.ghost {
			animation: none;
		}
	}
</style>
