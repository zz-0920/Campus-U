export default {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375, // 设计稿宽度
      viewportHeight: 667, // 设计稿高度（可选）
      unitPrecision: 3, // 转换后的精度
      viewportUnit: 'vw', // 希望使用的视口单位
      selectorBlackList: ['.ignore'], // 需要忽略的CSS选择器
      minPixelValue: 1, // 最小的转换数值
      mediaQuery: false, // 是否在媒体查询的css代码中也进行转换
      exclude: [/node_modules/], // 忽略某些文件夹下的文件
    },
  },
}