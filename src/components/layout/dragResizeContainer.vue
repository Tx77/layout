<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:44:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-29 18:22:12
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
			@setInitWidth="setInitWidth"
			@setCurrentComponent="setCurrentComponent"
			@setInitX="setInitX"
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
//* 幽灵组件x轴移动的阈值
const ghostStep = ref(0);
const closestYStep = ref(0);
const isGhost = ref(false);
//* 幽灵组件样式
const ghostStyle = ref<GhostStyle>();
const beforeWidth = ref(0);
const beforeX = ref(0);
//* 布局缓存数据
const layoutStorageData = ref();
//* 默认间隙
const gap = ref(1);
watch(
	() => props.screenWidth,
	(val) => {
		ghostStep.value = parseFloat((val / 24).toFixed(0));
	}
);
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
		closestYStep.value = clacClosestYStep();
		components.value = applyGapAndRePosition(localComponents);
		initComponents.value = deepClone(localComponents);
		resetComponentsY();
	}
);

const clacClosestYStep = () => {
	return parseFloat((props.screenWidth / 50).toFixed(0));
};

/**
 * 初始化给所有x,y非0的组件的x,y增加gap
 * @param components
 */
const applyGapAndRePosition = (components: ComponentState[]): ComponentState[] => {
	const gapValue = gap.value;

	const xAxisAdjustments = new Set<number>();
	const yAxisAdjustments = new Set<number>();

	//* 递归函数处理 x 轴相邻的所有组件
	function adjustXAxis(index: number, currentX: number) {
		components.forEach((other, i) => {
			if (i !== index && other.x === currentX) {
				xAxisAdjustments.add(i);
				adjustXAxis(i, other.x + other.width);
			}
		});
	}

	//* 递归函数处理 y 轴相邻的所有组件
	function adjustYAxis(index: number, currentY: number) {
		components.forEach((other, i) => {
			if (i !== index && other.y === currentY) {
				yAxisAdjustments.add(i);
				adjustYAxis(i, other.y + other.height);
			}
		});
	}

	components.forEach((component, index) => {
		if (component.x === 0) {
			adjustXAxis(index, component.x + component.width);
		}

		if (component.y === 0) {
			adjustYAxis(index, component.y + component.height);
		}
	});

	// console.log(xAxisAdjustments);
	// console.log(yAxisAdjustments);

	let lastX = 0;
	let lastY = 0;
	let lastWidth = 0;
	let lastHeight = 0;

	return components.reduce((acc, component, index) => {
		let newComponent = { ...component };

		if (xAxisAdjustments.has(index)) {
			newComponent.x = lastX + lastWidth + gapValue;
		}

		if (yAxisAdjustments.has(index)) {
			newComponent.y = lastY + lastHeight + gapValue;
		}

		//* 更新 lastX, lastY, lastWidth, lastHeight，累加上一次的结果
		lastX = newComponent.x;
		lastY = newComponent.y;
		lastWidth = newComponent.width;
		lastHeight = newComponent.height;
		acc.push(newComponent);
		return acc;
	}, [] as ComponentState[]);
};

/**
 * 转化为数字类型的像素
 * @param val
 */
const translateToPxNumber = (val: string): number => {
	if (val.indexOf("%") > -1) {
		return parseFloat((props.screenWidth * (parseFloat(val) / 100)).toFixed(0));
	}
	return parseFloat(val);
};

/**
 * 转化为百分比
 * @param val
 */
const translateToPercent = (val: number): number => {
	if (Number.isNaN(val)) {
		return val;
	}
	return parseFloat(((val / props.screenWidth) * 100).toFixed(4));
};

/**
 * 加载缓存布局
 */
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

/**
 * 缓存布局
 */
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

/**
 * 格式化缓存数据
 * @param comp
 */
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

/**
 * 处理拖拽事件
 * @param compName
 * @param x
 * @param y
 * @param moved
 */
const handleDrag = (compName: string, x: number, y: number, moved: boolean) => {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.x = x;
		component.y = y;
		component.moved = moved;
		saveState();
	}
};

/**
 * 处理resize事件
 * @param compName
 * @param width
 * @param height
 * @param isStatic
 */
const handleResize = (compName: string, width: number, height: number, isStatic: boolean) => {
	const component = components.value.find((c) => c.compName === compName);
	if (component) {
		component.width = width;
		component.height = height;
		component.static = isStatic;
		saveState();
	}
};

/**
 * 设置当前组件全局变量
 * @param currentComponent
 */
const setCurrentComponent = (currentComponent: ComponentState) => {
	Object.assign(currentComp, {
		compName: currentComponent.compName,
		x: currentComponent.x,
		y: currentComponent.y,
		width: currentComponent.width,
		height: currentComponent.height,
	});
};

const setInitX = (initX: number) => {
	beforeX.value = initX;
};

/**
 * 配置幽灵组件初始宽度
 * @param initGhostWidth
 */
const setInitWidth = (initGhostWidth: number) => {
	beforeWidth.value = initGhostWidth;
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
		setComponentsZIndex(currentComponentState.compName);
		setDragGhostComponent(currentComponentState, transition);
	}
	if (type === GhostType.RESIZE) {
		setResizeGhostComponent(currentComponentState);
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
					width: currentComponentState.width.toFixed(0) + "px",
					height: currentComponentState.height + "px",
					zIndex: "1",
					backgroundColor: "rgba(81, 37, 43, 1)",
					position: "absolute",
					transition,
					cursor: "auto",
					transform: `translate(${left.toFixed(0)}px, ${top}px)`,
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
	const currentComponentX = currentComponentState.x;
	const currentComponentY = currentComponentState.y;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	let ghostTop = currentComponentY;
	let ghostLeft = beforeX.value;
	const step = Math.floor(ghostStep.value / 2);

	ghostTop = findClosestY(currentComponentState);
	if (Math.abs(currentComponentX - beforeX.value) > step) {
		if (currentComponentX - beforeX.value > 0) {
			ghostLeft += ghostStep.value;
		} else {
			if (ghostLeft - ghostStep.value <= 0) {
				ghostLeft = 0;
			} else {
				ghostLeft -= ghostStep.value;
			}
		}
	} else {
		ghostLeft = beforeX.value;
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(currentComponentState);
	if (
		nearestComponent &&
		nearestComponent.distance <= step &&
		//* 幽灵组件也不能和其他组件发生碰撞
		findOverlappedComponents(Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop })).length === 0
	) {
		if (nearestComponent.direction === "left") {
			ghostLeft = nearestComponent.component.x + nearestComponent.component.width + gap.value;
		} else {
			ghostLeft = nearestComponent.component.x - currentComponentWidth - gap.value;
		}
		reCalcGhostStep(nearestComponent.component.width);
	}

	const initCurrentComponent = initComponents.value.filter(
		(item) => item.compName === currentComponentState.compName
	)[0];

	const ghostOverlappedComponents = findOverlappedComponents(
		Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop })
	);

	// if (ghostOverlappedComponents && ghostOverlappedComponents.length > 0) {
	// 	ghostOverlappedComponents.forEach((item) => {
	// 		//* 与重叠组件左边碰撞
	// 		const colliedComponentLeft =
	// 			currentComponentX + currentComponentWidth >= item.x + ghostStep.value &&
	// 			currentComponentX + currentComponentWidth <= item.x + item.width;
	// 		//* 与重叠组件右边碰撞
	// 		const colliedComponentRight =
	// 			currentComponentX <= item.x + item.width - ghostStep.value && currentComponentX >= item.x;
	// 		//* 与重叠组件底部碰撞
	// 		const colliedComponentBottom =
	// 			initCurrentComponent.y >= item.y + item.height &&
	// 			currentComponentY <= item.y + item.height &&
	// 			currentComponentY >= item.y;
	// 		const rePosition = () => {
	// 			const topMatchingComponents = findBottomMatchingComponents(item);
	// 			const subValue = Math.abs(ghostTop + currentComponentHeight - item.y);
	// 			topMatchingComponents.forEach((comp) => {
	// 				comp.y += subValue;
	// 				comp.moved = true;
	// 			});
	// 		};
	// 		// if (colliedComponentLeft || colliedComponentRight || colliedComponentBottom) {
	// 		// 	rePosition();
	// 		// } else {
	// 		// 	if (beforeGhostLeft.value >= 0) {
	// 		// 		ghostLeft = beforeGhostLeft.value;
	// 		// 	}
	// 		// }
	// 	});
	// } else {
	// }

	const sourceComponents = components.value.map((item) => {
		if (item.compName === currentComponentState.compName) {
			Object.assign(item, { x: ghostLeft, y: ghostTop });
		}
		return item;
	});

	ghostLeft = secondaryCorrectionLeft(ghostLeft, currentComponentX, currentComponentWidth);

	resetComponentsY(sourceComponents);
	return { top: ghostTop, left: ghostLeft };
};

const reCalcGhostStep = (componentWidth: number) => {
	const ratio = Math.floor(componentWidth / ghostStep.value);
	ghostStep.value = Math.floor(componentWidth / ratio);
};

/**
 * 找到满足y大于传入组件y的组件
 * @param component
 */
const findBottomMatchingComponents = (component: ComponentState): ComponentState[] => {
	return components.value.filter(
		(item) =>
			item.y >= component.y + component.height &&
			item.compName !== currentComp.compName &&
			((item.x >= component.x && item.x <= component.x + component.width) ||
				(item.x <= component.x && item.x + item.width >= component.x + component.width))
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
	// if (currentComponentX <= ghostStep.value / 2) {
	// 	return 0;
	// }
	if (left + currentComponentWidth > props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	if (currentComponentX + currentComponentWidth + ghostStep.value >= props.screenWidth) {
		return props.screenWidth - currentComponentWidth;
	}
	beforeX.value = left;
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
				//* 模块的右上角和左上角不能和其他模块形成十字，需要在阈值范围外才能在x轴移动
				const isOverlappingX =
					currentComponentStyle.x < cur.x + cur.width && currentComponentStyle.x + currentComponentStyle.width > cur.x;

				const curDistance = currentComponentStyle.y - (cur.y + cur.height);
				console.log(cur.compName, curDistance, closest.distance);
				if (isOverlappingX && curDistance < closest.distance && curDistance > 0) {
					return { y: cur.y + cur.height + gap.value, distance: curDistance, found: true };
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
	const currentComponentX = currentComponentState.x;
	const currentComponentY = currentComponentState.y;
	let ghostWidth = currentComponentState.width;
	let ghostHeight = currentComponentState.height;
	const currentComponentWidth = currentComponentState.width;
	const currentComponentHeight = currentComponentState.height;
	const step = Math.floor(ghostStep.value / 2);

	if (currentComponentWidth > currentComponentState.minWidth!) {
		if (Math.abs(currentComponentWidth - beforeWidth.value) > step) {
			if (currentComponentWidth - beforeWidth.value >= 0) {
				ghostWidth += step;
			} else {
				if (ghostWidth - step >= currentComponentState.minWidth!) {
					ghostWidth -= step;
				} else {
					ghostWidth = currentComponentState.minWidth!;
				}
			}
		} else {
			ghostWidth = beforeWidth.value;
		}
	}

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(
		Object.assign(currentComponentState, {
			width: ghostWidth,
			height: currentComponentHeight,
		})
	);
	//* 最近组件必须在当前组件右边
	if (
		nearestComponent &&
		ghostLeft + currentComponentWidth <= nearestComponent.component.x &&
		nearestComponent.component.x - (ghostLeft + currentComponentWidth) <= step
	) {
		ghostWidth = nearestComponent.component.x - ghostLeft - gap.value;
		beforeWidth.value = ghostWidth;
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
				ghostWidth = item.x - gap.value - currentComponentX;
				beforeWidth.value = ghostWidth;
			}
		});
	}

	const sourceComponents = components.value.map((item) => {
		if (item.compName === currentComponentState.compName) {
			Object.assign(item, { width: ghostWidth, height: currentComponentHeight });
		}
		return item;
	});
	beforeWidth.value = ghostWidth;
	resetComponentsY(sourceComponents);

	return { top: ghostTop, left: ghostLeft, width: ghostWidth, height: ghostHeight };
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
