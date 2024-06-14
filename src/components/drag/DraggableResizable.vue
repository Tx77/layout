<!--
 * @Author: 田鑫
 * @Date: 2024-06-14 15:17:18
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-14 20:19:22
 * @Description: 
-->
<template>
	<div :id="id" ref="container" class="draggable-resizable" :style="containerStyle">
		<div class="header" @mousedown.prevent="onMouseDown" :style="{ cursor: mouseCursor }">
			{{ id }}
		</div>

		<div
			v-for="dir in directions"
			:key="dir"
			:class="['resize-handle', dir]"
			@mousedown.stop.prevent="onResizeHandleMouseDown(dir, $event)"
		></div>
	</div>
</template>

<script setup lang="ts" name="DraggableResizable">
import type { PropType } from "vue";
import { ref, reactive, defineEmits } from "vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	x: {
		type: Number,
		required: true,
	},
	y: {
		type: Number,
		required: true,
	},
	width: {
		type: Number,
		required: true,
	},
	height: {
		type: Number,
		required: true,
	},
	zIndex: {
		type: String,
		default: "1",
		required: true,
	},
	snapDistance: {
		type: Number,
		default: 20,
	},
	ghostStyle: {
		type: Object,
		default: () => {},
	},
	onDrag: {
		type: Function,
		required: true,
	},
	onResize: {
		type: Function,
		required: true,
	},
	detectCollision: {
		type: Function,
		required: true,
	},
	detectSnap: {
		type: Function,
		required: true,
	},
	checkClosestComponent: {
		type: Function,
		required: true,
	},
	setCurrentComponent: {
		type: Function,
		required: true,
	},
	setGhostComponent: {
		type: Function,
		required: true,
	},
	handleCollision: {
		type: Function,
		required: true,
	},
	directions: {
		type: Array as PropType<string[]>,
		required: false,
		default: ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"],
	},
});

const emit = defineEmits(["drag", "resize"]);
const mouseCursor = ref("grab");

const isCollied = ref(false);
const isSnap = ref(false);
const startX = ref(0);
const startY = ref(0);
const startLeft = ref(0);
const startTop = ref(0);

const container = ref<HTMLElement | null>(null);

const containerStyle = reactive({
	id: `${props.id}`,
	width: `${props.width}px`,
	height: `${props.height}px`,
	top: `${props.y}px`,
	left: `${props.x}px`,
	zIndex: props.zIndex,
	transition: "none",
});

const updatePosition = (left: number, top: number, snap = false) => {
	isSnap.value = snap;
	if (isSnap.value) {
		containerStyle.transition = "0.08s ease-out";
	} else {
		containerStyle.transition = "none";
	}
	containerStyle.left = `${left}px`;
	containerStyle.top = `${top}px`;
};

const updateSize = (width: number, height: number) => {
	containerStyle.width = `${width}px`;
	containerStyle.height = `${height}px`;
};

const onMouseDown = (event: MouseEvent) => {
	mouseCursor.value = "grabbing";
	startX.value = event.clientX;
	startY.value = event.clientY;
	startLeft.value = parseInt(containerStyle.left);
	startTop.value = parseInt(containerStyle.top);
	props.setCurrentComponent(containerStyle);
	props.setGhostComponent(true, containerStyle);
	containerStyle.zIndex = "3";

	const onMouseMove = (moveEvent: MouseEvent) => {
		props.setGhostComponent(true, containerStyle);
		//* 使用 requestAnimationFrame 来优化性能
		requestAnimationFrame(() => {
			const newLeft = startLeft.value + (moveEvent.clientX - startX.value);
			const newTop = startTop.value + (moveEvent.clientY - startY.value);
			updatePosition(newLeft, newTop, false);
		});
	};

	const onMouseUp = (moveEvent: MouseEvent) => {
		requestAnimationFrame(() => {
			updatePosition(parseInt(props.ghostStyle.left), parseInt(props.ghostStyle.top), true);
			emit("drag", props.id, parseInt(containerStyle.left), parseInt(containerStyle.top));
		});
		mouseCursor.value = "grab";
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		if (isCollied.value) {
			containerStyle.zIndex = "3";
		} else {
			containerStyle.zIndex = "1";
			isCollied.value = false;
		}
		containerStyle.transition = "none";
		props.setGhostComponent(false, containerStyle);
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
	const startWidth = parseInt(containerStyle.width);
	const startHeight = parseInt(containerStyle.height);
	const startLeft = parseInt(containerStyle.left);
	const startTop = parseInt(containerStyle.top);

	const onMouseMove = (moveEvent: MouseEvent) => {
		let newWidth = startWidth;
		let newHeight = startHeight;
		let newLeft = startLeft;
		let newTop = startTop;

		if (dir.includes("right")) {
			newWidth = startWidth + (moveEvent.clientX - startX);
		} else if (dir.includes("left")) {
			newWidth = startWidth - (moveEvent.clientX - startX);
			newLeft = startLeft + (moveEvent.clientX - startX);
		}

		if (dir.includes("bottom")) {
			newHeight = startHeight + (moveEvent.clientY - startY);
		} else if (dir.includes("top")) {
			newHeight = startHeight - (moveEvent.clientY - startY);
			newTop = startTop + (moveEvent.clientY - startY);
		}
	};

	const onMouseUp = () => {
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		emit("resize", props.id, parseInt(containerStyle.width), parseInt(containerStyle.height));
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};

//* 使用 ResizeObserver 来监听容器大小变化
const resizeObserver = new ResizeObserver((entries) => {
	console.log(`entries, ${entries}`);
	const entry = entries[0];
	const { width, height } = entry.contentRect;
	updateSize(width, height);
});

//* 在容器元素存在时，才监听其大小变化
if (container.value) {
	resizeObserver.observe(container.value);
}
</script>

<style lang="less" scoped>
.draggable-resizable {
	position: absolute;
	background-color: lightblue;
	border: 1px solid #333;
	box-sizing: border-box;
	.header {
		width: 100%;
		background-color: #333;
		height: 40px;
		border-bottom: 1px solid #333;
		color: #fff;
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
	right: -5px;
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
	bottom: -5px;
	right: -5px;
	cursor: se-resize;
}
</style>
