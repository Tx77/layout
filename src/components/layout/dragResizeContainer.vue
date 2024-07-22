<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-22 17:35:07
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
			:ghostStepX="ghostDefaultStepX"
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
const ghostDefaultStepX = ref(0);
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
			ghostDefaultStepX.value = setGhostStepXRange();
			ghostStepX.value = ghostDefaultStepX.value + gap.value;
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
			item.zIndex = "3";
		} else {
			item.zIndex = "2";
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

	/**
	 * 矫正幽灵组件X轴
	 */
	const ghostXAdjust = (status: string): boolean => {
		//* 找到X轴上紧贴的上下组件
		const nearestXAxisComponent = findNearestXAxisComponent(ghostComponentState());
		// console.log("nearestXAxisComponent", nearestXAxisComponent?.compName);
		if (nearestXAxisComponent) {
			const nearestXSumWidth = nearestXAxisComponent.x + nearestXAxisComponent.width;
			if (status === "plus") {
				if (
					ghostX.value + ghostWidth.value >= nearestXSumWidth &&
					Math.abs(nearestXSumWidth - ghostX.value) > ghostStepX.value &&
					Math.abs(nearestXSumWidth - ghostX.value) < ghostStepX.value * 2
				) {
					ghostX.value += Math.abs(nearestXSumWidth - ghostX.value) - ghostStepX.value;
					return true;
				}
				if (
					ghostX.value + ghostWidth.value >= nearestXSumWidth &&
					ghostX.value + ghostStepX.value === nearestXSumWidth
				) {
					ghostX.value = nearestXSumWidth + gap.value;
					return true;
				}
				if (
					ghostX.value + ghostWidth.value + ghostStepX.value > nearestXSumWidth &&
					ghostX.value + ghostWidth.value < nearestXSumWidth
				) {
					// console.log("adjust add", nearestXAxisComponent.compName);
					if (nearestXSumWidth - ghostX.value < props.screenWidth) {
						ghostX.value = nearestXSumWidth - ghostWidth.value;
						return true;
					}
				}
				if (
					ghostX.value + ghostWidth.value >= nearestXAxisComponent.x &&
					Math.abs(nearestXAxisComponent.x - ghostX.value) > ghostStepX.value &&
					Math.abs(nearestXAxisComponent.x - ghostX.value) < ghostStepX.value * 2
				) {
					ghostX.value += Math.abs(nearestXAxisComponent.x - ghostX.value) - ghostStepX.value;
					return true;
				}
			} else {
				if (ghostX.value > nearestXAxisComponent.x && ghostX.value - ghostStepX.value < nearestXAxisComponent.x) {
					// console.log("adjust sub", nearestXAxisComponent.compName);
					ghostX.value = nearestXAxisComponent.x;
					return true;
				}
				if (
					ghostX.value + ghostWidth.value >= nearestXSumWidth &&
					Math.abs(nearestXSumWidth - (ghostX.value + ghostWidth.value)) > ghostStepX.value &&
					Math.abs(nearestXSumWidth - (ghostX.value + ghostWidth.value)) < ghostStepX.value * 2
				) {
					ghostX.value -= Math.abs(nearestXSumWidth - (ghostX.value + ghostWidth.value)) - ghostStepX.value;
					return true;
				}
				if (
					ghostX.value + ghostWidth.value >= nearestXAxisComponent.x &&
					Math.abs(nearestXAxisComponent.x - (ghostX.value + ghostWidth.value)) > ghostStepX.value &&
					Math.abs(nearestXAxisComponent.x - (ghostX.value + ghostWidth.value)) < ghostStepX.value * 2
				) {
					ghostX.value -=
						Math.abs(nearestXAxisComponent.x - (ghostX.value + ghostWidth.value)) - ghostStepX.value + gap.value;
					return true;
				}
			}
		}
		return false;
	};
	if (Math.abs(currentComponentX - ghostX.value) >= stepX) {
		if (currentComponentX - ghostX.value >= 0) {
			if (currentComponentWidth + ghostX.value >= props.screenWidth) {
				ghostX.value = props.screenWidth - currentComponentWidth;
			} else {
				if (!ghostXAdjust("plus")) {
					// console.log("normal add");
					ghostX.value += ghostStepX.value;
				}
			}
		} else {
			if (ghostX.value - ghostStepX.value <= 0) {
				ghostX.value = 0;
			} else {
				if (currentComponentX - stepX <= 0) {
					ghostX.value = 0;
				} else {
					if (!ghostXAdjust("minus")) {
						// console.log("normal sub");
						ghostX.value -= ghostStepX.value;
					}
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
	const chooseOverlappedComponent = (overlappedComponents: ComponentState[]): ComponentState => {
		let overlappedComponent = overlappedComponents[0] as ComponentState;
		for (let i = 0; i < overlappedComponents.length; i++) {
			const item = overlappedComponents[i] as ComponentState;
			if (isOverlappingX(item, currentComponentState, stepX)) {
				overlappedComponent = item;
			}
		}
		return overlappedComponent;
	};
	const overlappedComponents = findOverlappedComponents(currentComponentState);
	if (overlappedComponents && overlappedComponents.length > 0) {
		const item = overlappedComponents[0];
		// const item = chooseOverlappedComponent(overlappedComponents);
		// const item = overlappedComponents[overlappedComponents.length - 1];
		// console.log("overlappedComponent", item.compName);
		flag.value = false;
		const topMatchingComponents = findTopMatchingComponents(item);
		let case1 = false;
		if (topMatchingComponents.length === 0) {
			//* 当前组件height大于碰撞组件height
			case1 =
				currentComponentHeight > item.height &&
				currentComponentY + currentComponentHeight > item.y + item.height - triggerY &&
				currentComponentY < item.y;
		} else {
			//* 碰撞组件上方有紧挨着的另一个组件需要单独判断
			case1 = currentComponentHeight > item.height && currentComponentY > item.y + triggerY;
		}
		const case2 = currentComponentY >= item.y + triggerY;
		if (isOverlappingX(item, currentComponentState, stepX)) {
			//! 有的组件需要特殊处理，可以考虑给组件增加属性，通过属性来调整碰撞规则
			if (case1 || case2) {
				ghostY.value = item.y + item.height + gap.value;
			} else {
				ghostY.value = findClosestY(currentComponentState);
			}
			const ghostOverlappedComponents = ghostCheck();
			if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
				// console.log(JSON.stringify(ghostOverlappedComponents));
				const ghostItem = ghostOverlappedComponents[0] as ComponentState;
				// console.log(ghostItem.compName);
				if (ghostY.value <= ghostItem.y) {
					const ghostBelowComponents = findBottomMatchingComponents(ghostItem);
					ghostBelowComponents.unshift({
						components: [ghostItem],
						maxHeight: ghostItem.height,
					});
					// console.log("ghostBelowComponents", ghostBelowComponents);
					belowComponentsMove(ghostBelowComponents, true);
				} else {
					ghostY.value = ghostItem.y + ghostItem.height + gap.value;
				}
			} else {
				ghostCollidedComponents.value = [];
			}
		} else {
			ghostY.value = findClosestY(currentComponentState);
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
	const currentComponentMinWidth = currentComponentState.minW! * ghostDefaultStepX.value;
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

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestXComponent = findNearestXComponent(currentComponentState);
	if (nearestXComponent && nearestXComponent.distance <= stepX) {
		if (nearestXComponent.direction === "right") {
			// console.log("hahaha", nearestXComponent.component.compName);
			ghostWidth.value = nearestXComponent.component.x - ghostX.value - gap.value;
		}
	}

	/**
	 * 幽灵组件宽度改变事件
	 * 由于在resize时，幽灵组件的Y轴可能会改变，因此不能用原生组件来判断，因此统一用幽灵组件来判断
	 */
	const ghostWidthChange = (): boolean => {
		let isChange = false;
		//* 找到X轴上紧贴的上下组件
		const nearestXAxisComponent = findNearestXAxisComponent(ghostComponentState());
		if (nearestXAxisComponent) {
			// console.log(nearestXAxisComponent.compName);
			const nearestXSumWidth = nearestXAxisComponent.x + nearestXAxisComponent.width;
			if (
				ghostX.value + ghostWidth.value + ghostStepX.value > nearestXSumWidth &&
				ghostX.value + ghostWidth.value < nearestXSumWidth
			) {
				// console.log("adjust add", nearestXAxisComponent.compName);
				if (nearestXSumWidth - ghostX.value < props.screenWidth) {
					ghostWidth.value = nearestXSumWidth - ghostX.value;
					isChange = true;
				}
			}
			if (
				ghostX.value + ghostWidth.value - ghostStepX.value < nearestXAxisComponent.x - gap.value &&
				ghostX.value + ghostWidth.value + gap.value > nearestXAxisComponent.x
			) {
				// console.log("adjust sub", nearestXAxisComponent.compName);
				if (nearestXSumWidth - ghostX.value < props.screenWidth) {
					ghostWidth.value = nearestXAxisComponent.x - ghostX.value - gap.value;
					isChange = true;
				}
			}
		}
		return isChange;
	};

	//* X轴步进计算
	if (currentComponentWidth >= currentComponentMinWidth) {
		if (Math.abs(currentComponentWidth - ghostWidth.value) >= stepX) {
			if (currentComponentWidth - ghostWidth.value >= 0) {
				if (ghostWidth.value + ghostStepX.value > props.screenWidth) {
					ghostWidth.value = props.screenWidth;
				} else {
					if (!ghostWidthChange()) {
						// console.log("normal add");
						ghostWidth.value += ghostStepX.value;
					}
				}
			} else {
				if (
					currentComponentWidth <= currentComponentMinWidth ||
					ghostWidth.value - ghostStepX.value <= currentComponentMinWidth
				) {
					ghostWidth.value = currentComponentMinWidth;
				} else {
					if (!ghostWidthChange()) {
						// console.log("normal sub");
						ghostWidth.value -= ghostStepX.value;
					}
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

	const overlappedComponents = findOverlappedComponents(currentComponentState);

	if (overlappedComponents && overlappedComponents.length > 0) {
		// console.log(JSON.stringify(overlappedComponents));
		flag.value = false;
		const item = overlappedComponents[0];

		if (isOverlappingX(item, currentComponentState, stepX)) {
			if (item.y >= ghostY.value) {
				const belowComponents = findBottomMatchingComponents(item);
				belowComponents.unshift({ components: [item], maxHeight: item.height });
				belowComponentsMove(belowComponents);
			} else {
				ghostY.value = item.y + item.height + gap.value;
				const belowGhostComponents = components.value.filter(
					(comp) => comp.y > ghostY.value + ghostHeight.value + gap.value
				);
				belowGhostComponents.forEach((comp) => {
					comp.y = findClosestY(comp);
				});
			}
			const ghostOverlappedComponents = findOverlappedComponents(ghostComponentState(), true);
			if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
				const ghostItem = ghostOverlappedComponents[0];
				const ghostBelowComponents = findBottomMatchingComponents(ghostItem);
				ghostBelowComponents.unshift({
					components: [ghostItem],
					maxHeight: ghostItem.height,
				});
				belowComponentsMove(ghostBelowComponents);
			} else {
				ghostCollidedComponents.value = [];
			}
		}
	} else {
		flag.value = true;
		collidedComponents.value = [];
		ghostY.value = currentComponentState.y;
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
 * 组件向下移动
 * @param ghostBelowComponents
 */
function belowComponentsMove(ghostBelowComponents: BottomMatchingComponents[], isDrag = false) {
	let initYAxis = ghostY.value + ghostHeight.value + gap.value;
	for (let i = 0; i < ghostBelowComponents.length; i++) {
		for (let k = 0; k < ghostBelowComponents[i].components.length; k++) {
			const comp = ghostBelowComponents[i].components[k];
			const maxHeight = ghostBelowComponents[i].maxHeight;
			if (i == 0) {
				comp.y = initYAxis;
			} else {
				const upComp = ghostBelowComponents[i - 1].components[0];
				//* 当处于拖拽状态，且垂直交换位置时，下方如果存在多个在Y轴上相等的组件，取height最大的
				if (isDrag && ghostBelowComponents[i].components.length > 1) {
					comp.y = upComp.y + maxHeight + gap.value;
				} else {
					comp.y = upComp.y + upComp.height + gap.value;
				}
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
 * @param component
 */
function findBottomMatchingComponents(component: ComponentState): BottomMatchingComponents[] {
	const arr: BottomMatchingComponents[] = [];
	const sortedComponents = components.value.slice().sort((a, b) => a.y - b.y);
	const executeFunc = (comp: ComponentState) => {
		const index = sortedComponents.findIndex((item) => item.y >= comp.y + comp.height + gap.value);
		if (index > -1) {
			for (let i = index; i < sortedComponents.length; i++) {
				const item = sortedComponents[i];
				if (
					item.y + ghostStepY.value >= comp.y + comp.height + gap.value &&
					item.compName !== currentComp.compName &&
					isOverlappingX(item, comp)
				) {
					const existingGroup = arr.find((group) => group.components.some((i) => i.y === item.y));
					if (existingGroup) {
						if (!existingGroup.components.some((i) => i.compName === item.compName)) {
							existingGroup.components.push(item);
							existingGroup.maxHeight = Math.max(existingGroup.maxHeight, item.height);
						}
					} else {
						arr.push({
							components: [item],
							maxHeight: item.height,
						});
					}
					executeFunc(item);
				}
			}
		}
	};
	executeFunc(component);
	return arr;
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
				// const currentLeft = currentComponentState.x;
				// const currentRight = currentComponentState.x + currentComponentState.width;
				// const otherLeft = cur.x;
				// const otherRight = cur.x + cur.width;

				//* 判断 x 轴是否重叠
				const isOverlappingStepX = isOverlappingX(cur, currentComponentState, stepX);
				// const isOverlappingStepX =
				// 	(currentLeft >= otherLeft && currentLeft <= otherRight - stepX) ||
				// 	(currentRight - stepX >= otherLeft && currentRight <= otherRight) ||
				// 	(currentLeft <= otherLeft && currentRight >= otherRight);

				const curDistance = currentComponentState.y - (cur.y + cur.height);

				// if (cur.compName === "ExchangeList") {
				// 	// console.log("isOverlappingStepX", isOverlappingStepX, closest);
				// }

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
	// 	.filter((comp) => comp.compName !== compName)
	// 	.filter((item) => isOverlaping(item, { compName, x, y, width, height }));
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
