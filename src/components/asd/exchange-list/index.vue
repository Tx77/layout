<script lang="ts" setup>
import { Handicap as FutureHandicap, LiveDealTable } from "~/components/futures/view";
import Live from "./live.vue";
import { useFutureStore } from "~/store/modules/future";
import { useSelectDepth } from "./useSelectDepth";
import { useBookStore } from "./useBookStore";
import { useLiveDeal } from "./useLiveDeal";

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
const futureStore = useFutureStore();
const symbolRef = toRef(futureStore, "currentSymbol");
const { deepOptions, deepSelected, onHandleSelectDeep } = useSelectDepth(symbolRef);
const { tableHeader, acksRef, bidsRef } = useBookStore(symbolRef, deepSelected);

const { liveTableHeader, liveTableRef } = useLiveDeal(symbolRef);
const onSelectPrice = (price: string | number) => {
	futureStore.fillPrice$.trigger("live-price", price);
};
</script>
<template>
	<div
		class="orderbook-container"
		:style="{
			cursor,
			width: '100%',
			height: '100%',
			backgroundColor: 'var(--color-bg-0)',
		}"
		@mousedown.prevent="onMouseDown"
	>
		<!-- // @ts-ignore -->
		<FutureHandicap :asks="acksRef" :bids="bidsRef" :table-header="tableHeader" @select-price="onSelectPrice">
			<template #live>
				<Live />
			</template>
			<template #liveDeal>
				<LiveDealTable ref="liveTableRef" :head-label="liveTableHeader" />
			</template>
			<template #orderbookOption>
				<a-dropdown class="depth-select" @select="onHandleSelectDeep">
					<span class="color-text-1 fs-12 cursor-pointer">{{ deepSelected?.label }} <icon-caret-down /></span>
					<template #content>
						<template v-for="item in deepOptions" :key="item.value">
							<a-doption
								:class="item.value == deepSelected.value ? 'color-text-button' : 'color-text-2'"
								:value="item.value"
								>{{ item.label }}</a-doption
							>
						</template>
					</template>
				</a-dropdown>
			</template>
		</FutureHandicap>
	</div>
</template>
<style scoped lang="less">
.color-text-1 {
	color: var(--color-text-1);
}
.cm {
	color: red;
}
</style>
<style lang="less">
.depth-select {
	.arco-dropdown {
		background-color: var(--color-bg-4);
		border-radius: 4px;
	}
	.arco-dropdown-option {
		padding: 0px 8px;
		&:hover {
			background-color: var(--color-bg-5);
		}
	}
}
</style>
