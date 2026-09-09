/**
 * 地图初始化：Vue 2.7 选项式生命周期持有地图实例。
 * 关键点：mounted 中 createMinemapMap（异步等 load），beforeDestroy 中销毁；
 * 卸载后到达的异步结果不再写状态（disposed 标志防竞态）。
 */
import Vue from "vue2";
import { createMinemapMap } from "../shared/loadMinemap";
import { styleHost, type RenderOptions } from "../shared/demo";

const Demo = Vue.extend({
  data() {
    return {
      status: "等待挂载（mounted 中创建地图）",
      mapInstance: undefined as minemap.Map | undefined,
      setDisposed: undefined as (() => void) | undefined,
    };
  },
  mounted() {
    let disposed = false;
    this.setDisposed = () => {
      disposed = true;
    };
    this.status = "SDK 加载中，创建 minemap.Map…";
    createMinemapMap(this.$refs.host as HTMLElement)
      .then((map) => {
        if (disposed) {
          map.remove(); // 组件已销毁，直接释放
          return;
        }
        this.mapInstance = map;
        const center = map.getCenter();
        this.status = `地图已就绪 zoom=${map.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`;
      })
      .catch((error: unknown) => {
        if (!disposed) {
          this.status = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
        }
      });
  },
  beforeDestroy() {
    this.setDisposed?.();
    (this.mapInstance as minemap.Map | undefined)?.remove();
    this.mapInstance = undefined;
  },
  render(h) {
    return h("div", { style: "position:relative;width:100%;height:100%;" }, [
      h("div", { ref: "host", style: "position:absolute;inset:0;" }),
      h(
        "div",
        {
          style:
            "position:absolute;left:12px;bottom:12px;z-index:30;padding:6px 10px;border-radius:6px;font-size:12px;background:rgba(8,14,12,.86);color:#b9f6d5;font-family:ui-monospace,Consolas,monospace;",
        },
        this.status,
      ),
    ]);
  },
});

export default function render(container: HTMLElement, _options: RenderOptions): () => void {
  styleHost(container);
  const vm = new Vue({
    render: (h) => h(Demo),
  }).$mount();
  container.appendChild(vm.$el);
  return () => {
    vm.$destroy();
    container.innerHTML = "";
  };
}
