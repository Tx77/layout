<script setup lang="ts">
import {
  UserExchangeTable,
  ExchangeChart,
  ExchangeInfo,
  ExchangeList,
} from "~/components/futures/shared";
import {
  getFutureMarketCoinSymbolInfos,
  getFutureUserSelection,
} from "~/api/contractTrad/index";
import Header from "~/components/futures/shared/exchange-chart/header.vue";
import { useInitExchange } from "~/store/modules/future/future-exchange";
import {
  useInitContractStore,
  useInitStopProfit,
  useInitStopPending,
  useInitTrailing,
} from "~/store/modules/future/contract";
import { ModalManageProvider } from "~/components/futures/view/modalManage";
import { IS_CONTRACT_DEBUG } from "~/lib/futures-position/positionV3";
import { SEOHEAD } from "~/config/SEOConfig";
import type { LayoutStrategy } from "~/utils/layout/params";
import LayoutResizer from "~/utils/layout/LayoutResizer";
import { contractTradeLayout } from "~/utils/layout/contractTrade";
import DragResizeContainer from "~/utils/layout/DragResizeContainer.vue";
import { useAppStore } from "~/store";

const appStore = useAppStore();
const layoutStrategy = ref<LayoutStrategy>(appStore.getLayoutStrategy as LayoutStrategy);
const layoutResizer = new LayoutResizer(
  "#partial-container",
  layoutStrategy.value,
  contractTradeLayout
);
const layoutCompMap = ref(layoutResizer.layoutCompMap);
const screenHeight = ref(layoutResizer.screenHeight);
const screenWidth = ref(layoutResizer.screenWidth);

watch(
  () => appStore.getLayoutStrategy,
  (val: LayoutStrategy) => {
    layoutStrategy.value = val;
    layoutResizer.changeLayoutStrategy(val);
    layoutCompMap.value = layoutResizer.layoutCompMap;
  }
);

watch(
  () => appStore.isResetLayout,
  (val: boolean) => {
    if (val) {
      layoutResizer.removeLayoutStorage();
      layoutCompMap.value = layoutResizer.layoutCompMap;
      appStore.resetLayout(false);
    }
  }
);

const componentInstance = reactive({
  Header: markRaw(Header),
  ExchangeChart: markRaw(ExchangeChart),
  ExchangeList: markRaw(ExchangeList),
  ExchangeInfo: markRaw(ExchangeInfo),
  UserExchangeTable: markRaw(UserExchangeTable),
});

const DebuggerPanel = defineAsyncComponent(() =>
  import("~/components/futures/view/debugger-panel/index").then(
    (res) => res.DebuggerPanel
  )
);
// import ModalDepositionChange from '~/components/futures/shared/user-exchange-table/position-list/modal-deposit-change.vue';

definePageMeta({
  hideSections: ["footer"],
});

useHead(SEOHEAD["contracttrade"]);
const futureInitRef = useInitFutureStore();
onMounted(() => {
  getFutureMarketCoinSymbolInfos();
  getFutureUserSelection();
  window.localStorage.setItem("hideHistory", "true");
});
provide("spotTradeData", { setLayout: false } as { [propName: string]: any });
provideListener();
// useCommon(['footer']);
useInitExchange();
useSocketPreference();
const contractStore = useInitContractStore();
useInitStopProfit();
useInitTrailing();
useInitStopPending();
</script>

<template>
  <div
    v-if="futureInitRef.isInitComplete && contractStore.isGotSymbolBaseInfo"
    class="contract-trade-main-page contract-container-ce3daf1823ef color-bg-1 fm-text"
  >
    <ModalManageProvider>
      <DragResizeContainer
        :layoutComponents="[...layoutCompMap.values()]"
        :screenWidth="screenWidth"
        :layoutStrategy="layoutStrategy"
        :layoutResizer="layoutResizer"
        :componentInstance="componentInstance"
      />
      <!-- <Header class="split-top function-area" />
      <div class="contract-trade-page split-top">
        <section class="trade-main overflow-hidden">
          <div class="exchange-area flex flex-row flex-nowrap">
            <div class="flex-1 split-right function-area trading-view-h">
              <ExchangeChart />
            </div>
            <div class="ExchangeList function-area trading-view-h">
              <ExchangeList />
            </div>
          </div>
          <div class="user-exchange-table function-area split-top">
            <UserExchangeTable />
          </div>
        </section>
        <section class="trade-exchange ExchangeInfo function-area split-left">
          <ExchangeInfo />
        </section>
      </div>
      <DebuggerPanel v-if="IS_CONTRACT_DEBUG" /> -->
    </ModalManageProvider>
    <!-- <NetworkDetection /> -->
  </div>
  <div v-else></div>
</template>
<style scoped lang="less">
.contract-trade-main-page {
  overflow-x: auto;
}
.contract-trade-page {
  min-width: 1366px;
  display: grid;
  grid-template-columns: 1fr auto;
}
</style>
<style lang="less">
@import url(~/styles/futures.less);
.color-text-2-b307717f {
  color: var(--color-text-2);
}
.color-text-text-success-48da5f67 {
  color: var(--color-text-success);
}
.color-text-danger-6-5fde9113 {
  color: var(--color-text-error);
}

.contract-bg {
  background-color: var(--color-bg-1) !important;
}
.contract-dark-bg {
  background-color: var(--color-bg-1) !important;
}
.contract-light-bg {
  background-color: var(--color-bg-2) !important;
}
.function-area {
  .contract-light-bg;
}
body[arco-theme="dark"] {
  .function-area {
    .contract-dark-bg;
  }
}

.body {
  .function-area {
    .contract-light-bg;
  }
}
@SPLIT_SIZE: 2px;
@SPLIT_DARK_COLOR: #1a1a1a;
@SPLIT_LIGHT_COLOR: #f6f6f8;
.split-top {
  border-top: @SPLIT_SIZE solid @SPLIT_LIGHT_COLOR;
}
.split-bottom {
  border-bottom: @SPLIT_SIZE solid @SPLIT_LIGHT_COLOR;
}
.split-left {
  border-left: @SPLIT_SIZE solid @SPLIT_LIGHT_COLOR;
}
.split-right {
  border-right: @SPLIT_SIZE solid @SPLIT_LIGHT_COLOR;
}
body[arco-theme="dark"] {
  .split-top {
    border-top: @SPLIT_SIZE solid @SPLIT_DARK_COLOR;
  }
  .split-bottom {
    border-bottom: @SPLIT_SIZE solid @SPLIT_DARK_COLOR;
  }
  .split-left {
    border-left: @SPLIT_SIZE solid @SPLIT_DARK_COLOR;
  }
  .split-right {
    border-right: @SPLIT_SIZE solid @SPLIT_DARK_COLOR;
  }
}
.contract-trade-main-page {
  .contract-table-container {
    .arco-table {
      .arco-table-header {
        .arco-table-element {
          .arco-table-tr {
            .arco-table-th {
              .contract-light-bg;
            }
          }
        }
      }
      .arco-table-body {
        .arco-table-tr {
          .arco-table-td {
            .contract-light-bg;
          }
        }
      }
    }
  }
}
body[arco-theme="dark"] {
  .contract-trade-main-page {
    .contract-table-container {
      .arco-table {
        .arco-table-header {
          .arco-table-element {
            .arco-table-tr {
              .arco-table-th {
                .contract-dark-bg;
              }
            }
          }
        }
        .arco-table-body {
          .arco-table-tr {
            .arco-table-td {
              .contract-dark-bg;
            }
          }
        }
      }
    }
  }
}
</style>
