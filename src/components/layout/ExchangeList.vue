<template>
	<div id="comp3">
		<div class="header" @mousedown.prevent="onMouseDown" :style="{ cursor }">
			{{ compName }}
		</div>
		<div>width: {{ props.width }}</div>
		<div>left: {{ props.left }}</div>
	</div>
</template>

<script setup lang="ts" name="ExchangeList">
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
const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
</script>

<style scoped lang="less">
#comp3 {
	background-color: #15191c;
	position: relative;
	width: 100%;
	height: 100%;
	.header {
		width: 100%;
		height: 60px;
		border-bottom: 1px #262b33 solid;
	}
}
</style>
