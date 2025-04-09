export const load = async ({ url: { searchParams } }) => {
	const index = Number(searchParams.get('page') ?? 1);

	return { index };
};
