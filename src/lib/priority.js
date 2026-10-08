// The order tasks get dealt in. This is a hard rule, not a hint to the AI:
// a lower tier never comes up while a higher one still has tasks in it.
//   0  important + urgent, with a due date
//   1  important + urgent
//   2  important only
//   3  urgent only
//   4  everything else
export const TIER_LABELS = [
	'important + urgent, has a due date',
	'important + urgent',
	'important',
	'urgent',
	'neither'
];

export function tier(task) {
	if (task.important && task.urgent) return task.dueDate ? 0 : 1;
	if (task.important) return 2;
	if (task.urgent) return 3;
	return 4;
}

// Stable — tasks in the same tier keep the order they came in.
export function byTier(tasks) {
	return [...tasks].sort((a, b) => tier(a) - tier(b));
}
