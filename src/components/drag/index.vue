<template>
	<div class="app">
		<div class="header" :style="{ width: screenWidth + 'px' }">Header</div>
		<div class="drag-container">
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
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ComponentState, ComponentStyle, GhostStyle, DistanceResult } from "./params";

const snapDistance = 50;
const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 615, y: 100, width: 600, height: 300, zIndex: "3", fixed: false },
	{ id: "comp2", x: 0, y: 100, width: 400, height: 200, zIndex: "3", fixed: false },
	{ id: "comp3", x: 1107, y: 789, width: 400, height: 200, zIndex: "3", fixed: false },
	{ id: "comp4", x: 971, y: 400, width: 410, height: 290, zIndex: "3", fixed: false },
	{ id: "comp5", x: 0, y: 690, width: 2564, height: 100, zIndex: "2", fixed: true },
	{ id: "comp6", x: 400, y: 400, width: 432, height: 200, zIndex: "3", fixed: false },
];

const components = ref<ComponentState[]>([]);
const componentsStorage = ref<ComponentState[]>([]);
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

// 再修改下，传入一个参数，参数类型和item一致，求得满足上面条件的y

const saveState = () => {
	localStorage.setItem("componentsState", JSON.stringify(components.value));
	componentsStorage.value = JSON.parse(localStorage.getItem("componentsState")!);
};

const handleDrag = (id: string, x: number, y: number) => {
	const component = components.value.find((c) => c.id === id);
	if (component) {
		component.x = x;
		component.y = y;
		intersectComponents.value = [];
		resetComponentsY();
		// saveState();
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

const getGhostComponent = (isShow: boolean, currentComponentStyle: ComponentStyle) => {
	isGhost.value = isShow;
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
	components.value.forEach((item) => {
		item.y = findClosestY(item);
	});
	saveState();
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

const intersectComponents = ref<ComponentState[]>([]);
const affectedComponents = ref<ComponentState[]>([]);

/**
 * 计算幽灵组件坐标
 * @param currentComponentStyle
 */
const calGhostPosition = (currentComponentStyle: ComponentStyle): { top: number; left: number } => {
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
	const ghostPosition = calcGhostPosition(currentComponentState);
	let ghostTop = ghostPosition.y;
	let ghostLeft = ghostPosition.x;
	ghostTop = findClosestY(currentComponentState);
	if (!intersectComponents.value || intersectComponents.value.length === 0) {
	}
	/**
	 * 幽灵组件是否在组件x轴范围内
	 * @param comp
	 */
	const ghostInComponent = (comp: ComponentState): boolean => {
		return comp.x < ghostLeft + currentComponentWidth && comp.x + comp.width > ghostLeft;
	};
	/**
	 * 获取组件缓存数据
	 * @param comp
	 */
	const getComponentStorage = (comp: ComponentState): ComponentState => {
		return componentsStorage.value.filter((item) => item.id === comp.id)[0];
	};

	/**
	 * 重置组件位置
	 */
	const resetComponentPosition = () => {
		//* 无碰撞组件时，需要判断【曾经受碰撞组件影响的组件】以及【之前的碰撞组件】
		if (affectedComponents.value.length > 0 && intersectComponents.value.length > 0) {
			for (let i = affectedComponents.value.length - 1; i >= 0; i--) {
				const comp = affectedComponents.value[i];
				intersectComponents.value.forEach((interComp) => {
					if (!ghostInComponent(interComp)) {
						const affectedComponentStorage = getComponentStorage(comp);
						comp.y = affectedComponentStorage.y;
						affectedComponents.value.splice(i, 1);
					} else {
					}
				});
			}
		}
	};
	const currentComponentStorage = getComponentStorage(currentComponentState);

	intersectComponents.value = findOverlappedComponents(currentComponentState);
	// console.log(intersectComponents.value);
	if (intersectComponents.value && intersectComponents.value.length > 0) {
		const intersectComponent = intersectComponents.value[0];
		// console.log(intersectComponent.id);
		const itemStorage = getComponentStorage(intersectComponent);
		//! 组件碰撞时的重新定位规则
		//! 1、交换位置前，ghostTop用碰撞组件初始值y，先改变ghostTop，再改变碰撞组件的y
		//! 2、交换位置后，ghostTop用碰撞组件初始值y+height，先改变碰撞组件的y，再改变ghostTop
		if (currentComponentStorage.y === itemStorage.y) {
		} else if (currentComponentStorage.y > itemStorage.y) {
			if (currentComponentTop < intersectComponent.y + intersectComponent.height) {
				ghostTop = itemStorage.y;
				// ghostTop = findClosestY(Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop }));
				intersectComponent.y = ghostTop + currentComponentHeight;
			}
			if (ghostTop === itemStorage.y && currentComponentTop > intersectComponent.y) {
				intersectComponents.value.forEach((comp) => {
					const compStorage = getComponentStorage(comp);
					comp.y = compStorage.y;
				});
				ghostTop = itemStorage.y + itemStorage.height;
			}
		} else {
			if (currentComponentTop >= intersectComponent.y) {
				// intersectComponent.y = findClosestY(intersectComponent);
				// console.log(intersectComponent.y);
				// ghostTop = intersectComponent.y + intersectComponent.height;
				ghostTop = itemStorage.y + itemStorage.height;

				const touchingComponets = findTouchingComponents(intersectComponent);
				if (!touchingComponets || touchingComponets.length === 0) {
					intersectComponent.y = currentComponentStorage.y;
				}
			}
			if (ghostTop === itemStorage.y && currentComponentTop < intersectComponent.y) {
				intersectComponents.value.forEach((comp) => {
					const compStorage = getComponentStorage(comp);
					comp.y = compStorage.y;
				});
			}
		}
	}

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

	//todo 判断幽灵组件重新定位后是否影响到了其他组件，如果是则需要对被影响到的组件重新定位
	const ghostComponent = Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop });
	const coverByGhostComponent = findOverlappedComponents(ghostComponent);
	// console.log(coverByGhostComponent);
	if (coverByGhostComponent && coverByGhostComponent.length > 0) {
		coverByGhostComponent.forEach((item) => {
			item.y += currentComponentHeight;
		});
	}

	//todo 移动过的组件也需要判断是否影响到了其他组件，如果是则需要对被影响到的组件重新定位
	// const affectedComponents = findItemsWithBottomEdgeInRange(ghostComponent);
	// console.log(affectedComponents);

	return { top: ghostTop, left: ghostLeft };
};

/**
 * 传入一个目标组件，与源组件对比，得到当目标组件的x+width,y+height处于源组件的x+width,y+height范围内的组件
 * @param target
 * @param sourceComponents
 */
function findOverlappingComponents(target: ComponentState, sourceComponents: ComponentState[]): ComponentState[] {
	const overlappingComponents: ComponentState[] = [];
	const targetRight = target.x + target.width;
	const targetBottom = target.y + target.height;

	for (const component of sourceComponents) {
		if (component.id === target.id) continue;

		const componentRight = component.x + component.width;
		const componentBottom = component.y + component.height;

		//* 检查目标组件的right是否处于当前组件的x+width范围内
		const isXOverlap = targetRight > component.x && targetRight < componentRight;

		//* 检查目标组件的bottom是否处于当前组件的y+height范围内
		const isYOverlap = targetBottom > component.y && targetBottom < componentBottom;

		if (isXOverlap && isYOverlap) {
			overlappingComponents.push(component);
		}
	}

	return overlappingComponents;
}

/**
 * 重叠组件在受幽灵组件影响而移动时影响到的其他组件
 * @param comp
 * @param filterComponents
 */
const findAffectedComponents = (comp: ComponentState): ComponentState[] => {
	let affectedComponents: ComponentState[] = [];
	const filterComponents = components.value.filter((item) => item.id !== currentComp.id);
	filterComponents.forEach((item) => {
		if (item.y === comp.y + comp.height && item.x < comp.x + comp.width && item.x + item.width > comp.x) {
			affectedComponents.push(item);
			affectedComponents = affectedComponents.concat(findAffectedComponents(item));
		}
	});

	return affectedComponents;
};

/**
 * target顶部是否与其他组件底部相接触
 * @param target
 */
function findTouchingComponents(target: ComponentState): ComponentState[] {
	return components.value
		.filter((item) => item.id !== target.id)
		.filter((item) => {
			const isInWidthRange =
				(item.x >= target.x && item.x < target.x + target.width) ||
				(item.x + item.width > target.x && item.x + item.width <= target.x + target.width) ||
				(item.x <= target.x && item.x + item.width >= target.x + target.width);

			const isTouching = item.y + item.height === target.y;

			return isInWidthRange && isTouching;
		});
}

const findItemsWithBottomEdgeInRange = (currentComponent: ComponentState): ComponentState[] => {
	return defaultComponents.filter((item) => {
		if (item.id === currentComponent.id) {
			return false;
		}

		const currentBottomY = currentComponent.y + currentComponent.height;
		const isBottomEdgeInRange = currentBottomY >= item.y && currentBottomY <= item.y + item.height;
		const isOverlappingX =
			(currentComponent.x < item.x + item.width && currentComponent.x + currentComponent.width > item.x) ||
			(item.x < currentComponent.x + currentComponent.width && item.x + item.width > currentComponent.x);

		return isBottomEdgeInRange && isOverlappingX;
	});
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
	const initY = 100;
	const result = components.value
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
