<!--
 * @Author: 田鑫
 * @Date: 2024-08-19 18:32:04
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:06:14
 * @Description: 
-->
<template>
	<div>
		<a-tabs :active-key="activeKey" @tab-click="handleActiveKey">
			<a-tab-pane key="1" title="Tab 1">
				<div>{{ ls.length }}</div>
			</a-tab-pane>
			<a-tab-pane key="2" title="Tab 2">
				<div id="tab-2"></div>
			</a-tab-pane>
			<a-tab-pane key="3">
				<template #title>Tab 3</template>
				<div id="tab-3"></div>
			</a-tab-pane>
		</a-tabs>
		<div v-if="activeKey === '2'">
			<Teleport to="#tab-2">
				<a-table
					class="table-container"
					:columns="columns"
					:data="data"
					:pagination="false"
					:scroll="{ maxHeight: 600 }"
				/>
			</Teleport>
		</div>
		<div v-if="activeKey === '3'">
			<Teleport to="#tab-3">
				<a-table
					class="table-container"
					:columns="columns"
					:data="data"
					:pagination="false"
					:scroll="{ maxHeight: 600 }"
				/>
			</Teleport>
		</div>
	</div>
</template>

<script setup lang="ts">
import store from "./store";

const activeKey = ref("-1");
const ls = computed(() => store.list);
const columns = computed(() => store.tableColumns);
const data = computed(() => store.tableData);
const show = ref(false);
onMounted(() => {
	show.value = true;
	activeKey.value = "2";
});

function handleActiveKey(key: string) {
	activeKey.value = key;
}
</script>
<style lang="less" scoped>
.table-container {
	height: 600px;
	overflow-y: auto;
}
</style>
