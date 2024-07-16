<script lang="ts" setup>
import TradePrice from "./base/trade-price.vue";
import { useFutureStore } from "~/store/modules/future";
import { Information } from "./base/information/index";
// import type { CSSProperties } from 'vue';
import { useAppStore } from "~/store";
// import { Op } from '~/utils/maths';
// import { POSITION_MODE } from '~/types/futuress';
import { useModalManage } from "~/components/futures/view/modalManage";
const modalHandle = useModalManage();
const Dropdown = defineAsyncComponent(() => import("./base/dropdown.vue"));
const { currentSymbolConfig } = useCurrentSymbolConfig();
const subMapRef = ref<{ [key: string]: (arg: any) => void }>({});
const futureStore = useFutureStore();
const symbolRef = toRef(futureStore, "currentSymbol");
const { symbolDetailRef } = useSymbolDetail(symbolRef);
// const { liveQuotationRef } = useCurrentSymbolLiveQuotation();
const appStore = useAppStore();
const isLogin = computed(() => Boolean(appStore.login_status));
const gotoLoginPage = () => {
	navigateToLocale("/login");
};
useMultipleSubFutureWebSocket(subMapRef);
// const onChangeType = (_type: 1 | 2) => {
//   if (!isLogin) {
//     return gotoLoginPage();
//   }
//   updateCurrentSymbolConfig({ type: _type });
// };
// watch(
//   () => [liveQuotationRef],
//   () => {
//     setTimeout(() => {
//       if (liveQuotationRef.value.from !== 'serve') {
//         liveQuotationRef.value.from = 'local';
//       }
//     }, 3000);
//   },
//   { immediate: true, deep: true },
// );
// const color = useRiseFallColor();
// const btnStyle = computed(() => {
//   const buy: CSSProperties = {};
//   if (currentSymbolConfig.value.type == 1) {
//     buy['background-color'] = color.value.rise;
//   }
//   const sale: CSSProperties = {};
//   if (currentSymbolConfig.value.type == 2) {
//     sale['background-color'] = color.value.fall;
//   }
//   return {
//     buy,
//     sale,
//   };
// });

defineProps({
	cursor: {
		type: String,
		default: "auto",
	},
});

const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
	emits("dragMouseDown", event);
};
const onChangeLeverage = () => {
	if (!isLogin.value) {
		return gotoLoginPage();
	}
	modalHandle.changeLeverage({ symbol: symbolRef.value });
};
</script>
<template>
	<div
		class="exchange-info-container"
		:style="{
			cursor,
			width: '100%',
			height: '100%',
			backgroundColor: 'var(--color-bg-0)',
			overflowY: 'auto',
			padding: '0 18px',
		}"
		@mousedown.prevent="onMouseDown"
	>
		<template v-if="symbolDetailRef">
			<div class="exchange-info-item-padding flex flex-row flex-nowrap items-center justify-between p-t12 p-b3">
				<div class="flex items-center w100% color-bg-4 b-r2 h28">
					<div class="h30 flex items-center justify-center fs-14 p-r10 p-l10 m-r10 flex-1 cursor-pointer">
						<template v-if="isLogin">
							<Suspense>
								<template #default>
									<Dropdown />
								</template>
								<template #fallback>
									<span :class="['color-text-1 fs-12']"
										>{{ $t("contract.common.position_type_by_to_by") }} <icon-caret-down
									/></span>
								</template>
							</Suspense>
						</template>
						<template v-else>
							<span :class="['color-text-1 fs-12']" @click="gotoLoginPage"
								>{{ $t("contract.common.position_type_by_to_by") }} <icon-caret-down
							/></span>
						</template>
					</div>
					<div class="h16" style="border: 1px solid var(--color-border-1)"></div>
					<div
						class="flex items-center justify-center fs-12 color-text-1 h30 p-r20 p-l20 flex-1 cursor-pointer"
						@click="onChangeLeverage"
					>
						{{ currentSymbolConfig.lever }}X
					</div>
				</div>
			</div>
			<!-- <div class="p-r20 p-l20 m-t2" v-if="Op.ne(futureStore.userSetting.positionMode, POSITION_MODE.ONE_WEY) && isLogin">
        <div class="h36 flex-row-between-center b-r4 color-white color-bg-4">
          <div
            class="flex-1 flex-row-center-center b-r4 h28 m-l4 m-r2 cursor-pointer"
            :style="btnStyle.buy"
            @click="onChangeType(1)"
          >
            {{ $t('contract.common.deal_type_open') }}
          </div>
          <div
            class="flex-1 flex-row-center-center b-r4 h28 m-l2 m-r4 cursor-pointer"
            :style="btnStyle.sale"
            @click="onChangeType(2)"
          >
            {{ $t('contract.common.deal_type_close') }}
          </div>
        </div>
      </div> -->
			<div :class="['exchange-info-item-padding', futureStore.userSetting.positionMode === 1 ? '' : 'm-t20']">
				<TradePrice />
			</div>
			<Information />
		</template>
	</div>
</template>
