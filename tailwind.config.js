/** @type {import('tailwindcss').Config} */
// Utilities only (spacing, text-center, sr-only…). Colors live as CSS
// variables in src/app.css and are used directly; nothing here wraps them.
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {},
	plugins: []
};
