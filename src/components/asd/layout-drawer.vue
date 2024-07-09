<!--
 * @Author: 田鑫
 * @Date: 2024-07-08 11:15:24
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-08 15:18:00
 * @Description: 
-->

<template>
  <div class="layout-drawer">
    <SvgIcon
      name="bx-icon-contract-setting"
      class="icon relative inline-block color-text-1 calculate-icon cursor-pointer relative h18 w18"
      @click="toggleDrawer"
    />

    <a-drawer :width="380" :visible="visible" :closable="false" :header="false" :footer="false" @cancel="handleCancel">
      <div class="drawer-container">
        <div class="header">
          <div class="title">布局</div>
          <div class="close-icon">
            <SvgIcon
              name="bx-icon-close-pop-s"
              class="close-icon color-text-1 icon relative inline-block relative"
              @click="handleCancel"
            />
          </div>
        </div>
        <div class="layout-panel">
          <div class="panel-item">
            <SvgIcon
              :name="`bx-icon-layout-left-${store.theme}`"
              :class="['panel-icon', layoutStrategy === LayoutStrategy.PRO_LEFT ? 'active' : '']"
              @click="handleLayoutChange(LayoutStrategy.PRO_LEFT)"
            />
            <div class="description">专业布局(左)</div>
          </div>
          <div class="panel-item">
            <SvgIcon
              :name="`bx-icon-layout-standard-${store.theme}`"
              :class="['panel-icon', layoutStrategy === LayoutStrategy.STANDARD ? 'active' : '']"
              @click="handleLayoutChange(LayoutStrategy.STANDARD)"
            />
            <div class="description">标准布局</div>
          </div>
          <div class="panel-item">
            <SvgIcon
              :name="`bx-icon-layout-right-${store.theme}`"
              :class="['panel-icon', layoutStrategy === LayoutStrategy.PRO_RIGHT ? 'active' : '']"
              @click="handleLayoutChange(LayoutStrategy.PRO_RIGHT)"
            />
            <div class="description">专业布局(右)</div>
          </div>
        </div>
        <div class="reset-layout">
          <SvgIcon name="bx-icon-resetlayout-s" class="reset-icon" :style="{ color: 'var(--color-text-1)' }" />
          <span class="reset-text">重新布局</span>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts" name="LayoutDrawer">
import { useAppStore } from '~/store';
import { LayoutStrategy } from '~/utils/layout/params';

const store = useAppStore();
const visible = ref(false);
const layoutStrategy = ref(LayoutStrategy.PRO_LEFT);

function toggleDrawer() {
  visible.value = !visible.value;
}

/**
 * 关闭事件
 */
function handleCancel() {
  visible.value = false;
}

/**
 * 布局切换
 * @param strategy
 */
function handleLayoutChange(strategy: LayoutStrategy) {
  layoutStrategy.value = strategy;
}
</script>
<style lang="less" scoped>
.drawer-container {
  padding: 12px 8px;
  .header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 24px;
    .close-icon {
      width: 24px;
      height: 24px;
    }
    border-bottom: 1px var(--color-border-1) solid;
  }
  .layout-panel {
    display: flex;
    flex-wrap: wrap;
    .panel-item {
      flex: 0 0 33%;
      margin-top: 24px;
      width: 88px;
      text-align: center;
      .panel-icon {
        width: 88px;
        height: 60px;
        cursor: pointer;
      }
      .active {
        border: 2px solid #b0f539;
        border-radius: 8px;
      }
      .description {
        width: 100%;
        color: var(--color-text-2);
        font-size: 12px;
        margin-top: 16px;
      }
    }
  }

  .reset-layout {
    margin-top: 24px;
    width: 100%;
    height: 40px;
    border: 1px var(--color-border-1) solid;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .reset-icon {
      width: 18px;
      height: 18px;
      position: relative;
      top: 1px;
    }
    .reset-text {
      margin-left: 8px;
      color: var(--color-text-1);
    }
  }
}
</style>
