<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

const modules = [Autoplay, FreeMode];
const swiperInstance = ref(null);

function onSwiper(swiper) {
	swiperInstance.value = swiper;
}

let autoplayTimer = null;
function handleNext(type) {
	const swiper = swiperInstance.value;
	swiper.autoplay.stop();
	if (type === "prev") {
		swiper.slideToLoop(swiper.realIndex <= 1 ? 7 : swiper.realIndex - 1, 500);
	} else {
		swiper.slideToLoop(swiper.realIndex >= 7 ? 0 : swiper.realIndex + 1, 500);
	}
	clearInterval(autoplayTimer);
	autoplayTimer = setTimeout(() => {
		swiper.autoplay.start();
	}, 2000);
}
</script>

<template>
	<div>
		<Swiper
			:slides-per-view="4"
			:space-between="20"
			:speed="1000"
			:modules="modules"
			:autoplay="{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }"
			loop
			@swiper="onSwiper"
		>
			<SwiperSlide v-for="item in 8" :key="item" class="bg-blueGray">
				<div class="h-300px">
					item {{ item }}
					<!-- <img src="../../assets/images/lucy.jpeg" alt="" /> -->
					<!-- <img src="../../assets/images/mariah.JPG" alt="" /> -->
				</div>
			</SwiperSlide>
		</Swiper>
		<button @click="handleNext('prev')">
			<div class="i-ms-chevron-left" />
		</button>
		<button @click="handleNext('next')">
			<div class="i-ms-chevron-right" />
		</button>
	</div>
</template>
<style>
.swiper-free-mode .swiper-wrapper {
	transition-timing-function: linear;
}
img {
	width: 100px;
	height: 100px;
}
</style>
