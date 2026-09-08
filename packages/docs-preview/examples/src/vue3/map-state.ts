/**
 * 地图状态：Vue 3 监听 moveend/zoomend 实时读取状态，并演示 panTo/easeTo/setZoom。
 * 关键点：事件回调里同步读 getZoom/getCenter；组件卸载时先 off 再销毁地图。
 */
import { createApp, defineComponent, h, onUnmounted, ref } from "vue";
import { easeTo, panTo, setZoom } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const DEMO_CENTER: [number, number] = [106.62, 29.48];

const Demo = defineComponent({
  props: { token: { type: String, default: "" } },
  setup(props) {
    const hostRef = ref<HTMLDivElement | null>(null);
    const status = ref("初始化中");
    let map: minemap.Map | null = null;
    let disposed = false;

    const readState = () => {
      if (!map) return;
      const center = map.getCenter();
      status.value = `zoom=${map.getZoom().toFixed(2)} center=[${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]`;
    };

    const onMoveEnd = () => readState();
    const onZoomEnd = () => readState();

    if (props.token) {
      createMinemapMap(hostRef.value!, props.token)
        .then((created) => {
          if (disposed) {
            created.remove();
            return;
          }
          map = created;
          created.on("moveend", onMoveEnd);
          created.on("zoomend", onZoomEnd);
          readState();
        })
        .catch((error) => {
          if (!disposed)
            status.value = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
        });
    }

    onUnmounted(() => {
      disposed = true;
      map?.off("moveend", onMoveEnd);
      map?.off("zoomend", onZoomEnd);
      map?.remove();
      map = null;
    });

    const guard = () => {
      if (!map) {
        status.value = "地图尚未就绪";
        return false;
      }
      return true;
    };

    return () =>
      h("div", { style: "position:relative;width:100%;height:100%;" }, [
        h("div", { ref: hostRef, style: "position:absolute;inset:0;" }),
        props.token
          ? h(
              "div",
              {
                style:
                  "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;",
              },
              [
                h(
                  "button",
                  {
                    class: "demo-btn",
                    type: "button",
                    onClick: () => guard() && panTo(map!, DEMO_CENTER),
                  },
                  "panTo 平移",
                ),
                h(
                  "button",
                  {
                    class: "demo-btn",
                    type: "button",
                    onClick: () =>
                      guard() && easeTo(map!, { center: DEMO_CENTER, zoom: 13, duration: 800 }),
                  },
                  "easeTo 缓动",
                ),
                h(
                  "button",
                  {
                    class: "demo-btn",
                    type: "button",
                    onClick: () => guard() && setZoom(map!, 12),
                  },
                  "setZoom 12",
                ),
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
  const app = createApp(Demo, { token: options.token });
  app.mount(container);
  return () => {
    app.unmount();
    container.innerHTML = "";
  };
}
