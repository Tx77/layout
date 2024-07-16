<script lang="ts" setup name="PageLayout">
import { useUserStore, useAppStore, useMarketStore, useRateStore } from "~/store";
import { NetworkDetection } from "~/components/NetworkDetection";
import TransactionNotification from "~/components/transaction-notification/index.vue";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const appStore = useAppStore();
const marketStore = useMarketStore();
const rateStore = useRateStore();
const token = getToken();
const globalLoading = useGlobalLoading();
const { isHideLayout } = storeToRefs(appStore);
const init = (): void => {
	if (token && !userStore.id) {
		userStore.info();
	}
	Promise.all([
		appStore.getPublicInfo(),
		appStore.getFreezeExpiryDate(),
		appStore.getDefaultC2CNickFreeze(),
		appStore.getLanguageListFn(),
		marketStore.getCoinSymbolList(),
		marketStore.getTradeSort(),
		marketStore.getFiatList(),
		marketStore.getCoinDetailList(),
		rateStore.getRateList(),
		rateStore.getLegalTenderList(),
		Promise.all([marketStore.getAllCoinSymbol(), marketStore.getFutureMarketCoinSymbolList()]).then(() => {
			marketStore.getUserFutureSelected();
		}),
	]);
};
const sub = useFutureWebSocket();
useEffect(() => {
	const close = sub.value.subscribe("system_notice", () => {
		rateStore.getRateList();
		marketStore.getAllCoinSymbol();
		marketStore.getFutureMarketCoinSymbolList();
	});
	return close;
});
onMounted(() => {
	init();
	containerHeight.value = (containerRef.value as HTMLElement).offsetHeight;
});
// 注入当前容易元素滚动的距离
const scrollDistance = ref(0);
const handleScroll = (v) => {
	scrollDistance.value = v.srcElement.scrollTop;
};
provide("scrollDistance", scrollDistance);
/* 获取容易的高度 */
const containerRef = ref<HTMLElement | null>(null);
const containerHeight = ref(0);

watch(
	() => appStore.loading,
	(load) => {
		if (load) {
			globalLoading.load();
		} else {
			globalLoading.remove();
		}
	}
);

provide("containerHeight", containerHeight);
// const routerStyle = ref({ minHeight: 'calc(100vh - 300px)' });
const routerStyle = ref({
	height: "calc(100% - 30px)",
	overflowY: "auto",
	backgroundColor: "--var(color-bg-2)",
});
// const handleFooterHeight = (height: number) => {
//   routerStyle.value.minHeight = `calc(100vh - ${height}px)`;
// };
const router = useRouter();
const officialCertificationPage = computed(() => router.currentRoute.value.path.includes("/official-certification"));
</script>
<template>
	<div class="layout-wrapper">
		<Header v-show="!isHideLayout.isHideTheHead" />
		<div
			id="partial-container"
			ref="containerRef"
			:class="['partial-container no-scroll', { 'p-t0!': isHideLayout.isHideTheHead }]"
			@scroll="handleScroll"
		>
			<section
				class="router-container no-scroll"
				:class="{
					'flex justify-center items-center min-h-720': officialCertificationPage,
				}"
				:style="officialCertificationPage ? '' : routerStyle"
			>
				<slot></slot>
			</section>
			<Footer v-show="!isHideLayout.isHideTheFoot" />
			<ClientOnly>
				<NetworkDetection />
				<TransactionNotification />
			</ClientOnly>
		</div>
	</div>
</template>
<style lang="less" scoped>
.layout-wrapper {
	height: 100%;
	width: 100%;
	position: relative;
	overflow: hidden;
	background-color: var(--color-bg-1);
}
@media screen and (min-width: 768px) {
	.layout-wrapper {
		overflow-x: auto;
	}
}
.partial-container {
	width: 100%;
	background-color: var(--color-bg-0);
	padding-top: 64px;
	overflow: scroll;
	height: 100vh;
	.router-container {
		background-color: var(--color-bg-2);
		// min-height: 700px;
		position: relative;
	}
	.transition-cls {
		--animate-duration: 0.5s;
	}
}
</style>
