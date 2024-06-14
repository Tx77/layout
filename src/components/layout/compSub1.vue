<template>
	<div id="compSub1" :style="props.layoutStyle">
		<div>compSub1</div>
		<div>width: {{ props.layoutStyle.width }}</div>
	</div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { type ComponentStyle } from "./layout";

const props = defineProps({
	layoutStyle: {
		type: Object as PropType<ComponentStyle>,
		default: () => {},
		required: true,
	},
});
</script>

<style scoped>
#compSub1 {
	background-color: darkgreen;
}
</style>
