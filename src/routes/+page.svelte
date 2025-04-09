<script lang="ts">
	import { goto } from '$app/navigation';
	import VirtualList from './VirtualList.svelte';

	export let data;
	// Пусть у нас 1000 элементов (квадратов)
	let items = Array.from({ length: 63 }, (_, i) => i);

	const initialIndex = data.index - 1;
	let currentIndex = 0;

	// При каждом скролле VirtualList даёт нам событие "viewChange"
	function handleViewChange(event: CustomEvent<{ currentIndex: number }>) {
		const newIndex = event.detail.currentIndex ?? 0;
		if (newIndex !== currentIndex) {
			currentIndex = newIndex;
			// Если нужно, здесь можно сохранить index в store или обновить query-параметры
			goto(`?page=${currentIndex + 1}`, {
				replaceState: true,
				noScroll: true
			});
		}
	}
</script>

<VirtualList totalCount={items.length} on:viewChange={handleViewChange} {initialIndex}>
	{#each items as item, index}
		{#if index >= currentIndex && index <= currentIndex + 1}
			<div class="chunk" data-index={index + 1} class:reverse={index % 2}>
				<div class="item">{item * 4 + 1}</div>
				<div class="item">{item * 4 + 2}</div>
				<div class="item">{item * 4 + 3}</div>
				<div class="item">{item * 4 + 4}</div>
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
</style>
