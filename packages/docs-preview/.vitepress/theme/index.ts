import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Playground from "./components/Playground.vue";
import "./custom.css";

/**
 * 文档站主题：默认主题 + 示例实验室组件注册
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Playground", Playground);
  },
} satisfies Theme;
