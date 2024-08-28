// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite' //自动引入element组件
import Components from 'unplugin-vue-components/vite'//自动引入element组件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'; //node的路径，必须安装@types/node来拓展node语法
export default defineConfig({
    plugins: [
        vue(),
        //配置elements-plus自动按需引入
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    server:{
        host:'0.0.0.0',
        proxy: {
            '/api': {
                // target: 'https://www.codeman.store',
                target: 'http://www.codeman.ink:3000',
                // target:'http://localhost:3000',
                open: true, // 设置服务启动时是否自动打开浏览器
                cors: true, // 允许跨域
                rewrite: (path) => path.replace('/api', '')
            },
            'm7': {
                target: 'http://m7.music.126.net',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace('/m7', '')
            },
            'm701': {
                target: 'http://m701.music.126.net',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace('/m701', '')
            },
            'm8': {
                target: 'http://m8.music.126.net',
                changeOrigin: true,
                ws: true,
                rewrite:(path) => path.replace('/m8', '')
            },
            'm801': {
                target: 'http://m801.music.126.net',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace('/m801', '')
            }

        }

    },
    resolve: {
        alias: {
            // 配置路径别名@
            "@": path.resolve(__dirname, "src"),
            "@/*": ["./src/*"] // 多加个这个
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    //配置less全局变量都可用
                    hack: `true; @import (reference) "${path.resolve(__dirname, 'src/assets/css/global.less')}";`,  // src/assets/global.less 是你需要全局变量 （你定义的定义的方法 和 变量等）
                },
                javascriptEnabled: true
            }
        }
    }
})