<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 15:04:27
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-10 15:04:27
 * @Description: 
-->

<template>
  <div>
    <OrderBook />
  </div>
</template>

<script lang="ts" name="ExchangeView">
import { defineComponent } from "vue";
import OrderBook from "./OrderBookCopy.vue";

export default defineComponent({
  name: "ExchangeView",
  components: {
    OrderBook,
  },
  setup() {},
});
</script>

<style scoped>
.exchange-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2em;
}
</style>
