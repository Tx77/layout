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
//todo 1 增加布局切换的功能，且切换有过渡效果
//todo 2 吸附功能也需要增加过渡效果
//todo 3 resize的操作节点需要可配置，并且允许用svg替代
//todo 4 拖拽区域需要可配置
//todo 5 增加drag预期位置显示，并设置吸附距离，达到吸附距离后立即移动到吸附后的位置，并增加过渡效果
//todo 6 当预期位置侵占其他组件时，需要移动被侵占组件的位置
import { onMounted, reactive, ref } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ClosestParams, ComponentState, ComponentStyle, Direction, GhostStyle } from "./params";

const snapDistance = 50;
const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 0, y: 0, width: screenWidth, height: 200, zIndex: "1", fixed: true },
	{ id: "comp2", x: 0, y: 200, width: 600, height: 300, zIndex: "1", fixed: false },
	{ id: "comp3", x: 1200, y: 200, width: 300, height: 600, zIndex: "1", fixed: false },
	{ id: "comp4", x: 400, y: 400, width: 400, height: 600, zIndex: "1", fixed: true },
];
const components = ref<ComponentState[]>([]);
const componentsStorage = ref<ComponentState[]>([]);
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
const isOverlapping = ref(false);

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
	componentsStorage.value = JSON.parse(localStorage.getItem("componentsState")!);
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

const getCurrentComponent = (currentComponent: ComponentStyle): ComponentState => {
	components.value = components.value.map((item) => {
		if (item.id === currentComponent.id) {
			item.zIndex = "3";
		} else {
			item.zIndex = "4";
		}
		return item;
	});
	return Object.assign(currentComp, {
		id: currentComponent.id,
		x: parseInt(currentComponent.left),
		y: parseInt(currentComponent.top),
		width: parseInt(currentComponent.width),
		height: parseInt(currentComponent.height),
	});
};

const getGhostComponent = (isShow: boolean, currentComponentStyle: ComponentStyle, lastMouseDirection: Direction) => {
	isGhost.value = isShow;
	mouseDirection.value = lastMouseDirection;
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

/**
 * 计算幽灵组件坐标
 * @param currentComponentStyle
 */
const calGhostPosition = (currentComponentStyle: ComponentStyle): { top: number; left: number } => {
	let top: number;
	let left: number;
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
	const colliedPosition = calCollied(formatCurrentComponentStyle);
	top = colliedPosition.y;
	left = colliedPosition.x;
	left = secondaryCorrectionLeft(left, currentComponentWidth);
	return { top, left };
};

function calCollied(currentComponentState: ComponentState): {
	x: number;
	y: number;
} {
	let position = { x: currentComponentState.x, y: currentComponentState.y };
	const closestParams = getClosestComponent(
		currentComponentState.id,
		currentComponentState.x,
		currentComponentState.y,
		currentComponentState.width,
		currentComponentState.height,
		mouseDirection as unknown as Direction
	);
	console.log(
		"closestParams",
		closestParams.component.id
		// closestParams.direction,
		// "mouseDirection",
		// mouseDirection.value
	);
	isOverlapping.value = closestParams.isOverlapping;
	if (closestParams.direction === "left") {
		if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
			position.x = closestParams.component.x + closestParams.component.width;
		}
	} else if (closestParams.direction === "right") {
		if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
			position.x = closestParams.component.x - currentComponentState.width;
		}
	} else if (closestParams.direction === "top") {
		if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
			position.y = closestParams.component.y + closestParams.component.height;
		}
	} else {
		if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
			position.y = closestParams.component.y - currentComponentState.height;
		}
	}
	return position;
}

/**
 * 二次矫正x轴
 * @param left
 * @param currentComponentWidth
 */
const secondaryCorrectionLeft = (left: number, currentComponentWidth: number): number => {
	if (left < 0) {
		return 0;
	}
	if (left + currentComponentWidth > screenWidth!) {
		return screenWidth! - currentComponentWidth;
	}

	return left;
};

/**
 * 获取距离最近的组件
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 * @param mouseDirection
 */
const getClosestComponent = (
	id: string,
	x: number,
	y: number,
	width: number,
	height: number,
	mouseDirection: Direction
): ClosestParams => {
	// 获取当前所有组件
	const otherComponents = components.value.filter((comp) => comp.id !== id);

	const calculateEdgeDistance = (
		comp1: { x: number; y: number; width: number; height: number },
		comp2: { x: number; y: number; width: number; height: number }
	): { distance: number; direction: Direction; isOverlapping: boolean } => {
		const left = comp1.x - (comp2.x + comp2.width);
		const right = comp1.x + comp1.width - comp2.x;
		const top = comp1.y - (comp2.y + comp2.height);
		const bottom = comp1.y + comp1.height - comp2.y;

		const distances = [
			{
				distance: Math.abs(left),
				direction: "left" as Direction,
				isOverlapping: left < 0,
			},
			{
				distance: Math.abs(right),
				direction: "right" as Direction,
				isOverlapping: right > 0,
			},
			{
				distance: Math.abs(top),
				direction: "top" as Direction,
				isOverlapping: top <= 0,
			},
			{
				distance: Math.abs(bottom),
				direction: "bottom" as Direction,
				isOverlapping: bottom > 0,
			},
		];

		// 找到最小距离和对应的方向
		const closest = distances.reduce((prev, curr) => (curr.distance < prev.distance ? curr : prev));

		return closest;
	};

	let closestComponent = otherComponents[0];
	let closestData = calculateEdgeDistance({ x, y, width, height }, closestComponent);

	for (const component of otherComponents) {
		const distanceData = calculateEdgeDistance({ x, y, width, height }, component);

		// 根据鼠标方向调整距离权重
		let adjustedDistance = distanceData.distance;
		if (distanceData.direction === mouseDirection) {
			adjustedDistance *= 0.75; // 鼠标方向上的距离优先级更高，减少距离值
		} else if (isOppositeDirection(distanceData.direction, mouseDirection)) {
			adjustedDistance *= 1.25; // 反方向上的距离优先级降低，增加距离值
		}

		if (adjustedDistance < closestData.distance) {
			closestData = distanceData;
			closestComponent = component;
		}
	}

	return {
		component: closestComponent,
		distance: closestData.distance,
		direction: closestData.direction,
		isOverlapping: closestData.isOverlapping,
	};
};

// 判断两个方向是否相反
const isOppositeDirection = (dir1: Direction, dir2: Direction): boolean => {
	return (
		(dir1 === "left" && dir2 === "right") ||
		(dir1 === "right" && dir2 === "left") ||
		(dir1 === "top" && dir2 === "bottom") ||
		(dir1 === "bottom" && dir2 === "top")
	);
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
