<script setup lang="ts" name="Layout">
import { ref, watchEffect } from "vue";
import { LayoutStrategy, LayoutCompMap } from "./layout";
import LayoutResizer from "./LayoutResizer";
import { contractTradeLayout } from "./contractTrade";
import DragResizeContainer from "./DragResizeContainer.vue";

const layoutResizer = new LayoutResizer("#app", LayoutStrategy.PRO_RIGHT, contractTradeLayout);

const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);
const layoutData = ref<LayoutCompMap[]>([]);

watchEffect(() => {
	if (layoutCompMap.value.size > 0) {
		layoutData.value = [...layoutCompMap.value.values()].map((item) => {
			Object.assign(item.layoutStyle, {
				x: translateToPxNumber(item.layoutStyle.left as string),
				y: translateToPxNumber(item.layoutStyle.top as string),
				width: translateToPxNumber(item.layoutStyle.width as string),
				height: translateToPxNumber(item.layoutStyle.height as string),
			});
			return item;
		});
		// console.log(layoutData.value);
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
		<DragResizeContainer :components="layoutData"></DragResizeContainer>
		<!-- <component
			v-for="item in [...layoutCompMap.values()]"
			:key="item.compName"
			:is="item.comp"
			:layoutStyle="item.layoutStyle"
			:id="item.compName"
		></component> -->
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
