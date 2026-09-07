import { defineConfig } from "vitepress";

/**
 * @ym/map-tools 文档站配置
 * - 站点导航：首页 / 指南 / API 参考 / 示例中心
 * - demos（四框架示例）由 build:demos 预构建到 public/demos，
 *   dev 与 build 均通过 /demos/{variant}.html 访问
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
      { text: "API 参考", link: "/api/overview" },
      { text: "示例中心", link: "/examples-center/", activeMatch: "^/examples-center/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始（安装与私仓配置）", link: "/guide/getting-started" },
            { text: "核心 API", link: "/guide/core" },
            { text: "接入方式 · Vue 3", link: "/guide/vue3" },
            { text: "接入方式 · Vue 2", link: "/guide/vue2" },
            { text: "接入方式 · React", link: "/guide/react" },
            { text: "接入方式 · 原生 HTML（UMD）", link: "/guide/html" },
            { text: "v2 → v3 迁移指南", link: "/guide/migration" },
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
            { text: "useMap", link: "/api/use-map" },
          ],
        },
      ],
      "/examples-center/": [
        {
          text: "示例中心",
          items: [
            { text: "示例列表", link: "/examples-center/" },
            { text: "示例详情（iframe 预览）", link: "/examples-center/example" },
          ],
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
