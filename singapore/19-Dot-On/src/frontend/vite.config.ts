import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import autoprefixer from "autoprefixer";
import postCssPxToRem from "postcss-pxtorem";
import path from "path";

export default defineConfig({
	plugins: [react(), mkcert()],

	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

	server: {
		host: true,
		proxy: {
			"/api": {
				target: "http://127.0.0.1:3000",
				changeOrigin: false,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},

	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},

		postcss: {
			plugins: [
				//自动补充前缀
				autoprefixer({
					overrideBrowserslist: ["Android 4.1", "iOS 7.1", "Chrome > 31", "ff > 31", "ie >= 8"],
				}),
				//单位转化
				postCssPxToRem({
					rootValue: 37.5, // 75表示750设计稿，37.5表示375设计稿
					propList: ["*"], // 需要转换的属性，这里选择全部都进行转换
					selectorBlackList: ["norem"], // 过滤掉norem-开头的class，不进行rem转换
				}),
			],
		},
	},
});
