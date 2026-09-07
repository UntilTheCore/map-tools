# 示例中心

可切换 **Vue 3 / Vue 2.7 / React / 原生 HTML（FE_utils UMD）** 四种框架变体，实时预览地图效果并查看对应源码。

## 使用说明

- 地图基于 minemap SDK，示例通过 CDN 动态加载，无需本地 SDK。
- 未配置 token 时示例会渲染占位面板（不初始化地图、不抛异常），请通过以下任一方式配置：
  1. 在示例 URL 追加 `?token=xxx`（如 `/demos/vue3.html?ex=init&token=xxx`）；
  2. 在示例页点击「设置 token」写入 `localStorage.MINEMAP_TOKEN`。
- 所有示例的地图逻辑均真实调用 `@ym/map-tools` API（框架变体从对应子路径导入，HTML 变体使用 UMD 全局 `FE_utils`）。

## 示例列表

<ExampleList />

## 快速跳转

- [查看某个示例详情（默认 init）](/examples-center/example)
- [查看某示例详情并带 token](/examples-center/example.html?ex=init&token=你的token)
