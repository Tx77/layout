<!--
 * @Author: 田鑫
 * @Date: 2024-07-19 14:19:36
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:07:57
 * @Description: 
-->
<template>
	<div class="scroll-container" ref="scrollContainer" @wheel="handleWheel">
		<div class="scroll-content">
			<slot></slot>
		</div>
		<div class="custom-scrollbar" ref="scrollbar" @mousedown="startDrag"></div>
	</div>
</template>

<script lang="ts">
export default {
	name: "CustomScrollbar",
	setup() {
		const scrollContainer = ref<HTMLElement | null>(null);
		const scrollbar = ref<HTMLElement | null>(null);
		const isDragging = ref(false);
		const startY = ref(0);
		const startTop = ref(0);

		const updateScrollbar = () => {
			if (!scrollContainer.value || !scrollbar.value) return;
			const container = scrollContainer.value;
			const content = container.querySelector(".scroll-content") as HTMLElement;

			const containerHeight = container.clientHeight;
			const contentHeight = content.scrollHeight;
			const scrollbarHeight = 14; // 固定高度为 14px

			scrollbar.value.style.height = `${scrollbarHeight}px`;
			scrollbar.value.style.top = `${(container.scrollTop / contentHeight) * (containerHeight - scrollbarHeight)}px`;
		};

		const startDrag = (event: MouseEvent) => {
			isDragging.value = true;
			startY.value = event.clientY;
			startTop.value = parseInt(scrollbar.value!.style.top, 10) || 0;
			document.addEventListener("mousemove", handleDrag);
			document.addEventListener("mouseup", stopDrag);
			event.preventDefault(); // 防止选中文本
		};

		const handleDrag = (event: MouseEvent) => {
			if (!isDragging.value || !scrollContainer.value || !scrollbar.value) return;
			const deltaY = event.clientY - startY.value;
			const containerHeight = scrollContainer.value.clientHeight;
			const contentHeight = scrollContainer.value.scrollHeight;
			const scrollbarHeight = scrollbar.value.clientHeight;

			let newTop = startTop.value + deltaY;
			newTop = Math.max(0, newTop);
			newTop = Math.min(containerHeight - scrollbarHeight, newTop);

			scrollbar.value.style.top = `${newTop}px`;
			scrollContainer.value.scrollTop =
				(newTop / (containerHeight - scrollbarHeight)) * (contentHeight - containerHeight);
		};

		const stopDrag = () => {
			isDragging.value = false;
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", stopDrag);
		};

		const handleWheel = (event: WheelEvent) => {
			if (!scrollContainer.value) return;
			scrollContainer.value.scrollTop += event.deltaY;
			updateScrollbar();
		};

		onMounted(() => {
			if (scrollContainer.value) {
				scrollContainer.value.addEventListener("scroll", updateScrollbar);
				updateScrollbar();
			}
		});

		onBeforeUnmount(() => {
			if (scrollContainer.value) {
				scrollContainer.value.removeEventListener("scroll", updateScrollbar);
			}
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", stopDrag);
		});

		return {
			scrollContainer,
			scrollbar,
			startDrag,
			handleWheel,
		};
	},
};
</script>

<style scoped>
.scroll-container {
	position: relative;
	overflow: hidden;
	height: 100%;
}

.scroll-content {
	overflow-y: auto;
	height: 100%;
	padding-right: 18px;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.scroll-content::-webkit-scrollbar {
	display: none;
}
.custom-scrollbar {
	position: absolute;
	width: 2px;
	height: 14px; /* 固定高度为 14px */
	right: 2px;
	background: #fff;
	border-radius: 2px;
	cursor: pointer;
	opacity: 0.7;
	transition: opacity 0.3s;
}

.custom-scrollbar:hover {
	opacity: 1;
}
</style>
