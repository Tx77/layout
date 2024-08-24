/*
 * @Author: 田鑫
 * @Date: 2024-08-24 15:36:26
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:02:10
 * @Description:
 */
import { configAutoImport, configComponents } from "./unplugin";
import viteCompression from "vite-plugin-compression";
import progress from "vite-plugin-progress";
import defineOptions from "unplugin-vue-define-options/vite";

export const pluginsConfig = [
	configAutoImport(),
	configComponents(),
	viteCompression(),
	progress(),
	defineOptions({
		include: [/\.vue$/, /\.vue\?vue/],
	}),
];
