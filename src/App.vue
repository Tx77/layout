<script setup lang="ts">
import { ref } from "vue";
import Header from "./components/comp1.vue";
import ExchangeChart from "./components/comp2.vue";
import ExchangeList from "./components/comp3.vue";
import ExchangeInfo from "./components/comp4.vue";
import UserExchangeTable from "./components/comp5.vue";
import { LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";

const layoutResizer = new LayoutResizer("#app", LayoutStrategy.PRO_RIGHT);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);

const switchLayout = (layoutStrategy: LayoutStrategy) => {
	layoutResizer.currentLayoutStrategy.value = layoutStrategy;
};
</script>

<template>
	<div class="home-container" :style="{ height: `${screenHeight}px` }">
		<Header v-if="layoutCompMap.get('Header')?.layoutStyle" :layoutStyle="layoutCompMap.get('Header')?.layoutStyle" />
		<ExchangeChart
			v-if="layoutCompMap.get('ExchangeChart')?.layoutStyle"
			:layoutStyle="layoutCompMap.get('ExchangeChart')?.layoutStyle"
		/>
		<ExchangeList
			v-if="layoutCompMap.get('ExchangeList')?.layoutStyle"
			:layoutStyle="layoutCompMap.get('ExchangeList')?.layoutStyle"
		/>
		<ExchangeInfo
			v-if="layoutCompMap.get('ExchangeInfo')?.layoutStyle"
			:layoutStyle="layoutCompMap.get('ExchangeInfo')?.layoutStyle"
		/>
		<UserExchangeTable
			v-if="layoutCompMap.get('UserExchangeTable')?.layoutStyle"
			:layoutStyle="layoutCompMap.get('UserExchangeTable')?.layoutStyle"
		/>
		<div>
			<p>
				screenWidth: {{ screenWidth }}px
				<button @click="switchLayout(LayoutStrategy.PRO_RIGHT)">专业版 - 右</button>
				<button @click="switchLayout(LayoutStrategy.PRO_LEFT)">专业版 - 左</button>
			</p>
		</div>
	</div>
</template>

<style scoped>
.home-container {
	width: 100%;
}

p {
	position: absolute;
	left: 0;
	bottom: 0;
}
</style>
