<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import {
	screenResolutionMap,
	type ComponentStyle,
	type LayoutStrategy,
	type ComponentWidthRange,
	type Resolution,
	type Coordinate,
} from "./layout";
import Header from "./components/comp1.vue";
import ExchangeChart from "./components/comp2.vue";
import ExchangeList from "./components/comp3.vue";
import ExchangeInfo from "./components/comp4.vue";
import UserExchangeTable from "./components/comp5.vue";

const screenWidth = ref(0);
const screenHeight = ref(0);
const screenMinWidth = ref(0);
const screenMaxWidth = ref(0);
const layoutCompMap = reactive<Map<string, { compName: string; layoutStyle: ComponentStyle }>>(new Map());
const currentLayoutStrategy = ref<LayoutStrategy>("strategy1");

const resizeObserver = ref<ResizeObserver | null>(null);
const observedElement = ref<HTMLElement | null>(null);

onMounted(() => {
	observedElement.value = document.querySelector("#app");
	if (observedElement.value) {
		resizeObserver.value = new ResizeObserver((entries) => {
			const entry = entries[0];
			const { width, height } = entry.contentRect;
			screenWidth.value = width;
			screenHeight.value = height;
			// const solution = solveEquation(width);
			// console.log(solution, solution.x + solution.y + solution.z);

			const compStyles = loadComponentWidthRange(currentLayoutStrategy.value, width);
			if (compStyles) {
				setComponentStyleByStrategy(compStyles);
			}
		});
		resizeObserver.value.observe(observedElement.value);
	}
});

/**
 * 加载组件宽度区间
 * @param layoutStrategy 布局策略
 * @param screenWidth 屏幕宽度
 */
const loadComponentWidthRange = (layoutStrategy: LayoutStrategy, screenWidth: number): ComponentWidthRange[] => {
	let layoutStyles: ComponentWidthRange[] | null = [];
	for (let item of screenResolutionMap) {
		if (item.layoutStrategy === layoutStrategy) {
			layoutStyles = getComponentWidthRange(screenWidth, item.resolution);
			break;
		}
	}
	if (!layoutStyles || layoutStyles.length === 0) {
		layoutStyles = getComponentWidthRange(screenWidth, screenResolutionMap[0].resolution) as ComponentWidthRange[];
	}
	return layoutStyles;
};

/**
 * 获取组件宽度区间
 * @param screenWidth
 * @param resolution
 */
const getComponentWidthRange = (screenWidth: number, resolution: Resolution): ComponentWidthRange[] | null => {
	for (const resolutionRange in resolution) {
		const [minWidth, maxWidth] = JSON.parse(resolutionRange.replace("[", "[").replace("]", "]"));
		if (screenWidth >= minWidth && screenWidth <= maxWidth) {
			screenMinWidth.value = minWidth;
			screenMaxWidth.value = maxWidth;
			return resolution[resolutionRange];
		}
	}
	return null; //* 如果没有找到对应的分辨率范围，则返回null
};

/**
 * 根据布局策略设置组件样式
 * @param compStyles
 */
const setComponentStyleByStrategy = (compStyles: ComponentWidthRange[]) => {
	compStyles.forEach((item: ComponentWidthRange) => {
		const compPosition = getRelativePosition(item, screenWidth.value, screenMinWidth.value, screenMaxWidth.value);
		layoutCompMap.set(item.compName, {
			compName: item.compName,
			layoutStyle: {
				position: "absolute",
				left: `${compPosition.x}%`,
				top: `${item.y}px`,
				width: `${compPosition.width}%`,
				height: `${item.height}px`,
				transition: "all 0.25s ease",
			},
		});
	});
};

/**
 * 计算组件相对位置和大小的函数
 * @param compStyles - 组件的样式信息
 * @param screenWidth - 屏幕宽度
 * @returns 组件的计算位置和大小
 */
function getRelativePosition(
	compStyles: ComponentWidthRange,
	screenWidth: number,
	screenMinWidth: number,
	screenMaxWidth: number
): { x: string; width: string } {
	const { x, width } = compStyles;

	/**
	 * 解析区间值
	 * @param value
	 */
	const parseRange = (value: Coordinate): { min: number; max: number } => {
		if (Array.isArray(value)) {
			const [min, max] = value;
			return { min, max };
		}
		return { min: value, max: value };
	};

	/**
	 * 转换为基于屏幕宽度的百分比
	 * @param range
	 * @param screenWidth
	 */
	const toPercentage = (
		range: { min: number; max: number },
		screenWidth: number
	): { minPercentage: number; maxPercentage: number } => {
		const minPercentage = (range.min / screenWidth) * 100;
		const maxPercentage = (range.max / screenWidth) * 100;
		return { minPercentage, maxPercentage };
	};

	/**
	 * 计算在当前屏幕宽度下的具体值
	 * @param range
	 * @param screenWidth
	 * @param screenMinWidth
	 * @param screenMaxWidth
	 */
	const calculateValue = (
		range: { min: number; max: number },
		screenWidth: number,
		screenMinWidth: number,
		screenMaxWidth: number
	): number => {
		const screenRange = screenMaxWidth - screenMinWidth;
		const valueRange = range.max - range.min;
		const normalizedScreenWidth = screenWidth - screenMinWidth;
		return range.min + (valueRange * normalizedScreenWidth) / screenRange;
	};

	//* 解析并计算宽度和x值
	const widthRange = parseRange(width);
	const xRange = parseRange(x);

	const calculatedWidth = calculateValue(widthRange, screenWidth, screenMinWidth, screenMaxWidth);
	const calculatedX = calculateValue(xRange, screenWidth, screenMinWidth, screenMaxWidth);

	//* 转换为百分比
	const widthPercentage = toPercentage(
		{ min: Math.round(calculatedWidth), max: Math.round(calculatedWidth) },
		screenWidth
	);
	const xPercentage = toPercentage({ min: Math.round(calculatedX), max: Math.round(calculatedX) }, screenWidth);
	return {
		x: xPercentage.minPercentage.toFixed(0),
		width: widthPercentage.minPercentage.toFixed(0),
	};
}

onUnmounted(() => {
	if (resizeObserver.value && observedElement.value) {
		resizeObserver.value.unobserve(observedElement.value);
		resizeObserver.value.disconnect();
		resizeObserver.value = null;
	}
});
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
		<p>screenWidth: {{ screenWidth }}px</p>
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
