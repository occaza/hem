<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronUp } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	let showButton = $state(false);

	onMount(() => {
		const handleScroll = () => {
			// Check window scroll
			const windowScroll = window.scrollY > 300;

			// Check for custom scroll containers (like homepage)
			const scrollContainers = document.querySelectorAll('[data-scroll-container]');
			let containerScroll = false;

			scrollContainers.forEach((container) => {
				if (container.scrollTop > 300) {
					containerScroll = true;
				}
			});

			showButton = windowScroll || containerScroll;
		};

		// Listen to window scroll
		window.addEventListener('scroll', handleScroll);

		// Listen to scroll on custom containers
		const scrollContainers = document.querySelectorAll('[data-scroll-container]');
		scrollContainers.forEach((container) => {
			container.addEventListener('scroll', handleScroll);
		});

		return () => {
			window.removeEventListener('scroll', handleScroll);
			scrollContainers.forEach((container) => {
				container.removeEventListener('scroll', handleScroll);
			});
		};
	});

	function scrollToTop() {
		// Try to scroll custom container first
		const scrollContainer = document.querySelector('[data-scroll-container]');
		if (scrollContainer) {
			scrollContainer.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		} else {
			// Fallback to window scroll
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}
</script>

{#if showButton}
	<button
		onclick={scrollToTop}
		in:fly={{ y: 20, duration: 300 }}
		out:fly={{ y: 20, duration: 200 }}
		class="btn fixed right-4 bottom-20 z-50 btn-circle shadow-lg btn-primary hover:shadow-xl lg:right-6 lg:bottom-6"
		aria-label="Back to top"
	>
		<ChevronUp size={24} />
	</button>
{/if}
