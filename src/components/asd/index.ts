/**
 * @store AppStore
 * @description appStore 储存非登录状态下和“用户无关”的项目基础信息,用于初始化(大多数应来源于后台管理系统配置)
 * @example
 * title  浏览器title
 * iconUrl  浏览器icon
 * logoUrl  项目logo
 * 第三方下载的 Url 地址集合
 * lan 当前语言环境
 * 。。。
 */

import { defineStore } from "pinia";
import piniaStore from "~/store/index";
import { type AppState, type IsHideLayoutType, DISABLE_SET_TO_PATH, REDIRECT_PATH_LIST } from "./types";
import {
	getAreaCode,
	getAreaCodeByIp,
	getDefaultC2cNickFreeze,
	getPublicInfo,
	getWithdrawLimit,
	getAccountSecurityFreezeTime,
} from "~/api/app";
import type { RouteLocationNormalized } from "vue-router";
import { getLanguageList } from "~/api/app/index";
import { LayoutStrategy } from "~/utils/layout/params";
export const useAppStore = defineStore(
	// 唯一ID元素
	"app",
	{
		state: (): AppState => ({
			title: "bitunix",
			h1: "bitunix",
			theme: "dark",
			loading: false, // 全局loading 遮罩慎用，影响用户体验
			//   login_status: 0, //登录状态 0：未登录 1：已登录
			toPath: "/", // 登录后前往的页面
			toQuery: {}, // 登录后前往的页面携带参数
			areaList: [],
			areaCodeByIp: undefined,
			default_c2c_nick_freeze: undefined, //默认C2C过期时长
			freezeExpiryDate: undefined, //默认冻结时长
			publicInfo: {}, // 后台配置的全部信息
			publicMsg: undefined, // 后台配置的基础信息
			indexHeaderTitle: undefined, // 网站title信息
			switch: undefined, // 网站的一些开关配置
			urls: undefined, //平台站点URL
			limitCountryList: undefined, // 国家访问限制
			HIT: undefined, // 平台分红币种设置
			klineColor: undefined, // K线涨跌颜色
			lan: undefined, // 平台多语言
			coinsymbol_introduce_names: undefined, // 获取所有存在简介的币种列表
			update_safe_withdraw: undefined, // 修改密码冻结提现
			seo: undefined, // SEO 配置信息
			user_day_withdraw_value_limit_no_auth: undefined, // 未认证用户每日最大提币(USDT)价值上限
			user_day_withdraw_value_limit_lv1: undefined, // 认证用户lv1每日最大提币(USDT)价值上限
			user_day_withdraw_value_limit_lv2: undefined, // 认证用户lv2每日最大提币(USDT)价值上限
			assets_showInfo: true, // 资产模块-资产金额显隐状态
			pageSize: 20, // 资产模块-表格分页数量
			scrollDistance: 0, // 页面滚动距离
			isHideLayout: {
				isHideTheHead: false,
				isHideTheFoot: false,
			},
			hasSecurityTips: false,
			lockTime: {
				loginPasswordWithdrawLockTime: 0, // 用户修改登录密码后的提币锁定时间(秒)
				capitalPasswordWithdrawLockTime: 0, // 用户修改资金密码后的提币锁定时间(秒)
				safeSetWithdrawLockTime: 0, // 用户修改安全项后的提币锁定时间(秒)
			},
			languageList: [], // 接口返回语言列表
			currentVersion: BUILD_TIME,
			serverVersion: BUILD_TIME,
			layoutStrategy: LayoutStrategy.PRO_RIGHT, // 布局策略
			isResetLayout: false, // 是否重置当前布局
		}),
		getters: {
			isLatestVersion(state) {
				return state.currentVersion == state.serverVersion;
			},
			login_status() {
				return getToken() ? 1 : 0;
			},
			getLayoutStrategy(state) {
				return state.layoutStrategy;
			},
		},
		actions: {
			setToPath(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
				this.toQuery = {};
				if (to.name === "login" && DISABLE_SET_TO_PATH.includes(_from.path)) {
					this.toPath = _from.path;
					this.toQuery = _from.query;
					return;
				}
				if (to.name === "login" && REDIRECT_PATH_LIST.some((item) => _from.path.toString().includes(item))) {
					this.toPath = _from.path;
				} else {
					this.toPath = "/";
				}
			},
			toggleTheme(theme: "dark" | "light") {
				this.theme = theme;
			},
			toggleLoading(open: boolean) {
				this.loading = open;
			},
			//   setLoginStatus(type: 0 | 1) {
			//     this.login_status = type;
			//   },
			async getAreaCode() {
				const result = await getAreaCode();
				this.areaList = result;
				return result;
			},
			async getAreaCodeByIp() {
				const result = await getAreaCodeByIp();
				this.areaCodeByIp = result;
				return result;
			},
			async getDefaultC2CNickFreeze() {
				const result = await getDefaultC2cNickFreeze();
				this.default_c2c_nick_freeze = result.date;
			},
			async getFreezeExpiryDate() {
				const result = await getAccountSecurityFreezeTime();
				this.lockTime = result;
			},
			async getPublicInfo() {
				const result = await getPublicInfo();
				if (result.code === "0" && result.data) {
					this.publicInfo = result.data;
					this.publicMsg = result.data.msg;
					this.indexHeaderTitle = result.data.indexHeaderTitle;
					this.switch = result.data.switch;
					this.urls = result.data.url;
					this.limitCountryList = result.data.limitCountryList;
					this.HIT = result.data.HIT;
					this.klineColor = result.data.klineColor;
					this.lan = result.data.lan;
					this.coinsymbol_introduce_names = result.data.coinsymbol_introduce_names;
					this.update_safe_withdraw = result.data.update_safe_withdraw;
					this.seo = result.data.seo;
					this.user_day_withdraw_value_limit_no_auth = result.data.user_day_withdraw_value_limit_no_auth;
					this.user_day_withdraw_value_limit_lv1 = result.data.user_day_withdraw_value_limit_lv1;
				}
				const limit = await getWithdrawLimit({ userKycTypeCode: "lv2" });
				if (String(limit.code) === "0") {
					this.user_day_withdraw_value_limit_lv2 = limit.data;
				}
			},
			changeAssetsShow(type: boolean) {
				this.assets_showInfo = type;
			},
			changePageSize(num: number) {
				this.pageSize = num;
			},
			changeLayout(obj: IsHideLayoutType) {
				Object.assign(this.isHideLayout, obj);
			},
			async getLanguageListFn() {
				const languageList = await getLanguageList();
				const temp = languageList ?? [];
				if (import.meta.env.VITE_APP_ENV === "pro") {
					this.languageList = temp.filter((item) => {
						return item.languageKey !== "zh_CN";
					});
				} else {
					this.languageList = temp;
				}
			},
			setLayoutStrategy(strategy: LayoutStrategy) {
				this.layoutStrategy = strategy;
				localStorage.setItem("layoutStrategy", this.layoutStrategy as string);
			},
			resetLayout(reset: boolean) {
				this.isResetLayout = reset;
			},
		},
		persist: [
			{
				key: import.meta.env.VITE_CACHE_THEME,
				storage: persistedState.cookies,
				paths: ["theme"],
			},
			{
				key: "assets_showInfo",
				storage: persistedState.cookies,
				paths: ["assets_showInfo"],
			},
			{
				key: "pageSize",
				storage: persistedState.localStorage,
				paths: ["pageSize"],
			},
			{
				key: "login_status",
				storage: persistedState.localStorage,
				paths: ["login_status"],
			},
			{
				key: "layoutStrategy",
				paths: ["layoutStrategy"],
			},
		],
	}
);

// 数据自动持久化 https://prazdevs.github.io/pinia-plugin-persistedstate/guide/
export function useAppOutsideStore() {
	return useAppStore(piniaStore);
}
