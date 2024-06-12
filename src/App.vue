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

// function solveEquation(screenWidth: number) {
// 	const x = ((1 - 0.072) * screenWidth) / (1 + 0.6225);
// 	const y = ((1 - 0.072) * screenWidth) / (1 + 0.1874);
// 	const z = ((1 - 0.072) * screenWidth) / (1 + 0.1874);

// 	const transformNum = (num: number) => parseFloat(num.toFixed(2));

// 	return { x: transformNum(x), y: transformNum(y), z: transformNum(z) };
// }

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
			return resolution[resolutionRange].map((item) => {
				if (item.width[1] === maxWidth) {
					item.width = "100%";
				}
				return item;
			});
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
		const compPosition = getRelativePosition(item, screenWidth.value);
		layoutCompMap.set(item.compName, {
			compName: item.compName,
			layoutStyle: {
				position: "absolute",
				left: `${compPosition.x}%`,
				top: `${item.y}px`,
				width: `${compPosition.maxWidth}%`,
				minWidth: `${compPosition.minWidth}%`,
				maxWidth: `${compPosition.maxWidth}%`,
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
	screenWidth: number
): { x: number; width: number; [x: string]: number } {
	const { x, width } = compStyles;

	//* 解析区间值
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
		//todo 最大值的计算有误，屏幕宽度是在不断变化的，如果layout中组件的最小和最大宽度和屏幕宽度区间一致，则组件的宽度百分比应为100%
		const maxPercentage = (range.max / screenWidth) * 100;
		return { minPercentage, maxPercentage };
	};

	let finalWidth: number;
	let finalX: number;
	let minWidth: number;
	let maxWidth: number;
	const xRange = parseRange(x);
	const xPercentage = toPercentage(xRange, screenWidth);
	//* 解析并计算宽度和x值
	if (typeof width === "string" && width === "100%") {
		finalWidth = 100;
		minWidth = 100;
		maxWidth = 100;
		finalX = 0;
	} else {
		const widthRange = parseRange(width);
		const widthPercentage = toPercentage(widthRange, screenWidth);
		//* 取区间的中间值作为最终值

		//todo 取中间值这种方式不行，如果我设定某个元素宽度区间为[1921, 2560]，并且当前屏幕宽度为2560，那得到的宽度百分比就不对
		finalWidth = parseFloat(((widthPercentage.minPercentage + widthPercentage.maxPercentage) / 2).toFixed(2));
		minWidth = widthPercentage.minPercentage;
		maxWidth = widthPercentage.maxPercentage;
		// finalX = parseFloat(((xPercentage.minPercentage + xPercentage.maxPercentage) / 2).toFixed(2));
		if (xPercentage.maxPercentage === xPercentage.minPercentage) {
			finalX = 0;
		} else {
			finalX = parseFloat(xPercentage.maxPercentage.toFixed(2));
		}
	}

	if (finalWidth > 100) {
		finalWidth = 100;
	}

	return {
		x: finalX,
		width: finalWidth,
		minWidth,
		maxWidth,
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
