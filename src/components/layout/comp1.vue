<template>
	<div id="comp1" @mousedown.prevent="onMouseDown" :style="{ cursor }">
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

<script setup lang="ts" name="Header">
const props = defineProps({
	compName: {
		type: String,
		default: "",
	},
	width: {
		type: String,
		default: "",
	},
	cursor: {
		type: String,
		default: "auto",
	},
});

const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
</script>

<style scoped>
#comp1 {
	background-color: red;
	display: flex;
	justify-content: space-between;
	position: relative;
	width: 100%;
	height: 100%;
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
