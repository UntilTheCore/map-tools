/**
 * 地图销毁：Vue 3 中调用 destroyMap 销毁实例并重新创建。
 * 关键点：destroyMap(map) + 清空容器；requestId 防止"销毁后旧异步创建"覆盖新地图。
 */
import { createApp, defineComponent, h, onUnmounted, ref } from "vue";
import { destroyMap } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const Demo = defineComponent({
  props: { token: { type: String, default: "" } },
  setup(props) {
    const hostRef = ref<HTMLDivElement | null>(null);
    const status = ref("初始化中");
    let map: minemap.Map | null = null;
    let disposed = false;
    let requestId = 0;

    const create = () => {
      if (!props.token) return;
      const currentRequest = ++requestId;
      status.value = "地图创建中…";
      createMinemapMap(hostRef.value!, props.token)
        .then((nextMap) => {
          if (disposed || currentRequest !== requestId) {
            nextMap.remove(); // 迟到的创建结果：直接释放
            return;
          }
          map = nextMap;
          status.value = "地图已创建（点击「销毁地图」释放实例）";
        })
        .catch((error) => {
          if (!disposed)
            status.value = `创建失败：${error instanceof Error ? error.message : String(error)}`;
        });
    };

    const destroy = () => {
      if (!map) {
        status.value = "当前没有地图实例";
        return;
      }
      destroyMap(map);
      map = null;
      hostRef.value?.replaceChildren();
      status.value = "destroyMap 已执行，实例已释放";
    };

    onUnmounted(() => {
      disposed = true;
      if (map) destroyMap(map);
      map = null;
    });

    return () =>
      h("div", { style: "position:relative;width:100%;height:100%;" }, [
        h("div", { ref: hostRef, style: "position:absolute;inset:0;" }),
        props.token
          ? h(
              "div",
              { style: "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;" },
              [
                h("button", { class: "demo-btn", type: "button", onClick: destroy }, "销毁地图"),
                h("button", { class: "demo-btn", type: "button", onClick: create }, "重新创建"),
              ],
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
  const app = createApp(Demo, { token: options.token });
  app.mount(container);
  return () => {
    app.unmount();
    container.innerHTML = "";
  };
}
