/**
 * 地图初始化：在 Vue 3 组合式生命周期中创建地图实例。
 * 关键点：onMounted 中 createMinemapMap（异步等 load），onUnmounted 中销毁；
 * 组件卸载后到达的异步结果不再写状态（disposed 标志防竞态）。
 */
import { createApp, defineComponent, h, onMounted, onUnmounted, ref, type Ref } from "vue";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const Demo = defineComponent({
  props: { token: { type: String, default: "" } },
  setup(props) {
    const hostRef = ref<HTMLDivElement | null>(null);
    const status: Ref<string> = ref("等待挂载（onMounted 中创建地图）");
    let map: minemap.Map | null = null;

    onMounted(async () => {
      if (!props.token) return; // 无 token 时渲染占位面板，不初始化地图
      status.value = "SDK 加载中，创建 minemap.Map…";
      try {
        const created = await createMinemapMap(hostRef.value!, props.token);
        if (!hostRef.value) {
          created.remove(); // 组件已卸载，直接释放
          return;
        }
        map = created;
        const center = created.getCenter();
        status.value = `地图已就绪 zoom=${created.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`;
      } catch (error) {
        status.value = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
      }
    });

    onUnmounted(() => {
      map?.remove();
      map = null;
    });

    return () =>
      h("div", { style: "position:relative;width:100%;height:100%;" }, [
        h("div", { ref: hostRef, style: "position:absolute;inset:0;" }),
        props.token
          ? h(
              "div",
              {
                style:
                  "position:absolute;left:12px;bottom:12px;z-index:30;padding:6px 10px;border-radius:6px;font-size:12px;background:rgba(8,14,12,.86);color:#b9f6d5;font-family:ui-monospace,Consolas,monospace;",
              },
              status.value,
            )
          : h("div", { style: "position:absolute;inset:0;" }),
      ]);
  },
});

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图初始化");
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
