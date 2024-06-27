<!--
 * @Author: 田鑫
 * @Date: 2024-06-24 16:45:01
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-27 15:10:51
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
import { ComponentState, GhostType } from "./params";

const props = defineProps({
	componentState: {
		type: Object as PropType<ComponentState>,
		default: () => {},
	},
	ghostStyle: {
		type: Object,
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

const emit = defineEmits(["drag", "resize", "setInitGhostWidth", "setCurrentComponent", "setGhostComponent"]);
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
	// containerStyle.transition = "0.05s ease-out";
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
				updatePosition(parseFloat(props.ghostStyle.left), parseFloat(props.ghostStyle.top), true);
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
	const startWidth = containerStyle.width;
	const startHeight = containerStyle.height;
	emit("setCurrentComponent", containerStyle);
	emit("setInitGhostWidth", startWidth);

	const onMouseMove = (moveEvent: MouseEvent) => {
		let newWidth = startWidth;
		let newHeight = startHeight;

		if (dir.includes("right")) {
			newWidth = startWidth + (moveEvent.clientX - startX);
		} else if (dir.includes("left")) {
			newWidth = startWidth - (moveEvent.clientX - startX);
		}

		if (dir.includes("bottom")) {
			newHeight = startHeight + (moveEvent.clientY - startY);
		} else if (dir.includes("top")) {
			newHeight = startHeight - (moveEvent.clientY - startY);
		}
		//* 最小宽高限制
		if (newWidth <= (containerStyle.minWidth as number) || newHeight <= (containerStyle.minHeight as number)) {
			return;
		}

		emit("setGhostComponent", true, containerStyle, GhostType.RESIZE, "0.1s ease-out");
		updateSize(newWidth, newHeight);
	};

	const onMouseUp = () => {
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		emit("setGhostComponent", false, containerStyle, GhostType.RESIZE, "none");
		emit("resize", props.compName, parseFloat(props.ghostStyle.width), parseFloat(props.ghostStyle.height), false);
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};

//* 使用 ResizeObserver 来监听容器大小变化
// const resizeObserver = new ResizeObserver((entries) => {
// 	console.log(`entries, ${entries}`);
// 	const entry = entries[0];
// 	const { width, height } = entry.contentRect;
// 	updateSize(width, height);
// });

// //* 在容器元素存在时，才监听其大小变化
// if (container.value) {
// 	resizeObserver.observe(container.value);
// }
</script>

<style lang="less" scoped>
.draggable-resizable {
	position: absolute;
	// background-color: #15191c;
	// border: 1px solid #333;
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
