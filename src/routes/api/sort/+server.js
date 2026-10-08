import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { tier, TIER_LABELS } from '$lib/priority.js';

const STACK_SIZE = 5;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const apiKey = platform?.env?.ANTHROPIC_API_KEY ?? env.ANTHROPIC_API_KEY;

	if (!apiKey) {
		throw error(500, 'Missing Anthropic API key');
	}

	const { tasks, context } = await request.json();

	if (!tasks?.length) {
		throw error(400, 'No tasks to sort');
	}

	// Tier order is enforced here, not left to the AI. It only sees the tiers
	// that can reach the stack: every tier down to the one holding the 5th task.
	const ranked = tasks
		.map((t, i) => ({ ...t, index: i + 1, tier: tier(t) }))
		.sort((a, b) => a.tier - b.tier);
	const cutoff = ranked[Math.min(STACK_SIZE, ranked.length) - 1].tier;
	const pool = ranked.filter((t) => t.tier <= cutoff);

	const taskList = pool
		.map(
			(t) =>
				`${t.index}. "${t.name}"` +
				` [${TIER_LABELS[t.tier]}]` +
				(t.dueDate ? ` (due: ${t.dueDate})` : '') +
				(t.effort ? ` effort:${t.effort}` : '') +
				(t.impact ? ` impact:${t.impact}` : '') +
				(t.timeEstimate ? ` estimate:${t.timeEstimate}` : '')
		)
		.join('\n');

	const contextBlock = context
		? `\nSession context:\n- Important today: ${context.important || 'nothing noted'}\n- Meetings: ${context.meetings || 'none'}\n- Carried over: ${context.carried || 'nothing'}\n`
		: '';

	const prompt = `You are a personal executive functioning coach. Below are this person's top incomplete tasks — they have not pre-filtered this list themselves. Your job is to PICK ${STACK_SIZE} for today and RANK them, so they don't have to decide anything.${contextBlock}
Each task is tagged with its priority group. The groups are a strict order, set by the person, and you must not override it:
${TIER_LABELS.map((l, i) => `${i + 1}. [${l}]`).join('\n')}
Never pick a task from a later group while an earlier group still has unpicked tasks. Your judgement is for ordering tasks WITHIN a group, and for choosing which ones make the cut when a group has more than fit.

Within a group, use these 4 criteria:
1. What breaks if I don't do this today? (consequences, due dates)
2. Does this make other things easier? (leverage, unlocking)
3. Can I finish this in one sitting? (sizing — favor completable tasks)
4. What's the best thing that happens if I DO this? (positive value)

Tasks:
${taskList}

Return ONLY a JSON array of ${Math.min(STACK_SIZE, pool.length)} tasks, sorted highest priority first, using the task numbers exactly as given: [{"index": 1, "reason": "one short phrase"}, ...]
No markdown, no extra text, no explanation outside the JSON.`;

	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			model: 'claude-sonnet-5',
			max_tokens: 4096,
			messages: [{ role: 'user', content: prompt }]
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw error(502, `Anthropic API error: ${res.status} ${text}`);
	}

	const data = await res.json();
	const text = (data.content ?? [])
		.filter((b) => b.type === 'text')
		.map((b) => b.text)
		.join('');

	let picks = [];
	const match = text.replace(/```json|```/g, '').match(/\[[\s\S]*\]/);
	if (match) {
		try {
			picks = JSON.parse(match[0]);
		} catch {
			// unparseable — the tier order below still gives a capped, sane stack
		}
	}

	// Tier first, then the AI's order; anything it left out trails its tier.
	// So even a wrong or empty answer can't put a lower tier ahead of a higher one.
	const rank = new Map(picks.map((p, i) => [p.index, { at: i, reason: p.reason ?? '' }]));
	const order = pool
		.map((t) => ({ index: t.index, tier: t.tier, at: Infinity, reason: '', ...rank.get(t.index) }))
		.sort((a, b) => a.tier - b.tier || a.at - b.at)
		.slice(0, STACK_SIZE)
		.map(({ index, reason }) => ({ index, reason }));

	return json(order);
}
