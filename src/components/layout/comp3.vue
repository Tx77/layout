<template>
	<div id="comp3" :style="props.layoutStyle">
		<div>ExchangeList</div>
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
#comp3 {
	background-color: blueviolet;
}
</style>
