<script setup lang="ts" name="Layout">
import { ref } from "vue";
import { LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";
import { contractTradeLayout } from "./contractTrade";
import DragResizeContainer from "./DragResizeContainer.vue";

const layoutStrategy = ref(LayoutStrategy.PRO_RIGHT);
const layoutResizer = new LayoutResizer("#app", layoutStrategy.value, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);

const switchLayout = (strategy: LayoutStrategy) => {
	layoutResizer.currentLayoutStrategy.value = strategy;
};
</script>

<template>
	<div class="home-container" :style="{ height: `${screenHeight}px` }">
		<DragResizeContainer
			:layoutComponents="[...layoutCompMap.values()]"
			:screenWidth="screenWidth"
			:layoutStrategy="layoutStrategy"
		/>
		<div>
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

p {
	position: absolute;
	left: 0;
	bottom: 0;
}
</style>
