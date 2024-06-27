<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-27 18:33:31
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
import { PropType, onMounted, reactive, ref, toRef, toRefs, watch } from "vue";
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
const initComponents = ref<ComponentState[]>([]);
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
const space = ref(1);

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
		initComponents.value = deepClone(localComponents);
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
const setGhostComponent = (
	isShow: boolean,
	currentComponentState: ComponentState,
	type: GhostType,
	transition: string
) => {
	isGhost.value = isShow;
	if (!isGhost.value) {
		return;
	}
	if (type === GhostType.DRAG) {
		ghostStep.value = parseFloat((props.screenWidth / 30).toFixed(0));
		setComponentsZIndex(currentComponentState.compName);
		setDragGhostComponent(currentComponentState, transition);
	}
	if (type === GhostType.RESIZE) {
		ghostStep.value = parseFloat((props.screenWidth / 60).toFixed(0));
		setResizeGhostComponent(currentComponentState, transition);
	}
};

/**
 * 配置drag幽灵组件
 * @param currentComponentState
 */
const setDragGhostComponent = (currentComponentState: ComponentState, transition: string) => {
	if (isGhost.value && currentComponentState) {
		requestAnimationFrame(() => {
			if (currentComponentState.x >= 0 && currentComponentState.x + currentComponentState.width <= props.screenWidth) {
				const { top, left } = calcDragGhost(currentComponentState);
				ghostStyle.value = {
					width: currentComponentState.width + "px",
					height: currentComponentState.height + "px",
					top: top.toFixed(4) + "px",
					left: left.toFixed(4) + "px",
					zIndex: "1",
					backgroundColor: "rgba(81, 37, 43, 1)",
					position: "absolute",
					transition,
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
const setResizeGhostComponent = (currentComponentState: ComponentState, transition: string) => {
	if (isGhost.value && currentComponentState) {
		requestAnimationFrame(() => {
			const { top, left, width, height } = calcResizeGhost(currentComponentState);
			ghostStyle.value = {
				width: width + "px",
				height: height + "px",
				top: top.toFixed(4) + "px",
				left: left.toFixed(4) + "px",
				zIndex: "4",
				backgroundColor: "rgba(81, 37, 43, 0.7)",
				position: "absolute",
				transition,
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

const beforeGhostLeft = ref(-1);
const beforeGhostTop = ref(0);
const isColliedComponentTop = ref(false);

/**
 * 计算drag幽灵组件坐标
 * @param currentComponentStyle
 */
const calcDragGhost = (currentComponentState: ComponentState): { top: number; left: number } => {
	const currentComponentX = currentComponentState.x;
	const currentComponentY = currentComponentState.y;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	let ghostTop = currentComponentY;
	let ghostLeft = currentComponentX;

	ghostTop = findClosestY(currentComponentState);

	const initCurrentComponent = initComponents.value.filter(
		(item) => item.compName === currentComponentState.compName
	)[0];

	const ghostOverlappedComponents = findOverlappedComponents(
		Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop })
	);

	if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
		ghostOverlappedComponents.forEach((item) => {
			//* 与重叠组件左边碰撞
			const colliedComponentLeft =
				currentComponentX + currentComponentWidth >= item.x + ghostStep.value &&
				currentComponentX + currentComponentWidth <= item.x + item.width;
			//* 与重叠组件右边碰撞
			const colliedComponentRight =
				currentComponentX <= item.x + item.width - ghostStep.value && currentComponentX >= item.x;
			//* 与重叠组件底部碰撞
			const colliedComponentBottom =
				initCurrentComponent.y >= item.y + item.height &&
				currentComponentY <= item.y + item.height &&
				currentComponentY >= item.y;
			const rePosition = () => {
				const topMatchingComponents = findBottomMatchingComponents(item);
				const step = Math.abs(ghostTop + currentComponentHeight - item.y);
				topMatchingComponents.forEach((comp) => {
					comp.y += step;
					comp.moved = true;
				});
			};
			if (colliedComponentLeft || colliedComponentRight || colliedComponentBottom) {
				rePosition();
			} else {
				if (beforeGhostLeft.value >= 0) {
					ghostLeft = beforeGhostLeft.value;
				}
			}
		});
	} else {
		beforeGhostLeft.value = ghostLeft;
		const overlappedComponents = findOverlappedComponents(
			Object.assign(currentComponentState, { x: currentComponentX, y: currentComponentY })
		);
		if (overlappedComponents && overlappedComponents.length > 0) {
			overlappedComponents.forEach((item) => {
				console.log(item.compName);
				// const colliedComponentTop = () => {
				// 	if (item.height <= currentComponentHeight) {
				// 		return (
				// 			initCurrentComponent.y + initCurrentComponent.height <= item.y &&
				// 			currentComponentY + currentComponentHeight >= item.y + item.height
				// 		);
				// 	}
				// 	return false;
				// };
				// console.log("real", colliedComponentTop());
				// const restComponents = components.value.filter((comp) => comp.compName !== currentComponentState.compName);
				// if (colliedComponentTop()) {
				// 	isColliedComponentTop.value = colliedComponentTop();
				// 	item.y = findClosestY(item, restComponents);
				// 	ghostTop = item.y + item.height;
				// }
			});
		} else {
		}
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
		//* 判断最近组件的y是否和幽灵组件相等，否则会出现吸附到不同y的组件上
		if (nearestComponent.component.y === ghostTop) {
			if (nearestComponent.direction === "left") {
				ghostLeft = nearestComponent.component.x + nearestComponent.component.width + space.value;
			} else {
				ghostLeft = nearestComponent.component.x - currentComponentWidth - space.value;
			}
		}
	}

	ghostLeft = secondaryCorrectionLeft(ghostLeft, currentComponentX, currentComponentWidth);
	resetComponentsY(sourceComponents);

	return { top: ghostTop, left: ghostLeft };
};

/**
 * 找到满足y大于传入组件y的组件
 * @param component
 */
const findBottomMatchingComponents = (component: ComponentState): ComponentState[] => {
	return components.value.filter(
		(item) =>
			item.y >= component.y &&
			item.compName !== currentComp.compName &&
			(item.x >= component.x || item.x <= component.x + component.width)
	);
};

/**
 * 找到在初始数据下，当前组件宽度范围内且初始y小于当前组件初始y的组件
 * @param component
 */
const findTopMatchingComponents = (component: ComponentState): ComponentState[] => {
	return initComponents.value.filter(
		(item) =>
			item.compName != currentComp.compName &&
			item.compName != component.compName &&
			item.y + item.height <= component.y &&
			item.x >= component.x &&
			item.x + item.width <= component.x + component.width
	);
};

/**
 * 二次矫正幽灵组件x轴
 * @param left
 * @param currentComponentX
 * @param currentComponentWidth
 */
const secondaryCorrectionLeft = (left: number, currentComponentX: number, currentComponentWidth: number): number => {
	if (left < 0) {
		return 0;
	}
	if (currentComponentX <= ghostStep.value) {
		return 0;
	}
	if (left + currentComponentWidth > props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	if (currentComponentX + currentComponentWidth + ghostStep.value >= props.screenWidth) {
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
					return { y: cur.y + cur.height + space.value, distance: curDistance, found: true };
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

	const ghostOverlappedComponents = findOverlappedComponents(ghostComponent);

	if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
		ghostOverlappedComponents.forEach((item) => {
			const topMatchingComponents = findBottomMatchingComponents(item);
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

/**
 * 深拷贝函数
 * @param obj
 * @param hash
 */
const deepClone = <T>(obj: T, hash = new WeakMap()): T => {
	if (obj instanceof Date) {
		return new Date(obj) as T;
	}
	if (obj instanceof RegExp) {
		return new RegExp(obj) as T;
	}
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}
	if (hash.get(obj)) {
		return hash.get(obj) as T;
	}
	const cloneObj = new (obj.constructor as { new (): T })();
	hash.set(obj, cloneObj);
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) {
			cloneObj[i] = deepClone((obj as any)[i], hash);
		}
	}
	return cloneObj;
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
