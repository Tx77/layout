<template>
	<div class="app">
		<DraggableResizable
			v-for="comp in components"
			:key="comp.id"
			:componentState="comp"
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
import { onMounted, reactive, ref, watch } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ComponentState, ComponentStyle, Direction, GhostStyle } from "./params";

const snapDistance = 50;
const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 0, y: 0, width: 2560, height: 200, zIndex: "2", fixed: true },
	{ id: "comp2", x: 537, y: 200, width: 600, height: 300, zIndex: "3", fixed: false },
	{ id: "comp3", x: 620, y: 500, width: 400, height: 200, zIndex: "3", fixed: false },
	{ id: "comp4", x: 630, y: 700, width: 400, height: 400, zIndex: "4", fixed: false },
];
const components = ref<ComponentState[]>([]);
const componentsStorage = ref<ComponentState[]>([]);
const intersectComponent = ref<ComponentState | null>(null);
const otherComponents = ref<ComponentState[]>([]);
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
const mouseDirection = ref<Direction>();
const ghostStyle = ref<GhostStyle>();

const loadState = () => {
	const savedState = localStorage.getItem("componentsState");
	if (savedState) {
		Object.assign(components.value, JSON.parse(savedState));
		Object.assign(componentsStorage.value, JSON.parse(savedState));
	} else {
		Object.assign(components.value, defaultComponents);
	}
};

const saveState = () => {
	localStorage.setItem("componentsState", JSON.stringify(components.value));
	componentsStorage.value = JSON.parse(localStorage.getItem("componentsState")!);
};

const handleDrag = (id: string, x: number, y: number) => {
	const component = components.value.find((c) => c.id === id);
	if (component) {
		component.x = x;
		component.y = y;
		saveState();
		resetComponentsY();
		intersectComponent.value = null;
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

const getCurrentComponent = (currentComponent: ComponentStyle): ComponentState => {
	return Object.assign(currentComp, {
		id: currentComponent.id,
		x: parseInt(currentComponent.left),
		y: parseInt(currentComponent.top),
		width: parseInt(currentComponent.width),
		height: parseInt(currentComponent.height),
	});
};

/**
 * 设置组件zIndex
 * @param currentCompId
 */
const setComponentsZIndex = (currentCompId: string) => {
	components.value = components.value.map((item) => {
		if (item.id === currentCompId) {
			item.zIndex = "4";
		} else {
			item.zIndex = item.fixed ? "2" : "3";
		}
		return item;
	});
};

const getGhostComponent = (isShow: boolean, currentComponentStyle: ComponentStyle, lastMouseDirection: Direction) => {
	isGhost.value = isShow;
	mouseDirection.value = lastMouseDirection;
	setComponentsZIndex(currentComponentStyle.id);
	otherComponents.value = components.value.filter((item) => item.id !== currentComponentStyle.id);
	if (isGhost.value && currentComponentStyle) {
		requestAnimationFrame(() => {
			const { top, left } = calGhostPosition(currentComponentStyle);
			ghostStyle.value = {
				width: currentComponentStyle.width,
				height: currentComponentStyle.height,
				top: top + "px",
				left: left + "px",
				zIndex: "1",
				backgroundColor: "#51252B",
				position: "absolute",
				transition: "0.1s ease-out",
			};
		});
	}
};

const resetComponentsY = () => {
	components.value = components.value.map((item) => {
		if (!item.fixed && item.id !== currentComp.id) {
			item.y = findClosestY(item);
		}
		return item;
	});
	saveState();
};

/**
 * 计算幽灵组件坐标
 * @param currentComponentStyle
 */
const calGhostPosition = (currentComponentStyle: ComponentStyle): { top: number; left: number } => {
	const currentComponentLeft = parseInt(currentComponentStyle.left);
	const currentComponentTop = parseInt(currentComponentStyle.top);
	const currentComponentWidth = parseInt(currentComponentStyle.width);
	const currentComponentHeight = parseInt(currentComponentStyle.height);
	const formatCurrentComponentStyle: ComponentState = {
		id: currentComponentStyle.id,
		x: currentComponentLeft,
		y: currentComponentTop,
		width: currentComponentWidth,
		height: currentComponentHeight,
	};
	let ghostTop = currentComponentTop;
	let ghostLeft = currentComponentLeft;
	ghostTop = findClosestY(formatCurrentComponentStyle);

	ghostLeft = secondaryCorrectionLeft(ghostLeft, currentComponentLeft, currentComponentWidth);
	return { top: ghostTop, left: ghostLeft };
};

/**
 * 计算幽灵组件位置
 * @param currentComponentState
 */
const calcGhostPosition = (
	currentComponentState: ComponentState
): {
	x: number;
	y: number;
} => {
	let position = { x: currentComponentState.x, y: currentComponentState.y };
	return position;
};

/**
 * 二次矫正幽灵组件x轴
 * @param left
 * @param currentComponentLeft
 * @param currentComponentWidth
 */
const secondaryCorrectionLeft = (left: number, currentComponentLeft: number, currentComponentWidth: number): number => {
	if (left < 0) {
		return 0;
	}
	if (currentComponentLeft <= ghostStep.value) {
		return 0;
	}
	if (left + currentComponentWidth > screenWidth!) {
		return screenWidth! - currentComponentWidth;
	}
	if (currentComponentLeft + currentComponentWidth + ghostStep.value >= screenWidth!) {
		return screenWidth! - currentComponentWidth;
	}

	return left;
};

/**
 * 找到距离当前组件最近组件的y
 * @param currentComponentStyle
 */
const findClosestY = (currentComponentStyle: ComponentState): number => {
	return components.value
		.filter((item) => item.id !== currentComponentStyle.id)
		.reduce(
			(closest, cur) => {
				const isOverlappingX =
					(currentComponentStyle.x < cur.x + cur.width &&
						currentComponentStyle.x + currentComponentStyle.width > cur.x) ||
					(cur.x < currentComponentStyle.x + currentComponentStyle.width &&
						cur.x + cur.width > currentComponentStyle.x);

				const curDistance = Math.abs(currentComponentStyle.y - (cur.y + cur.height));

				if (isOverlappingX && curDistance < closest.distance) {
					return { y: cur.y + cur.height, distance: curDistance };
				}
				return closest;
			},
			{ y: Infinity, distance: Infinity }
		).y;
};

const isIntersecting = (item1: ComponentState, item2: ComponentState): boolean => {
	return (
		item1.x < item2.x + item2.width &&
		item1.x + item1.width > item2.x &&
		item1.y < item2.y + item2.height &&
		item1.y + item1.height > item2.y
	);
};

/**
 * 找到被覆盖的组件
 * @param param0
 */
const findIntersectComponents = ({ id, x, y, width, height }: ComponentState): ComponentState[] => {
	return components.value
		.filter((comp) => comp.id !== id && !comp.fixed)
		.filter((item) => isIntersecting(item, { id, x, y, width, height }));
};

onMounted(() => {
	if (!localStorage.getItem("componentsState")) {
		localStorage.setItem("componentsState", JSON.stringify(defaultComponents));
	}
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
	background-color: #262b32;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
