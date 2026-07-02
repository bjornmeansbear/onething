import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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

	const taskList = tasks
		.map(
			(t, i) =>
				`${i + 1}. "${t.name}"` +
				(t.dueDate ? ` (due: ${t.dueDate})` : '') +
				(t.important ? ' [important]' : '') +
				(t.urgent ? ' [urgent]' : '') +
				(t.effort ? ` effort:${t.effort}` : '') +
				(t.impact ? ` impact:${t.impact}` : '') +
				(t.timeEstimate ? ` estimate:${t.timeEstimate}` : '')
		)
		.join('\n');

	const contextBlock = context
		? `\nSession context:\n- Important today: ${context.important || 'nothing noted'}\n- Meetings: ${context.meetings || 'none'}\n- Carried over: ${context.carried || 'nothing'}\n`
		: '';

	const prompt = `You are a personal executive functioning coach. Below is EVERY incomplete task this person has — they have not pre-filtered this list themselves. Your job is to both PICK which ones genuinely deserve attention today and RANK them, so they don't have to decide anything.${contextBlock}
Use these 4 criteria:
1. What breaks if I don't do this today? (consequences, urgency)
2. Does this make other things easier? (leverage, unlocking)
3. Can I finish this in one sitting? (sizing — favor completable tasks)
4. What's the best thing that happens if I DO this? (positive value)

All incomplete tasks:
${taskList}

Return ONLY a JSON array of AT MOST 5 tasks — fewer if fewer than 5 genuinely need today's attention — sorted highest priority first: [{"index": 1, "reason": "one short phrase"}, ...]
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

	const match = text.replace(/```json|```/g, '').match(/\[[\s\S]*\]/);
	if (!match) {
		// Fall back to the first 5 in original order, no reasons — still capped,
		// so a parse failure doesn't dump the whole list back on the user.
		return json(tasks.slice(0, 5).map((_, i) => ({ index: i + 1, reason: '' })));
	}

	const order = JSON.parse(match[0]);
	return json(order);
}
