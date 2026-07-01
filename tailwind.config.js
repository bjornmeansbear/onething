/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				red:         Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--red-${i})`])),
				orange:      Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--orange-${i})`])),
				yellow:      Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--yellow-${i})`])),
				green:       Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--green-${i})`])),
				blue:        Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--blue-${i})`])),
				purple:      Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--purple-${i})`])),
				pink:        Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--pink-${i})`])),
				brown:       Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--brown-${i})`])),
				gray:        Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--gray-${i})`])),
				'dark-gray': Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--dark-gray-${i})`])),
				'light-gray':Object.fromEntries([...Array(10).keys()].map(i => [i, `var(--light-gray-${i})`])),
			},
			fontFamily: {
				mac: ['system-ui', "'Segoe UI'", 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
				mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Menlo', 'monospace']
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
