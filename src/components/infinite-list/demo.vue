<!--
 * @Author: 田鑫
 * @Date: 2024-08-15 10:16:04
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:06:21
 * @Description: 
-->

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

<script setup lang="ts">
const props = defineProps<{
	coinGroups: { logo: string; name: string }[][];
}>();

const VISIBLE_COUNT = 7; // 每行可视区域内显示的 item 数量
const ITEM_WIDTH = 160; // 每个 item 的宽度
const speed = 2; // 移动速度

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
