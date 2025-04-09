export const load = async ({ url: { searchParams } }) => {
	return { index: Number(searchParams.get('page') ?? 1) };
};
