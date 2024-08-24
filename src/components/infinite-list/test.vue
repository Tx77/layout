<!--
 * @Author: 田鑫
 * @Date: 2024-08-14 10:32:51
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:07:43
 * @Description: 
-->
<template>
	<div class="infinite-scroll">
		<div
			v-for="(row, rowIndex) in props.data"
			:key="rowIndex"
			class="scroll-row"
			@mouseenter="stopScroll(rowIndex)"
			@mouseleave="startScroll(rowIndex)"
		>
			<div ref="scrollContainer" :style="getScrollContainerStyle(rowIndex)" class="scroll-container">
				<div v-for="(item, index) in visibleItems(row, rowIndex)" :key="index" class="scroll-item">
					<img :src="item.logo" alt="" class="item-logo" />
					<span class="item-name">{{ item.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface ScrollItem {
	logo: string;
	name: string;
}

interface Props {
	data: ScrollItem[][];
}

const props = defineProps<Props>();

const itemWidth = 200; // 假设每个item的宽度为200px
const visibleItemCount = 7; // 每行显示的item数量
const scrollSpeed = 1; // 滚动速度

const scrollPositions = ref(new Array(props.data.length).fill(0));
const animationFrameIds = ref<number[]>([]);
const animationPaused = ref(new Array(props.data.length).fill(false));

const visibleItems = (row: ScrollItem[], rowIndex: number) => {
	const startIdx = Math.floor(scrollPositions.value[rowIndex] / itemWidth) % row.length;
	return new Array(visibleItemCount).fill(null).map((_, i) => row[(startIdx + i) % row.length]);
};

const getScrollContainerStyle = (rowIndex: number) => {
	const pauseStyle = animationPaused.value[rowIndex] ? "paused" : "running";
	return {
		width: `${itemWidth * visibleItemCount}px`,
		animation: `scroll-${rowIndex} linear infinite`,
		"animation-play-state": pauseStyle,
		"animation-duration": `${props.data[rowIndex].length / scrollSpeed}s`,
	};
};

const startScroll = (rowIndex: number) => {
	animationPaused.value[rowIndex] = false;
};

const stopScroll = (rowIndex: number) => {
	animationPaused.value[rowIndex] = true;
};

onMounted(() => {
	props.data.forEach((_, rowIndex) => startScroll(rowIndex));
});

onBeforeUnmount(() => {
	animationFrameIds.value.forEach((id) => cancelAnimationFrame(id));
});
</script>

<style lang="less" scoped>
.infinite-scroll {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-row {
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 20px; /* 每行之间的间隔 */
  position: relative;
}

.scroll-container {
  display: flex;
  position: relative;
  width: 100%;
}

.scroll-item {
  width: 200px; /* 每个item的宽度 */
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.item-logo {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.item-name {
  margin-top: 10px;
  font-size: 16px;
}

/* 定义动态生成的动画 */
@for $i from 0 through 3 {
  @keyframes scroll-#{$i} {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
}
</style>
