<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, createEventDispatcher, tick } from 'svelte';

	/**
	 * Сколько всего «виртуальных» элементов в списке (для вычисления totalHeight).
	 */
	export let totalCount: number;
	export let initialIndex = 0;

	const dispatch = createEventDispatcher<{ viewChange: { currentIndex: number } }>();

	let container: HTMLDivElement; // Внешний контейнер
	let slotContainer: HTMLDivElement; // Блок со <slot>

	let itemHeight = 0; // Высота одного «элемента» (меряем по первому ребёнку слота)
	let totalHeight = 0; // Общая высота для заполнения
	let containerTop = 0; // Позиция нашего контейнера на странице
	let slotOffset = 0; // Смещение слота вниз (translateY)

	// Замеряем размеры: высоту первого «ребёнка» и положение контейнера
	function updateDimensions() {
		if (!slotContainer || !totalCount) return;

		const firstChild = slotContainer.children[0] as HTMLElement | undefined;
		if (!firstChild) {
			// Если слота вообще нет (нет ни одного видимого элемента), высота = 0
			itemHeight = 0;
			totalHeight = 0;
			return;
		}

		const rect = firstChild.getBoundingClientRect();
		itemHeight = rect.height;

		const cRect = container.getBoundingClientRect();
		containerTop = (window.scrollY || 0) + cRect.top;

		totalHeight = itemHeight * totalCount;
	}

	// Функция, вызываемая на глобальном скролле
	function onScroll() {
		if (!itemHeight) return;

		const scrollY = window.scrollY || 0;
		const offsetInside = scrollY - containerTop;

		// Индекс верхнего видимого элемента
		let visibleIndex = offsetInside < 0 ? 0 : Math.floor(offsetInside / itemHeight);

		// Говорим наружу, что у нас теперь такой индекс
		dispatch('viewChange', { currentIndex: visibleIndex });

		// Сдвигаем слот, чтобы он визуально был на нужной позиции
		slotOffset = visibleIndex * itemHeight;
	}

	// Ресайз (или появление контента)
	function handleResize() {
		updateDimensions();
		onScroll();
	}

	let resizeObserver: ResizeObserver;

	if (browser) {
		window.scrollTo({ top: 0 });
	}

	onMount(() => {
		// Слушаем глобальный скролл
		window.addEventListener('scroll', onScroll, { passive: true });

		// Следим за изменением размеров содержимого, чтобы поймать момент,
		// когда высота первого элемента станет > 0
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				handleResize();
			});
			resizeObserver.observe(slotContainer);
		} else {
			// Фолбэк на window.resize
			window.addEventListener('resize', handleResize);
		}

		setTimeout(() => {
			window.scrollTo({ top: (initialIndex + 0.05) * itemHeight, behavior: 'instant' });
		}, 250);

		return () => {
			window.removeEventListener('scroll', onScroll);
			if (resizeObserver) {
				resizeObserver.disconnect();
			} else {
				window.removeEventListener('resize', handleResize);
			}
		};
	});
</script>

<div bind:this={container} style="position: relative; width: 100%;" class="container">
	<div style="position: relative; width: 100%; height: {totalHeight}px;">
		<div
			bind:this={slotContainer}
			style="
        position: absolute;
        top: 0; 
        left: 0; 
        right: 0;
        transform: translateY({slotOffset}px);
      "
		>
			<slot />
		</div>
	</div>
</div>

<style>
	.container {
		opacity: 0;
		animation: fadeIn 0.5s ease forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
