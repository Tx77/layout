<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 16:29:33
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-15 16:57:02
 * @Description: 
-->

<template>
	<div class="order-book">
		<h2>Order Book</h2>
		<div class="order-header">
			<span>Price (USDT)</span>
			<span>Amount (BTC)</span>
			<span>Cumulative (BTC)</span>
		</div>
		<div
			class="order-list"
			ref="scrollContainer"
			@scroll="onScroll"
			:style="{ height: containerHeight + 'px', overflowY: 'auto' }"
		>
			<div :style="{ height: totalHeight + 'px', position: 'relative' }">
				<div
					v-for="(order, index) in visibleOrders"
					:key="index"
					:style="{
						transform: `translate3d(0, ${(start + index) * itemHeight}px, 0)`,
					}"
					class="order-item"
				>
					<span>{{ order.price.toFixed(2) }}</span>
					<span>{{ order.amount.toFixed(6) }}</span>
					<span>{{ order.cumulative.toFixed(6) }}</span>
					<div
						class="progress-bar"
						:style="{
							transform: `translate3d(-${order.progressBar}, 0, 0)`,
						}"
					></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import OrderWorker from "./orderWorker?worker";

interface Order {
	price: number;
	amount: number;
	cumulative: number;
	progressBar: string;
}

const orders = ref<Order[]>([]);
const visibleOrders = ref<Order[]>([]);
const itemHeight = 40;
const containerHeight = 400;
const buffer = 5;
const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight) + buffer * 2);
const start = ref(0);
const totalHeight = computed(() => orders.value.length * itemHeight);

const scrollContainer = ref<HTMLElement | null>(null);

let worker: Worker;
let intervalId: NodeJS.Timeout;
let isRendering = false;

const updateOrders = async () => {
	if (isRendering) {
		return;
	}

	isRendering = true;

	worker.postMessage(20000);

	worker.onmessage = async (e: MessageEvent) => {
		orders.value = e.data;
		await nextTick();
		isRendering = false;
		updateVisibleOrders();
	};
};

const updateVisibleOrders = () => {
	const startBuffer = Math.max(0, start.value - buffer);
	const endBuffer = Math.min(orders.value.length, start.value + visibleCount.value + buffer);
	visibleOrders.value = orders.value.slice(startBuffer, endBuffer);
};

const onScroll = () => {
	if (scrollContainer.value) {
		const scrollTop = scrollContainer.value.scrollTop;
		start.value = Math.floor(scrollTop / itemHeight);
		requestAnimationFrame(updateVisibleOrders);
	}
};

onMounted(() => {
	worker = new OrderWorker();

	intervalId = setInterval(() => {
		updateOrders();
	}, 500);

	updateVisibleOrders();
});

onUnmounted(() => {
	clearInterval(intervalId);
	worker.terminate();
});
</script>

<style lang="less" scoped>
.order-book {
	width: 100%;
	max-width: 600px;
	margin: 0 auto;
	font-family: Arial, sans-serif;

	h2 {
		text-align: center;
		margin-bottom: 1em;
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		font-weight: bold;
		padding: 0.5em 0;
		border-bottom: 1px solid #ccc;
	}

	.order-list {
		.order-item {
			display: flex;
			justify-content: space-between;
			padding: 0.5em 0;
			border-bottom: 1px solid #eee;
			font-size: 0.9em;
			position: absolute;
			width: 100%;
			box-sizing: border-box;
			overflow-x: hidden;
			&:nth-child(odd) {
				background-color: #f9f9f9;
			}

			.progress-bar {
				height: 28px;
				opacity: 0.1;
				position: absolute;
				width: 100%;
				z-index: 1;
				right: 0;
				background-color: red;
				left: 100%;
			}
		}
	}
}
</style>
