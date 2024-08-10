<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 15:10:32
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-10 15:10:32
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
          :style="{ transform: `translateY(${(start + index) * itemHeight}px)` }"
          class="order-item"
        >
          <span>{{ order.price.toFixed(2) }}</span>
          <span>{{ order.amount.toFixed(6) }}</span>
          <span>{{ order.cumulative.toFixed(6) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import OrderWorker from "./orderWorker?worker";

// 定义订单类型
interface Order {
  price: number;
  amount: number;
  cumulative: number;
}

const orders = ref<Order[]>([]);
const visibleOrders = ref<Order[]>([]);
const itemHeight = 40; // 每个列表项的高度 (像素)
const containerHeight = 400; // 容器高度 (像素)
const buffer = 5; // 额外加载5个项目作为缓冲区
const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight) + buffer * 2); // 可见项数量
const start = ref(0);
const totalHeight = computed(() => orders.value.length * itemHeight); // 总高度

const scrollContainer = ref<HTMLElement | null>(null); // 定义 scrollContainer

let worker: Worker;
let intervalId: NodeJS.Timeout;
let isRendering = false;

const updateOrders = async () => {
  if (isRendering) {
    return;
  }

  isRendering = true;

  worker.postMessage(200);

  worker.onmessage = async (e: MessageEvent) => {
    orders.value = e.data;
    await nextTick();
    isRendering = false;
    updateVisibleOrders();
  };
};

const updateVisibleOrders = () => {
  const startBuffer = Math.max(0, start.value - buffer);
  const endBuffer = Math.min(
    orders.value.length,
    start.value + visibleCount.value + buffer
  );
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

      &:nth-child(odd) {
        background-color: #f9f9f9;
      }
    }
  }
}
</style>
