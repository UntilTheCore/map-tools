/**
 * 地图状态：Vue 2.7 监听 moveend/zoomend 实时读取状态，并演示 panTo/easeTo/setZoom。
 * 关键点：事件回调里同步读 getZoom/getCenter；beforeDestroy 时先 off 再销毁地图。
 */
import Vue from "vue2";
import { easeTo, panTo, setZoom } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const DEMO_CENTER: [number, number] = [106.62, 29.48];

const Demo = Vue.extend({
  props: { token: { type: String, default: "" } },
  data() {
    return {
      status: "初始化中",
      mapInstance: null as minemap.Map | null,
      disposed: false,
    };
  },
  created() {
    this.mapInstance = null;
    this.disposed = false;
  },
  mounted() {
    if (!this.token) return; // 无 token 时渲染占位面板，不初始化地图
    createMinemapMap(this.$refs.host as HTMLElement, this.token)
      .then((map) => {
        if (this.disposed) {
          map.remove();
          return;
        }
        this.mapInstance = map;
        map.on("moveend", this.readState);
        map.on("zoomend", this.readState);
        this.readState();
      })
      .catch((error: unknown) => {
        if (!this.disposed) {
          this.status = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
        }
      });
  },
  beforeDestroy() {
    this.disposed = true;
    const map = this.mapInstance as minemap.Map | null;
    map?.off("moveend", this.readState);
    map?.off("zoomend", this.readState);
    map?.remove();
    this.mapInstance = null;
  },
  methods: {
    readState() {
      const map = this.mapInstance as minemap.Map | null;
      if (!map) return;
      const center = map.getCenter();
      this.status = `zoom=${map.getZoom().toFixed(2)} center=[${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]`;
    },
    guard(): minemap.Map | null {
      const map = this.mapInstance as minemap.Map | null;
      if (!map) {
        this.status = "地图尚未就绪";
        return null;
      }
      return map;
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
            {
              style:
                "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;",
            },
            [
              btn("panTo 平移", () => {
                const map = this.guard();
                if (map) panTo(map, DEMO_CENTER);
              }),
              btn("easeTo 缓动", () => {
                const map = this.guard();
                if (map) easeTo(map, { center: DEMO_CENTER, zoom: 13, duration: 800 });
              }),
              btn("setZoom 12", () => {
                const map = this.guard();
                if (map) setZoom(map, 12);
              }),
            ],
          )
        : h("div", { style: "position:absolute;inset:0;" }),
    ]);
  },
});

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图状态");
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
