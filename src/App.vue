<script setup lang="ts">
import Layout from "./components/layout/index.vue";
// import CustomScrollbar from "./components/layout/CustomScrollbar.vue";
// import DragAndResize from "./components/drag/index.vue";
</script>

<template>
	<div>
		<Layout />
		<!-- <DragAndResize /> -->
	</div>
</template>

<style lang="less" scoped>
.content {
	width: 400px;
	height: 600px;
	overflow-y: auto;
	border: 1px #fff solid;
}
.content::-webkit-scrollbar {
	display: none;
}
</style>
