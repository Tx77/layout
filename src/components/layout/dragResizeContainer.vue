<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-26 18:04:18
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
			@drag="handleDrag"
			@resize="handleResize"
			@setInitGhostWidth="setInitGhostWidth"
			@setCurrentComponent="setCurrentComponent"
			@setGhostComponent="setGhostComponent"
			@setResizeGhostComponent="setResizeGhostComponent"
		/>
		<div class="ghost" v-if="isGhost" :style="ghostStyle"></div>
	</div>
</template>

<script setup lang="ts" name="DragResizeContainer">
import { PropType, onMounted, reactive, ref, watch } from "vue";
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
const ghostStep = ref(0);
const isGhost = ref(false);
const ghostStyle = ref<GhostStyle>();
const ghostWidth = ref(0);
const layoutStorageData = ref();

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
		console.log(components.value);
	}
);

const translateToPxNumber = (val: string): number => {
	if (val.indexOf("%") > -1) {
		return parseFloat((props.screenWidth * (parseFloat(val) / 100)).toFixed(4));
	}
	return parseFloat(val);
};

const translateToPercent = (val: number): number => {
	if (Number.isNaN(val)) {
		return val;
	}
	return parseFloat(((val / props.screenWidth) * 100).toFixed(4));
};

const loadState = () => {
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
};

const saveState = () => {
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
};

const formatStorageComponent = (comp: ComponentState) => {
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
};

const handleDrag = (compName: string, x: number, y: number, moved: boolean) => {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.x = x;
		component.y = y;
		component.moved = moved;
		saveState();
	}
};

const handleResize = (compName: string, width: number, height: number, isStatic: boolean) => {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.width = width;
		component.height = height;
		component.static = isStatic;
		saveState();
	}
};

const setCurrentComponent = (currentComponent: ComponentState) => {
	Object.assign(currentComp, {
		compName: currentComponent.compName,
		x: currentComponent.x,
		y: currentComponent.y,
		width: currentComponent.width,
		height: currentComponent.height,
	});
};

/**
 * 配置幽灵组件初始宽度
 * @param initGhostWidth
 */
const setInitGhostWidth = (initGhostWidth: number) => {
	ghostWidth.value = initGhostWidth;
};

/**
 * 设置组件zIndex
 * @param currentCompId
 */
const setComponentsZIndex = (currentCompId: string) => {
	components.value = components.value.map((item) => {
		if (item.compName === currentCompId) {
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
const setGhostComponent = (isShow: boolean, currentComponentState: ComponentState, type: GhostType) => {
	isGhost.value = isShow;
	if (!isGhost.value) {
		return;
	}
	if (type === GhostType.DRAG) {
		ghostStep.value = parseFloat((props.screenWidth / 30).toFixed(0));
		setComponentsZIndex(currentComponentState.compName);
		setDragGhostComponent(currentComponentState);
	}
	if (type === GhostType.RESIZE) {
		ghostStep.value = parseFloat((props.screenWidth / 60).toFixed(0));
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
			if (currentComponentState.x >= 0 && currentComponentState.x + currentComponentState.width <= props.screenWidth) {
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
					cursor: "auto",
				};
			}
		});
	}
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
				cursor: "se-resize",
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
				comp.moved = true;
			});
		});
	}

	const sourceComponents = components.value.map((item) => {
		if (item.compName === currentComponentState.compName) {
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
			item.compName !== currentComp.compName &&
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
	if (left + currentComponentWidth > props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	if (currentComponentLeft + currentComponentWidth + ghostStep.value >= props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
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
	const initY = 0;
	const result = sourceComponents
		.filter((item) => item.compName !== currentComponentStyle.compName)
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
const findOverlappedComponents = ({ compName, x, y, width, height }: ComponentState): ComponentState[] => {
	return components.value
		.filter((comp) => comp.compName !== compName)
		.filter((item) => isOverlaping(item, { compName, x, y, width, height }));
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
				comp.moved = true;
			});
		});
	} else {
		const sourceComponents = components.value.map((item) => {
			if (item.compName === currentComponentState.compName) {
				Object.assign(item, { width: ghostWidth.value, height: currentComponentHeight });
			}
			return item;
		});
		resetComponentsY(sourceComponents);
	}

	return { top: ghostTop, left: ghostLeft, width: ghostWidth.value, height: ghostHeight };
};

onMounted(() => {});
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
		height: 100%;
	}
}
</style>
