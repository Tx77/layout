<template>
	<div id="comp5">
		<div class="header" @mousedown.prevent="onMouseDown" :style="{ cursor }">
			{{ compName }}
		</div>
		<div>width: {{ props.width }}</div>
		<div>left: {{ props.left }}</div>
		<div>sumWidth: {{ parseFloat(props.width) + parseFloat(props.left) }}px</div>
		<div>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
			<p>111</p>
		</div>
	</div>
</template>

<script setup lang="ts" name="UserExchangeTable">

const props = defineProps({
	compName: {
		type: String,
		default: "",
	},
	cursor: {
		type: String,
		default: "auto",
	},
	width: {
		type: String,
		default: "",
	},
	left: {
		type: String,
		default: "",
	},
});
onMounted(async () => {
	const node = document?.querySelector("#comp5")?.querySelector(".header");
	const vnode = h("div", { class: "bar", innerHTML: "hello", style: { color: "red" } });
	const container = document.createElement("div");
	if (node) {
		render(vnode, container);
		node.appendChild(container);
	}
});
const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
</script>

<style scoped lang="less">
#comp5 {
	background-color: #15191c;
	position: relative;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	.header {
		width: 100%;
		height: 60px;
		border-bottom: 1px #262b33 solid;
	}
}
#comp5:hover::-webkit-scrollbar {
	width: 15px;
}
#comp5::-webkit-scrollbar {
	width: 0;
}
#comp5::-webkit-scrollbar-thumb {
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	background-color: red;
	background-clip: content-box;
	border: solid 6px transparent;
	cursor: pointer;
}
</style>
