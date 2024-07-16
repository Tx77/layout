<script lang="ts" setup>
import { useAppStore, useFutureStore } from "~/store/index";
import ErrorBoundary from "~/components/errorBoundary/index.vue";
import { Tchart } from "@bitunix/com";
import type { TradViewApi } from "~/composables/futures/kLineHooks/types";
import "@bitunix/com/lib/index.css";
const Setting = defineAsyncComponent(() =>
  import("~/components/futures/view").then((comps) => comps.Setting)
);
const DealRecordModal = defineAsyncComponent(() =>
  import("~/components/futures/view").then((comps) => comps.DealRecord)
);
const appStorePinia = useAppStore();
const futureStore = useFutureStore();
const symbolRef = toRef(futureStore, "currentSymbol");
const { theme } = storeToRefs(appStorePinia);
const { locale } = useI18n();
const envWsUrl = import.meta.env.VITE_FUTURE_WSAPI;
const { symbolInfoRef } = useSymbol(symbolRef);
const showKLine = !window.localStorage.getItem("CONTRACT_KLINE_HIDDEN");
const tradViewHandle = shallowRef<TradViewApi>();
const handleKlineOrder = useKLineOrder(tradViewHandle);
const { origin: dealRecords } = useDealRecord(tradViewHandle);
useKLinePosition(tradViewHandle);
useOperatePosition(tradViewHandle);
useKLineTPSL(tradViewHandle);

defineProps({
  cursor: {
    type: String,
    default: "auto",
  },
  pointerEvents: {
    type: String,
    default: "auto",
  },
});

const emits = defineEmits(["dragMouseDown"]);
const onMouseDown = (event: MouseEvent) => {
  emits("dragMouseDown", event);
};

const color = useRiseFallColor();
const { config } = useKLineData(tradViewHandle);
onMounted(() => {
  new Promise<void>((resolve) => {
    // todo
    resolve();
  });
});

const onChartReady = (instance: any) => {
  Logger.info("k-line information", JSON.stringify(instance));
  futureStore.updateChartIsReady();
  // @ts-expect-error
  tradViewHandle.value = window.bitunixTv.eventBus;
  if (instance.menusConfig) {
    const timer = setInterval(() => {
      if (settingPanelRef.value) {
        // console.debug(JSON.parse(JSON.stringify(instance.menusConfig._value)));
        settingPanelRef.value?.updateSetting({ ...instance.menusConfig });
        clearInterval(timer);
      }
    }, 500);
  }
};

onMounted(() => {
  futureStore.updateChartIsReady(false);
});

const kLineLocale = computed(() =>
  locale.value.replace(/([a-zA-Z]{2})[-|_]([a-zA-Z]{2})/, ($1, $2, $3) => {
    return `${$2}_${$3.toLocaleUpperCase()}`;
  })
);

const kLineData = computed(() => {
  const data = {
    envWsUrl: envWsUrl,
    theme: theme.value === "dark" ? "Dark" : "Light",
    lang: locale.value === "zh_TW" ? locale.value : locale.value.slice(0, 2),
    chartStyle: { riseDownColor: [color.value.riseHex, color.value.fallHex] },
    quotePrecision: symbolInfoRef.value.quotePrecision,
    symbol: symbolRef.value,
  };
  return data;
});
const baseConfig = computed(() => {
  const data = {
    id: "contract-trade-Tchart",
    exType: "contract",
    wsUrl: kLineData.value.envWsUrl,
    theme: theme.value === "dark" ? "Dark" : "Light",
    lang: kLineLocale.value,
    pricePrecision: symbolInfoRef.value.quotePrecision,
    tickSize: symbolInfoRef.value.basePrecision,
    symbol: symbolInfoRef.value.symbol,
    base: symbolInfoRef.value.base,
    quote: symbolInfoRef.value.quote,
    contractMenu: true,
    chartStyle: {
      riseDownColor: [color.value.riseHex, color.value.fallHex],
    },
  };

  if (import.meta.dev) {
    Object.assign(data, {
      historyUrl: `${useRuntimeConfig().public.apiDomain}/kline/history/futures`,
    });
  }
  return data;
});

const onEditLimit = (value) => {
  console.log(value);
};

onUnmounted(() => {
  futureStore.updateChartIsReady(false);
});
const settingPanelRef = shallowRef();
const onShowPanel = (e: MouseEvent) => {
  const x = e.clientX;
  const y = e.clientY;
  settingPanelRef.value?.show(x, y);
};
const recordModalRef = ref();
const onMark = (e) => {
  console.debug(e);
  try {
    const ids = new Set(e.params.map((item) => item.id));
    const orders = dealRecords.value.filter((item) => ids.has(item.orderId));
    recordModalRef.value?.show({ symbol: futureStore.currentSymbol }, orders);
    console.debug(orders);
  } catch (error) {
    console.debug(origin);
    console.error(error);
  }
};
watch(
  () => [tradViewHandle.value],
  () => {
    if (!tradViewHandle.value) return;
    tradViewHandle.value.subscribe("showSetClick", (event) => {
      onShowPanel(event);
    });
  },
  { immediate: true }
);
</script>
<template>
  <div
    class="contract-info-area tradview-container"
    :style="{
      cursor,
      pointerEvents,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-bg-4)',
    }"
    @mousedown.prevent="onMouseDown"
  >
    <div id="tradeView" class="flex flex-col items-center justify-center h-100%">
      <ErrorBoundary>
        <Tchart
          v-if="showKLine"
          :base-config="baseConfig"
          :orderWs="config"
          @chart-ready="onChartReady"
          @order="handleKlineOrder.createOrder"
          @edit-limit="onEditLimit"
          @update-limit="handleKlineOrder.updateOrder"
          @cancel-limit="handleKlineOrder.cancelOrder"
          @mark="onMark"
        />
        <Setting ref="settingPanelRef" :k-line-handle="tradViewHandle" />
        <DealRecordModal ref="recordModalRef" />
      </ErrorBoundary>
    </div>
  </div>
</template>
<style lang="less" scoped>
#tradeView {
  // height: calc(704px - 72px);
}
</style>
