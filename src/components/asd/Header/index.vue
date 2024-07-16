<script setup lang="ts" name="bit-header">
import AllNav from "./components/AllNav/index.vue";
import AuthPanel from "./components/AuthPanel/index.vue";
import Correspondence from "./components/Correspondence/index.vue";
import DownloadIcon from "./components/DownloadIcon/index.vue";
import LanguageRate from "./components/LanguageRate/index.vue";
import ThemeSwitch from "./components/ThemeSwitch/index.vue";
import NavTrigger from "./components/NavTrigger/index.vue";

import {
	logoUrl,
	authPanel as authPanelObj,
	transactionList,
	linkMarket,
	derivativeList,
	tripartiteCoinList,
	activityList,
} from "./config";
import { useThrottleFn } from "@vueuse/core";

const route = useRoute();

const hideSections = computed(() => route.meta.hideSections);

const checkPageSection = (section: PageSection) => {
	return !hideSections.value?.includes(section);
};

const windowWidth = ref(1920);
useEffect(() => {
	windowWidth.value = window.innerWidth;
	const onWindowResize = useThrottleFn(() => {
		windowWidth.value = window.innerWidth;
	}, 200);
	window.addEventListener("resize", onWindowResize);
	return () => {
		window.removeEventListener("resize", onWindowResize);
	};
}, []);
/**
 * 活动落地页隐藏主题切换按钮
 */
const themeSwitchShow = ref(true);
watch(
	() => route,
	() => {
		if (route.fullPath.includes("/act/partner")) {
			themeSwitchShow.value = false;
		} else {
			themeSwitchShow.value = true;
		}
	},
	{
		deep: true,
	}
);
// const assetsTitleNavTo = () => {
//   navigateToLocale('/assets/overview');
// };
// const handleOrderNavTo = () => {
//   navigateToLocale('/order/contract');
// };
// const handleAuthNavTo = () => {
//   navigateToLocale('/account/setting');
// };

const { assetsList, orderList } = useMenu();

const { token } = useToken();
</script>

<template>
	<div class="header-wrapper-main flex-row-between-center">
		<div class="h-100% flex items-center left">
			<NuxtLinkLocale :to="logoUrl" noPrefetch>
				<div class="hover-opacity-80 w-140 h-100% cursor-pointer flex-center">
					<!-- <bit-icon
            class="mb-6"
            name="icon-Bitunix-logo-s"
            color="var(--color-bg-button-new)"
            width="100"
            height="23"
          /> -->
					<SvgIcon name="bx-icon-bitunix-logo" w="100" h="23" color="var(--color-bg-button-new)" class="mb-6"></SvgIcon>
				</div>
			</NuxtLinkLocale>
			<section class="nav-layout h-100% flex color-text-1 cursor-pointer">
				<!-- 这个版本隐藏 -->
				<AllNav v-if="checkPageSection('allNav') && false" />
				<NuxtLinkLocale :to="tripartiteCoinList()[0]?.link" noPrefetch>
					<nav v-show="checkPageSection('tripartiteCoin')" class="nav-item">
						{{ $t("header.tripartiteCoin") }}
					</nav>
				</NuxtLinkLocale>
				<NuxtLinkLocale :to="linkMarket.link" noPrefetch>
					<nav v-show="checkPageSection('market')" class="nav-item">
						{{ $t("header.markets") }}
					</nav>
				</NuxtLinkLocale>
				<NuxtLinkLocale :to="derivativeList()[0]?.link" noPrefetch>
					<nav v-show="checkPageSection('derivative')" class="nav-item">
						{{ $t("header.futures") }}
					</nav>
				</NuxtLinkLocale>
				<NuxtLinkLocale :to="transactionList()[0]?.link" noPrefetch>
					<nav v-show="checkPageSection('transaction')" class="nav-item">
						{{ $t("header.spot") }}
					</nav>
				</NuxtLinkLocale>
				<NavTrigger v-if="checkPageSection('activity')" :nav-title="$t('activity.nav')" :down-list="activityList()" />
				<NuxtLinkLocale to="/activity/newborn-zone" noPrefetch>
					<nav v-show="checkPageSection('activity')" class="nav-item">
						<span class="fm-medium">
							{{ $t("activity.newcomer") }}
						</span>
						<bit-icon class="transform-translate-y--14" name="icon-new" width="24" height="10" />
					</nav>
				</NuxtLinkLocale>
				<NuxtLinkLocale to="/activity/goal/junevip" noPrefetch>
					<nav v-show="checkPageSection('activity')" class="nav-item">
						<span class="fm-medium">
							{{ $t("header.vipUrl") }}
						</span>
						<svg-icon class="transform-translate-y--12" name="bx-icon-fervent" w="16" h="16" />
					</nav>
				</NuxtLinkLocale>
			</section>
		</div>
		<ClientOnly>
			<section class="nav-layout h-100% flex items-center color-text-1">
				<NavTrigger
					v-show="token"
					class="h-100%"
					:nav-title="$t('header.assets')"
					:down-list="assetsList"
					navigation-path="/assets/overview"
					align-side="br"
				/>
				<NavTrigger
					v-show="token"
					class="h-100%"
					:nav-title="$t('header.order')"
					:down-list="orderList"
					navigation-path="/order/contract"
					align-side="br"
				/>
				<template v-if="checkPageSection('authPanel')">
					<AuthPanel v-if="token" class="h-100%" />
					<template v-else>
						<NuxtLinkLocale :to="authPanelObj().loginUrl" noPrefetch>
							<a-button class="login-btn px-24! h-32! fm-medium mr-12 !color-text-1" type="outline">
								{{ $t("header.login") }}
							</a-button>
						</NuxtLinkLocale>
						<NuxtLinkLocale :to="authPanelObj().registerUrl" noPrefetch>
							<a-button class="sign-btn px-24! h-32! fm-medium !color-text-button-new">
								{{ $t("header.register") }}
							</a-button>
						</NuxtLinkLocale>
					</template>
				</template>
				<div class="segmentation w-2 h-16 mx-12"></div>
				<Correspondence v-if="checkPageSection('correspondence') && token" class="h-100%" />
				<DownloadIcon v-show="checkPageSection('downloadIcon')" class="h-100%" />
				<LanguageRate class="h-100%" />
				<ThemeSwitch v-if="themeSwitchShow" class="h-100%" />
			</section>
		</ClientOnly>
	</div>
</template>

<style scoped lang="less">
.header-wrapper-main {
	position: absolute;
	width: 100%;
	height: 64px;
	background-color: var(--color-bg-0);
	box-sizing: border-box;
	z-index: 998;
	.left {
		overflow-x: auto;
		margin-right: 40px;
	}
	.nav-layout {
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		.nav-item {
			padding: 0 12px;
			height: 100%;
			font-weight: 500;
			display: flex;
			align-items: center;
			white-space: nowrap;
			&:hover {
				opacity: 0.8;
			}
		}
		.segmentation {
			background-color: var(--color-border-1);
		}
	}
	.login-btn {
		border-color: var(--color-text-1);
		&:hover {
			opacity: 0.8;
		}
	}
	.sign-btn {
		background-color: var(--color-bg-button-new);
		&:hover {
			opacity: 0.8;
		}
	}

	a,
	a:link,
	a:visited,
	a:hover,
	a:active {
		text-decoration: none;
		color: var(--color-text-1);
	}
}
</style>
