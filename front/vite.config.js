import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const { resolve } = require('path');

export default defineConfig({
    plugins: [vue()],
    server: {
        host: 'localhost', // 指定服务器主机名
        // port: 8080, // 指定服务器端口
        open: true, // 在服务器启动时自动在浏览器中打开应用程序
        https: false, // 是否开启 https
        proxy: {
            "/grafana": {
                target: "http://10.1.22.120:3001/",
                ws: true
                //rewrite: path => path.replace(/^\/grafana/, "")
            },
            // "/d": {
            //     target: "http://10.1.22.120:3001/"
            // },
            // "/public": {
            //     target: "http://10.1.22.120:3001/"
            // },
            // "/api": {
            //     ws: true,
            //     target: "http://10.1.22.120:3001/"
            // },
            // "/goto": {
            //     ws: true,
            //     target: "http://10.1.22.120:3001/"
            // }
        }
    },
    build: {
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/package.js'), //指定组件编译入口文件
            name: 'wastflow',
            fileName: 'wastflow',
        },//库编译模式配置
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ["vue"],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                },
            },
        },// rollup打包配置
    },
});