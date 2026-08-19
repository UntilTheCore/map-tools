import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ExampleList from "./components/ExampleList.vue";
import ExampleDetail from "./components/ExampleDetail.vue";
import "./custom.css";

/**
 * 文档站主题：默认主题 + 示例中心组件注册
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ExampleList", ExampleList);
    app.component("ExampleDetail", ExampleDetail);
  },
} satisfies Theme;
