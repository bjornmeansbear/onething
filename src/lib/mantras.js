export const MANTRAS = [
	"Choosing isn't neglecting — it's sequencing.",
	"Doing one thing well moves everything forward more than agonizing over ten.",
	"The stack shrinks. That's the only metric that matters.",
	"Finish one thing. Everything else is still there.",
	"You don't need a better system. You need to start."
];

export function randomMantra() {
	return MANTRAS[Math.floor(Math.random() * MANTRAS.length)];
}
