/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				mac: ["'Chicago'", "'Geneva'", "'Charcoal'", "'Lucida Grande'", 'system-ui', 'sans-serif'],
				mono: ["'Monaco'", "'Menlo'", "'Courier New'", 'monospace']
			},
			boxShadow: {
				mac: '2px 2px 0px #000000',
				'mac-inset': 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #888888'
			},
			backgroundImage: {
				'titlebar': 'linear-gradient(to bottom, #e8e8e8, #c0c0c0)'
			}
		}
	},
	plugins: []
};
