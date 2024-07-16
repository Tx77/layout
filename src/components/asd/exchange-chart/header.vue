<script lang="ts" setup>
import CoinSelect from "./coin-select.vue";
import { Precision, Rise, DefaultDisplay } from "~/components/number";
// import { DisplaySignPrice } from '~/components/futures/view';
import { useFutureStore } from "~/store/modules/future";
import { useMarketStore } from "~/store/modules/market";
import { SymbolPrecision, DisplayRiseClose } from "~/components/futures/view";
import dayjs from "dayjs";
// import CheckTheRateModule from '~/components/CheckTheRateModule/index.vue';
import { Calculate } from "~/components/futures/shared/calculate";
import ModalSetting from "./modal-setting.vue";
import LayoutDrawer from "./layout-drawer.vue";
import { Op, isNumber } from "~/utils/maths";
import { useFutureExchangeStore } from "~/store";

const i18n = useI18n();
const futureStore = useFutureStore();
const marketStore = useMarketStore();
const { futureRouterParams, goto } = useFutureRouter();
const coin = ref(futureRouterParams.value.symbol);
const { liveQuotationRef } = useSymbolLiveQuotation(coin);
const { signPriceRef } = useSymbolSignPrice(coin);
const { symbolInfoRef } = useSymbol(coin);
const futureExchangeStore = useFutureExchangeStore();
const titleRef = ref("");
const headerContainer = ref();

const props = defineProps({
  cursor: {
    type: String,
    default: "auto",
  },
});

const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
  emits("dragMouseDown", event);
};

useTitle(titleRef);
useEffect(() => {
  if (liveQuotationRef.value.close) {
    const close = handlePrecision(
      liveQuotationRef.value.close,
      symbolInfoRef.value.quotePrecision
    );
    titleRef.value =
      toThousands(fillZero(close, symbolInfoRef.value.quotePrecision)) +
      ` | ${liveQuotationRef.value.symbol} Futures Exchange - Crypto Futures | Bitunix`;
  } else {
    titleRef.value = "";
  }
}, [liveQuotationRef]);
// const { symbolDetailRef } = useSymbolDetail(coin);
watch(
  () => futureRouterParams,
  () => {
    if (futureRouterParams.value.symbol !== coin.value) {
      coin.value = futureRouterParams.value.symbol;
    }
  },
  { immediate: true, deep: true }
);
watch(
  () => [futureRouterParams],
  () => {
    futureStore.currentSymbol = coin.value;
    const targetSymbol = futureRouterParams.value.symbol;
    const find = futureStore.symbols.find((item) =>
      equalString(futureRouterParams.value.symbol, item.symbol)
    );
    if (!find) {
      goto({ symbol: "BTCUSDT", query: futureRouterParams.value });
    } else {
      futureStore.updateCurrentSymbol(targetSymbol);
      futureExchangeStore.currentSymbol = targetSymbol;
      marketStore.updateCurrentFutureOperateSymbol(targetSymbol);
    }
  },
  { immediate: true, deep: true }
);
const countDownRef = ref("--:--:--");
useEffectAfterMounted(() => {
  let residue =
    new Date(signPriceRef.value.fundingAt).getTime() -
    new Date(signPriceRef.value.origin?.ts).getTime();
  if (!isNumber(residue)) {
    countDownRef.value = "--:--:--";
    return;
  }
  if (isNaN(Number(residue))) {
    countDownRef.value = "--:--:--";
    return;
  } else {
    const val = formateCountdown(residue);
    countDownRef.value = val;
  }

  const timer = setInterval(() => {
    residue = Math.max(residue - 1000, 0);
    if (Op.lt(residue, 0)) {
      // 小于0代表有不正常的数据，或者推送延迟，这个时候需要重新拉一下数据
      countDownRef.value = "00:00:00";
    } else {
      countDownRef.value = formateCountdown(residue);
    }
  }, 1000);
  return () => {
    clearInterval(timer);
  };
}, [signPriceRef]);
const feeTip = computed(() => {
  const time = (() => {
    try {
      return dayjs(new Date(signPriceRef.value.fundingAt)).format("YYYY-MM-DD HH:mm:ss");
    } catch (_err) {
      return "--:--:--";
    }
  })();
  return replaceText(i18n.t("contract.header.fee_tip"), [time]);
});
const signPriceTip = computed(() => i18n.t("contract.live.sign_price_tip"));
const nextFeeRateTip = computed(() => {
  const time = (() => {
    try {
      return dayjs(signPriceRef.value.fundingAt)
        .add(signPriceRef.value.fundingInterval, "minute")
        .format("YYYY-MM-DD HH:mm:ss");
    } catch (_error) {
      return "--:--:--";
    }
  })();
  return i18n.t("contract.header.next_fee_tip").replace("c%", time);
});
</script>
<template>
  <div
    ref="headerContainer"
    class="ae21b19e chart-header-container h60 w100% flex flex-row flex-nowrap items-center justify-between"
    :style="{ cursor, backgroundColor: 'var(--color-bg-0)' }"
    @mousedown.prevent="onMouseDown"
  >
    <div class="info-main c2dfda99 flex flex-row flex-nowrap flex-1">
      <div class="flex flex-row flex-nowrap items-center m-r1">
        <CoinSelect :popup-container="headerContainer" />
        <div class="h20 flex items-center p-l24 border-1 m-l24">
          <span class="fs-18 block fw700">
            <DisplayRiseClose :symbol="coin" />
          </span>
        </div>
      </div>
      <div
        class="item-box other-info flex items-center p-l24 flex-1"
        style="overflow-x: auto"
      >
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">{{
            $t("contract.header.rise")
          }}</span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="liveQuotationRef.rose">
              <Rise :value="liveQuotationRef.rose">
                <Precision
                  :value="liveQuotationRef.rose"
                  :fix-len="2"
                  fill-zero="true"
                  thousand="true"
                />%
              </Rise>
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">
            <a-tooltip :content="signPriceTip" :z-index="2500" class="header-tip">
              <span class="inline-block under-dash-line">{{
                $t("contract.common.sign_price")
              }}</span>
            </a-tooltip>
          </span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="signPriceRef.signPrice">
              ₮
              <Precision
                :value="signPriceRef.signPrice"
                :fix-len="symbolInfoRef.quotePrecision"
                fill-zero="true"
                thousand="true"
              />
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">{{
            $t("contract.common.index_price")
          }}</span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="signPriceRef.indexPrice">
              ₮
              <Precision
                :value="signPriceRef.indexPrice"
                :fix-len="symbolInfoRef.quotePrecision"
                fill-zero="true"
                thousand="true"
              />
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">{{
            $t("contract.header.high")
          }}</span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="liveQuotationRef.high">
              ₮
              <Precision
                :value="liveQuotationRef.high"
                :fix-len="symbolInfoRef.quotePrecision"
                fill-zero="true"
                thousand="true"
              />
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">{{
            $t("contract.header.low")
          }}</span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="liveQuotationRef.low">
              ₮
              <Precision
                :value="liveQuotationRef.low"
                :fix-len="symbolInfoRef.quotePrecision"
                fill-zero="true"
                thousand="true"
              />
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap"
            >{{ $t("contract.common.deal_24") }}&nbsp;&nbsp;({{
              symbolInfoRef.base
            }})</span
          >
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="liveQuotationRef.vol">
              <Precision
                :value="liveQuotationRef.vol"
                :fix-len="symbolInfoRef.basePrecision"
                fill-zero="true"
                thousand="true"
                :hasUnit="true"
              />
            </DefaultDisplay>
          </span>
        </div>
        <div class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap"
            >{{ $t("contract.common.deal_value_24") }}&nbsp;&nbsp;(USDT)</span
          >
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="liveQuotationRef.amount">
              <Precision
                :value="liveQuotationRef.amount"
                :fix-len="symbolInfoRef.basePrecision"
                fill-zero="true"
                thousand="true"
                :hasUnit="true"
              />&nbsp;{{ symbolInfoRef.amount }}
            </DefaultDisplay>
          </span>
        </div>
        <div v-if="true" class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-2 text-nowrap">
            <a-tooltip :content="feeTip" :z-index="2500" class="header-tip">
              <span class="inline-block under-dash-line">{{
                $t("contract.header.fee_rate_time")
              }}</span>
            </a-tooltip>
          </span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="signPriceRef.fundingRatePredict">
              <Rise :value="signPriceRef.fundingRatePredict">
                <Precision
                  :value="signPriceRef.fundingRatePredict!"
                  :fix-len="4"
                  fill-zero="true"
                  thousand="true"
                />%
              </Rise> </DefaultDisplay
            >&nbsp;/&nbsp;<span class="fvn-number">{{ countDownRef }}</span>
          </span>
        </div>
        <div v-if="false" class="other-info-item m-r24">
          <span class="info-label fs-12 m-b4 block color-text-3">
            <a-tooltip :content="nextFeeRateTip" :z-index="2500" class="header-tip">
              <span class="inline-block under-dash-line text-nowrap color-text-2">{{
                $t("contract.common.next_issue_fund_rate")
              }}</span>
            </a-tooltip>
          </span>
          <span
            class="info-value fs-12 color-text-1 block text-nowrap headerNumberFontWeight"
          >
            <DefaultDisplay :value="signPriceRef.fundingRatePredict">
              <Rise :value="signPriceRef.fundingRatePredict">
                <SymbolPrecision
                  :value="signPriceRef.fundingRatePredict!"
                  :symbol="coin"
                  type="feeRate"
                />%
              </Rise>
            </DefaultDisplay>
          </span>
        </div>
      </div>
    </div>
    <div class="info-operate p-r24 flex flex-row flex-nowrap items-center text-nowrap">
      <div class="m-l24 flex-row-center-center">
        <Calculate />
      </div>
      <div class="m-l24 flex-row-center-center">
        <ModalSetting />
      </div>
      <div class="m-l24 flex-row-center-center">
        <LayoutDrawer />
      </div>
      <div class="m-l24 flex-row-center-center">
        <a-tooltip :content="$t('contract.market.information')">
          <NuxtLinkLocale :to="`/contract-trade/${coin}/info`" class="fs-0">
            <SvgIcon
              name="bx-icon-header-contract-icon"
              class="icon relative inline-block color-text-1 cursor-pointer relative h18 w18"
            />
          </NuxtLinkLocale>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.chart-header-container {
  .border-right {
    border-right: 1px solid var(--color-text-3);
  }
  .kline-title {
  }
  .price-up-text-color {
    color: var(--color-text-success);
  }
  .price-down-text-color {
    color: var(--color-text-error);
  }
}
.under-dash-line {
  border-bottom: 1px dashed var(--color-text-3);
  cursor: help;
}
.border-1 {
  border-left: 1px solid var(--color-border-1);
}
.headerNumberFontWeight {
  font-weight: 500;
  .fvn-number {
    font-weight: 500;
  }
}
.info-main {
  overflow-x: auto;
  .item-box {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}
</style>
<style lang="less">
.header-tip {
  z-index: 2500 !important;
}
</style>
