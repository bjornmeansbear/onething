import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const token = platform?.env?.NOTION_TOKEN ?? env.NOTION_TOKEN;

	if (!token) {
		throw error(500, 'Missing Notion credentials');
	}

	const { pageId } = await request.json();

	if (!pageId) {
		throw error(400, 'Missing pageId');
	}

	const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Notion-Version': '2022-06-28',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			properties: {
				Done: { checkbox: true }
			}
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw error(502, `Notion API error: ${res.status} ${text}`);
	}

	return json({ ok: true });
}
