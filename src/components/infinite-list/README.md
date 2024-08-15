# 只渲染可视区域的无限滚动列表

## 设计思路

### 前言

1. 传统的无限滚动通常采用 css 的`@keyframes`，通过复制一份 dom 节点，调整`translateX`来实现。这种方式的帧率比较稳定，动画效果过渡流畅，视觉体验比较舒服。但存在几个问题  
   1.1 dom 数\*2，当数据量较多时，cpu 负载和 dom 节点会严重影响性能。  
   1.2 如果存在多行数据，且每行渲染数据不同时，`animation`中用相同的渲染时间会导致每行的动画速度不一致，当行内数据量相差过大时，更为明显。
2. 采用`虚拟列表`的设计思路，只显示可视区域内的数据是一个更为合理的设计。但难点在于无限滚动应该如何实现，本质上来说是`取余`，比如：
   ```js
   初始下标：0，总渲染数：3
   0 % 3 = 0
   1 % 3 = 1
   2 % 3 = 2
   3 % 3 = 0
   4 % 3 = 1
   5 % 3 = 2
   6 % 3 = 0
   ```

## 技术栈

Vue3, Typescript, Vite

## 功能实现

```vue
<template>
	<div>
		<div class="scroll-container">
			<div
				class="scroll-row"
				v-for="(_, rowIndex) in coinGroups"
				:key="rowIndex"
				:style="{ transform: `translate3d(-${offsets[rowIndex]}px, 0, 0)` }"
				@mouseover="pauseScroll(rowIndex)"
				@mouseout="resumeScroll(rowIndex)"
			>
				<div
					class="item-box"
					v-for="(item, index) in visibleItems[rowIndex]"
					:key="index"
					:style="{ transform: `translateX(${index * ITEM_WIDTH}px)` }"
				>
					<img :src="item.logo" alt="" class="logo" />
					<div class="name">{{ item.name }}</div>
				</div>
			</div>
		</div>
	</div>
</template>
```

```js
<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
	coinGroups: { logo: string; name: string }[][];
}>();

const VISIBLE_COUNT = 7; // 每行可视区域内显示的 item 数量
const ITEM_WIDTH = 160; // 每个 item 的宽度
const speed = 0; // 移动速度

const offsets = ref<number[]>(props.coinGroups.map(() => Math.random() * ITEM_WIDTH));
const visibleItems = ref(props.coinGroups.map((group) => group.slice(0, VISIBLE_COUNT)));

// 管理每行的动画 ID 和滚动状态
const animationIds = ref<number[]>(props.coinGroups.map(() => 0));
const isScrollingPaused = ref<boolean[]>(props.coinGroups.map(() => false));

const startScroll = () => {
	offsets.value = offsets.value.map((offset, rowIndex) => {
		if (!isScrollingPaused.value[rowIndex]) {
			let newOffset = offset + speed;

			if (newOffset >= ITEM_WIDTH) {
				newOffset -= ITEM_WIDTH;

				// 滚动到一项移出视图时，移除第一个并在末尾添加新的项
				const removedItem = visibleItems.value[rowIndex].shift();
				if (removedItem) {
					const group = props.coinGroups[rowIndex];
					const nextIndex = (group.indexOf(removedItem) + VISIBLE_COUNT) % group.length;
					visibleItems.value[rowIndex].push(group[nextIndex]);
				}
			}

			return newOffset;
		}

		return offset;
	});

	// 为每行重新请求动画帧
	animationIds.value = animationIds.value.map((id, rowIndex) => {
		if (id) {
			cancelAnimationFrame(id);
		}
		return !isScrollingPaused.value[rowIndex] ? requestAnimationFrame(startScroll) : 0;
	});
};

// 控制滚动暂停和恢复
const pauseScroll = (rowIndex: number) => {
	isScrollingPaused.value[rowIndex] = true;
};

const resumeScroll = (rowIndex: number) => {
	isScrollingPaused.value[rowIndex] = false;
};

// 开始滚动
onMounted(() => {
	startScroll();
});

// 监听 props.coinGroups 的变化
watch(
	() => props.coinGroups,
	(newVal) => {
		if (newVal && newVal.length > 0 && newVal[0].length > 0) {
			if (animationIds.value.every((id) => id === 0)) {
				startScroll();
			}
		}
	},
	{ immediate: true, deep: true }
);

onBeforeUnmount(() => {
	// 清除所有动画帧
	animationIds.value.forEach((id) => cancelAnimationFrame(id));
});
</script>
```

```css
<style lang="less" scoped>
.scroll-container {
	width: 800px;
	overflow-x: hidden;
	position: relative;
	background-color: red;
	.scroll-row {
		display: flex;
		align-items: center;
		height: 100px;
		width: 100%;
		margin-bottom: 10px;
		.item-box {
			position: absolute;
			display: flex;
			justify-content: center;
			padding: 10px 26px 10px 10px;
			border-radius: 100px;
			box-sizing: border-box;
			background-color: #ddd;
			transform: translateX(0); /* 使用 translateX 替代 left */
			.logo {
				width: 30px;
				height: 30px;
				margin-right: 10px;
			}
			.name {
			}
		}
	}
}
</style>

```
