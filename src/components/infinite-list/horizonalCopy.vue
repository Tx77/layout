<!--
 * @Author: 田鑫
 * @Date: 2024-08-12 11:10:13
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-13 15:52:08
 * @Description: 
-->
<template>
	<div class="scroll-container">
		<div
			v-for="(row, rowIndex) in coinGroups"
			:key="rowIndex"
			class="row"
			:style="{ transform: `translate(-${offsets[rowIndex]}px, 0) translateZ(0)` }"
		>
			<div
				v-for="(item, index) in getVisibleItems(rowIndex)"
				:key="item.name"
				class="item"
				@mouseover="stopScrolling(rowIndex)"
				@mouseleave="startScrolling(rowIndex)"
				:style="{ left: `${getItemPosition(index, rowIndex)}px` }"
			>
				<div class="coin-item">
					<img :src="item.logo" alt="logo" class="logo" @load="handleImageLoad" :class="{ loaded: imageLoaded }" />
					<span class="name">{{ item.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, watch } from "vue";
import HorizonalWorker from "./horizonalWorker?worker";

const visibleItemCount = 5; // 可视区域内显示的 item 数量
const gap = 0; // item 之间的间距
const itemWidth = 160; // 每个 item 的宽度
const scrollSpeed = 1.45;

// props 传入 coinGroups
const props = defineProps<{
	coinGroups: { logo: string; name: string }[][];
}>();

// 初始化每行的偏移量，使用随机值确保每行不同
const initialOffsets = ref<number[]>(
	props.coinGroups.map(() => Math.random() * 500) // 每行偏移一个随机值（0-500px）
);
const offsets = ref<number[]>([...initialOffsets.value]);

const workers: Worker[] = [];
const imageLoaded = ref(false); // 控制图片加载状态

// 获取当前可视区域内的 items
function getVisibleItems(rowIndex: number) {
	const rowItemCount = props.coinGroups[rowIndex]?.length || 0;
	const startIndex = Math.floor(offsets.value[rowIndex] / (itemWidth + gap));
	const items = [];

	for (let i = 0; i < visibleItemCount + 1; i++) {
		const itemIndex = (startIndex + i) % rowItemCount;
		if (itemIndex < rowItemCount) {
			items.push(props.coinGroups[rowIndex][itemIndex]);
		}
	}
	return items;
}

// 计算每个 item 的位置
function getItemPosition(index: number, rowIndex: number) {
	const startIndex = Math.floor(offsets.value[rowIndex] / (itemWidth + gap));
	return (startIndex + index) * (itemWidth + gap);
}

// 停止滚动
function stopScrolling(rowIndex: number) {
	workers[rowIndex].postMessage({ command: "stop" });
}

// 开始滚动
function startScrolling(rowIndex: number) {
	const rowItemCount = props.coinGroups[rowIndex]?.length || 0;
	workers[rowIndex].postMessage({
		command: "start",
		scrollSpeed,
		rowWidth: rowItemCount * (itemWidth + gap),
	});
}

// 图片加载完成后的处理函数，触发过渡效果
function handleImageLoad() {
	imageLoaded.value = true;
}

// 监听 props 变化，重新初始化 worker
watch(
	() => props.coinGroups,
	(val) => {
		if (val) {
			props.coinGroups.forEach((_, index) => {
				const worker = new HorizonalWorker();
				workers.push(worker);

				const rowItemCount = props.coinGroups[index]?.length || 0;

				worker.postMessage({
					command: "start",
					scrollSpeed,
					rowWidth: rowItemCount * (itemWidth + gap),
				});

				worker.onmessage = (e) => {
					offsets.value[index] = initialOffsets.value[index] + e.data.offset;
				};
			});
		}
	},
	{ immediate: true }
);

// 组件卸载时清除 worker
onUnmounted(() => {
	workers.forEach((worker) => worker.terminate());
});
</script>

<style scoped>
.scroll-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
	overflow: hidden;
	padding: 10px;
	position: relative;
}

.row {
	display: flex;
	position: relative;
	height: 100px;
}

.item {
	position: absolute;
	display: flex;
	align-items: center;
	padding: 10px 26px 10px 10px;
	border-radius: 100px;
	background-color: #ddd;
	user-select: none;
}

.coin-item {
	display: flex;
	align-items: center;
}

.logo {
	width: 20px;
	height: 20px;
	margin-right: 10px;
	opacity: 0;
	transition: opacity 0.5s ease-in-out;
}

.logo.loaded {
	opacity: 1;
}

.name {
	flex-grow: 1;
	text-align: left;
}
</style>
