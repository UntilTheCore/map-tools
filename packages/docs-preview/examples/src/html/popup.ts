/**
 * 示例：Popup 弹窗（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.getPopupDom（核心版，纯 DOM 模式，content 支持 string / HTMLElement）
 */
import {
  styleHost,
  createMapHost,
  createControlBar,
  addButton,
  createStatusBar,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { markerPoints } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "Popup 弹窗");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);

  let map: minemap.Map | null = null;
  let disposed = false;
  let clickHandler: ((e: any) => void) | null = null;
  const openPopups: minemap.Popup[] = [];

  const sourceId = FE_utils.setSourceIdName("demo", "popupPoints");
  const layerId = FE_utils.setLayerIdName("demo", "popupPoints");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      FE_utils.setSourceData(
        m,
        sourceId,
        {
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
        },
        markerPoints as any
      );

      // 点击任意位置弹出 popup（纯 DOM 内容：getPopupDom 核心版）
      clickHandler = (e: any) => {
        const content = document.createElement("div");
        content.textContent =
          `Popup 弹窗（HTML · FE_utils）\n` +
          `经度: ${e.lngLat.lng.toFixed(5)}  纬度: ${e.lngLat.lat.toFixed(5)}`;
        content.style.cssText =
          "padding:8px 12px;font-size:12px;line-height:1.6;white-space:pre;" +
          "background:#0d1a15;border:1px solid rgba(77,224,139,.5);border-radius:8px;color:#eafff5;";
        const dom = FE_utils.getPopupDom(content);
        const popup = new minemap.Popup({
          closeOnClick: false,
          closeButton: true,
          offset: [0, -10],
        });
        popup
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setDOMContent(dom)
          .addTo(m);
        openPopups.push(popup);
        status.info(
          `FE_utils.getPopupDom(HTMLElement) → minemap.Popup 已打开（当前 ${openPopups.length} 个）`
        );
      };
      m.on("click", clickHandler);
      status.info("点击地图任意位置弹出 Popup（纯 DOM 内容）");
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  addButton(bar, "清理全部 Popup", () => {
    openPopups.forEach((p) => p.remove());
    openPopups.length = 0;
    status.info("已关闭全部 Popup");
  });

  return () => {
    disposed = true;
    if (map && clickHandler) map.off("click", clickHandler);
    openPopups.forEach((p) => p.remove());
    container.innerHTML = "";
  };
}
