<!--
 * @Author: 田鑫
 * @Date: 2024-08-22 13:53:36
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:06:10
 * @Description: 
-->
<template>
	<div class="animation-container">
		<div class="scroll-row" v-for="(_, rowIndex) in coinGroups" :key="rowIndex">
			<div class="item-box" v-for="item in _.concat(_)" :key="item.name">
				<div class="coin-item">
					<img class="logo" :src="item.logo" alt="" />
					<div class="name">{{ item.name }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	coinGroups: { logo: string; name: string }[][];
	animationActive: boolean;
}>();
</script>
<style lang="less" scoped>
@keyframes infinite-slide {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}
.animation-container {
	width: 800px;
	margin-top: 20px;
	background: red;
	overflow-x: hidden;
}
.scroll-row {
	width: max-content;
	display: flex;
	height: 100px;
	animation: infinite-slide v-bind("(animationActive ? 80 : 0) + 's'") linear infinite;
	.item-box {
		display: flex;
		align-items: center;
		padding: 0 26px 0 10px;
		height: 60px;
		border-radius: 100px;
		background-color: #0d0d0d;
		border: 1px solid #474c51;
		cursor: pointer;
		margin-right: 40px;
		.coin-item {
			display: flex;
			align-items: center;
			cursor: pointer;
			.logo {
				width: 40px;
				height: 40px;
				border-radius: 50%;
			}

			.name {
				color: #ffffff;
				font-size: 24px;
				line-height: 24px;
				margin-left: 16px;
			}
		}
	}
}
/* 鼠标悬浮时暂停动画 */
.scroll-row:hover {
	animation-play-state: paused;
	.item-box:hover {
		background-color: #b9f641;
		.coin-item {
			.name {
				color: #131f00;
			}
		}
	}
}
</style>
