import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
const resolve = (src: string) => fileURLToPath(new URL(`../${src}`, import.meta.url));
import { pluginsConfig } from "./config";
export default defineConfig({
	plugins: [vue(), ...pluginsConfig],
	resolve: {
		extensions: [".jsx", ".tsx", ".js", ".ts", ".json", ".vue"],
		alias: {
			"@": resolve("src"),
			"@components": resolve("src/components"),
		},
	},
});
