<!--
 * @Author: 田鑫
 * @Date: 2024-08-10 15:04:27
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:05:23
 * @Description: 
-->

<template>
	<div class="home-page">
		<!-- <button @click="show = !show">toggle</button>
		<div class="box">
			<ComputedExamplate v-show="show"></ComputedExamplate>
		</div> -->
		<!-- <Demo :coinGroups="coinGroupData" /> -->
		<OrderBook />
		<VirtualSocketList />
		<!-- <Animation :coinGroups="coinGroupData" /> -->
		<!-- <Horizonal :coinGroups="coinGroupData" /> -->
		<!-- <horizonalCopy :coinGroups="coinGroupData" /> -->
	</div>
</template>

<script setup lang="ts" name="ExchangeView">
import OrderBook from "./OrderBookCopy.vue";
import Horizonal from "./horizonal.vue";
import horizonalCopy from "./horizonalCopy.vue";
import Demo from "./demo.vue";
import ComputedExamplate from "./Computed.vue";
import Animation from "./Animation.vue";
import Swiper from "./Swiper.vue";
import VirtualSocketList from "./VirtualSocketList.vue";
import { coinGroup } from "./data";
import store from "./store";

const coinGroupData = ref(coinGroup);
const show = ref(false);
const columns = computed(() => store.tableColumns);
const data = computed(() => store.tableData);
</script>

<style scoped lang="less">
.exchange-view {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2em;
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
