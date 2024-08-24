<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:08:11
 * @Description: 
-->
<template>
	<div class="drag-resize-container" ref="scrollContainer" :style="{ height: `${scrollHeight}px` }">
		<DraggableResizable
			v-for="comp in components"
			:key="comp.compName"
			:componentState="comp"
			:compName="comp.compName"
			:ghostStyle="ghostStyle"
			:directions="['bottom-right']"
			:screenWidth="screenWidth"
			:screenHeight="screenHeight"
			:comp="componentInstance[comp.compName]"
			:initProps="initProps[comp.compName]"
			:ghostStepX="ghostStepX"
			@drag="handleDrag"
			@resize="handleResize"
			@setCurrentComponent="setCurrentComponent"
			@setPointerEvents="setPointerEvents"
			@setGhostComponent="setGhostComponent"
			@setResizeGhostComponent="setResizeGhostComponent"
		>
		</DraggableResizable>
		<div class="ghost" v-if="ghostShow && ghostStyle" :style="ghostStyle"></div>
	</div>
</template>

<script setup lang="ts" name="DragResizeContainer">
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
	screenHeight: {
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
	initProps: {
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
	minW: 0,
	minHeight: 0,
});
//* 幽灵组件显示标识
const ghostShow = ref(false);
//* 幽灵组件x轴移动的阈值
const ghostStepX = ref(0);
//* 幽灵组件y轴移动的阈值
const ghostStepY = ref(10);
//* 幽灵组件样式
const ghostStyle = ref<GhostStyle | null>(null);
//* 幽灵组件x轴
const ghostX = ref(0);
//* 幽灵组件y轴
const ghostY = ref(0);
//* 幽灵组件宽度
const ghostWidth = ref(0);
//* 幽灵组件高度
const ghostHeight = ref(0);
//* 重新定位标识
const flag = ref(true);
//* 默认间隙
const gap = ref(2);
//* 布局缓存数据
const layoutStorageData = ref();
const scrollContainer = ref<HTMLElement | null>(null);
const scrollHeight = ref(0);

watch(
	() => props.layoutComponents,
	() => {
		if (props.layoutComponents) {
			scrollHeight.value = props.screenHeight;
			ghostStepX.value = setGhostStepXRange();
			const localComponents = props.layoutComponents.map((item) => {
				const width = translateToPxNumber(item.layoutStyle.width);
				return {
					compName: item.compName,
					width,
					height: translateToPxNumber(item.layoutStyle.height),
					minW: item.layoutStyle.minW,
					minHeight: translateToPxNumber(item.layoutStyle.minHeight),
					x: translateToPxNumber(item.layoutStyle.left),
					y: translateToPxNumber(item.layoutStyle.top),
					transition: item.layoutStyle.transition,
					zIndex: item.layoutStyle.zIndex,
					fixed: item.fixed,
					moved: false,
					static: true,
					show: item.show,
					pointerEvents: "auto",
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
			components.value = localComponents;
		}
	},
	{ immediate: true }
);

/**
 * 设置幽灵组件X轴步进值
 */
function setGhostStepXRange(): number {
	return Math.floor(props.screenWidth / 24);
}
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
						(components.value[i]?.moved || !components.value[i]?.static) &&
						components.value[i]!.compName === layoutStorageData.value[resolutionRange][k].compName
					) {
						layoutStorageData.value[resolutionRange][k] = formatStorageComponent(components.value[i]!);
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
		minW: comp.minW,
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
		resetComponentsY();
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
function handleResize(
	compName: string,
	containerStyle: { x: number; y: number; width: number; height: number },
	isStatic: boolean
) {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.width = containerStyle.width;
		component.height = containerStyle.height;
		component.x = containerStyle.x;
		component.y = containerStyle.y;
		component.static = isStatic;
		resetComponentsY();
		saveState();
	}
}

/**
 * 设置当前组件全局变量
 * @param currentComponent
 */
function setCurrentComponent(currentComponent: ComponentState) {
	// console.log("currentComponent", currentComponent.compName);
	ghostX.value = currentComponent.x;
	ghostY.value = currentComponent.y;
	ghostWidth.value = currentComponent.width;
	ghostHeight.value = currentComponent.height;
	Object.assign(currentComp, currentComponent);
}

/**
 * 设置pointerEvents
 * @param pointerEvents
 */
function setPointerEvents(pointerEvents: string) {
	components.value.forEach((item) => {
		item.pointerEvents = pointerEvents;
	});
}

/**
 * 设置组件zIndex
 * @param currentCompId
 */
function setComponentsZIndex(currentCompId: string) {
	components.value = components.value.map((item) => {
		if (item.compName === currentCompId) {
			item.zIndex = "2";
		} else {
			item.zIndex = "3";
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
	ghostShow.value = isShow;
	if (!ghostShow.value) {
		ghostStyle.value = null;
		collidedComponents.value = [];
		ghostCollidedComponents.value = [];
		return;
	}
	setComponentsZIndex(currentComponentState.compName);
	if (ghostStyle.value) {
		Object.assign(ghostStyle.value, {
			zIndex: "1",
		});
	}
	if (type === GhostType.DRAG) {
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
	if (ghostShow.value && currentComponentState) {
		const { top, left } = calcDragGhost(currentComponentState);
		ghostStyle.value = {
			width: currentComponentState.width.toFixed(0) + "px",
			height: currentComponentState.height + "px",
			zIndex: "1",
			backgroundColor: "rgba(81, 37, 43, 1)",
			position: "absolute",
			transition: "0.08s ease",
			cursor: "auto",
			transform: `translate(${left.toFixed(0)}px, ${top}px) translateZ(0)`,
		};
	}
}

/**
 * 计算drag幽灵组件坐标
 * @param currentComponentState
 */
function calcDragGhost(currentComponentState: ComponentState): { top: number; left: number } {
	const currentComponentX = currentComponentState.x;
	const currentComponentY = currentComponentState.y;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	ghostWidth.value = currentComponentWidth;
	if (currentComponentState.x < 0) {
		currentComponentState.x = 0;
	}
	if (currentComponentState.x + currentComponentWidth > props.screenWidth) {
		currentComponentState.x = props.screenWidth - currentComponentWidth;
	}
	const stepX = Math.floor(ghostStepX.value / 2);

	const ghostComponentState = () => ({
		compName: currentComponentState.compName,
		x: ghostX.value,
		y: ghostY.value,
		width: currentComponentWidth,
		height: currentComponentHeight,
	});

	if (Math.abs(currentComponentX - ghostX.value) >= stepX) {
		if (currentComponentX - ghostX.value >= 0) {
			if (currentComponentWidth + ghostX.value >= props.screenWidth) {
				ghostX.value = props.screenWidth - currentComponentWidth;
			} else {
				const newGhostStepX = recalcGhostStepXWithDrag();
				// console.log("plus newGhostStepX", newGhostStepX);
				ghostX.value += newGhostStepX;
			}
		} else {
			if (ghostX.value - ghostStepX.value <= 0) {
				ghostX.value = 0;
			} else {
				if (currentComponentX - stepX <= 0) {
					ghostX.value = 0;
				} else {
					const newGhostStepX = recalcGhostStepXWithDrag();
					// console.log("minus newGhostStepX", newGhostStepX);
					ghostX.value -= newGhostStepX;
				}
			}
		}
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestXComponent = findNearestXComponent(currentComponentState);
	if (nearestXComponent && nearestXComponent.distance <= stepX) {
		if (nearestXComponent.direction === "left") {
			// console.log("near left");
			ghostX.value = nearestXComponent.component.x + nearestXComponent.component.width + gap.value;
		} else if (nearestXComponent.direction === "right") {
			// console.log("near right");
			ghostX.value = nearestXComponent.component.x - currentComponentWidth - gap.value;
		}
	}

	const ghostCheck = (): ComponentState[] => {
		const ghostOverlappedComponents = findOverlappedComponents(ghostComponentState(), true);
		if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
			return ghostOverlappedComponents;
		}
		return [];
	};
	const triggerY = 20;
	const overlappedComponents = findOverlappedComponents(currentComponentState);
	if (overlappedComponents && overlappedComponents.length > 0) {
		// const item = overlappedComponents[0];
		const item = overlappedComponents[0];
		// console.log("overlappedComponent", item.compName);
		flag.value = false;
		const case1 =
			currentComponentHeight > item.height &&
			currentComponentY + currentComponentHeight > item.y + item.height - triggerY &&
			currentComponentY < item.y;
		const case2 = currentComponentY >= item.y + triggerY;
		if (isOverlappingX(item, currentComponentState, stepX)) {
			if (case1 || case2) {
				ghostY.value = item.y + item.height + gap.value;
			} else {
				ghostY.value = findClosestY(currentComponentState);
			}
		} else {
			ghostY.value = findClosestY(currentComponentState);
		}
		const ghostOverlappedComponents = ghostCheck();
		if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
			// console.log("ghostOverlappedComponents", JSON.stringify(ghostOverlappedComponents));
			const ghostOverlappedItem = ghostOverlappedComponents[0] as ComponentState;
			// const ghostOverlappedItem = ghostOverlappedComponents[ghostOverlappedComponents.length - 1] as ComponentState;
			// console.log("ghostOverlappedItem", ghostOverlappedItem.compName);
			if (ghostY.value <= ghostOverlappedItem.y) {
				const ghostBelowComponents = findBottomMatchingComponents(ghostOverlappedComponents);
				belowComponentsMove(ghostBelowComponents);
			} else {
				ghostY.value = ghostOverlappedItem.y + ghostOverlappedItem.height + gap.value;
			}
		} else {
			ghostCollidedComponents.value = [];
		}
		flag.value = true;
	} else {
		collidedComponents.value = [];
		ghostCollidedComponents.value = [];
		ghostY.value = findClosestY(currentComponentState);
	}

	if (flag.value) {
		const sourceComponents = components.value.map((item) => {
			if (item.compName === currentComponentState.compName) {
				Object.assign(item, { x: ghostX.value, y: ghostY.value });
			}
			return item;
		});
		resetComponentsY(sourceComponents);
	}
	return { top: ghostY.value, left: ghostX.value };
}

/**
 * drag时重新计算步进值
 */
function recalcGhostStepXWithDrag(): number {
	const filterComponents = components.value.filter((item) => item.compName !== currentComp.compName);
	let leftClosestComponent: ComponentState | null;
	let rightClosestComponent: ComponentState | null;
	const leftComponents = filterComponents.filter((item) => ghostX.value - (item.x + item.width) > 0);
	if (leftComponents.length > 0) {
		leftClosestComponent = leftComponents[0] as ComponentState;
		if (leftClosestComponent) {
			leftComponents.forEach((item) => {
				const itemSumWidth = item.x + item.width;
				if (
					ghostX.value - itemSumWidth > 0 &&
					ghostX.value - itemSumWidth <= ghostX.value - (leftClosestComponent!.x + leftClosestComponent!.width)
				) {
					leftClosestComponent = item;
				}
			});
		}
	}
	const ghostSumWidth = ghostX.value + ghostWidth.value;
	const rightComponents = filterComponents.filter((item) => item.x - ghostSumWidth > 0);
	if (rightComponents.length > 0) {
		rightClosestComponent = rightComponents[0] as ComponentState;
		if (rightClosestComponent) {
			rightComponents.forEach((item) => {
				if (
					rightClosestComponent!.x - ghostSumWidth > 0 &&
					rightClosestComponent!.x - ghostSumWidth <= item.x - ghostSumWidth
				) {
					rightClosestComponent = item;
				}
			});
		}
	}

	let leftRange = 0;
	let rightRange = 0;
	if (leftClosestComponent!) {
		leftRange = ghostX.value - (leftClosestComponent.x + leftClosestComponent.width) - gap.value;
	} else {
		leftRange = ghostX.value;
	}

	if (rightClosestComponent!) {
		rightRange = rightClosestComponent.x - (ghostX.value + ghostWidth.value) - gap.value;
		return reCalcGhostStepX(leftRange + rightRange);
	} else {
		rightRange = props.screenWidth - (ghostX.value + ghostWidth.value);
		return reCalcGhostStepX(rightRange);
	}
}

/**
 * 配置resize幽灵组件
 * @param currentComponentState
 */
function setResizeGhostComponent(currentComponentState: ComponentState) {
	if (ghostShow.value && currentComponentState) {
		const { top, left, width, height } = calcResizeGhost(currentComponentState);
		ghostStyle.value = {
			width: width.toFixed(0) + "px",
			height: height + "px",
			zIndex: "5",
			backgroundColor: "rgba(81, 37, 43, 0.5)",
			position: "absolute",
			cursor: "se-resize",
			transform: `translate(${left.toFixed(0)}px, ${top}px) translateZ(0)`,
		};
	}
}
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
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	const currentComponentMinWidth = currentComponentState.minW! * ghostStepX.value;
	const stepX = Math.floor(ghostStepX.value / 2);
	const stepY = Math.floor(ghostStepY.value / 2);

	/**
	 * 获取幽灵组件
	 */
	const ghostComponentState = () => ({
		compName: currentComponentState.compName,
		x: ghostX.value,
		y: ghostY.value,
		width: ghostWidth.value,
		height: ghostHeight.value,
	});

	//* X轴步进计算
	if (currentComponentWidth >= currentComponentMinWidth) {
		if (Math.abs(currentComponentWidth - ghostWidth.value) >= stepX) {
			if (currentComponentWidth - ghostWidth.value >= 0) {
				if (ghostX.value + ghostWidth.value + ghostStepX.value > props.screenWidth) {
					ghostWidth.value = props.screenWidth - ghostX.value;
				} else {
					const newGhostStepX = recalcGhostStepXWithResize();
					console.log(Math.round(ghostWidth.value / ghostStepX.value) + 1, "resize plus newGhostStepX", newGhostStepX);
					ghostWidth.value += newGhostStepX;
				}
			} else {
				if (
					currentComponentWidth <= currentComponentMinWidth ||
					ghostWidth.value - ghostStepX.value <= currentComponentMinWidth
				) {
					ghostWidth.value = currentComponentMinWidth;
				} else {
					const newGhostStepX = recalcGhostStepXWithResize();
					console.log(Math.round(ghostWidth.value / ghostStepX.value) - 1, "resize minus newGhostStepX", newGhostStepX);
					ghostWidth.value -= newGhostStepX;
				}
			}
		} else {
			if (currentComponentWidth === currentComponentMinWidth) {
				ghostWidth.value = currentComponentMinWidth;
			}
		}
	}
	//* Y轴步进计算
	if (currentComponentHeight >= currentComponentState.minHeight!) {
		if (Math.abs(currentComponentHeight - ghostHeight.value) > stepY) {
			if (currentComponentHeight - ghostHeight.value > 0) {
				ghostHeight.value = currentComponentHeight + stepY;
			} else {
				if (ghostHeight.value - stepY <= currentComponentState.minHeight!) {
					ghostHeight.value = currentComponentState.minHeight!;
				} else {
					ghostHeight.value = currentComponentHeight - stepY;
				}
			}
		} else {
			if (ghostHeight.value - stepY <= currentComponentState.minHeight!) {
				ghostHeight.value = currentComponentState.minHeight!;
			}
		}
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestXComponent = findNearestXComponent(currentComponentState);
	if (nearestXComponent && nearestXComponent.distance <= stepX) {
		if (nearestXComponent.direction === "right") {
			// console.log("hahaha", nearestXComponent.component.compName);
			ghostWidth.value = nearestXComponent.component.x - ghostX.value - gap.value;
		}
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件Y轴吸附过渡
	const nearestYComponent = findNearestYComponent(
		Object.assign(currentComponentState, {
			width: ghostWidth.value,
			height: currentComponentHeight,
		})
	);
	if (nearestYComponent) {
		if (
			ghostY.value + currentComponentHeight + gap.value <= nearestYComponent.component.y &&
			nearestYComponent.component.y - (ghostY.value + currentComponentHeight + gap.value) <= stepY
		) {
			ghostHeight.value = nearestYComponent.component.y - ghostY.value - gap.value;
		}
	}

	const ghostOverlappedComponents = findOverlappedComponents(ghostComponentState(), true);
	if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
		const arr = ghostOverlappedComponents.sort((a, b) => a.y - b.y);
		const ghostBelowComponents = findBottomMatchingComponents(arr);
		belowComponentsMove(ghostBelowComponents);
	} else {
		ghostCollidedComponents.value = [];
	}

	if (flag.value) {
		const sourceComponents = components.value.map((item) => {
			if (item.compName === currentComponentState.compName) {
				Object.assign(item, {
					width: ghostWidth.value,
					height: ghostHeight.value,
					x: ghostX.value,
					y: ghostY.value,
				});
			}
			return item;
		});
		ghostY.value = findClosestY(ghostComponentState());
		resetComponentsY(sourceComponents);
	}

	return {
		top: ghostY.value,
		left: ghostX.value,
		width: ghostWidth.value,
		height: ghostHeight.value,
	};
}

/**
 * resize时重新计算步进值
 */
function recalcGhostStepXWithResize(): number {
	// const nearestXAxisComponent = findNearestXAxisComponent(currentComp);
	// console.log("nearestXAxisComponent", nearestXAxisComponent);
	const filterComponents = components.value.filter((item) => item.compName !== currentComp.compName);
	let rightClosestComponent: ComponentState | null;

	const ghostSumWidth = ghostX.value + ghostWidth.value;
	const rightComponents = filterComponents.filter((item) => item.x - ghostSumWidth > 0);
	if (rightComponents.length > 0) {
		rightClosestComponent = rightComponents[0] as ComponentState;
		if (rightClosestComponent) {
			rightComponents.forEach((item) => {
				if (
					rightClosestComponent!.x - ghostSumWidth > 0 &&
					rightClosestComponent!.x - ghostSumWidth <= item.x - ghostSumWidth
				) {
					rightClosestComponent = item;
				}
			});
		}
	}

	let leftRange = (currentComp.minW as number) * ghostStepX.value;
	let rightRange = 0;

	if (rightClosestComponent!) {
		rightRange = rightClosestComponent.x - (ghostX.value + ghostWidth.value) - gap.value;
		return reCalcGhostStepX(leftRange + rightRange);
	} else {
		rightRange = props.screenWidth - (ghostX.value + ghostWidth.value);
		return reCalcGhostStepX(rightRange);
	}
}

/**
 * 重新计算步进值
 * @param distance
 */
function reCalcGhostStepX(distance: number): number {
	let newGhostStepX = ghostStepX.value;
	if (distance) {
		const val = distance / ghostStepX.value;
		const valStr = val.toFixed(4);
		const integer = parseInt(valStr.substring(0, valStr.indexOf(".")));
		const decimal = parseFloat("0" + valStr.substring(valStr.indexOf(".")));
		// console.log("integer", integer);
		// console.log("decimal", decimal);
		if (!isNaN(integer) && integer > 0 && !isNaN(decimal) && decimal > 0) {
			newGhostStepX = parseFloat((ghostStepX.value + (ghostStepX.value * decimal) / integer).toFixed(4));
		} else {
			newGhostStepX = ghostStepX.value;
		}
	}
	return newGhostStepX;
}

/**
 * 组件向下移动
 * @param ghostBelowComponents
 */
function belowComponentsMove(ghostBelowComponents: BottomMatchingComponents[]) {
	// console.log("ghostBelowComponents", ghostBelowComponents);
	const initYAxis = ghostY.value + ghostHeight.value + gap.value;
	for (let i = 0; i < ghostBelowComponents.length; i++) {
		for (let k = 0; k < (ghostBelowComponents[i] as BottomMatchingComponents).components.length; k++) {
			const comp = (ghostBelowComponents[i] as BottomMatchingComponents).components[k] as ComponentState;
			if (i === 0) {
				comp.y = initYAxis;
			} else {
				const upComp = (ghostBelowComponents[i - 1] as BottomMatchingComponents).components[0] as ComponentState;
				const maxHeight = (ghostBelowComponents[i - 1] as BottomMatchingComponents).maxHeight;
				comp.y = upComp.y + maxHeight + gap.value;
			}
			comp.moved = true;
		}
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
 * 找到距离当前组件X轴最近的组件以及方向
 * @param currentComponent
 */
function findNearestXComponent(currentComponent: ComponentState): DistanceResult | null {
	const nearestComponents = components.value.filter((item) => item.compName !== currentComponent.compName);
	let nearestXComponent: DistanceResult | null = null;
	for (const component of nearestComponents) {
		if (component.compName === currentComponent.compName) continue;
		const leftDistance = currentComponent.x - (component.x + component.width);
		const rightDistance = component.x - (currentComponent.x + currentComponent.width);

		if (leftDistance > 0) {
			if (!nearestXComponent || leftDistance < nearestXComponent.distance) {
				nearestXComponent = { component, distance: leftDistance, direction: "left" };
			}
		} else if (rightDistance > 0) {
			if (!nearestXComponent || rightDistance < nearestXComponent.distance) {
				nearestXComponent = { component, distance: rightDistance, direction: "right" };
			}
		}
	}

	return nearestXComponent;
}
/**
 * 找到距离当前组件Y轴最近的组件以及方向
 * @param currentComponent
 */
function findNearestYComponent(currentComponent: ComponentState): DistanceResult | null {
	const nearestComponents = components.value.filter((item) => item.compName !== currentComponent.compName);
	let nearestYComponent: DistanceResult | null = null;
	for (const component of nearestComponents) {
		if (component.compName === currentComponent.compName) continue;
		const bottomDistance = component.y - (currentComponent.y + currentComponent.height);

		if (bottomDistance > 0) {
			if (!nearestYComponent || bottomDistance < nearestYComponent.distance) {
				nearestYComponent = { component, distance: bottomDistance, direction: "bottom" };
			}
		}
	}

	return nearestYComponent;
}

interface BottomMatchingComponents {
	components: ComponentState[];
	maxHeight: number;
}

/**
 * 找到满足y大于传入组件y的组件，并以升序排序
 * 由于满足条件的组件可能在相同Y轴上同时存在多个，因此需要用二维数组来存储
 * 同时，上方满足条件的组件的高度可能不同，在向下移动时需要取组件中height最大值来作为向下移动的距离
 * @param targetComponents
 */
function findBottomMatchingComponents(targetComponents: ComponentState[]): BottomMatchingComponents[] {
	const arr: BottomMatchingComponents[] = [];
	targetComponents.forEach((target) => {
		const sortedComponents = components.value
			.filter(
				(item) =>
					item.y >= target.y &&
					item.compName !== currentComp.compName &&
					isOverlappingX(item, target, Math.floor(ghostStepX.value / 2))
			)
			.sort((a, b) => a.y - b.y);
		// console.log("sortedComponents", sortedComponents);

		sortedComponents.forEach((item) => {
			let found = false;
			for (let i = 0; i < arr.length; i++) {
				const arrItem = arr[i] as BottomMatchingComponents;
				if (arrItem.components.some((comp) => comp.compName === item.compName)) {
					found = true;
					break;
				}
				if (arrItem.components.some((comp) => comp.y === item.y)) {
					const maxHeight = Math.max(arrItem.maxHeight, item.height);
					arrItem.components.push(item);
					arrItem.maxHeight = maxHeight;
					found = true;
					break;
				}
			}
			if (!found) {
				arr.push({ components: [item], maxHeight: item.height });
			}
		});
	});
	return arr;
}

/**
 * 找到距离当前组件最近组件的y
 * @param currentComponentState
 */
function findClosestY(currentComponentState: ComponentState, componentList?: ComponentState[]): number {
	const initY = 2;
	const sourceComponents: ComponentState[] =
		componentList && componentList.length > 0 ? componentList : components.value;
	const stepX = Math.floor(ghostStepX.value / 2);
	const result = sourceComponents
		.filter((item) => item.compName !== currentComponentState.compName)
		.reduce(
			(closest, cur) => {
				//* 判断 x 轴是否重叠
				const isOverlappingStepX = isOverlappingX(cur, currentComponentState, stepX);
				const curDistance = currentComponentState.y - (cur.y + cur.height);

				if (isOverlappingStepX && curDistance < closest.distance && curDistance >= 0) {
					return {
						y: cur.y + cur.height + gap.value,
						distance: curDistance,
						found: true,
					};
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

const collidedComponents = ref<ComponentState[]>([]);
const ghostCollidedComponents = ref<ComponentState[]>([]);
/**
 * 依次找到被覆盖的组件
 * @param param
 */
function findOverlappedComponents(component: ComponentState, isGhost = false): ComponentState[] {
	// return components.value
	// 	.filter((comp) => comp.compName !== component.compName)
	// 	.filter((item) => isOverlaping(item, component));
	let arr: ComponentState[];
	if (isGhost) {
		arr = ghostCollidedComponents.value as ComponentState[];
	} else {
		arr = collidedComponents.value as ComponentState[];
	}
	components.value
		.filter((comp) => comp.compName !== component.compName)
		.forEach((comp) => {
			if (isOverlaping(comp, component)) {
				if (arr.findIndex((item) => item.compName === comp.compName) < 0) {
					arr.push(comp);
				}
			} else {
				const index = arr.findIndex((item) => item.compName === comp.compName);
				if (index > -1) {
					arr.splice(index, 1);
				}
			}
		});

	return arr;
}

/**
 * 判断x轴重叠
 * @param target
 * @param component
 * @param stepX
 */
function isOverlappingX(target: ComponentState, component: ComponentState, stepX = 0): boolean {
	//* target.x 在 component 的范围内
	const case1 = target.x >= component.x + stepX && target.x <= component.x + component.width - stepX;
	// console.log("case1", case1);
	//* target 的右边界在 component 的范围内
	const case2 =
		target.x + target.width >= component.x + stepX && target.x + target.width <= component.x + component.width - stepX;
	// console.log("case2", case2);
	//* component.x 在 target 的范围内
	const case3 = component.x >= target.x - stepX && component.x <= target.x + target.width - stepX;
	// console.log("case3", case3);
	//* component 的右边界在 target 的范围内
	const case4 =
		component.x + component.width >= target.x + stepX && component.x + component.width <= target.x + target.width;
	// console.log("case4", case4);
	return case1 || case2 || case3 || case4;
}

/**
 * 找到X轴上离组件上下最近的组件
 * @param component
 * @param topOnly
 */
function findNearestXAxisComponent(component: ComponentState): ComponentState | null {
	const topComponents: ComponentState[] = [];
	const bottomComponents: ComponentState[] = [];

	components.value.forEach((item) => {
		if (item.compName !== component.compName && isOverlappingX(item, component)) {
			if (item.y + item.height + gap.value === component.y) {
				topComponents.push(item);
			}
			if (item.y === component.y + component.height + gap.value) {
				bottomComponents.push(item);
			}
		}
	});
	// console.log("topComponents", topComponents);
	// console.log("bottomComponents", bottomComponents);

	const arr = topComponents.concat(bottomComponents) as ComponentState[];
	if (arr.length > 0) {
		let minItem = arr[0] as ComponentState;
		let minSumWidth = Math.abs(minItem.x + minItem.width - (component.x + component.width));
		arr.forEach((item) => {
			if (Math.abs(item.x + item.width - (component.x + component.width)) < minSumWidth) {
				minItem = item;
				minSumWidth = Math.abs(item.x + item.width - (component.x + component.width));
			}
		});
		//* 距离当前组件X轴距离最小的组件可能存在与其他组件的x+width或x的差值都相等情况，这个时候要以距离x轴差值最小时为最高权重
		let minX = Math.abs(minItem.x + minItem.width - component.x);
		arr.forEach((item) => {
			if (Math.abs(item.x - (component.x + component.width)) < minX) {
				minItem = item;
				minX = Math.abs(item.x + item.width - (component.x + component.width));
			}
		});
		return minItem;
	}
	return null;
}
</script>
<style lang="less" scoped>
.app {
	position: relative;
	width: 100%;
	height: 100%;
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
}
.drag-resize-container {
	position: relative;
	width: 100%;
	overflow-y: scroll;
	scrollbar-width: none;
	color: #fff;
	margin-bottom: 30px;
}
.drag-resize-container::-webkit-scrollbar {
	display: none;
}
</style>
