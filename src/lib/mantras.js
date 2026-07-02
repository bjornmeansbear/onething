export const MANTRAS = [
	"Choosing isn't neglecting — it's sequencing.",
	"Doing one thing well moves everything forward more than agonizing over ten.",
	"The stack shrinks. That's the only metric that matters.",
	"Finish one thing. Everything else is still there.",
	"You don't need a better system. You need to start.",
	"I don't need to be good enough. I just need to be willing to learn as I go.",
	"I can smartly and efficiently do one thing at a time. Do less with less.",
	"Progress over perfection.",
	"The future self values long-term rewards, but only the present self can act.",
	"I have a clear mind, ready to tackle one problem at a time."
];

export function randomMantra() {
	return MANTRAS[Math.floor(Math.random() * MANTRAS.length)];
}
