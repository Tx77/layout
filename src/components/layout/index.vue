<script setup lang="ts" name="Layout">
import { h, onMounted, reactive, ref, render } from "vue";
import { LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";
import { contractTradeLayout } from "./contractTrade";
import DragResizeContainer from "./dragResizeContainer.vue";
import Header from "./Header.vue";
import { markRaw } from "vue";
import ExchangeChart from "./ExchangeChart.vue";
import ExchangeList from "./ExchangeList.vue";
import ExchangeInfo from "./ExchangeInfo.vue";
import UserExchangeTable from "./UserExchangeTable.vue";

const layoutStrategy = ref(LayoutStrategy.PRO_RIGHT);
const layoutResizer = new LayoutResizer("#app", layoutStrategy.value, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);

const switchLayout = (strategy: LayoutStrategy) => {
	layoutResizer.currentLayoutStrategy.value = strategy;
};

const componentInstance = reactive({
	Header: markRaw(Header),
	ExchangeChart: markRaw(ExchangeChart),
	ExchangeList: markRaw(ExchangeList),
	ExchangeInfo: markRaw(ExchangeInfo),
	UserExchangeTable: markRaw(UserExchangeTable),
});
</script>

<template>
	<div class="home-container" :style="{ height: `${screenHeight}px` }">
		<div style="width: 100%; height: 64px; background: #15191c; color: #fff">Fixed Header</div>
		<DragResizeContainer
			:layoutComponents="[...layoutCompMap.values()]"
			:screenWidth="screenWidth"
			:layoutStrategy="layoutStrategy"
			:layoutResizer="layoutResizer"
			:componentInstance="componentInstance"
		/>
		<div>
			<div class="footer">{{ screenWidth }}px</div>
			<!-- <p>
				screenWidth: {{ screenWidth }}px
				<button @click="switchLayout(LayoutStrategy.PRO_RIGHT)">专业版 - 右</button>
				<button @click="switchLayout(LayoutStrategy.STANDARD)">标准版</button>
				<button @click="switchLayout(LayoutStrategy.PRO_LEFT)">专业版 - 左</button>
			</p> -->
		</div>
	</div>
</template>

<style scoped>
.home-container {
	width: 100%;
}

@media screen and (max-width: 768px) {
	.home-container {
		overflow-x: auto;
	}
}

p {
	position: absolute;
	left: 0;
	bottom: 0;
}

.footer {
	width: 100%;
	height: 30px;
	position: fixed;
	bottom: 0;
	background-color: #15191c;
	z-index: 10;
}
</style>
