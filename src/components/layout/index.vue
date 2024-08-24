<script setup lang="ts" name="Layout">
import { LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";
import { contractTradeLayout } from "./contractTrade";
import DragResizeContainer from "./dragResizeContainer.vue";
import Header from "./Header.vue";
import ExchangeChart from "./ExchangeChart.vue";
import ExchangeList from "./ExchangeList.vue";
import ExchangeInfo from "./ExchangeInfo.vue";
import UserExchangeTable from "./UserExchangeTable.vue";

const layoutStrategy = ref(LayoutStrategy.PRO_RIGHT);
const layoutResizer = new LayoutResizer("#app", layoutStrategy.value, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const computedScreenHeight = computed(() => {
	return layoutResizer.screenHeight.value - 64 - 30;
});
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

const initProps = reactive({
	Header: {
		screenWidth,
	},
});
</script>

<template>
	<div class="home-container">
		<div style="width: 100%; height: 64px; background: #15191c; color: #fff">Fixed Header</div>
		<DragResizeContainer
			:layoutComponents="[...layoutCompMap.values()]"
			:screenWidth="screenWidth"
			:screenHeight="computedScreenHeight"
			:layoutStrategy="layoutStrategy"
			:layoutResizer="layoutResizer"
			:init-props="initProps"
			:componentInstance="componentInstance"
		/>
		<div class="footer">
			<div>{{ screenWidth }}px</div>
			<!-- <div class="btn-wrapper">
				<button @click="switchLayout(LayoutStrategy.PRO_RIGHT)">专业布局 - 右</button>
				<button @click="switchLayout(LayoutStrategy.PRO_LEFT)">专业布局 - 左</button>
			</div> -->
		</div>
	</div>
</template>

<style scoped>
.home-container {
	width: 100%;
	height: 100%;
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
	color: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	.btn-wrapper {
		display: flex;
		align-items: center;
		button {
			color: #fff;
		}
	}
}
</style>
