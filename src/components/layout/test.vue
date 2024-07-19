<!--
 * @Author: 田鑫
 * @Date: 2024-07-17 15:18:11
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-19 11:24:16
 * @Description: 
-->
<template>
	<div class="container">
		<div class="arrow left-arrow" @click="scrollLeft" v-if="showLeftArrow">←</div>
		<div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
			<div class="scroll-content">
				<!-- 内容 -->
				<div class="item" v-for="item in items" :key="item">{{ item }}</div>
			</div>
		</div>
		<div class="arrow right-arrow" @click="scrollRight" v-if="showRightArrow">→</div>
	</div>
</template>

<script lang="ts">
import { ref, onMounted, reactive } from "vue";

export default {
	name: "ScrollComponent",
	setup() {
		const scrollContainer = ref<HTMLElement | null>(null);
		const showLeftArrow = ref(false);
		const showRightArrow = ref(true);
		const scrollStep = 100; // 每次点击箭头滚动的像素值
		const items = reactive([...Array(20).keys()].map((i) => `Item ${i + 1}`));

		const updateArrows = () => {
			if (!scrollContainer.value) return;
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
			console.log(scrollLeft, scrollWidth, clientWidth);
			showLeftArrow.value = scrollLeft > 0;
			showRightArrow.value = scrollLeft < scrollWidth - clientWidth;
		};

		const scrollLeft = () => {
			if (!scrollContainer.value) return;
			scrollContainer.value.scrollBy({ left: -scrollStep, behavior: "smooth" });
		};

		const scrollRight = () => {
			if (!scrollContainer.value) return;
			scrollContainer.value.scrollBy({ left: scrollStep, behavior: "smooth" });
		};

		const handleScroll = () => {
			updateArrows();
		};

		onMounted(() => {
			updateArrows();
		});

		return {
			scrollContainer,
			showLeftArrow,
			showRightArrow,
			scrollLeft,
			scrollRight,
			handleScroll,
			items,
		};
	},
};
</script>

<style scoped>
.container {
	display: flex;
	align-items: center;
	width: 100%;
}

.arrow {
	cursor: pointer;
	user-select: none;
}

.scroll-container {
	display: flex;
	overflow-x: auto;
	flex-grow: 1;
	scroll-behavior: smooth;
}

.scroll-content {
	display: flex;
}

.item {
	min-width: 100px;
	margin-right: 10px;
}
</style>
