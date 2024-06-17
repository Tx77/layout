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
import { ClosestParams, ComponentState, ComponentStyle, Direction, GhostStyle, Position } from "./params";

const snapDistance = 50;
const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 0, y: 0, width: screenWidth, height: 200, zIndex: "1", fixed: true },
	{ id: "comp2", x: 0, y: 200, width: 600, height: 300, zIndex: "1", fixed: false },
	{ id: "comp3", x: 1200, y: 200, width: 300, height: 600, zIndex: "1", fixed: false },
	{ id: "comp4", x: 400, y: 400, width: 400, height: 600, zIndex: "1", fixed: false },
];
const components = ref<ComponentState[]>([]);
const componentsStorage = ref<ComponentState[]>([]);
const intersectComponents = ref<ComponentState[]>([]);
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

	const ghostPosition = calcGhostPosition(formatCurrentComponentStyle);
	top = ghostPosition.y;
	left = ghostPosition.x;
	left = secondaryCorrectionLeft(left, currentComponentLeft, currentComponentWidth);
	const closests = checkIsOverlapperd(formatCurrentComponentStyle);
	// console.log("closests", closests[0]);
	if (closests.length > 0) {
		const index = intersectComponents.value.findIndex((item) => item.id === closests[0].id);
		if (index < 0) {
			intersectComponents.value.push(closests[0]);
		}
		if (intersectComponents.value.length > 0) {
			components.value = components.value.map((item) => {
				for (let i = intersectComponents.value.length - 1; i >= 0; i--) {
					const comp = intersectComponents.value[i];
					if (comp.id === item.id && comp.id !== closests[0].id && !isIntersecting(comp, formatCurrentComponentStyle)) {
						item.y = findMinY(item.id);
						intersectComponents.value.splice(i, 1);
					}
				}
				return item;
			});
		}
		components.value
			.filter((item) => item.id !== currentComponentStyle.id && !item.fixed && item.id !== closests[0].id)
			.forEach((item) => {
				if (item.y === closests[0].y + closests[0].height) {
					item.y += closests[0].height + closests[0].y;
				}
			});
		closests[0].y = currentComponentHeight + top;
	} else {
		if (intersectComponents.value.length > 0) {
			components.value = components.value.map((item) => {
				intersectComponents.value.forEach((comp) => {
					if (item.id === comp.id) {
						item.y = findMinY(item.id);
					}
				});
				return item;
			});
			intersectComponents.value = [];
		}

		const ghostClosests = checkIsOverlapperd(Object.assign(formatCurrentComponentStyle, { x: left, y: top }));
		if (ghostClosests.length > 0) {
			top += ghostClosests[0].height;
		}
	}

	return { top, left };
};

/**
 * 检查幽灵组件是否与真实组件碰撞并调整位置
 * @param ghostX
 * @param ghostY
 * @param targetComp
 */
const adjustGhostPosition = (ghostX: number, ghostY: number, targetComp: ComponentState): Position => {
	const intersectComponents = components.value
		.filter((comp) => comp.id !== targetComp.id)
		.filter((item) => isIntersecting(item, Object.assign(targetComp, { x: ghostX, y: ghostY })));
	let finalPosition = { x: ghostX, y: ghostY };
	// console.log("intersectComponents", intersectComponents[0]);
	if (intersectComponents.length > 0) {
		const finalX = intersectComponents[0].x;
		const finalY = intersectComponents[0].y + intersectComponents[0].height;
		finalPosition = { x: finalX, y: finalY };
	}
	return finalPosition;
};

const findMinY = (id: string): number => {
	return components.value
		.filter((item) => item.id !== id)
		.reduce((minY, component) => {
			return component.y < minY ? component.y + component.height : minY;
		}, Infinity);
};

function findClosestYComponent(id: string, clientY: number, clientX: number): ComponentState {
	const otherComponents = components.value
		.filter((comp) => comp.id !== id)
		.filter((item) => item.y + item.height <= clientY);
	return otherComponents.reduce((closest, current) => {
		// 计算 current 组件的 y + height
		const currentYHeightSum = current.y + current.height;
		// 计算 closest 组件的 y + height
		const closestYHeightSum = closest.y + closest.height;

		// 计算 current 和 closest 与 clientY 的差值
		const currentYSumDifference = Math.abs(currentYHeightSum - clientY);
		const closestYSumDifference = Math.abs(closestYHeightSum - clientY);

		// const currentXWidthSum = current.x + current.width;
		// const closestXWidthSum = closest.x + current.width;

		const currentXSumDifference = Math.abs(current.x - clientX);
		const closestXSumDifference = Math.abs(closest.x - clientX);

		// 比较差值，返回差值更小的组件
		return currentYSumDifference <= closestYSumDifference && currentXSumDifference <= closestXSumDifference
			? current
			: closest;
	});
}

const checkIsOverlapperd = ({ id, x, y, width, height }: ComponentState): ComponentState[] => {
	return components.value
		.filter((comp) => comp.id !== id && !comp.fixed)
		.filter((item) => isIntersecting(item, { id, x, y, width, height }));
};

function isIntersecting(item1: ComponentState, item2: ComponentState): boolean {
	return (
		item1.x < item2.x + item2.width &&
		item1.x + item1.width > item2.x &&
		item1.y < item2.y + item2.height &&
		item1.y + item1.height > item2.y
	);
}

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
	let position = { x: currentComponentState.x, y: findMinY(currentComponentState.id) };
	// const closestParams = getClosestComponent(
	// 	currentComponentState.id,
	// 	currentComponentState.x,
	// 	currentComponentState.y,
	// 	currentComponentState.width,
	// 	currentComponentState.height,
	// 	mouseDirection as unknown as Direction
	// );
	// // console.log("closestParams", closestParams.component.id);
	// isOverlapping.value = closestParams.isOverlapping;
	// if (closestParams.direction === "left") {
	// 	if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
	// 		position.x = closestParams.component.x + closestParams.component.width;
	// 	}
	// } else if (closestParams.direction === "right") {
	// 	if (closestParams.distance <= ghostStep.value || closestParams.isOverlapping) {
	// 		position.x = closestParams.component.x - currentComponentState.width;
	// 	}
	// }
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
