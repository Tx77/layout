<script setup lang="ts">
// import PositionList from './position-list/index.vue';
import ErrorBoundary from '~/components/errorBoundary/index.vue';
// import { useEntrustAmount } from './useEntrustAmount';
// import { useFuturePositionStore } from '~/store';
import { UnLoginPlaceholder } from '~/components/futures/view';
import { SliderTabContainer, SliderTabItem } from '~/components/tap';
import { useContractStore } from '~/store/modules/future/contract';
const PositionList = defineAsyncComponent(() => import('./position-list/index.vue'));
const EntrustList = defineAsyncComponent(() => import('./entrust-list/index.vue'));
const EntrustPastList = defineAsyncComponent(() => import('./entrust-past-list/index.vue'));
const FundList = defineAsyncComponent(() => import('./fund-list/index.vue'));
const HistoryDeals = defineAsyncComponent(() => import('./history-deals/index.vue'));
const HistoryPosition = defineAsyncComponent(() => import('./history-position/index.vue'));
const contractStore = useContractStore();
const i18n = useI18n();
const activeKey = ref('position');

defineProps({
  cursor: {
    type: String,
    default: 'auto',
  },
});

const emits = defineEmits(['dragMouseDown']);
const onMouseDown = (event: MouseEvent) => {
  emits('dragMouseDown', event);
};
const onChangeActiveKey = (val: string) => {
  activeKey.value = val;
};
const totalEntrustLen = computed(() => {
  return (
    contractStore.normalOrders.length +
    contractStore.stopPendingList.length +
    contractStore.stopProfitLossList.length +
    contractStore.trailAfterList.length
  );
});
const positionCountRef = computed(() => {
  return contractStore.positions.filter((item) => contractStore.closedIds.indexOf(item.positionId) == -1).length;
});
</script>
<template>
  <div
    class="contract-table-container p-r20 p-l20 w100% overflow-hidden"
    :style="{ cursor, width: '100%', height: '100%', backgroundColor: 'var(--color-bg-0)' }"
    @mousedown.prevent="onMouseDown"
  >
    <SliderTabContainer
      content-class="min-height-610"
      :active-key="activeKey"
      default-active-key="position"
      @update:active-key="onChangeActiveKey"
    >
      <template #extra>
        <span class="a1e3dfdb exchange-table inline-block flex-row-center-center"></span>
      </template>
      <SliderTabItem
        id="position"
        :name="`${i18n.t('contract.common.position')}(${positionCountRef})`"
        :destroy-on-hide="true"
      >
        <UnLoginPlaceholder>
          <ErrorBoundary>
            <Suspense>
              <template #default>
                <PositionList />
              </template>
              <template #fallback>
                <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
              </template>
            </Suspense>
          </ErrorBoundary>
        </UnLoginPlaceholder>
      </SliderTabItem>
      <SliderTabItem
        id="entrust"
        :name="i18n.t('contract.lab.current_entrust') + '(' + totalEntrustLen + ')'"
        :destroy-on-hide="true"
      >
        <UnLoginPlaceholder>
          <Suspense>
            <template #default>
              <EntrustList :count="totalEntrustLen" />
            </template>
            <template #fallback>
              <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
            </template>
          </Suspense>
        </UnLoginPlaceholder>
      </SliderTabItem>
      <SliderTabItem id="history" :name="i18n.t('contract.lab.history_entrust')" :destroy-on-hide="true">
        <UnLoginPlaceholder>
          <Suspense>
            <template #default>
              <EntrustPastList />
            </template>
            <template #fallback>
              <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
            </template>
          </Suspense>
        </UnLoginPlaceholder>
      </SliderTabItem>
      <SliderTabItem
        id="historyPosition"
        :name="i18n.t('contract.history_deal.lab_history_position')"
        :destroy-on-hide="true"
      >
        <UnLoginPlaceholder>
          <Suspense>
            <template #default>
              <HistoryPosition />
            </template>
            <template #fallback>
              <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
            </template>
          </Suspense>
        </UnLoginPlaceholder>
      </SliderTabItem>
      <SliderTabItem id="historyDeals" :name="i18n.t('contract.history_deal.lab_history_deal')" :destroy-on-hide="true">
        <UnLoginPlaceholder>
          <Suspense>
            <template #default>
              <HistoryDeals />
            </template>
            <template #fallback>
              <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
            </template>
          </Suspense>
        </UnLoginPlaceholder>
      </SliderTabItem>
      <SliderTabItem id="fund" :name="i18n.t('contract.lab.fund_record')" :destroy-on-hide="true">
        <UnLoginPlaceholder>
          <Suspense>
            <template #default>
              <FundList />
            </template>
            <template #fallback>
              <div v-tLoad="true" class="w100% h300 flex-row-center-center"></div>
            </template>
          </Suspense>
        </UnLoginPlaceholder>
      </SliderTabItem>
    </SliderTabContainer>
  </div>
</template>
<style lang="less">
.min-height-610 {
  min-height: 610px;
}
.exchange-table {
  margin-right: 0px;
  .arco-radio {
    margin: 0px 0px;
  }
}

.contract-table-container {
  .arco-table-element {
    .arco-table-th {
      height: 36px;
    }
  }
  .arco-scrollbar-container {
    .arco-scrollbar-track {
      // opacity: 0 !important;
      width: 6px !important;
      .arco-scrollbar-thumb-bar {
        width: 4px !important;
        margin: 0px 0px;
        opacity: 0.5 !important;
      }
    }
  }
  .arco-table-cell {
    padding: 0px 4px !important;
    &:last-child {
      padding: 0px 0px;
    }
  }
}
</style>
