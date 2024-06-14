<template>
	<div id="comp2" :style="props.layoutStyle">
		<div>ExchangeChart</div>
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
#comp2 {
	background-color: blue;
}
</style>
