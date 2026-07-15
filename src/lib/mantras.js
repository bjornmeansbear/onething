export const MANTRAS = [
	"Choosing isn't neglecting — it's sequencing.",
	"Doing one thing well moves everything forward more than agonizing over ten incomplete things.",
	"The stack shrinks. That's the only metric that matters.",
	"Finish one thing. Everything else can wait.",
	"I don't need a better system. I just need to start.",
	"I don't need to be good enough. I just need to learn as I go.",
	"I can smartly and efficiently do one thing at a time",
	"Do less with less.",
	"Progress over perfection.",
	"Future me values long-term rewards, but only present me can act. So act!",
	"I have a clear mind, ready to tackle one problem at a time."
];

export function randomMantra() {
	return MANTRAS[Math.floor(Math.random() * MANTRAS.length)];
}
