/**
 * 示例：底图初始化与销毁（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.destroyMap
 *
 * 本文件不 import @ym/map-tools 运行时：API 通过 plain.html 中
 * <script src="./vendor/fe-utils.umd.js"> 加载的全局 FE_utils 访问。
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

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "底图初始化与销毁");
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
  let seq = 0;

  function initMap() {
    const current = ++seq;
    status.info("地图初始化中…（createMinemapMap → minemap.Map）");
    createMinemapMap(host, token!)
      .then((m) => {
        if (disposed || current !== seq) {
          m.remove();
          return;
        }
        map = m;
        status.info(
          "地图已初始化。点击「销毁地图」将调用 FE_utils.destroyMap(map)"
        );
      })
      .catch((err) => {
        if (disposed) return;
        status.error("初始化失败：" + String(err?.message ?? err));
      });
  }

  addButton(bar, "销毁地图 destroyMap", () => {
    if (map) {
      FE_utils.destroyMap(map);
      map = null;
      host.innerHTML = "";
      status.info("FE_utils.destroyMap 已执行：地图实例已销毁（map.remove()）");
    } else {
      status.info("当前没有地图实例");
    }
  });

  addButton(bar, "重新初始化", initMap);

  initMap();

  return () => {
    disposed = true;
    if (map) FE_utils.destroyMap(map);
    container.innerHTML = "";
  };
}
