<script setup lang="ts">
// import Layout from './components/layout/index.vue'
import DragAndResize from "./components/drag/index.vue";
</script>

<template>
	<div>
		<!-- <Layout /> -->
		<DragAndResize />
	</div>
</template>

<style scoped>
.home-container {
	width: 100%;
}

p {
	position: absolute;
	left: 0;
	bottom: 0;
}
</style>
