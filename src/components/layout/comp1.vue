<template>
	<div :id="props.compName" :style="props.layoutStyle">
		<div class="left">
			<div class="item">Header</div>
			<!-- width: {{ props.layoutStyle.width }} -->
			<div class="item-box">
				<div class="item">123</div>
				<div class="item">asd</div>
				<div class="item">zxc</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
				<div class="item">qwe</div>
			</div>
		</div>
		<div class="right">
			<div class="icon">1</div>
			<div class="icon">2</div>
			<div class="icon">3</div>
			<div class="icon">4</div>
		</div>
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
	compName: {
		type: String,
		default: "",
	},
});
</script>

<style scoped>
#Header {
	background-color: red;
	display: flex;
	justify-content: space-between;
}

.left {
	display: flex;
	overflow: auto;
}

.item-box {
	display: flex;
	height: 100%;
	overflow-x: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.left::-webkit-scrollbar {
	display: none;
}
.item-box::-webkit-scrollbar {
	display: none;
}

.item {
	flex: none;
	width: 80px;
	height: 100%;
	display: inline-flex;
	margin-right: 10px;
	border: 1px #000 solid;
}

.right {
	display: flex;
}

.right .icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #000;
	color: #fff;
	margin-right: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* @media (max-width: 1280px) {
	.left {
		flex: none;
		width: 100%;
	}
	.item-box {
		flex: none;
		width: auto;
		overflow-x: auto;
	}
} */
</style>
