<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:45:01
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-01 10:20:15
 * @Description: 
-->
<template>
	<div :id="props.compName" ref="container" class="draggable-resizable" :style="computedContainerStyle">
		<component
			v-if="props.componentState.show"
			:is="importComponent"
			:compName="props.compName"
			:width="computedContainerStyle.width"
			:left="computedContainerStyle.left"
			:cursor="mouseCursor"
			@dragMouseDown.stop.prevent="onMouseDown"
		></component>
		<div
			v-for="dir in props.directions"
			:key="dir"
			:class="['resize-handle', dir]"
			@mousedown.stop.prevent="onResizeHandleMouseDown(dir, $event)"
		></div>
	</div>
</template>

<script setup lang="ts" name="DraggableResizable">
import type { PropType } from "vue";
import { ref, reactive, defineEmits, watch, computed, defineAsyncComponent } from "vue";
import { ComponentState, GhostStyle, GhostType } from "./params";

const props = defineProps({
	componentState: {
		type: Object as PropType<ComponentState>,
		default: () => {},
	},
	ghostStyle: {
		type: Object as PropType<GhostStyle>,
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
});

const emit = defineEmits(["drag", "resize", "setInitWidth", "setCurrentComponent", "setGhostComponent", "setInitX"]);
const mouseCursor = ref("grab");

const startX = ref(0);
const startY = ref(0);
const startLeft = ref(0);
const startTop = ref(0);

const container = ref<HTMLElement | null>(null);

const translateToPercent = (val: number): number => {
	if (Number.isNaN(val)) {
		return val;
	}
	return parseFloat(((val / props.screenWidth) * 100).toFixed(4));
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

const containerStyle = reactive<ComponentState>({
	compName: props.compName,
	width: props.componentState.width,
	height: props.componentState.height,
	minWidth: props.componentState.minWidth,
	minHeight: props.componentState.minHeight,
	x: props.componentState.x,
	y: props.componentState.y,
	zIndex: props.componentState.zIndex,
	transition: props.componentState.transition,
});

const importComponent = computed(() => {
	return defineAsyncComponent(() => {
		return import(`./${props.compName}.vue`);
	});
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

const translateComponentState = (componentState: ComponentState) => {
	return {
		compName: props.compName,
		width: componentState.width,
		height: componentState.height,
		y: componentState.y,
		x: componentState.x,
		minWidth: componentState.minWidth,
		minHeight: componentState.minHeight,
		zIndex: componentState.zIndex,
		transition: componentState.transition,
	};
};

const updatePosition = (x: number, y: number, snap = false) => {
	if (snap) {
		containerStyle.transition = "0.08s ease-out";
	} else {
		containerStyle.transition = "none";
	}
	containerStyle.x = x;
	containerStyle.y = y;
};

const updateSize = (width: number, height: number) => {
	containerStyle.transition = "none";
	containerStyle.width = width;
	containerStyle.height = height;
};

/**
 * 组件drag事件
 * @param event
 */
const onMouseDown = (event: MouseEvent) => {
	if (props.componentState.fixed) {
		mouseCursor.value = "auto";
		return;
	}
	mouseCursor.value = "grabbing";
	startX.value = event.clientX;
	startY.value = event.clientY;
	startLeft.value = containerStyle.x;
	startTop.value = containerStyle.y;
	emit("setCurrentComponent", containerStyle);
	emit("setInitX", containerStyle.x);
	emit("setGhostComponent", true, containerStyle, GhostType.DRAG, "none");

	const onMouseMove = (moveEvent: MouseEvent) => {
		emit("setGhostComponent", true, containerStyle, GhostType.DRAG, "0.1s ease-out");
		//* 使用 requestAnimationFrame 来优化性能
		requestAnimationFrame(() => {
			const newLeft = startLeft.value + (moveEvent.clientX - startX.value);
			const newTop = startTop.value + (moveEvent.clientY - startY.value);
			updatePosition(newLeft, newTop, false);
		});
	};

	const onMouseUp = () => {
		emit("setGhostComponent", false, containerStyle, GhostType.DRAG, "none");
		requestAnimationFrame(() => {
			if (props.ghostStyle) {
				const position = transformTranslateToLeftTop(props.ghostStyle.transform as string);
				if (position) {
					const [x, y] = position;
					updatePosition(x, y, true);
				}
			}
			emit("drag", props.compName, containerStyle.x, containerStyle.y, true);
		});
		mouseCursor.value = "grab";
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		containerStyle.transition = "none";
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
	const startX = event.clientX;
	const startY = event.clientY;
	const startWidth = Math.floor(containerStyle.width);
	const startHeight = Math.floor(containerStyle.height);
	containerStyle.zIndex = "2";
	emit("setCurrentComponent", containerStyle);
	emit("setInitWidth", startWidth);
	emit("setGhostComponent", true, containerStyle, GhostType.RESIZE, "none");
	let newWidth = startWidth;
	let newHeight = startHeight;
	let isResizing = true;
	const onMouseMove = (moveEvent: MouseEvent) => {
		if (!isResizing) {
			return;
		}
		if (dir.includes("right")) {
			newWidth = startWidth + (moveEvent.clientX - startX);
		} else if (dir.includes("left")) {
			newWidth = startWidth - (moveEvent.clientX - startX);
		}
		if (newWidth < (containerStyle.minWidth as number)) {
			newWidth = containerStyle.minWidth as number;
		}
		if (dir.includes("bottom")) {
			newHeight = startHeight + (moveEvent.clientY - startY);
		} else if (dir.includes("top")) {
			newHeight = startHeight - (moveEvent.clientY - startY);
		}
		if (newHeight < (containerStyle.minHeight as number)) {
			newHeight = containerStyle.minHeight as number;
		}

		emit("setGhostComponent", true, containerStyle, GhostType.RESIZE, "0.1s ease-out");
		updateSize(newWidth, newHeight);
		requestAnimationFrame(() => {});
	};

	const onMouseUp = () => {
		isResizing = false;
		containerStyle.zIndex = "3";
		const finalWidth = parseFloat(props.ghostStyle.width);
		const finalHeight = parseFloat(props.ghostStyle.height);
		if (props.ghostStyle) {
			emit(
				"setGhostComponent",
				false,
				Object.assign(containerStyle, {
					width: finalWidth,
					height: finalHeight,
				}),
				GhostType.RESIZE,
				"none"
			);
			emit("resize", props.compName, finalWidth, finalHeight, false);
		}
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};

function transformTranslateToLeftTop(transform: string): [number, number] | null {
	// 匹配 translate 或 translate3d
	const translateMatch = transform.match(/translate(?:3d)?\(\s*([^)]+)\s*\)/);

	if (translateMatch) {
		const values = translateMatch[1].split(/,\s*/);

		// 获取 translateX 和 translateY 的值
		const translateX = parseFloat(values[0]);
		const translateY = parseFloat(values[1]);

		return [translateX, translateY];
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
	background-color: #333;
	z-index: 1;
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
