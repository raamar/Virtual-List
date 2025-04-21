<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import VirtualList from './VirtualList.svelte';

	export let data;

	const chunkArray = <T,>(arr: T[], chunkSize: number = 4): T[][] => {
		const result: T[][] = [];
		for (let i = 0; i < arr.length; i += chunkSize) {
			result.push(arr.slice(i, i + chunkSize));
		}
		return result;
	};

	const store = writable<Record<string, { name: string; description: string }>>({});
	const pageHistory = writable<Record<string, boolean>>({});
	const initialIndex = data.index - 1;

	let currentIndex = 0;

	const handleViewChange = ({
		detail: { currentIndex: newIndex = 0 }
	}: CustomEvent<{ currentIndex: number }>) => {
		if (newIndex === currentIndex) return;

		currentIndex = newIndex;

		const page = currentIndex + 1;

		if ($pageHistory[page]) {
			history.replaceState(null, '', `?page=${page}`);
		} else {
			goto(`?page=${page}`, {
				replaceState: true,
				noScroll: true
			});

			$pageHistory[page] = true;
		}
	};

	$: void (async (
		data_promise: Promise<
			{
				id: number;
				name: string;
				description: string;
			}[]
		>
	) => {
		const data = await data_promise;

		store.update(($store) => {
			Object.assign(
				$store,
				Object.fromEntries(
					data.map((item) => [item.id, { name: item.name, description: item.description }])
				)
			);
			return $store;
		});
	})(data.getData);

	$: console.log($store);
</script>

<VirtualList
	totalCount={Math.floor(data.items.length / data.pageSize)}
	on:viewChange={handleViewChange}
	{initialIndex}
>
	{#each chunkArray(data.items, data.pageSize) as chunk, index}
		{#if index >= currentIndex && index <= currentIndex + 1}
			<div class="chunk" data-index={index + 1} class:reverse={index % 2}>
				{#each chunk as id}
					<div class="item" class:loading={!$store[id]}>
						{#if $store[id]}
							<h1>{$store[id].name}</h1>
							<p>{$store[id].description}</p>
						{:else}
							<h1>Loading...</h1>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</VirtualList>

<style>
	:global(body, html) {
		padding: 0;
		margin: 0;
	}

	.chunk {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
		position: relative;
		padding-bottom: 20px;
	}

	@media (max-width: 768px) {
		.chunk {
			grid-template-columns: repeat(1, 1fr);
		}
	}

	.reverse {
		direction: rtl;
	}

	.chunk::before {
		content: attr(data-index);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		margin-top: -10px;
	}

	.item {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		transition: background-color 0.3s ease;
	}

	.item:nth-child(4n - 3) {
		background-color: aquamarine;
	}
	.item:nth-child(4n - 2) {
		background-color: beige;
	}
	.item:nth-child(4n - 1) {
		background-color: burlywood;
	}
	.item:nth-child(4n) {
		background-color: blueviolet;
	}

	.item.loading {
		background-color: #ccc;
	}
</style>
