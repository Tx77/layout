<template>
	<div id="comp2">
		<div class="header" @mousedown.prevent="onMouseDown" :style="{ cursor }">
			{{ compName }}
		</div>
		<div>width: {{ props.width }}</div>
	</div>
</template>

<script setup lang="ts" name="ExchangeChart">
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
});
const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
</script>

<style scoped lang="less">
#comp2 {
	background-color: blue;
	position: relative;
	width: 100%;
	height: 100%;
	.header {
		width: 100%;
		height: 60px;
		border-bottom: 1px #000 solid;
	}
}
</style>
