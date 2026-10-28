// How many cards a stack deals.
export const STACK_SIZE = 5;

// Who and when come before how much. A task only reaches the deck if it is
// mine to do and in play. Owner and Stage are set in Notion; a task with
// neither set is new and unsorted, so it still comes through.
//   Owner: Me · Person · Agent · Drop   — only Me (or blank) is dealt
//   Stage: Now · Next · Later · Waiting — Later and Waiting are never dealt
const NOT_MINE = new Set(['Person', 'Agent', 'Drop']);
const NOT_NOW = new Set(['Later', 'Waiting']);

export function inPlay(task) {
	if (task.owner && NOT_MINE.has(task.owner)) return false;
	if (task.stage && NOT_NOW.has(task.stage)) return false;
	return true;
}

// The order tasks get dealt in. This is a hard rule, not a hint to the AI:
// a lower tier never comes up while a higher one still has tasks in it.
//   0  Now
//   1  Next, and important or urgent — or unsorted and urgent
//   2  Next
//   3  unsorted (no Stage yet)
export const TIER_LABELS = ['now', 'next, flagged', 'next', 'not sorted yet'];

export function tier(task) {
	if (task.stage === 'Now') return 0;
	const flagged = task.important || task.urgent;
	if (task.stage === 'Next') return flagged ? 1 : 2;
	return task.urgent ? 1 : 3;
}

// The order without the AI: tier first, then the soonest due date (undated
// last), then the order they came in. The sort falls back to this whenever
// the AI is unavailable, so the stack still respects the tiers.
export function byUrgency(tasks) {
	const due = (t) => (t.dueDate ? Date.parse(t.dueDate) : Infinity);
	return [...tasks].sort((a, b) => tier(a) - tier(b) || due(a) - due(b));
}
