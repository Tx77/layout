<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-04 14:38:19
 * @Description: 
-->
<template>
	<div class="drag-container">
		<DraggableResizable
			v-for="comp in components"
			:key="comp.compName"
			:componentState="comp"
			:compName="comp.compName"
			:ghostStyle="ghostStyle"
			:directions="['bottom-right']"
			:screenWidth="screenWidth"
			:comp="componentInstance[comp.compName]"
			@drag="handleDrag"
			@resize="handleResize"
			@setInitWidth="setInitWidth"
			@setCurrentComponent="setCurrentComponent"
			@setInitX="setInitX"
			@setGhostComponent="setGhostComponent"
			@setResizeGhostComponent="setResizeGhostComponent"
		>
		</DraggableResizable>
		<div class="ghost" v-if="isGhost" :style="ghostStyle"></div>
	</div>
</template>

<script setup lang="ts" name="DragResizeContainer">
import { PropType, reactive, ref, watch } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ComponentState, GhostStyle, DistanceResult, GhostType } from "./params";
import { LayoutCompMap, LayoutStrategy } from "./layout";
import LayoutResizer from "./LayoutResizer";

const props = defineProps({
	layoutComponents: {
		type: Array as PropType<LayoutCompMap[]>,
		default: () => [],
	},
	screenWidth: {
		type: Number,
		default: 0,
	},
	layoutStrategy: {
		type: String,
		default: LayoutStrategy.PRO_RIGHT,
	},
	layoutResizer: {
		type: Object as PropType<LayoutResizer>,
		default: () => {},
	},
	componentInstance: {
		type: Object,
		default: () => {},
	},
});

const components = ref<ComponentState[]>([]);
const currentComp = reactive<ComponentState>({
	compName: "",
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	minWidth: 0,
	minHeight: 0,
});
//* 幽灵组件x轴移动的阈值
const ghostStep = ref(0);
const isGhost = ref(false);
//* 幽灵组件样式
const ghostStyle = ref<GhostStyle>();
//* 布局缓存数据
const layoutStorageData = ref();
//* 默认间隙
const gap = ref(2);
watch(
	() => props.layoutComponents,
	(val) => {
		const localComponents = val.map((item) => {
			return {
				compName: item.compName,
				width: translateToPxNumber(item.layoutStyle.width),
				height: translateToPxNumber(item.layoutStyle.height),
				minWidth: translateToPxNumber(item.layoutStyle.minWidth),
				minHeight: translateToPxNumber(item.layoutStyle.minHeight),
				x: translateToPxNumber(item.layoutStyle.left),
				y: translateToPxNumber(item.layoutStyle.top),
				transition: item.layoutStyle.transition,
				zIndex: item.layoutStyle.zIndex,
				fixed: item.fixed,
				moved: false,
				static: true,
				show: item.show,
				isGap: false,
			};
		});

		const storageComponents = loadState();
		if (storageComponents && storageComponents.length > 0) {
			for (let i = 0; i < localComponents.length; i++) {
				for (let k = 0; k < storageComponents.length; k++) {
					if (
						storageComponents[k].compName === localComponents[i].compName &&
						storageComponents[k].show &&
						(storageComponents[k].moved || !storageComponents[k].static)
					) {
						localComponents[i] = Object.assign(storageComponents[k], {
							width: translateToPxNumber(storageComponents[k].width),
							x: translateToPxNumber(storageComponents[k].x),
						});
					}
				}
			}
		}
		ghostStep.value = 133;
		components.value = localComponents;
	}
);

/**
 * 转化为数字类型的像素
 * @param val
 */
function translateToPxNumber(val: string): number {
	if (val.indexOf("%") > -1) {
		return Math.round(props.screenWidth * (parseFloat(val) / 100));
	}
	return parseFloat(val);
}

/**
 * 转化为百分比
 * @param val
 */
function translateToPercent(val: number): number {
	if (Number.isNaN(val)) {
		return val;
	}
	return parseFloat(((val / props.screenWidth) * 100).toFixed(4));
}

/**
 * 加载缓存布局
 */
function loadState() {
	let data = [];
	layoutStorageData.value = localStorage.getItem(props.layoutStrategy);
	if (!layoutStorageData.value) {
		return;
	}
	layoutStorageData.value = JSON.parse(layoutStorageData.value);
	for (const resolutionRange in layoutStorageData.value) {
		const [minWidth, maxWidth] = JSON.parse(resolutionRange.replace("[", "[").replace("]", "]"));
		if (props.screenWidth >= minWidth && props.screenWidth <= maxWidth) {
			data = layoutStorageData.value[resolutionRange];
		}
	}
	return data;
}

/**
 * 缓存布局
 */
function saveState() {
	for (const resolutionRange in layoutStorageData.value) {
		const [minWidth, maxWidth] = JSON.parse(resolutionRange.replace("[", "[").replace("]", "]"));
		if (props.screenWidth >= minWidth && props.screenWidth <= maxWidth) {
			for (let i = 0; i < components.value.length; i++) {
				for (let k = 0; k < layoutStorageData.value[resolutionRange].length; k++) {
					if (
						(components.value[i].moved || !components.value[i].static) &&
						components.value[i].compName === layoutStorageData.value[resolutionRange][k].compName
					) {
						layoutStorageData.value[resolutionRange][k] = formatStorageComponent(components.value[i]);
					}
				}
			}
		}
	}
	localStorage.setItem(props.layoutStrategy, JSON.stringify(layoutStorageData.value));
}

/**
 * 格式化缓存数据
 * @param comp
 */
function formatStorageComponent(comp: ComponentState) {
	return {
		compName: comp.compName,
		width: translateToPercent(comp.width) + "%",
		height: comp.height,
		minWidth: comp.minWidth,
		minHeight: comp.minHeight,
		x: translateToPercent(comp.x) + "%",
		y: comp.y,
		zIndex: comp.zIndex,
		fixed: comp.fixed,
		moved: comp.moved,
		static: comp.static,
		show: comp.show,
	};
}

/**
 * 处理拖拽事件
 * @param compName
 * @param x
 * @param y
 * @param moved
 */
function handleDrag(compName: string, x: number, y: number, moved: boolean) {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.x = x;
		component.y = y;
		component.moved = moved;
		saveState();
	}
}

/**
 * 处理resize事件
 * @param compName
 * @param width
 * @param height
 * @param isStatic
 */
function handleResize(compName: string, width: number, height: number, isStatic: boolean) {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.width = width;
		component.height = height;
		component.static = isStatic;
		saveState();
	}
}

/**
 * 设置当前组件全局变量
 * @param currentComponent
 */
function setCurrentComponent(currentComponent: ComponentState) {
	Object.assign(currentComp, currentComponent);
	ghostY.value = currentComp.y;
}

const setInitX = (initX: number) => {
	ghostX.value = initX;
};

/**
 * 配置幽灵组件初始宽度
 * @param initGhostWidth
 */
function setInitWidth(initGhostWidth: number) {
	ghostWidth.value = initGhostWidth;
}

/**
 * 设置组件zIndex
 * @param currentCompId
 */
function setComponentsZIndex(currentCompId: string) {
	components.value = components.value.map((item) => {
		if (item.compName === currentCompId) {
			item.zIndex = "4";
		} else {
			item.zIndex = item.fixed ? "2" : "3";
		}
		return item;
	});
}

/**
 * 配置幽灵组件
 * @param isShow
 * @param currentComponentState
 */
function setGhostComponent(isShow: boolean, currentComponentState: ComponentState, type: GhostType) {
	isGhost.value = isShow;
	if (!isGhost.value) {
		return;
	}

	if (type === GhostType.DRAG) {
		setComponentsZIndex(currentComponentState.compName);
		setDragGhostComponent(currentComponentState);
	}
	if (type === GhostType.RESIZE) {
		setResizeGhostComponent(currentComponentState);
	}
}

/**
 * 配置drag幽灵组件
 * @param currentComponentState
 */
function setDragGhostComponent(currentComponentState: ComponentState) {
	if (isGhost.value && currentComponentState) {
		const { top, left } = calcDragGhost(currentComponentState);
		ghostStyle.value = {
			width: currentComponentState.width.toFixed(0) + "px",
			height: currentComponentState.height + "px",
			zIndex: "1",
			backgroundColor: "rgba(81, 37, 43, 1)",
			position: "absolute",
			transition: "0.08s ease",
			cursor: "auto",
			transform: `translate(${left.toFixed(0)}px, ${top}px)`,
		};
	}
}

/**
 * 配置resize幽灵组件
 * @param currentComponentState
 */
function setResizeGhostComponent(currentComponentState: ComponentState) {
	if (isGhost.value && currentComponentState) {
		const { top, left, width, height } = calcResizeGhost(currentComponentState);
		ghostStyle.value = {
			width: width.toFixed(0) + "px",
			height: height + "px",
			zIndex: "3",
			backgroundColor: "rgba(81, 37, 43, 0.9)",
			position: "absolute",
			cursor: "se-resize",
			transform: `translate(${left.toFixed(0)}px, ${top}px)`,
		};
	}
}

/**
 * 重置组件y轴定位
 * @param list
 */
function resetComponentsY(list?: ComponentState[]) {
	let sourceComponents: ComponentState[] = [];
	if (list && list.length > 0) {
		sourceComponents = list;
	} else {
		sourceComponents = components.value;
	}
	sourceComponents.forEach((item) => {
		item.y = findClosestY(item);
	});
}

/**
 * 找到距离当前组件X轴最近的组件
 * @param currentComponent
 */
function findNearestXComponent(currentComponent: ComponentState): DistanceResult | null {
	const nearestComponents = components.value.filter((item) => item.compName !== currentComponent.compName);
	let nearestComponent: DistanceResult | null = null;
	for (const component of nearestComponents) {
		if (component.compName === currentComponent.compName) continue;
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
 * @param currentComponentState
 */
const ghostX = ref(0);
const ghostY = ref(0);
const flag = ref(true);
function calcDragGhost(currentComponentState: ComponentState): { top: number; left: number } {
	let currentComponentX = currentComponentState.x;
	let currentComponentY = currentComponentState.y;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	if (currentComponentState.x < 0) {
		currentComponentX = 0;
	}
	if (currentComponentState.x + currentComponentWidth > props.screenWidth) {
		currentComponentState.x = props.screenWidth - currentComponentWidth;
	}
	const step = Math.ceil(ghostStep.value / 2);

	const moveGhostX = () => {
		if (Math.abs(currentComponentX - ghostX.value) > step) {
			if (currentComponentX - ghostX.value > 0) {
				if (currentComponentWidth + ghostX.value + ghostStep.value >= props.screenWidth) {
					ghostX.value = props.screenWidth - currentComponentWidth;
				} else {
					ghostX.value += ghostStep.value;
				}
			} else {
				if (ghostX.value - ghostStep.value <= 0) {
					ghostX.value = 0;
				} else {
					ghostX.value -= ghostStep.value;
				}
			}
		}
	};

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(currentComponentState);
	if (
		nearestComponent &&
		nearestComponent.distance <= step
		//* 幽灵组件也不能和其他组件发生碰撞
		// findOverlappedComponents(Object.assign(currentComponentState, { x: ghostX.value, y: ghostY.value })).length === 0
	) {
		if (nearestComponent.direction === "left") {
			ghostX.value = nearestComponent.component.x + nearestComponent.component.width + gap.value;
		} else {
			ghostX.value = nearestComponent.component.x - currentComponentWidth - gap.value;
		}
	}

	const ghostCheck = (): ComponentState[] => {
		const ghostOverlappedComponents = findOverlappedComponents({
			x: ghostX.value,
			y: ghostY.value,
			width: currentComponentWidth,
			height: currentComponentHeight,
			compName: currentComponentState.compName,
		});

		if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
			return ghostOverlappedComponents;
		}
		return [];
	};

	const overlappedComponents = findOverlappedComponents(currentComponentState);
	if (overlappedComponents && overlappedComponents.length > 0) {
		const item = overlappedComponents[overlappedComponents.length - 1];
		// console.log(item);
		flag.value = false;
		const moveStep = 10;
		const topMatchingComponents = findTopMatchingComponents(item);
		let case1 = false;
		if (topMatchingComponents.length === 0) {
			//* 当前组件height大于碰撞组件height
			case1 =
				currentComponentHeight > item.height &&
				currentComponentY + currentComponentHeight > item.height + item.y &&
				ghostY.value <= item.y;
		} else {
			//* 碰撞组件上方有紧挨着的另一个组件需要单独判断
			case1 = currentComponentHeight > item.height && currentComponentY > item.y + moveStep && ghostY.value <= item.y;
		}
		//* 当前组件height小于碰撞组件height
		const case2 =
			currentComponentHeight <= item.height && currentComponentY >= item.y + moveStep && ghostY.value <= item.y;
		const leftOverlapped =
			currentComponentX + currentComponentWidth >= item.x + step &&
			currentComponentX + currentComponentWidth < item.x + item.width;
		const rightOverlapped = currentComponentX > item.x && currentComponentX <= item.x + item.width - step;
		if ((currentComponentY > item.y + moveStep || case1 || case2) && (leftOverlapped || rightOverlapped)) {
			ghostY.value = item.y + item.height + gap.value;
		} else {
			// console.log("====");
			ghostY.value = findClosestY(currentComponentState);
		}
		const ghostOverlappedComponents = ghostCheck();
		if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
			ghostOverlappedComponents.forEach((ghostItem) => {
				if (ghostY.value <= ghostItem.y) {
					let ghostBelowComponents = findBottomMatchingComponents(ghostItem);
					ghostBelowComponents.unshift(ghostItem);
					ghostBelowComponents.forEach((comp) => {
						comp.y += currentComponentHeight;
						comp.moved = true;
					});
				}
			});
		}
		flag.value = true;
	} else {
		ghostY.value = findClosestY(currentComponentState);
	}

	moveGhostX();

	const sourceComponents = components.value.map((item) => {
		if (item.compName === currentComponentState.compName) {
			Object.assign(item, { x: ghostX.value, y: ghostY.value });
		}
		return item;
	});

	ghostX.value = secondaryCorrectionLeft(ghostX.value, currentComponentX, currentComponentWidth);

	if (flag.value) {
		resetComponentsY(sourceComponents);
	}
	return { top: ghostY.value, left: ghostX.value };
}

/**
 * 找到满足y大于传入组件y的组件
 * @param component
 */
function findBottomMatchingComponents(component: ComponentState): ComponentState[] {
	return components.value.filter(
		(item) =>
			item.y >= component.y + component.height &&
			item.compName !== currentComp.compName &&
			((item.x >= component.x && item.x <= component.x + component.width) ||
				(item.x <= component.x && item.x + item.width >= component.x + component.width))
	);
}

/**
 * 找到满足y小于传入组件y的组件
 * @param component
 */
function findTopMatchingComponents(component: ComponentState): ComponentState[] {
	return components.value.filter(
		(item) =>
			item.y <= component.y + component.height &&
			item.compName !== component.compName &&
			item.compName !== currentComp.compName &&
			!item.fixed &&
			((item.x >= component.x && item.x <= component.x + component.width) ||
				(item.x <= component.x && item.x + item.width >= component.x + component.width))
	);
}

/**
 * 二次矫正幽灵组件x轴
 * @param left
 * @param currentComponentX
 * @param currentComponentWidth
 */
function secondaryCorrectionLeft(left: number, currentComponentX: number, currentComponentWidth: number): number {
	if (left < 0) {
		return 0;
	}
	if (currentComponentX <= ghostStep.value / 2) {
		return 0;
	}
	if (left + currentComponentWidth > props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	if (currentComponentX + currentComponentWidth + ghostStep.value >= props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	return left;
}

/**
 * 找到距离当前组件最近组件的y
 * @param currentComponentState
 */
function findClosestY(currentComponentState: ComponentState, componentList?: ComponentState[]): number {
	let sourceComponents: ComponentState[] = componentList && componentList.length > 0 ? componentList : components.value;

	let initY = 0;
	const step = Math.ceil(ghostStep.value / 2);
	const result = sourceComponents
		.filter((item) => item.compName !== currentComponentState.compName)
		.reduce(
			(closest, cur) => {
				const currentLeft = currentComponentState.x;
				const currentRight = currentComponentState.x + currentComponentState.width;
				const otherLeft = cur.x;
				const otherRight = cur.x + cur.width;

				// 判断 x 轴是否重叠
				const isOverlappingX =
					(currentLeft >= otherLeft && currentLeft <= otherRight - step) ||
					(currentRight - step >= otherLeft && currentRight <= otherRight) ||
					(currentLeft <= otherLeft && currentRight >= otherRight);

				const curDistance = currentComponentState.y - (cur.y + cur.height);
				// 只在严格重叠的情况下更新最近距离
				if (isOverlappingX && curDistance < closest.distance && curDistance >= 0) {
					return { y: cur.y + cur.height + gap.value, distance: curDistance, found: true };
				}
				return closest;
			},
			{ y: initY, distance: Infinity, found: false }
		);

	return result.found ? result.y : initY;
}

/**
 * 覆盖边界
 * @param item1
 * @param item2
 */
function isOverlaping(item1: ComponentState, item2: ComponentState): boolean {
	return (
		item1.x < item2.x + item2.width &&
		item1.x + item1.width > item2.x &&
		item1.y < item2.y + item2.height &&
		item1.y + item1.height > item2.y
	);
}

/**
 * 找到被覆盖的组件
 * @param param
 */
function findOverlappedComponents({ compName, x, y, width, height }: ComponentState): ComponentState[] {
	return components.value
		.filter((comp) => comp.compName !== compName)
		.filter((item) => isOverlaping(item, { compName, x, y, width, height }));
}

const ghostWidth = ref(0);

/**
 * 计算resize幽灵组件坐标及宽高
 * @param currentComponentState
 */
function calcResizeGhost(currentComponentState: ComponentState): {
	top: number;
	left: number;
	width: number;
	height: number;
} {
	ghostY.value = currentComponentState.y;
	const ghostX = currentComponentState.x;
	const currentComponentX = currentComponentState.x;
	const currentComponentY = currentComponentState.y;
	let ghostHeight = currentComponentState.height;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	const step = Math.ceil(ghostStep.value / 2);

	if (currentComponentWidth > currentComponentState.minWidth!) {
		if (Math.abs(currentComponentWidth - ghostWidth.value) > step) {
			if (currentComponentWidth - ghostWidth.value >= 0) {
				if (ghostWidth.value + ghostStep.value >= props.screenWidth) {
					ghostWidth.value = props.screenWidth;
				} else {
					ghostWidth.value += ghostStep.value;
				}
			} else {
				if (ghostWidth.value - ghostStep.value >= currentComponentState.minWidth!) {
					ghostWidth.value -= ghostStep.value;
				} else {
					ghostWidth.value = currentComponentState.minWidth!;
				}
			}
		} else {
			if (ghostWidth.value - step <= currentComponentState.minWidth!) {
				ghostWidth.value = currentComponentState.minWidth!;
			}
		}
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(
		Object.assign(currentComponentState, {
			width: ghostWidth.value,
			height: currentComponentHeight,
		})
	);
	//* 最近组件必须在当前组件右边
	if (
		nearestComponent &&
		ghostX + currentComponentWidth <= nearestComponent.component.x &&
		nearestComponent.component.x - (ghostX + currentComponentWidth) <= step
	) {
		ghostWidth.value = nearestComponent.component.x - ghostX - gap.value;
		// console.log("nearest");
	}

	const nearestXAxisComponent = findNearestXAxisComponent(currentComponentState);
	if (nearestXAxisComponent) {
		const currentSumWidth = currentComponentWidth + currentComponentX;
		const nearestXSumWidth = nearestXAxisComponent.x + nearestXAxisComponent.width;
		if (Math.abs(nearestXSumWidth - currentSumWidth) < step && nearestXAxisComponent.x > 0) {
			if (nearestXSumWidth - currentSumWidth > 0) {
				ghostWidth.value = nearestXSumWidth;
			} else {
				ghostWidth.value = nearestXAxisComponent.x;
			}
		}
	}

	const overlappedComponents = findOverlappedComponents(currentComponentState);
	if (overlappedComponents && overlappedComponents.length > 0) {
		overlappedComponents.forEach((item) => {
			if (currentComponentX + currentComponentWidth >= item.x + step) {
				const bottomMatchingComponents = findBottomMatchingComponents(item).concat(item);
				bottomMatchingComponents.forEach((comp) => {
					comp.y += currentComponentY + currentComponentHeight;
					comp.moved = true;
				});
			} else {
				ghostWidth.value = item.x - gap.value - currentComponentX;
				console.log("overlapped");
			}
		});
	}

	const sourceComponents = components.value.map((item) => {
		if (item.compName === currentComponentState.compName) {
			Object.assign(item, { width: ghostWidth.value, height: currentComponentHeight });
		}
		return item;
	});
	resetComponentsY(sourceComponents);

	return { top: ghostY.value, left: ghostX, width: ghostWidth.value, height: ghostHeight };
}

function findNearestXAxisComponent(component: ComponentState): ComponentState | null {
	let topComponents: ComponentState[] = [];
	let bottomComponents: ComponentState[] = [];
	const isOverlappingX = (target: ComponentState): boolean => {
		return (
			(target.x >= component.x && target.x <= component.x + component.width) ||
			(target.x <= component.x && target.x + target.width >= component.x + component.width)
		);
	};
	components.value.forEach((item) => {
		if (
			item.compName !== component.compName &&
			isOverlappingX(item) &&
			item.x + item.width !== component.x + component.width
		) {
			if (item.y + item.height <= component.y) {
				topComponents.push(item);
			}
			if (item.y >= component.y + component.height) {
				bottomComponents.push(item);
			}
		}
	});

	let arr = topComponents.concat(bottomComponents);
	if (arr.length > 0) {
		let min = Math.abs(arr[0].x + arr[0].width - (component.x + component.width));
		let minItem: ComponentState = arr[0];
		arr.forEach((item) => {
			if (Math.abs(item.x + item.width - (component.x + component.width)) < min) {
				minItem = item;
				min = Math.abs(item.x + item.width - (component.x + component.width));
			}
		});
		// console.log(minItem);
		return minItem;
	}
	return null;
}
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
		width: 100%;
		height: calc(100% - 30px);
	}
}
</style>
