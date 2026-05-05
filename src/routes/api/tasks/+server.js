import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform }) {
	const token = platform?.env?.NOTION_TOKEN ?? env.NOTION_TOKEN;
	const dbId = platform?.env?.NOTION_DATABASE_ID ?? env.NOTION_DATABASE_ID;

	if (!token || !dbId) {
		throw error(500, 'Missing Notion credentials');
	}

	const cleanId = dbId.replace(/-/g, '');

	let results = [];
	let cursor = undefined;

	do {
		const body = {
			filter: {
				and: [
					{ property: 'Done', checkbox: { equals: false } }
				]
			},
			sorts: [
				{ property: 'Urgent', direction: 'descending' },
				{ property: 'Important', direction: 'descending' },
				{ timestamp: 'last_edited_time', direction: 'descending' }
			],
			page_size: 100,
			...(cursor ? { start_cursor: cursor } : {})
		};

		const res = await fetch(`https://api.notion.com/v1/databases/${cleanId}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			const text = await res.text();
			throw error(502, `Notion API error: ${res.status} ${text}`);
		}

		const data = await res.json();
		results = results.concat(data.results);
		cursor = data.has_more ? data.next_cursor : undefined;
	} while (cursor);

	const tasks = results.map((page) => {
		const props = page.properties;

		const name = props.Name?.title?.[0]?.plain_text ?? '(untitled)';
		const done = props.Done?.checkbox ?? false;
		const important = props.Important?.checkbox ?? false;
		const urgent = props.Urgent?.checkbox ?? false;
		const dueDate = props['Due Date']?.date?.start ?? null;
		const effort = props.Effort?.select?.name ?? null;
		const impact = props.Impact?.select?.name ?? null;
		const timeEstimate = props['Time Estimate']?.select?.name ?? null;

		return { id: page.id, name, done, important, urgent, dueDate, effort, impact, timeEstimate };
	});

	return json(tasks);
}
