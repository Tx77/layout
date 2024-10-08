<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:45:01
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:08:03
 * @Description: 
-->
<template>
	<div :id="props.compName" ref="container" class="draggable-resizable" :style="computedContainerStyle">
		<component
			v-if="props.componentState.show"
			:is="props.comp"
			:compName="props.compName"
			:width="`${containerStyle.width}px`"
			:left="`${containerStyle.x}px`"
			:cursor="mouseCursor"
			:initProps="initProps"
			:screenWidth="screenWidth"
			@dragMouseDown.stop.prevent="onMouseDown"
		></component>
		<div v-if="!props.componentState.fixed">
			<div
				v-for="dir in props.directions"
				:key="dir"
				:class="['resize-handle', dir]"
				@mousedown.stop.prevent="onResizeHandleMouseDown(dir, $event)"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts" name="DraggableResizable">
import { ComponentState, GhostStyle, GhostType } from "./params";

const props = defineProps({
	componentState: {
		type: Object as PropType<ComponentState>,
		default: () => {},
	},
	ghostStyle: {
		type: Object as PropType<GhostStyle | null>,
		default: () => {},
	},
	directions: {
		type: Array as PropType<string[]>,
		required: false,
		default: ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"],
	},
	compName: {
		type: String,
		default: "",
	},
	screenWidth: {
		type: Number,
		default: 0,
	},
	screenHeight: {
		type: Number,
		default: 0,
	},
	ghostStepX: {
		type: Number,
		default: 0,
	},
	comp: {
		type: Object as PropType<ReturnType<typeof defineComponent>>,
		default: () => {},
	},
	initProps: {
		type: Object,
		default: () => {},
	},
});

const emit = defineEmits(["drag", "resize", "setCurrentComponent", "setGhostComponent", "setPointerEvents"]);
const mouseCursor = ref("grab");

const startX = ref(0);
const startY = ref(0);
const startLeft = ref(0);
const startTop = ref(0);
const rightButtonDown = ref(false);

const container = ref<HTMLElement | null>(null);

const translateToPercent = (val: number): number => {
	if (Number.isNaN(val)) {
		return val;
	}
	return parseFloat(((val / props.screenWidth) * 100).toFixed(4));
};

const containerStyle = reactive<ComponentState>({
	compName: props.compName,
	width: props.componentState.width,
	height: props.componentState.height,
	minW: props.componentState.minW,
	minHeight: props.componentState.minHeight,
	x: props.componentState.x,
	y: props.componentState.y,
	zIndex: props.componentState.zIndex,
	transition: props.componentState.transition,
});

const computedContainerStyle = computed(() => {
	return {
		width: `${translateToPercent(containerStyle.width)}%`,
		height: `${containerStyle.height}px`,
		top: `${containerStyle.y}px`,
		left: `${translateToPercent(containerStyle.x)}%`,
		zIndex: containerStyle.zIndex,
		transition: containerStyle.transition,
	};
});

watch(
	() => props.componentState,
	(val) => {
		Object.assign(containerStyle, translateComponentState(val));
	}
);

watch(
	() => props.componentState.y,
	(val) => {
		if (!isNaN(val)) {
			containerStyle.y = val;
			containerStyle.transition = "0.08s ease-out";
		}
	}
);

watch(
	() => props.componentState.zIndex,
	(val) => {
		containerStyle.zIndex = val;
	}
);

/**
 * 转换组件样式
 * @param componentState
 */
const translateComponentState = (componentState: ComponentState) => {
	return {
		compName: props.compName,
		width: componentState.width,
		height: componentState.height,
		y: componentState.y,
		x: componentState.x,
		minW: componentState.minW,
		minHeight: componentState.minHeight,
		zIndex: componentState.zIndex,
		transition: componentState.transition,
	};
};

/**
 * 右键屏蔽事件，防止先点右键再点左键触发设定事件
 * @param event
 */
function preventRightButton(event: MouseEvent) {
	//* 右键按下
	if (event.button === 2) {
		rightButtonDown.value = true;
	}
	//* 左键按下且右键已按下
	else if (event.button === 0 && rightButtonDown.value) {
		rightButtonDown.value = false;
		event.preventDefault();
	} else if (event.button === 0) {
		//* 正常左键点击事件
		rightButtonDown.value = false;
	}
}
/**
 * 组件drag事件
 * @param event
 */
const onMouseDown = (event: MouseEvent) => {
	const fatherDom = document.querySelector(".drag-resize-container");
	preventRightButton(event);
	if (rightButtonDown.value) {
		return;
	}
	emit("setPointerEvents", "none");
	if (props.componentState.fixed) {
		mouseCursor.value = "auto";
		return;
	}
	containerStyle.zIndex = "3";
	mouseCursor.value = "grabbing";
	startX.value = event.clientX;
	startY.value = event.clientY;
	startLeft.value = containerStyle.x;
	startTop.value = containerStyle.y;
	emit("setCurrentComponent", containerStyle);
	emit("setGhostComponent", true, containerStyle, GhostType.DRAG);
	let animationFrameId: number;

	const updatePosition = (x: number, y: number, transition: string) => {
		containerStyle.transition = transition;
		containerStyle.x = x;
		containerStyle.y = y;
	};

	const onMouseMove = (moveEvent: MouseEvent) => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}

		animationFrameId = requestAnimationFrame(() => {
			const newLeft = startLeft.value + (moveEvent.clientX - startX.value);
			const newTop = startTop.value + (moveEvent.clientY - startY.value);
			if (newTop > props.screenHeight) {
				if (fatherDom) {
					fatherDom.scrollTop = newTop + containerStyle.height;
				}
			}
			updatePosition(newLeft, newTop, "none");
			emit("setGhostComponent", true, containerStyle, GhostType.DRAG);
		});
	};

	const onMouseUp = (event: MouseEvent) => {
		if (event.button === 2) {
			rightButtonDown.value = false;
		}
		emit("setPointerEvents", "auto");
		containerStyle.zIndex = "1";
		emit("setGhostComponent", false, containerStyle, GhostType.DRAG);
		if (props.ghostStyle) {
			const position = transformTranslateToLeftTop(props.ghostStyle.transform as string);
			if (position) {
				const [x, y] = position;
				updatePosition(x, y, "0.02s ease");
				emit("drag", props.compName, x, y, true);
			}
		}
		containerStyle.transition = "none";
		mouseCursor.value = "grab";
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};

/**
 * 组件resize事件
 * @param dir
 * @param event
 */
const onResizeHandleMouseDown = (dir: string, event: MouseEvent) => {
	preventRightButton(event);
	if (rightButtonDown.value) {
		return;
	}
	const fatherDom = document.querySelector(".drag-resize-container");
	emit("setPointerEvents", "none");
	startX.value = event.clientX;
	startY.value = event.clientY;
	startLeft.value = containerStyle.x;
	startTop.value = containerStyle.y;
	const startWidth = Math.floor(containerStyle.width);
	const startHeight = Math.floor(containerStyle.height);
	containerStyle.zIndex = "2";
	emit("setCurrentComponent", containerStyle);

	let newWidth = startWidth;
	let newHeight = startHeight;
	let isResizing = true;
	let animationFrameId: number;

	const updateSize = (width: number, height: number) => {
		containerStyle.transition = "none";
		containerStyle.width = width;
		containerStyle.height = height;
	};

	const onMouseMove = (moveEvent: MouseEvent) => {
		if (!isResizing) {
			return;
		}

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}

		animationFrameId = requestAnimationFrame(() => {
			let needsUpdate = false;

			//* 计算新的宽度
			if (dir.includes("right")) {
				newWidth = startWidth + (moveEvent.clientX - startX.value);
				needsUpdate = true;
			} else if (dir.includes("left")) {
				newWidth = startWidth - (moveEvent.clientX - startX.value);
				needsUpdate = true;
			}

			//* 限制最小宽度
			if (newWidth <= (containerStyle.minW as number) * props.ghostStepX) {
				newWidth = (containerStyle.minW as number) * props.ghostStepX;
			}

			//* 限制最大宽度
			if (newWidth >= props.screenWidth) {
				newWidth = props.screenWidth;
			}

			//* 计算新的高度
			if (dir.includes("bottom")) {
				newHeight = startHeight + (moveEvent.clientY - startY.value);
				needsUpdate = true;
			} else if (dir.includes("top")) {
				newHeight = startHeight - (moveEvent.clientY - startY.value);
				needsUpdate = true;
			}

			//* 限制最小高度
			if (newHeight <= (containerStyle.minHeight as number)) {
				newHeight = containerStyle.minHeight as number;
			}

			if (newHeight + startTop.value > props.screenHeight) {
				if (fatherDom) {
					fatherDom.scrollTop = props.screenHeight + containerStyle.height;
				}
			}

			if (needsUpdate) {
				emit("setGhostComponent", true, containerStyle, GhostType.RESIZE);
				updateSize(newWidth, newHeight);
			}
		});
	};

	const onMouseUp = (event: MouseEvent) => {
		if (event.button === 2) {
			rightButtonDown.value = false;
		}
		isResizing = false;
		emit("setPointerEvents", "auto");
		containerStyle.zIndex = "1";
		//* 发送最终的尺寸更新事件
		if (props.ghostStyle) {
			const finalWidth = parseFloat(props.ghostStyle.width);
			const finalHeight = parseFloat(props.ghostStyle.height);
			const position = transformTranslateToLeftTop(props.ghostStyle.transform as string);
			if (position) {
				const [x, y] = position;
				emit(
					"setGhostComponent",
					false,
					Object.assign(containerStyle, {
						width: finalWidth,
						height: finalHeight,
						x,
						y,
					}),
					GhostType.RESIZE,
					"none"
				);
				emit("resize", props.compName, { x, y, width: finalWidth, height: finalHeight }, false);
			}
		}

		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};
/**
 * 转换translate中的坐标
 * @param transform
 */
function transformTranslateToLeftTop(transform: string): [number, number] | null {
	if (!transform) {
		return null;
	}
	//* 匹配 translate 或 translate3d
	const translateMatch = transform.match(/translate(?:3d)?\(\s*([^)]+)\s*\)/);

	if (translateMatch) {
		const values = translateMatch[1]?.split(/,\s*/);
		if (values && values.length >= 2) {
			//* 获取 translateX 和 translateY 的值
			const translateX = parseFloat(values[0] as string);
			const translateY = parseFloat(values[1] as string);

			return [translateX, translateY];
		}
		return null;
	}
	return null;
}
</script>

<style lang="less" scoped>
.draggable-resizable {
	position: absolute;
	box-sizing: border-box;
	.header {
		width: 100%;
		height: 40px;
		color: #fff;
		border-bottom: 1px solid rgb(43, 49, 58);
	}
}
.resize-handle {
	position: absolute;
	width: 10px;
	height: 10px;
	background-color: #fff;
	z-index: 11;
}
.resize-handle.top {
	top: -5px;
	left: 50%;
	transform: translateX(-50%);
	cursor: n-resize;
}
.resize-handle.bottom {
	bottom: -5px;
	left: 50%;
	transform: translateX(-50%);
	cursor: s-resize;
}
.resize-handle.left {
	left: -5px;
	top: 50%;
	transform: translateY(-50%);
	cursor: w-resize;
}
.resize-handle.right {
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	cursor: e-resize;
}
.resize-handle.top-left {
	top: -5px;
	left: -5px;
	cursor: nw-resize;
}
.resize-handle.top-right {
	top: -5px;
	right: -5px;
	cursor: ne-resize;
}
.resize-handle.bottom-left {
	bottom: -5px;
	left: -5px;
	cursor: sw-resize;
}
.resize-handle.bottom-right {
	bottom: 0px;
	right: 0px;
	cursor: se-resize;
}
</style>
