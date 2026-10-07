<script>
	export let doneCount;
	export let onNext;

	let el;
	export function focus() {
		el?.focus();
	}

	// 24-point burst, drawn in a 200×200 box.
	const BURST = Array.from({ length: 48 }, (_, i) => {
		const r = i % 2 ? 90 : 98;
		const a = (i / 48) * 2 * Math.PI;
		return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
	}).join(' ');
</script>

<div class="wrap">
	<button class="sticker" bind:this={el} on:click={onNext}>
		<svg viewBox="0 0 200 200" aria-hidden="true">
			<polygon points={BURST} />
		</svg>
		<span class="text">
			{#if doneCount}
				<span class="small">Stack complete</span>
				<span class="big">{doneCount} for {doneCount}</span>
			{/if}
			<span class="next">Deal the next 5 →</span>
		</span>
	</button>
	<p class="rest">Everything else can wait.</p>
</div>

<style>
	.wrap {
		text-align: center;
		padding: 1rem 0;
	}

	.sticker {
		position: relative;
		display: inline-grid;
		place-items: center;
		width: clamp(15rem, 60vw, 22rem);
		max-width: 100%;
		aspect-ratio: 1;
		color: var(--color-bg);
		transform: rotate(-8deg);
		animation: settle 320ms cubic-bezier(0.2, 1.4, 0.4, 1) 560ms backwards;
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	polygon {
		fill: var(--color-accent);
		stroke: var(--color-text);
		stroke-width: 2px;
		vector-effect: non-scaling-stroke;
	}

	@media (hover: hover) {
		.sticker:hover polygon {
			fill: var(--color-accent-hover);
		}
	}

	.sticker:active polygon {
		fill: var(--color-text);
	}

	.text {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 66%;
	}

	.small {
		font-size: 0.8125rem;
		line-height: 1.125rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.big {
		font-size: clamp(2.5rem, 11vw, 4rem);
		line-height: 1.1;
		font-weight: bold;
		white-space: nowrap;
	}

	.next {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 2px solid currentColor;
		font-size: 1.125rem;
		line-height: 1.5rem;
		font-weight: bold;
	}

	.rest {
		margin-top: 1.5rem;
		color: var(--color-text-muted);
	}

	@keyframes settle {
		from {
			transform: rotate(-20deg) scale(0.9);
		}
	}

	@media (min-width: 55rem) {
		.small {
			font-size: 1rem;
			line-height: 1.5rem;
		}
		.next {
			font-size: 1.375rem;
			line-height: 1.875rem;
		}
		.rest {
			font-size: 1.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sticker {
			animation: none;
		}
	}
</style>
