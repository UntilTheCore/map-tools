/**
 * 地图销毁：Vue 2.7 中调用 destroyMap 销毁实例并重新创建。
 * 关键点：destroyMap(map) + 清空容器；requestId 防止"销毁后旧异步创建"覆盖新地图。
 */
import Vue from "vue2";
import { destroyMap } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const Demo = Vue.extend({
  props: { token: { type: String, default: "" } },
  data() {
    return {
      status: "初始化中",
      mapInstance: null as minemap.Map | null,
      requestId: 0,
      disposed: false,
    };
  },
  created() {
    this.mapInstance = null;
    this.requestId = 0;
    this.disposed = false;
  },
  mounted() {
    this.create();
  },
  beforeDestroy() {
    this.disposed = true;
    if (this.mapInstance) destroyMap(this.mapInstance);
    this.mapInstance = null;
  },
  methods: {
    create() {
      if (!this.token) return;
      const currentRequest = ++this.requestId;
      this.status = "地图创建中…";
      createMinemapMap(this.$refs.host as HTMLElement, this.token)
        .then((nextMap) => {
          if (this.disposed || currentRequest !== this.requestId) {
            nextMap.remove(); // 迟到的创建结果：直接释放
            return;
          }
          this.mapInstance = nextMap;
          this.status = "地图已创建（点击「销毁地图」释放实例）";
        })
        .catch((error: unknown) => {
          if (!this.disposed) {
            this.status = `创建失败：${error instanceof Error ? error.message : String(error)}`;
          }
        });
    },
    destroy() {
      if (!this.mapInstance) {
        this.status = "当前没有地图实例";
        return;
      }
      destroyMap(this.mapInstance);
      this.mapInstance = null;
      (this.$refs.host as HTMLElement).replaceChildren();
      this.status = "destroyMap 已执行，实例已释放";
    },
  },
  render(h) {
    const btn = (label: string, onClick: () => void) =>
      h("button", { class: "demo-btn", on: { click: onClick } }, label);
    return h("div", { style: "position:relative;width:100%;height:100%;" }, [
      h("div", { ref: "host", style: "position:absolute;inset:0;" }),
      this.token
        ? h(
            "div",
            { style: "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;" },
            [btn("销毁地图", () => this.destroy()), btn("重新创建", () => this.create())],
          )
        : h("div", { style: "position:absolute;inset:0;" }),
    ]);
  },
});

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图销毁");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const vm = new Vue({
    render: (h) => h(Demo, { props: { token: options.token } }),
  }).$mount();
  container.appendChild(vm.$el);
  return () => {
    vm.$destroy();
    container.innerHTML = "";
  };
}
