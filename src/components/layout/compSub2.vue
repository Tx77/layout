<!--
 * @Author: 田鑫
 * @Date: 2024-06-13 16:14:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:07:52
 * @Description: 
-->
<template>
	<div id="compSub2" :style="props.layoutStyle">
		<div>compSub2</div>
		<div>width: {{ props.layoutStyle.width }}</div>
	</div>
</template>

<script setup lang="ts">
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
#compSub2 {
	background-color: darkgrey;
}
</style>
