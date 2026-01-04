import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
// vite.config.ts
import { URL } from 'node:url'
// 1. 引入 mock 插件
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({mode}) => {
    // 根据当前工作目录中的 .env 文件加载环境变量
    // mode 参数指定加载哪个环境变量文件，例如 '.env.development'、'.env.production' 等
    const env = loadEnv(mode, process.cwd()) as ImportMetaEnv

    return {
        // 开发或生产环境服务的公共基础路径
        base: env.VITE_BASE,
        // 路径别名
        resolve: {
            alias: {
                '~': new URL('./', import.meta.url).pathname,
                '@': new URL('./src', import.meta.url).pathname
            }
        },
        // 引入sass全局样式变量
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/styles/var.scss";`
                }
            }
        },
        plugins: [
            vue(),
            // 2. 配置 mock 插件
            viteMockServe({
                mockPath: 'mock', // mock 文件存放的文件夹名称
                enable: true,     // 设为 true 启用 mock
            }),
            Components({
                // 指定组件位置，默认是 src/components 自动导入自定义组件
                dirs: ['src/components'],
                // 配置文件生成位置
                dts: 'src/components.d.ts',
                //指定有效的组件文件扩展名，tsx是ts的扩展语法
                extensions: ['vue', 'tsx'],
                // 配置需要自动导入的组件
                include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
                dumpComponentsInfo: true,
            }),
            AutoImport({
                // 自动导入vue相关函数，如: ref、reactive、toRef等
                imports: ['vue', 'vue-router', {
                    // vue 3.5.x
                    vue: ['useTemplateRef', 'onWatcherCleanup', 'useId']
                }],
                // 配置生成位置
                dts: 'src/auto-imports.d.ts',
                // 配置需要自动导入的API
                include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
            })
        ]
    }
})

