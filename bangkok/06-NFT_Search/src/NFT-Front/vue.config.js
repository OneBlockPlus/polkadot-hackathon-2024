const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://region-42.seetacloud.com:58749',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 移除代理字符串
        }
      }
    }
  }
})
