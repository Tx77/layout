<template>
	<div id="comp1" @mousedown.prevent="onMouseDown" :style="{ cursor }">
		<div class="left">
			<div class="item">Header</div>
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
			<div class="icon" v-if="isShow">000</div>
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
	initProps: {
		type: Object,
		default: () => {},
	},
	screenWidth: {
		type: Number,
		default: 0,
	},
});

const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
const isShow = ref(true);

watch(
	() => props.initProps,
	(val) => {
		if (val.screenWidth <= 1280) {
			isShow.value = false;
		} else {
			isShow.value = true;
		}
	},
	{ immediate: true, deep: true }
);
</script>

<style scoped>
#comp1 {
	background-color: #15191c;
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
	border: 1px #262b33 solid;
}

.right {
	display: flex;
}

.right .icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #262b33;
	color: #fff;
	margin-right: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
