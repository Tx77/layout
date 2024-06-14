<script setup lang="ts" name="Layout">
import { ref } from "vue";
import { LayoutStrategy } from "./layout.js";
import LayoutResizer from "./LayoutResizer.js";
import { contractTradeLayout } from "./contractTrade.js";

const layoutResizer = new LayoutResizer("#app", LayoutStrategy.PRO_RIGHT, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);

const switchLayout = (layoutStrategy: LayoutStrategy) => {
	layoutResizer.currentLayoutStrategy.value = layoutStrategy;
};
</script>

<template>
	<div class="home-container" :style="{ height: `${screenHeight}px` }">
		<component
			v-for="item in [...layoutCompMap.values()]"
			:key="item.compName"
			:is="item.comp"
			:layoutStyle="item.layoutStyle"
		></component>
		<div>
			<p>
				screenWidth: {{ screenWidth }}px
				<button @click="switchLayout(LayoutStrategy.PRO_RIGHT)">专业版 - 右</button>
				<button @click="switchLayout(LayoutStrategy.STANDARD)">标准版</button>
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
