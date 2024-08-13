<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 15:04:27
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-13 14:18:07
 * @Description: 
-->

<template>
  <div>
    <OrderBook />
    <Horizonal :coinGroups="coinGroupData" />
  </div>
</template>

<script setup lang="ts" name="ExchangeView">
import { ref } from "vue";
import OrderBook from "./OrderBookCopy.vue";
import Horizonal from "./horizonalCopy.vue";
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
</style>
