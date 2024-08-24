/*
 * @Author: 田鑫
 * @Date: 2024-08-24 15:34:18
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 15:46:33
 * @Description:
 */
/**
 * 自动引入API
 * */
import AutoImport from "unplugin-auto-import/vite";

import { ArcoResolver } from "unplugin-vue-components/resolvers";
import IconsResolver from "unplugin-icons/resolver";

export function configAutoImport() {
	return AutoImport({
		imports: [
			"vue",
			"vue-router",
			"pinia",
			"@vueuse/core",
			{
				dayjs: [["default", "dayjs"]],
				"lodash-es": ["cloneDeep", "omit", "pick"],
				"@/hooks": ["useModal"],
			},
		],
		resolvers: [
			ArcoResolver({
				resolveIcons: {
					enable: true,
				},
			}),
			IconsResolver({
				enabledCollections: [],
			}),
		],
		eslintrc: {
			enabled: true,
			filepath: "./config/unplugin/.eslintrc-auto-import.json",
		},
		dts: "./config/unplugin/auto-imports.d.ts",
	});
}
