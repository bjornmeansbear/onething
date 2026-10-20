// Cloudflare Pages bindings, read in the API routes as platform.env.
declare global {
	namespace App {
		interface Platform {
			env?: {
				NOTION_TOKEN?: string;
				NOTION_DATABASE_ID?: string;
				ANTHROPIC_API_KEY?: string;
			};
		}
	}
}

export {};
