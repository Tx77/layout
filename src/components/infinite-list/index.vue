<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 15:04:27
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-15 14:09:12
 * @Description: 
-->

<template>
	<div>
		<!-- <OrderBook /> -->
		<Demo :coinGroups="coinGroupData" />
		<Horizonal :coinGroups="coinGroupData" />
		<horizonalCopy :coinGroups="coinGroupData" />
		<!-- <div class="wrap">
			<div class="slide-dom">
				<div class="itemA">A</div>
				<div class="itemB">B</div>
				<div class="itemA">A</div>
				<div class="itemB">B</div>
			</div>
		</div> -->
	</div>
</template>

<script setup lang="ts" name="ExchangeView">
import { ref } from "vue";
import OrderBook from "./OrderBookCopy.vue";
import Horizonal from "./horizonal.vue";
import horizonalCopy from "./horizonalCopy.vue";
import Demo from "./demo.vue";
import { coinGroup } from "./data.ts";

const coinGroupData = ref(coinGroup);
</script>

<style scoped>
.exchange-view {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2em;
}
@keyframes infinite-slide {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}
.wrap {
	overflow-x: visible;
	background: #eee;
	width: 200px;
	height: 300px;
	margin: 0 auto;
	padding: 100px 0;
}
.slide-dom {
	width: max-content;
	animation: infinite-slide 5s linear infinite;
}
/* 鼠标悬浮时暂停动画 */
.slide-dom:hover {
	animation-play-state: paused;
}
.itemA {
	display: inline-block;
	width: 200px;
	height: 100px;
	background: pink;
}
.itemB {
	display: inline-block;
	width: 200px;
	height: 100px;
	background: yellow;
}
</style>
