<script lang="ts">
	import VirtualList from './VirtualList.svelte';

	// Пусть у нас 1000 элементов (квадратов)
	let items = Array.from({ length: 1000 }, (_, i) => i);

	// Начнём сразу с 10-го элемента
	let currentIndex = 10;

	// При каждом скролле VirtualList даёт нам событие "viewChange"
	function handleViewChange(event: CustomEvent<{ currentIndex: number }>) {
		const newIndex = event.detail.currentIndex ?? 0;
		if (newIndex !== currentIndex) {
			currentIndex = newIndex;
			// Если нужно, здесь можно сохранить index в store или обновить query-параметры
		}
	}
</script>

<!-- 
  - Передаём initialIndex={currentIndex}, чтобы VirtualList знал,
    что надо автоскроллить на 10-й элемент
  - Снаружи рендерим только [currentIndex..currentIndex+1] (2 штуки)
-->
<VirtualList totalCount={items.length} initialIndex={currentIndex} on:viewChange={handleViewChange}>
	{#each items as item, index}
		{#if index >= currentIndex && index <= currentIndex + 1}
			<div class="chunk" data-index={index}>
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
		margin-bottom: 20px;
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
