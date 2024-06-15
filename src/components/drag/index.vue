<template>
	<div class="app">
		<DraggableResizable
			v-for="comp in components"
			:key="comp.id"
			:id="comp.id"
			:x="comp.x"
			:y="comp.y"
			:width="comp.width"
			:height="comp.height"
			:zIndex="comp.zIndex"
			:snapDistance="snapDistance"
			:ghostStyle="ghostStyle"
			@drag="handleDrag"
			@resize="handleResize"
			:setCurrentComponent="getCurrentComponent"
			:setGhostComponent="getGhostComponent"
			:directions="['right', 'bottom-right']"
		/>
		<div class="ghost" v-if="isGhost" :style="ghostStyle"></div>
	</div>
</template>

<script setup lang="ts">
//todo 1 增加布局切换的功能，且切换有过渡效果
//todo 2 吸附功能也需要增加过渡效果
//todo 3 resize的操作节点需要可配置，并且允许用svg替代
//todo 4 拖拽区域需要可配置
//todo 5 增加drag预期位置显示，并设置吸附距离，达到吸附距离后立即移动到吸附后的位置，并增加过渡效果
//todo 6 当预期位置侵占其他组件时，需要移动被侵占组件的位置
import { onMounted, reactive, ref } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
interface ComponentState {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	zIndex?: number | string;
}
interface SnapResult {
	id?: string;
	left: number;
	top: number;
	width: number;
	height: number;
	cx?: number;
	cy?: number;
	isSnap: boolean;
}
interface GhostStyle {
	top: number | string;
	left: number | string;
	width: number | string;
	height: number | string;
	zIndex?: number | string;
	backgroundColor: string;
	position: string;
	transition?: string;
}
const snapDistance = 50;
const defaultComponents = [
	{ id: "comp1", x: 100, y: 100, width: 400, height: 200, zIndex: "1" },
	{ id: "comp2", x: 800, y: 400, width: 600, height: 300, zIndex: "1" },
	{ id: "comp3", x: 600, y: 800, width: 300, height: 600, zIndex: "1" },
	{ id: "comp4", x: 400, y: 400, width: 200, height: 200, zIndex: "1" },
];
const components = ref<ComponentState[]>([]);
const currentComp = reactive<ComponentState>({
	id: "",
	x: 0,
	y: 0,
	width: 0,
	height: 0,
});
const parentWidth = ref(0);
const parentHeight = ref(0);
const ghostStep = ref(0);
const isGhost = ref(false);
const ghostStyle = ref<GhostStyle>();

const loadState = () => {
	const savedState = localStorage.getItem("componentsState");
	if (savedState) {
		Object.assign(components.value, JSON.parse(savedState));
	} else {
		Object.assign(components.value, defaultComponents);
	}
};

const saveState = () => {
	localStorage.setItem("componentsState", JSON.stringify(components.value));
};

const handleDrag = (id: string, x: number, y: number) => {
	const component = components.value.find((c) => c.id === id);
	if (component) {
		component.x = x;
		component.y = y;
		saveState();
	}
};

const handleResize = (id: string, width: number, height: number) => {
	const component = components.value.find((c) => c.id === id);
	if (component) {
		component.width = width;
		component.height = height;
		saveState();
	}
};

type ComponentStyle = {
	width: string;
	height: string;
	top: string;
	left: string;
	id: string;
};

const getCurrentComponent = (currentComponent: ComponentStyle): ComponentState => {
	components.value.forEach((item) => {
		item.zIndex = isGhost.value ? "3" : "1";
	});
	return Object.assign(currentComp, {
		id: currentComponent.id,
		x: parseInt(currentComponent.left),
		y: parseInt(currentComponent.top),
		width: parseInt(currentComponent.width),
		height: parseInt(currentComponent.height),
	});
};

const getGhostComponent = (ghostComponent: boolean, currentComponentStyle: ComponentStyle) => {
	isGhost.value = ghostComponent;
	if (isGhost.value && currentComponentStyle) {
		requestAnimationFrame(() => {
			const { top, left } = calGhostPosition(currentComponentStyle);
			ghostStyle.value = {
				width: currentComponentStyle.width,
				height: currentComponentStyle.height,
				top,
				left,
				zIndex: "1",
				backgroundColor: "#FF707E",
				position: "absolute",
				transition: "0.1 ease-out",
			};
		});
	}
};

/**
 * 计算幽灵组件坐标
 * @param currentComponentStyle
 */
const calGhostPosition = (currentComponentStyle: ComponentStyle): { top: number | string; left: number | string } => {
	const top = calGhostTop(currentComponentStyle);
	const left = calcGhostLeft(currentComponentStyle);
	return { top, left };
};

/**
 * 计算幽灵组件的top
 * @param currentComponentStyle
 */
const calGhostTop = (currentComponentStyle: ComponentStyle): number | string => {
	const closestComponent = findClosestComponent(currentComponentStyle);
	// if (closestComponent) {
	// 	const ghostTop = closestComponent.componentStyle.height + closestComponent.componentStyle.y;
	// 	return ghostTop;
	// }
	return 0;
};

/**
 * 计算幽灵组件的left
 * @param currentComponentStyle
 */
const calcGhostLeft = (currentComponentStyle: ComponentStyle): number | string => {
	const currentComponent = components.value.filter((item) => item.id === currentComponentStyle.id);
	const otherComponents = components.value.filter((item) => item.id !== currentComponentStyle.id);
	if (currentComponent) {
		const beforeLeft = currentComponent[0].x;
		const currentComponentLeft = parseInt(currentComponentStyle.left);
		const currentComponentTop = parseInt(currentComponentStyle.top);
		const currentComponentWidth = parseInt(currentComponentStyle.width);
		const currentComponentHeight = parseInt(currentComponentStyle.height);
		if (currentComponentLeft < 0) {
			return 0;
		}
		if (currentComponentLeft + currentComponentWidth >= parentWidth.value) {
			return `${parentWidth.value - currentComponentWidth}px`;
		}
		if (currentComponentLeft <= ghostStep.value) {
			return 0;
		}
		const colliedLeft = calCollied(
			{
				id: currentComponentStyle.id,
				x: currentComponentLeft,
				y: currentComponentTop,
				width: currentComponentWidth,
				height: currentComponentHeight,
			},
			otherComponents
		);
		//* 自动吸附
		if (colliedLeft) {
			return `${colliedLeft}px`;
		}
		if (Math.abs(currentComponentLeft - beforeLeft) > ghostStep.value) {
			return `${beforeLeft + Math.round((currentComponentLeft - beforeLeft) / ghostStep.value) * ghostStep.value}px`;
		}
		return `${beforeLeft}px`;
	}
	return currentComponentStyle.left;
};

function calCollied(
	curerntComponent: { id: string; x: number; y: number; width: number; height: number },
	otherComponents: ComponentState[]
) {
	const closestParams = getClosestComponent(
		curerntComponent.id,
		curerntComponent.x,
		curerntComponent.y,
		curerntComponent.width,
		curerntComponent.height
	);
	// console.log("closestParams", closestParams);
	if (closestParams.direction === "left") {
		if (closestParams.distance <= ghostStep.value) {
			return closestParams.component.x + closestParams.component.width;
		}
		return null;
	}
	if (closestParams.direction === "right") {
		if (closestParams.distance <= ghostStep.value) {
			return closestParams.component.x - curerntComponent.width;
		}
		return null;
	}
}

/**
 * 查询距离最近的组件
 * @param newItem
 */
function findClosestComponent(newItem: ComponentStyle): { componentStyle: ComponentState } | null {
	let closestComponent: { componentStyle: ComponentState; distance: number } | null = null;

	components.value.forEach((component) => {
		const componentBottom = component.y + component.height;
		const newItemTop = parseInt(newItem.top);
		const distance = Math.abs(componentBottom - newItemTop);

		if (newItemTop > componentBottom) {
			if (!closestComponent || distance < closestComponent.distance) {
				closestComponent = { componentStyle: component, distance };
			}
		}
	});

	return closestComponent;
}

const getClosestComponent = (
	id: string,
	x: number,
	y: number,
	width: number,
	height: number
): { component: ComponentState; distance: number; direction: string } => {
	const otherComponents = components.value.filter((comp) => comp.id !== id);

	const calculateEdgeDistance = (
		comp1: { x: number; y: number; width: number; height: number },
		comp2: { x: number; y: number; width: number; height: number }
	): { distance: number; direction: string } => {
		const left = Math.abs(comp1.x - (comp2.x + comp2.width));
		const right = Math.abs(comp1.x + comp1.width - comp2.x);
		const top = Math.abs(comp1.y - (comp2.y + comp2.height));
		const bottom = Math.abs(comp1.y + comp1.height - comp2.y);

		const minX = Math.min(left, right);
		const minY = Math.min(top, bottom);

		if (minX < minY) {
			return {
				distance: minX,
				direction: left < right ? "left" : "right",
			};
		} else {
			return {
				distance: minY,
				direction: top < bottom ? "top" : "bottom",
			};
		}
	};

	let closestComponent = otherComponents[0];
	let closestData = calculateEdgeDistance({ x, y, width, height }, closestComponent);

	for (const component of otherComponents) {
		const distanceData = calculateEdgeDistance({ x, y, width, height }, component);
		if (distanceData.distance < closestData.distance) {
			closestData = distanceData;
			closestComponent = component;
		}
	}

	return { component: closestComponent, distance: closestData.distance, direction: closestData.direction };
};

onMounted(() => {
	parentWidth.value = document.querySelector(".app")!.clientWidth;
	parentHeight.value = document.querySelector(".app")!.clientHeight;
	ghostStep.value = parseInt((parentWidth.value / 30).toFixed(0));
	loadState();
});
</script>
<style lang="less" scoped>
.app {
	position: relative;
	width: 100%;
	height: 100vh;
	background-color: #f0f0f0;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
