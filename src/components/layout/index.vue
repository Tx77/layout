<script setup lang="ts" name="Layout">
import { ref, watchEffect } from "vue";
import { LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";
import { contractTradeLayout } from "./contractTrade";
import { ComponentState } from "./params";

const layoutResizer = new LayoutResizer("#app", LayoutStrategy.PRO_RIGHT, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);
const layoutData = ref<ComponentState[]>([]);

watchEffect(() => {
	if (layoutCompMap.value.size > 0) {
		layoutData.value = [...layoutCompMap.value.values()].map((item) => {
			return Object.assign({
				id: item.compName,
				x: translateToPxNumber(item.layoutStyle.left),
				y: translateToPxNumber(item.layoutStyle.top),
				width: translateToPxNumber(item.layoutStyle.width),
				height: translateToPxNumber(item.layoutStyle.height),
				zIndex: item.layoutStyle.zIndex,
				fixed: item.fixed,
			});
		});
		console.log(layoutData.value);
	}
});

const translateToPxNumber = (val: string): number => {
	if (val.indexOf("%") > -1) {
		return parseFloat((screenWidth.value * (parseFloat(val) / 100)).toFixed(4));
	}
	return parseFloat(val);
};

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
			:id="item.compName"
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
