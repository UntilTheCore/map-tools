import { defineConfig } from "vitepress";

/**
 * @ym/map-tools 文档站配置
 * - 站点导航：首页 / 指南 / API 参考 / 示例实验室
 * - 示例实验室的编辑代码在 /runner.html 中运行（import map 解析本地
 *   public/runner/vendor 预打包产物，由 build:runner-vendor 产出）
 */
export default defineConfig({
  title: "@ym/map-tools",
  description: "minemap 地图开发工具库 · 四框架兼容（Vue2 / Vue3 / React / 原生 HTML）",
  lang: "zh-CN",
  base: "/",
  cleanUrls: false,
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }]],

  themeConfig: {
    logo: { src: "/logo.svg", width: 24, height: 24 },
    siteTitle: "@ym/map-tools",
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/getting-started" },
      { text: "案例参考", link: "/cases/", activeMatch: "^/cases/" },
      { text: "API 参考", link: "/api/overview" },
      {
        text: "示例实验室",
        link: "/examples-center/playground",
        activeMatch: "^/examples-center/",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始（安装与私仓配置）", link: "/guide/getting-started" },
            { text: "最佳实践", link: "/guide/best-practices" },
            { text: "核心 API", link: "/guide/core" },
            { text: "接入方式 · Vue 3", link: "/guide/vue3" },
            { text: "接入方式 · Vue 2", link: "/guide/vue2" },
            { text: "接入方式 · React", link: "/guide/react" },
            { text: "接入方式 · 原生 HTML（UMD）", link: "/guide/html" },
            { text: "v2 → v3 迁移指南", link: "/guide/migration" },
          ],
        },
      ],
      "/cases/": [
        {
          text: "案例参考",
          items: [
            { text: "案例总览", link: "/cases/" },
            { text: "轨迹回放", link: "/cases/track-playback" },
            { text: "地址解析与逆地址解析", link: "/cases/geocoding" },
            { text: "道路搜索", link: "/cases/road-search" },
            { text: "公交路径规划", link: "/cases/transit-route" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API 参考",
          items: [
            { text: "总览与类型入口", link: "/api/overview" },
            { text: "Resources", link: "/api/resources" },
            { text: "Layers", link: "/api/layers" },
            { text: "Query", link: "/api/query" },
            { text: "Viewport", link: "/api/viewport" },
            { text: "Geometry", link: "/api/geometry" },
            { text: "Overlays", link: "/api/overlays" },
            { text: "Popup", link: "/api/popup" },
            { text: "Track", link: "/api/track" },
            { text: "useMap", link: "/api/use-map" },
          ],
        },
      ],
      "/examples-center/": [
        {
          text: "示例实验室",
          items: [{ text: "示例实验室（可编辑运行）", link: "/examples-center/playground" }],
        },
      ],
    },

    outline: { level: [2, 3], label: "本页目录" },

    socialLinks: [{ icon: "github", link: "https://github.com" }],

    footer: {
      message: "基于 minemap SDK",
      copyright: "Copyright © 2026 @ym/map-tools",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    lastUpdatedText: "最后更新",
    darkModeSwitchLabel: "外观",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "回到顶部",
    outlineTitle: "本页目录",
    lightModeSwitchTitle: "切换浅色模式",
    darkModeSwitchTitle: "切换深色模式",
    notFound: {
      title: "页面未找到",
      quote: "您访问的页面不存在，请检查链接或返回首页。",
      linkLabel: "返回首页",
      linkText: "回到首页",
    },
  },
});
