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
import { onMounted, reactive, ref } from "vue";
import DraggableResizable from "./DraggableResizable.vue";
import { ComponentState, ComponentStyle, GhostStyle, DistanceResult } from "./params";

const snapDistance = 50;
const screenWidth = document.querySelector("#app")?.clientWidth;
const defaultComponents = [
	{ id: "comp1", x: 0, y: 0, width: 2560, height: 200, zIndex: "2", fixed: true },
	{ id: "comp2", x: 537, y: 200, width: 600, height: 300, zIndex: "3", fixed: false },
	{ id: "comp3", x: 1346, y: 200, width: 400, height: 200, zIndex: "4", fixed: false },
	{ id: "comp4", x: 630, y: 500, width: 400, height: 400, zIndex: "3", fixed: false },
	{ id: "comp5", x: 0, y: 1000, width: 2560, height: 200, zIndex: "2", fixed: true },
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
	components.value = components.value.map((item) => {
		if (!item.fixed && item.id !== currentComp.id) {
			item.y = findClosestY(item);
		}
		return item;
	});
	saveState();
};

/**
 * 找到距离当前组件X轴最近的组件
 * @param currentComponent
 */
function findNearestXComponent(currentComponent: ComponentState): DistanceResult | null {
	const nearestComponents = components.value.filter((item) => item.id !== currentComponent.id && !item.fixed);
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
	/**
	 * 幽灵组件是否在组件x轴范围内
	 * @param comp
	 */
	const ghostInComponent = (comp: ComponentState): boolean => {
		return comp.x < ghostLeft + currentComponentWidth && comp.x + comp.width > ghostLeft;
	};
	const currentComponentStorage = componentsStorage.value.filter((item) => item.id === currentComponentStyle.id)[0];
	const filterComponents = components.value.filter((item) => item.id !== currentComponentStyle.id && !item.fixed);
	let targetComponent: ComponentState | null = null;
	// const overlappedComponents = findOverlappedComponents(currentComponentState);
	// console.log(overlappedComponents);
	// if (overlappedComponents.length > 0) {
	// } else {
	// 	console.log("====");
	// }

	//* 找到距离当前组件最近的组件，并对幽灵组件X轴吸附过渡
	const nearestComponent = findNearestXComponent(currentComponentState);
	if (nearestComponent && nearestComponent.distance <= ghostStep.value) {
		// console.log(nearestComponent.component.id, nearestComponent.direction, nearestComponent.distance);
		if (nearestComponent.direction === "left") {
			ghostLeft = nearestComponent.component.x + nearestComponent.component.width;
		} else {
			ghostLeft = nearestComponent.component.x - currentComponentWidth;
		}
	}
	//* 过滤掉固定组件以及当前组件，进入组件重新定位的逻辑
	filterComponents.forEach((item) => {
		//! 幽灵组件定位规则：
		//! 1、幽灵组件永远不会和组件重叠
		//! 2、重叠组件的重新定位不能叠加
		//! 3、重叠组件重新定位时，需要依赖幽灵组件的初始值参数
		//! 4、幽灵组件y轴初始值与重叠组件不一致时，需根据幽灵组件和重叠组件的高度不同来分别判断
		//! 5、幽灵组件移出重叠组件后，重叠组件都需减去幽灵组件的高度
		//* 幽灵组件进入组件x轴范围内
		if (ghostInComponent(item)) {
			// console.log(item.id);
			const intersectComponentStorage = componentsStorage.value.filter((comp) => comp.id === item.id)[0];

			//* 重叠组件记录器
			if (intersectComponents.value.length > 0) {
				const index = intersectComponents.value.findIndex((comp) => comp.id === item.id);
				if (index < 0) {
					intersectComponents.value.push(item);
				}
			} else {
				intersectComponents.value.push(item);
			}
			// affectedComponents = findAffectedComponents(
			// 	intersectComponentStorage,
			// 	componentsStorage.value.filter((item) => item.id !== currentComponentStyle.id && !item.fixed)
			// );
			// console.log(currentComponentStorage.y, intersectComponentStorage.y);
			//?【初始值判断】---- 当前组件y轴【初始值】与重叠组件【初始值】处于同一高度
			if (currentComponentStorage.y === intersectComponentStorage.y) {
				// console.log("currentComponentTop", currentComponentTop, "itemY", item.y);
				//* 当前组件y轴高度小于等于重叠组件y轴高度
				if (currentComponentTop <= item.y) {
					item.y = currentComponentStorage.y + currentComponentStorage.height;
				}
				//* 当前组件y轴高度大于重叠组件y轴高度
				else {
					ghostTop = item.y + item.height;
					item.y = currentComponentStorage.y;
				}
			}
			//?【初始值判断】---- 当前组件y轴【初始值】高于重叠组件【初始值】
			if (currentComponentStorage.y < intersectComponentStorage.y) {
				const itemUp = () => {
					item.y = currentComponentStorage.y;
					ghostTop = item.y + item.height;
				};
				const itemDown = () => {
					item.y = intersectComponentStorage.y;
				};
				//* 当前组件【初始值】的y轴高度 + height 处于重叠组件【初始值】y轴高度 + height之间，需要将重叠组件移动到当前组件【初始值】的底部
				const currentBetweenItem = () => {
					return (
						currentComponentStorage.y + currentComponentStorage.height > intersectComponentStorage.y &&
						currentComponentStorage.y + currentComponentStorage.height <
							intersectComponentStorage.y + intersectComponentStorage.height
					);
				};
				//* 当前组件height大于等于重叠组件height
				if (currentComponentHeight >= item.height) {
					//* 当前组件y轴高度+height低于重叠组件y轴高度
					if (currentComponentTop + currentComponentHeight >= item.y + item.height) {
						itemUp();
						if (currentComponentTop < item.y) {
							itemDown();
						}
					} else {
						if (currentBetweenItem()) {
							// console.log("===");
							item.y = currentComponentStorage.y + currentComponentStorage.height;
						} else {
							itemDown();
						}
					}
				}
				//* 当前组件height小于重叠组件height
				else {
					if (currentComponentTop >= item.y) {
						itemUp();
					} else {
						if (currentBetweenItem()) {
							item.y = currentComponentStorage.y + currentComponentStorage.height;
						} else {
							itemDown();
						}
					}
				}
			}
			//?【初始值判断】---- 当前组件y轴【初始值】低于重叠组件【初始值】
			if (currentComponentStorage.y > intersectComponentStorage.y) {
				const itemBetweenCurrent = () => {
					return (
						currentComponentStorage.y < intersectComponentStorage.y + intersectComponentStorage.height &&
						currentComponentStorage.y + currentComponentStorage.height >
							intersectComponentStorage.y + intersectComponentStorage.height
					);
				};
				if (itemBetweenCurrent()) {
					// console.log("====", intersectComponentStorage.id);
					ghostTop = intersectComponentStorage.y + intersectComponentStorage.height;
				} else {
					if (currentComponentTop < item.y + item.height) {
						ghostTop = intersectComponentStorage.y;
						item.y = ghostTop + currentComponentHeight;
					}
					if (currentComponentTop + currentComponentHeight > item.y + item.height) {
						item.y = intersectComponentStorage.y;
					}
				}
			}
			targetComponent = item;
		}
		//* 幽灵组件不在组件x轴范围内
		else {
			if (intersectComponents.value.length > 0) {
				for (let i = intersectComponents.value.length - 1; i >= 0; i--) {
					const compStorages = componentsStorage.value.filter((comp) => comp.id === intersectComponents.value[i].id);
					if (!ghostInComponent(intersectComponents.value[i]) && compStorages.length > 0) {
						intersectComponents.value[i].y = compStorages[0].y;
						intersectComponents.value.splice(i, 1);
					}
				}
			}
		}
	});

	//todo 判断幽灵组件重新定位后是否影响到了其他组件，如果是则需要对被影响到的组件重新定位
	const ghostComponentState = Object.assign(currentComponentState, { x: ghostLeft, y: ghostTop });
	const overlappingComponents = findOverlappingComponents(ghostComponentState, filterComponents);
	if (overlappingComponents.length > 0) {
		overlappingComponents.forEach((comp) => {
			comp.y = ghostTop + currentComponentHeight;
		});
	}
	//todo 移动过的组件也需要判断是否影响到了其他组件，如果是则需要对被影响到的组件重新定位

	//* 判断受重叠组件重新定位而影响的其他组件
	if (targetComponent) {
		// console.log(targetComponent);
		const isAffectedByTargetComponent = (comp: ComponentState) => {
			return (
				targetComponent!.y + targetComponent!.height >= comp.y &&
				targetComponent!.y + targetComponent!.height <= comp.y + comp.height
			);
		};
		const affectedComponents = filterComponents.filter((item) => item.id !== targetComponent?.id);
		if (affectedComponents.length > 0) {
			affectedComponents.forEach((item) => {
				if (isAffectedByTargetComponent(item)) {
					// console.log(item.id, targetComponent!.y + targetComponent!.height);
					// item.y += targetComponent!.y + targetComponent!.height;
				}
			});
		}
	}
	ghostLeft = secondaryCorrectionLeft(ghostLeft, currentComponentLeft, currentComponentWidth);
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
const findAffectedComponents = (comp: ComponentState, filterComponents: ComponentState[]): ComponentState[] => {
	let affectedComponents: ComponentState[] = [];
	filterComponents.forEach((item) => {
		if (item.y === comp.y + comp.height && item.x < comp.x + comp.width && item.x + item.width > comp.x) {
			affectedComponents.push(item);
			affectedComponents = affectedComponents.concat(findAffectedComponents(item, filterComponents));
		}
	});

	return affectedComponents;
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
	return components.value
		.filter((item) => item.id !== currentComponentStyle.id)
		.reduce(
			(closest, cur) => {
				const isOverlappingX =
					(currentComponentStyle.x < cur.x + cur.width &&
						currentComponentStyle.x + currentComponentStyle.width > cur.x) ||
					(cur.x < currentComponentStyle.x + currentComponentStyle.width &&
						cur.x + cur.width > currentComponentStyle.x);

				const curDistance = Math.abs(currentComponentStyle.y - (cur.y + cur.height));

				if (isOverlappingX && curDistance < closest.distance) {
					return { y: cur.y + cur.height, distance: curDistance };
				}
				return closest;
			},
			{ y: Infinity, distance: Infinity }
		).y;
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
 * @param param0
 */
const findOverlappedComponents = ({ id, x, y, width, height }: ComponentState): ComponentState[] => {
	return components.value
		.filter((comp) => comp.id !== id && !comp.fixed)
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
}
</style>
