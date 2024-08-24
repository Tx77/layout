<!--
 * @Author: 田鑫
 * @Date: 2024-08-12 11:10:13
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:06:29
 * @Description: 
-->
<template>
	<div class="scroll-container">
		<div
			v-for="(items, rowIndex) in visibleRows"
			:key="rowIndex"
			class="scroll-row"
			@mouseenter="pauseAnimation(rowIndex)"
			@mouseleave="resumeAnimation(rowIndex)"
			@animationiteration="handleAnimationIteration(rowIndex)"
		>
			<div class="scroll-content" :class="{ paused: isPaused[rowIndex] }">
				<div v-for="(item, itemIndex) in items" :key="itemIndex" class="scroll-item">
					<img :src="item.logo" alt="logo" class="logo" @load="handleImageLoad" :class="{ loaded: imageLoaded }" />
					<span>{{ item.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Item {
	logo: string;
	name: string;
}

const props = defineProps<{
	coinGroups: Item[][];
}>();

// 每行可视区域显示的 item 数量
const VISIBLE_COUNT = 7;

// 控制每行动画暂停的状态
const isPaused = ref<boolean[]>(Array(props.coinGroups.length).fill(false));

// 动态生成可视区域的数据
const visibleRows = ref<Item[][]>(
	props.coinGroups.map((row) => {
		return row.slice(0, VISIBLE_COUNT);
	})
);

// 跟踪每行的当前索引，标识已经显示到哪一项
const currentIndices = ref<number[]>(Array(props.coinGroups.length).fill(VISIBLE_COUNT));

const imageLoaded = ref(false); // 控制图片加载状态

// 暂停动画
const pauseAnimation = (index: number) => {
	isPaused.value[index] = true;
};

// 恢复动画
const resumeAnimation = (index: number) => {
	isPaused.value[index] = false;
};

// 处理动画循环事件
const handleAnimationIteration = (rowIndex: number) => {
	const rowItems = visibleRows.value[rowIndex];
	const originalRow = props.coinGroups[rowIndex];

	// 将第一个元素移除，并顺序添加一个新元素到末尾
	if (rowItems.length > 0) {
		rowItems.shift(); // 移除第一个 item

		// 获取下一个 item 的索引
		const nextIndex = currentIndices.value[rowIndex];
		if (nextIndex < originalRow.length) {
			rowItems.push(originalRow[nextIndex]); // 顺序添加下一个 item
			currentIndices.value[rowIndex] += 1; // 更新当前索引
		} else {
			// 如果到达了原始数据的末尾，回到数组起始位置继续
			rowItems.push(originalRow[nextIndex % originalRow.length]);
			currentIndices.value[rowIndex] = 1; // 重置为 1，确保能顺序循环添加
		}

		visibleRows.value[rowIndex] = [...rowItems]; // 触发响应性
	}
};

// 图片加载完成后的处理函数，触发过渡效果
function handleImageLoad() {
	imageLoaded.value = true;
}

// 初始化动画
onMounted(() => {
	// 每行数据初始化时的动画
	visibleRows.value.forEach((_, rowIndex) => {
		handleAnimationIteration(rowIndex);
	});
});
</script>

<style lang="less" scoped>
.scroll-container {
	display: flex;
	flex-direction: column;
}

.scroll-row {
	overflow: hidden;
	white-space: nowrap;
	margin: 10px 0;
	height: 100px;
}

.scroll-content {
	display: inline-flex;
	animation: scroll 5s linear infinite;
}

.scroll-content.paused {
	animation-play-state: paused;
}

.scroll-item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 10px 26px 10px 10px;
	border-radius: 100px;
	margin-right: 60px;
	box-sizing: border-box;
	background-color: #ddd;
}

.logo {
	width: 30px;
	height: 30px;
	margin-right: 10px;
}

/* 无限滚动的动画 */
@keyframes scroll {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-100%);
	}
}
</style>
