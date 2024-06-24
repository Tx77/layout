<template>
	<div class="app">
		<div class="header" :style="{ width: screenWidth + 'px' }">Header</div>
		<div class="drag-container">
			<DraggableResizable
				v-for="comp in components"
				:key="comp.id"
				:componentState="comp"
				:ghostStyle="ghostStyle"
				@drag="handleDrag"
				@resize="handleResize"
				:setCurrentComponent="setCurrentComponent"
				:setGhostComponent="setGhostComponent"
				:setResizeGhostComponent="setResizeGhostComponent"
				:setInitGhostWidth="setInitGhostWidth"
				:directions="['bottom-right']"
			/>
			<div class="ghost" v-if="isGhost" :style="ghostStyle"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ComponentState, ComponentStyle, GhostStyle, DistanceResult, GhostType } from "./params";

const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 645, y: 100, width: 600, height: 300, zIndex: "3", fixed: false },
	{ id: "comp2", x: 1075, y: 500, width: 400, height: 200, zIndex: "3", fixed: false },
	{ id: "comp3", x: 746, y: 800, width: 400, height: 200, zIndex: "3", fixed: false },
	{ id: "comp4", x: 521, y: 500, width: 410, height: 300, zIndex: "3", fixed: false },
	{ id: "comp5", x: 0, y: 400, width: screenWidth, height: 100, zIndex: "2", fixed: true },
	{ id: "comp6", x: 1374, y: 100, width: 432, height: 200, zIndex: "3", fixed: false },
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
const ghostStyle = ref<GhostStyle>();
const ghostWidth = ref(0);

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

const setCurrentComponent = (currentComponent: ComponentStyle): ComponentState => {
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

/**
 * 配置幽灵组件
 * @param isShow
 * @param currentComponentStyle
 */
const setGhostComponent = (isShow: boolean, currentComponentStyle: ComponentStyle, type: GhostType) => {
	isGhost.value = isShow;
	if (!isGhost.value) {
		return;
	}
	const currentComponentLeft = parseInt(currentComponentStyle.left);
	const currentComponentTop = parseInt(currentComponentStyle.top);
	const currentComponentWidth = parseInt(currentComponentStyle.width);
	const currentComponentHeight = parseInt(currentComponentStyle.height);
	const currentComponentState: ComponentState = {
		id: currentComponentStyle.id,
		x: currentComponentLeft,
		y: currentComponentTop,
		width: currentComponentWidth,
		height: currentComponentHeight,
	};
	if (type === GhostType.DRAG) {
		ghostStep.value = parseInt((parentWidth.value / 30).toFixed(0));
		setComponentsZIndex(currentComponentStyle.id);
		setDragGhostComponent(currentComponentState);
	}
	if (type === GhostType.RESIZE) {
		ghostStep.value = parseInt((parentWidth.value / 60).toFixed(0));
		setResizeGhostComponent(currentComponentState);
	}
};

/**
 * 配置drag幽灵组件
 * @param currentComponentState
 */
const setDragGhostComponent = (currentComponentState: ComponentState) => {
	if (isGhost.value && currentComponentState) {
		requestAnimationFrame(() => {
			if (currentComponentState.x >= 0 && currentComponentState.x + currentComponentState.width <= screenWidth!) {
				const { top, left } = calcDragGhost(currentComponentState);
				ghostStyle.value = {
					width: currentComponentState.width + "px",
					height: currentComponentState.height + "px",
					top: top + "px",
					left: left + "px",
					zIndex: "1",
					backgroundColor: "rgba(81, 37, 43, 1)",
					position: "absolute",
					transition: "0.1s ease-out",
				};
			}
		});
	}
};

/**
 * 配置幽灵组件初始宽度
 * @param initGhostWidth
 */
const setInitGhostWidth = (initGhostWidth: number) => {
	ghostWidth.value = initGhostWidth;
};

/**
 * 配置resize幽灵组件
 * @param currentComponentState
 */
const setResizeGhostComponent = (currentComponentState: ComponentState) => {
	if (isGhost.value && currentComponentState) {
		requestAnimationFrame(() => {
			const { top, left, width, height } = calcResizeGhost(currentComponentState);
			ghostStyle.value = {
				width: width + "px",
				height: height + "px",
				top: top + "px",
				left: left + "px",
				zIndex: "4",
				backgroundColor: "rgba(81, 37, 43, 0.7)",
				position: "absolute",
				transition: "0.1s ease-out",
			};
		});
	}
};

/**
 * 重置组件y轴定位
 * @param list
 */
const resetComponentsY = (list?: ComponentState[]) => {
	let sourceComponents: ComponentState[] = [];
	if (list && list.length > 0) {
		sourceComponents = list;
	} else {
		sourceComponents = components.value;
	}
	sourceComponents.forEach((item) => {
		item.y = findClosestY(item);
	});
};

/**
 * 找到距离当前组件X轴最近的组件
 * @param currentComponent
 */
function findNearestXComponent(currentComponent: ComponentState): DistanceResult | null {
	const nearestComponents = components.value.filter((item) => item.id !== currentComponent.id);
	let nearestComponent: DistanceResult | null = null;
	for (const component of nearestComponents) {
		if (component.id === currentComponent.id) continue;
		const leftDistance = currentComponent.x - (component.x + component.width);
		const rightDistance = component.x - (currentComponent.x + currentComponent.width);

		if (leftDistance > 0) {
			if (!nearestComponent || leftDistance < nearestComponent.distance) {
				nearestComponent = { component, distance: leftDistance, direction: "left" };
			}
		} else if (rightDistance > 0) {
			if (!nearestComponent || rightDistance < nearestComponent.distance) {
				nearestComponent = { component, distance: rightDistance, direction: "right" };
			}
		}
	}

	return nearestComponent;
}

/**
 * 计算drag幽灵组件坐标
 * @param currentComponentStyle
 */
const calcDragGhost = (currentComponentState: ComponentState): { top: number; left: number } => {
	const currentComponentLeft = currentComponentState.x;
	const currentComponentTop = currentComponentState.y;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	let ghostTop = currentComponentTop;
	let ghostLeft = currentComponentLeft;

	ghostTop = findClosestY(currentComponentState);

	const overlappedComponents = findOverlappedComponents(
		Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop })
	);

	if (overlappedComponents && overlappedComponents.length > 0) {
		overlappedComponents.forEach((item) => {
			const topMatchingComponents = findTopMatchingComponents(item);
			const step = Math.abs(ghostTop + currentComponentHeight - item.y);
			topMatchingComponents.forEach((comp) => {
				comp.y += step;
			});
		});
	}

	const sourceComponents = components.value.map((item) => {
		if (item.id === currentComponentState.id) {
			Object.assign(item, { x: ghostLeft, y: ghostTop });
		}
		return item;
	});

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(currentComponentState);
	if (nearestComponent && nearestComponent.distance <= ghostStep.value) {
		if (nearestComponent.direction === "left") {
			ghostLeft = nearestComponent.component.x + nearestComponent.component.width;
		} else {
			ghostLeft = nearestComponent.component.x - currentComponentWidth;
		}
	}

	ghostLeft = secondaryCorrectionLeft(ghostLeft, currentComponentLeft, currentComponentWidth);
	resetComponentsY(sourceComponents);

	return { top: ghostTop, left: ghostLeft };
};

/**
 * 找到满足y大于传入组件y的组件
 * @param component
 */
const findTopMatchingComponents = (component: ComponentState): ComponentState[] => {
	return components.value.filter(
		(item) =>
			item.y >= component.y &&
			item.id !== currentComp.id &&
			(item.x >= component.x || item.x <= component.x + component.width)
	);
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
const findClosestY = (currentComponentStyle: ComponentState, componentList?: ComponentState[]): number => {
	let sourceComponents: ComponentState[];
	if (componentList && componentList.length > 0) {
		sourceComponents = componentList;
	} else {
		sourceComponents = components.value;
	}
	const initY = 100;
	const result = sourceComponents
		.filter((item) => item.id !== currentComponentStyle.id)
		.reduce(
			(closest, cur) => {
				const isOverlappingX =
					(currentComponentStyle.x < cur.x + cur.width &&
						currentComponentStyle.x + currentComponentStyle.width > cur.x) ||
					(cur.x < currentComponentStyle.x + currentComponentStyle.width &&
						cur.x + cur.width > currentComponentStyle.x);

				const curDistance = currentComponentStyle.y - (cur.y + cur.height);
				if (isOverlappingX && curDistance < closest.distance && curDistance >= 0) {
					return { y: cur.y + cur.height, distance: curDistance, found: true };
				}
				return closest;
			},
			{ y: initY, distance: Infinity, found: false }
		);

	return result.found ? result.y : initY;
};

/**
 * 覆盖边界
 * @param item1
 * @param item2
 */
const isOverlaping = (item1: ComponentState, item2: ComponentState): boolean => {
	return (
		item1.x < item2.x + item2.width &&
		item1.x + item1.width > item2.x &&
		item1.y < item2.y + item2.height &&
		item1.y + item1.height > item2.y
	);
};

/**
 * 找到被覆盖的组件
 * @param param
 */
const findOverlappedComponents = ({ id, x, y, width, height }: ComponentState): ComponentState[] => {
	return components.value
		.filter((comp) => comp.id !== id)
		.filter((item) => isOverlaping(item, { id, x, y, width, height }));
};

/**
 * 计算resize幽灵组件坐标及宽高
 * @param currentComponentState
 */
const calcResizeGhost = (
	currentComponentState: ComponentState
): { top: number; left: number; width: number; height: number } => {
	const ghostTop = currentComponentState.y;
	const ghostLeft = currentComponentState.x;
	let ghostHeight = currentComponentState.height;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	if (ghostWidth.value) {
		if (currentComponentWidth - ghostWidth.value >= 0) {
			if (Math.floor((currentComponentWidth - ghostWidth.value) / ghostStep.value) > 0) {
				ghostWidth.value +=
					Math.floor((currentComponentWidth - ghostWidth.value) / ghostStep.value) * ghostStep.value + ghostStep.value;
			}
		} else {
			if (Math.ceil((currentComponentWidth - ghostWidth.value) / ghostStep.value) < 0) {
				ghostWidth.value +=
					Math.ceil((currentComponentWidth - ghostWidth.value) / ghostStep.value) * ghostStep.value - ghostStep.value;
			}
		}
	}

	const ghostComponent = Object.assign(currentComponentState, {
		width: ghostWidth.value,
		height: currentComponentHeight,
	});

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(ghostComponent);

	//* 最近组件必须在当前组件右边
	if (
		nearestComponent &&
		ghostLeft + currentComponentWidth <= nearestComponent.component.x &&
		nearestComponent.component.x - (ghostLeft + currentComponentWidth) <= ghostStep.value
	) {
		ghostWidth.value = nearestComponent.component.x - ghostLeft;
	}

	const overlappedComponents = findOverlappedComponents(ghostComponent);

	if (overlappedComponents && overlappedComponents.length > 0) {
		overlappedComponents.forEach((item) => {
			const topMatchingComponents = findTopMatchingComponents(item);
			const step = Math.abs(ghostTop + currentComponentHeight - item.y);
			topMatchingComponents.forEach((comp) => {
				comp.y += step;
			});
		});
	} else {
		const sourceComponents = components.value.map((item) => {
			if (item.id === currentComponentState.id) {
				Object.assign(item, { width: ghostWidth.value, height: currentComponentHeight });
			}
			return item;
		});
		resetComponentsY(sourceComponents);
	}

	return { top: ghostTop, left: ghostLeft, width: ghostWidth.value, height: ghostHeight };
};

onMounted(() => {
	if (!localStorage.getItem("componentsState")) {
		localStorage.setItem("componentsState", JSON.stringify(defaultComponents));
	}
	parentWidth.value = document.querySelector(".app")!.clientWidth;
	parentHeight.value = document.querySelector(".app")!.clientHeight;
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
	.header {
		height: 100px;
		background-color: #15191c;
		color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2;
	}
	.drag-container {
		position: relative;
	}
}
</style>
