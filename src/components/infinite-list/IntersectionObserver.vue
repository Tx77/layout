<!--
 * @Author: 田鑫
 * @Date: 2024-08-24 10:05:56
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 10:05:56
 * @Description:  IntersectionObsever示例
-->
<template>
	<div class="home-page" ref="homePageRef">
		<!-- <button @click="show = !show">toggle</button>
		<div class="box">
			<ComputedExamplate v-show="show"></ComputedExamplate>
		</div> -->
		<!-- <Demo :coinGroups="coinGroupData" /> -->

		<div ref="longListRef">
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
			<p>asd</p>
		</div>
		<div ref="swiperRef">
			<Swiper v-if="swiperShow" />
		</div>
		<div ref="animationRef">
			<Animation :coinGroups="coinGroupData" :animationActive="animationShow" v-show="animationShow" />
		</div>
		<!-- <Horizonal :coinGroups="coinGroupData" /> -->
		<!-- <horizonalCopy :coinGroups="coinGroupData" /> -->
	</div>
</template>

<script setup lang="ts" name="ExchangeView">
import { ref, computed, onMounted, onUnmounted } from "vue";
import OrderBook from "./OrderBookCopy.vue";
import Horizonal from "./horizonal.vue";
import horizonalCopy from "./horizonalCopy.vue";
import Demo from "./demo.vue";
import ComputedExamplate from "./Computed.vue";
import Animation from "./Animation.vue";
import Swiper from "./Swiper.vue";
import { coinGroup } from "./data.ts";
import store from "./store";

const coinGroupData = ref(coinGroup);
const show = ref(false);
const columns = computed(() => store.tableColumns);
const data = computed(() => store.tableData);
const swiperShow = ref(false);
const animationShow = ref(false);

const homePageRef = ref<HTMLElement | null>(null);
const longListRef = ref<HTMLElement | null>(null);
const swiperRef = ref<HTMLElement | null>(null);
const animationRef = ref<HTMLElement | null>(null);

// 防抖函数
function debounce(fn: Function, delay: number) {
	let timer: number | undefined;
	return function (...args: any[]) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}
onMounted(() => {
	const observerCallback = debounce((entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (entry.target === swiperRef.value) {
				swiperShow.value = entry.isIntersecting;
			}
			if (entry.target === animationRef.value) {
				animationShow.value = entry.isIntersecting;
			}
		});
	}, 200); // 100ms 防抖延迟

	const observer = new IntersectionObserver(observerCallback, {
		threshold: 0.1, // 在元素可见 10% 的时候触发
		// rootMargin: "0px 0px 0px 0px", // 不使用任何 rootMargin
	});

	if (swiperRef.value) {
		observer.observe(swiperRef.value);
	}
	if (animationRef.value) {
		observer.observe(animationRef.value);
	}

	onUnmounted(() => {
		if (swiperRef.value) {
			observer.unobserve(swiperRef.value);
		}
		if (animationRef.value) {
			observer.unobserve(animationRef.value);
		}
		observer.disconnect();
	});
});
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
