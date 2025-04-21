const timeout = <T>(fn: () => T, time: number): Promise<T> =>
	new Promise((resolve) => {
		setTimeout(() => {
			resolve(fn());
		}, time);
	});

const data = Array.from({ length: 50 }, (_, i) => ({
	id: i,
	name: `Item ${i}`,
	description: `Description for item ${i}`
}));

const pageSize = 4;

export const load = async ({ url: { searchParams } }) => {
	const index = Number(searchParams.get('page') ?? 1);
	const items = data.map((item) => item.id);

	const getData = timeout(
		() => {
			const d = data.slice((index - 1) * pageSize, (index + 1) * pageSize);
			return d;
		},
		400 + Math.random() * 400
	);

	return {
		index,
		pageSize,
		items,
		getData
	};
};
