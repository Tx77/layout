<template>
	<div id="comp4" :style="props.layoutStyle">
		<div>ExchangeInfo</div>
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
#comp4 {
	background-color: salmon;
}
</style>
