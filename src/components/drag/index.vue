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
			:detectCollision="detectCollision"
			:detectSnap="detectSnap"
			:handleCollision="handleCollision"
			:checkClosestComponent="getClosestComponent"
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
const snapDistance = 50;
const defaultComponents = [
	{ id: "comp1", x: 100, y: 100, width: 400, height: 200, zIndex: "1" },
	// { id: "comp2", x: 400, y: 100, width: 200, height: 200, zIndex: "1" },
	// { id: "comp3", x: 100, y: 400, width: 200, height: 200, zIndex: "1" },
	// { id: "comp4", x: 400, y: 400, width: 200, height: 200, zIndex: "1" },
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
const ghostStyle = ref({});

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

type CollidedDirection = "top" | "right" | "bottom" | "left" | "";

/**
 * 检测元素之间的碰撞
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 */
const detectCollision = (id: string, x: number, y: number, width: number, height: number) => {
	const currentComponent = components.value.find((c) => c.id === id);
	if (!currentComponent) return false;
	let colliedComponent: ComponentState | null = null;
	let collidedDirection: CollidedDirection = "";
	const value = components.value.some((c) => {
		if (c.id === id) return false;
		colliedComponent = c;
		return !(x + width <= c.x || x >= c.x + c.width || y + height <= c.y || y >= c.y + c.height);
	});
	if (value && colliedComponent) {
		collidedDirection = getColliedDirection<ComponentState>(currentComponent, colliedComponent);
	}
	return { value, colliedComponent, collidedDirection };
};

/**
 * 获取被碰撞组件的方向
 * @param currentComponent
 * @param colliedComponent
 */
const getColliedDirection = <T extends ComponentState>(currentComponent: T, colliedComponent: T): CollidedDirection => {
	let collidedDirection: CollidedDirection = "";
	if (currentComponent.x + currentComponent.width === colliedComponent.x) {
		collidedDirection = "left";
	}
	if (currentComponent.x === colliedComponent.x + colliedComponent.width) {
		collidedDirection = "right";
	}
	if (currentComponent.y + currentComponent.height === colliedComponent.y) {
		collidedDirection = "top";
	}
	if (currentComponent.y === colliedComponent.y + colliedComponent.height) {
		collidedDirection = "bottom";
	}
	return collidedDirection;
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
			ghostStyle.value = {
				width: currentComponentStyle.width,
				height: currentComponentStyle.height,
				left: calcGhostLeft(currentComponentStyle),
				zIndex: "1",
				backgroundColor: "#FF707E",
				position: "absolute",
				transition: "0.05s ease",
			};
			const closestComponent = findClosestComponent(currentComponentStyle);
			if (closestComponent) {
				Object.assign(ghostStyle.value, {
					// top: currentComponentStyle.top,
					top: 0,
				});
			} else {
				Object.assign(ghostStyle.value, {
					top: 0,
				});
			}
		});
	}
};

/**
 * 计算幽灵组件的left
 * @param currentComponentStyle
 */
const calcGhostLeft = (currentComponentStyle: ComponentStyle): number | string => {
	const currentComponent = components.value.filter((item) => item.id === currentComponentStyle.id);
	if (currentComponent) {
		const beforeLeft = currentComponent[0].x;
		const currentComponentLeft = parseInt(currentComponentStyle.left);
		const currentComponentWidth = parseInt(currentComponentStyle.width);
		if (currentComponentLeft < 0) {
			return 0;
		}
		if (currentComponentLeft + currentComponentWidth >= parentWidth.value) {
			return `${parentWidth.value - currentComponentWidth}px`;
		}
		if (currentComponentLeft <= ghostStep.value) {
			return 0;
		}
		//* 每次mouseup后要重置，否则mousedown时，ghost的left会归零
		if (currentComponentLeft >= beforeLeft) {
			if (((currentComponentLeft - beforeLeft) / ghostStep.value) % 1 !== 0) {
				return `${currentComponentLeft - ghostStep.value}px`;
			}
			console.log("===");
			return currentComponentStyle.left;
		}
		return 0;
	}
	return currentComponentStyle.left;
};

function findClosestComponent(newItem: ComponentStyle): { id: string; distance: number } | null {
	let closestComponent: { id: string; distance: number } | null = null;

	components.value.forEach((component) => {
		const componentBottom = component.y + component.height;
		const newItemTop = parseInt(newItem.top);
		const distance = Math.abs(componentBottom - newItemTop);

		if (newItemTop > componentBottom) {
			if (!closestComponent || distance < closestComponent.distance) {
				closestComponent = { id: component.id, distance };
			}
		}
	});

	return closestComponent;
}

/**
 * 检测吸附
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 * @param snapDistance
 */
const detectSnap = (id: string, x: number, y: number, width: number, height: number, snapDistance: number) => {
	let snapResult: SnapResult = { left: x, top: y, width, height, cx: 0, cy: 0, isSnap: false };

	const closestComponent = getClosestComponent(id, x, y, width, height);
	// console.log('closestComponent', closestComponent);

	//* 检测左边缘吸附
	if (Math.abs(x - (closestComponent.x + closestComponent.width)) <= snapDistance) {
		snapResult.left = closestComponent.x + closestComponent.width;
		console.log("snap left", snapResult.left);
		snapResult.isSnap = true;
	}
	//* 检测右边缘吸附
	else if (Math.abs(x + width - closestComponent.x) <= snapDistance) {
		snapResult.left = closestComponent.x - width;
		console.log("snap right", snapResult.left);
		snapResult.isSnap = true;
	}
	//* 检测上边缘吸附
	else if (
		Math.abs(y - (closestComponent.y + closestComponent.height)) <= snapDistance &&
		(Math.abs(x + width - closestComponent.x) <= snapDistance || x + width >= closestComponent.x)
	) {
		snapResult.top = closestComponent.y + closestComponent.height;
		console.log("snap top", snapResult.top);
		snapResult.isSnap = true;
	}
	//* 检测下边缘吸附
	else if (Math.abs(y + height - closestComponent.y) <= snapDistance) {
		snapResult.top = closestComponent.y - height;
		console.log("snap bottom", snapResult.top);
		snapResult.isSnap = true;
	} else {
		snapResult.cx = closestComponent.x;
		snapResult.cy = closestComponent.y;
	}

	//* 检测父元素边界吸附
	if (x <= snapDistance) {
		console.log("parent left");
		snapResult.left = 0;
		snapResult.isSnap = true;
	}
	if (y <= snapDistance) {
		console.log("parent top");
		snapResult.top = 0;
		snapResult.isSnap = true;
	}
	if (parentWidth.value - (x + width) <= snapDistance) {
		console.log("parent right");
		snapResult.left = parentWidth.value - width;
		snapResult.isSnap = true;
	}
	if (parentHeight.value - (y + height) <= snapDistance) {
		console.log("parent bottom");
		snapResult.top = parentHeight.value - height;
		snapResult.isSnap = true;
	}

	// const result = adjustSnapResult(id, x, y, width, height, snapResult);
	// Object.assign(snapResult, result);

	return snapResult;
};

/**
 * 调整吸附参数
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 * @param snapResult
 */
const adjustSnapResult = (
	id: string,
	x: number,
	y: number,
	width: number,
	height: number,
	snapResult: SnapResult
): SnapResult => {
	const adjustPosition = adjustComponentPosition(id, x, y, width, height);
	console.log("adjustPosition", adjustPosition, "x", x, "y", y);
	console.log("currentComp", currentComp);

	//* 如果调整值有负数，则直接返回原始坐标，不进行后续逻辑判断（暴力调整，暂不开启）
	// if (adjustPosition.x < 0 || adjustPosition.y < 0) {
	//   snapResult.left = currentComp.x;
	//   snapResult.top = currentComp.y;
	//   return snapResult;
	// }

	//* 重新赋值，但需要避免不能将组件移动到负坐标上
	if (adjustPosition.x !== x) {
		if (adjustPosition.x <= 0) {
			snapResult.left = x;
		} else if (adjustPosition.x + width >= parentWidth.value) {
			snapResult.left = parentWidth.value - width;
		} else {
			snapResult.left = adjustPosition.x;
		}
		snapResult.isSnap = true;
	} else if (x < 0) {
		snapResult.left = 0;
		// snapResult.left = currentComp.x;
		// snapResult.top = currentComp.y;
		snapResult.isSnap = true;
	}
	if (adjustPosition.y !== y) {
		snapResult.top = adjustPosition.y <= 0 ? 0 : adjustPosition.y;
		snapResult.left = adjustPosition.x;
		snapResult.isSnap = true;
	}

	//* 返回前最后一次检查
	if (snapResult.left < 0 || snapResult.top < 0) {
		snapResult.left = currentComp.x;
		snapResult.top = currentComp.y;
	}

	return snapResult;
};

/**
 * 计算距离最近的组件
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 */
const getClosestComponent = (id: string, x: number, y: number, width: number, height: number): ComponentState => {
	const otherComponents = components.value.filter((comp) => comp.id !== id);

	const calculateEdgeDistance = (
		comp1: { x: number; y: number; width: number; height: number },
		comp2: { x: number; y: number; width: number; height: number }
	): number => {
		const left = Math.abs(comp1.x - (comp2.x + comp2.width));
		const right = Math.abs(comp1.x + comp1.width - comp2.x);
		const top = Math.abs(comp1.y - (comp2.y + comp2.height));
		const bottom = Math.abs(comp1.y + comp1.height - comp2.y);
		const minX = Math.min(left, right);
		const minY = Math.min(top, bottom);
		return Math.min(minX, minY);
	};

	let closestComponent = otherComponents[0];
	let shortestDistance = calculateEdgeDistance({ x, y, width, height }, closestComponent);

	for (const component of otherComponents) {
		const distance = calculateEdgeDistance({ x, y, width, height }, component);
		if (distance < shortestDistance) {
			shortestDistance = distance;
			closestComponent = component;
		}
	}

	return closestComponent;
};

const handleCollision = (id: string, x: number, y: number, width: number, height: number) => {
	//* 仅检测碰撞，不移动其他组件
	return detectCollision(id, x, y, width, height);
};

onMounted(() => {
	parentWidth.value = document.querySelector(".app")!.clientWidth;
	parentHeight.value = document.querySelector(".app")!.clientHeight;
	ghostStep.value = parseInt((parentWidth.value / 40).toFixed(0));
	loadState();
});

/**
 * 是否与其他组件重叠
 * @param comp1
 * @param comp2
 */
const isOverlapping = (comp1: ComponentState, comp2: ComponentState): boolean => {
	return !(
		comp1.x >= comp2.x + comp2.width ||
		comp1.x + comp1.width <= comp2.x ||
		comp1.y >= comp2.y + comp2.height ||
		comp1.y + comp1.height <= comp2.y
	);
};

/**
 * 调整当前组件位置
 * @param id
 * @param x
 * @param y
 * @param width
 * @param height
 */
const adjustComponentPosition = (
	id: string,
	x: number,
	y: number,
	width: number,
	height: number
): { x: number; y: number } => {
	const otherComponents = components.value.filter((comp) => comp.id !== id);
	let adjustedX = x;
	let adjustedY = y;

	const adjustPosition = () => {
		let adjusted = false;
		for (const component of otherComponents) {
			if (isOverlapping({ id, x: adjustedX, y: adjustedY, width, height }, component)) {
				const right = component.x + component.width;
				const bottom = component.y + component.height;
				const leftOverlap = adjustedX < component.x;
				const rightOverlap = adjustedX + width > component.x + component.width;
				const topOverlap = adjustedY < component.y;
				const bottomOverlap = adjustedY + height > component.y + component.height;

				if (leftOverlap) {
					console.log("leftOverlap");
					adjustedX = component.x - width;
					adjusted = true;
				} else if (rightOverlap) {
					console.log("rightOverlap", component);
					if (component.x + component.width + width > parentWidth.value) {
						console.log("rightOverlap overflow");
						adjustedX = currentComp.x;
						adjustedY = currentComp.y;
					}
					adjusted = true;
				} else if (topOverlap) {
					console.log("topOverlap");
					adjustedY = component.y - height;
					adjusted = true;
				} else if (bottomOverlap) {
					console.log("bottomOverlap");
					adjustedY = bottom;
					adjusted = true;
				} else {
					console.log("当前组件在其他组件内部");
				}

				//* 检查是否还是与其他组件重叠
				let stillOverlapping = false;
				for (const comp of otherComponents) {
					if (isOverlapping({ id, x: adjustedX, y: adjustedY, width, height }, comp)) {
						stillOverlapping = true;
						break;
					}
				}

				if (stillOverlapping) {
					//* 恢复组件移动前的原始位置
					console.log("stillOverlapping");
					adjustedX = currentComp.x;
					adjustedY = currentComp.y;
					adjusted = true;
					break;
				}
			}
		}
		return adjusted;
	};

	while (adjustPosition()) {
		const prevX = adjustedX;
		const prevY = adjustedY;
		if (adjustPosition()) {
			if (adjustedX === prevX && adjustedY === prevY) {
				console.log("full overlap");
				break;
			}
		}
	}

	return { x: adjustedX, y: adjustedY };
};
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
