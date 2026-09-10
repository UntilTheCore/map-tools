/**
 * minemap SDK 动态加载器。
 *
 * - 无 npm 包，通过 CDN 动态注入 <script> 加载
 * - 私有部署单源（已实测 200）：https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js
 * - 示例默认参数：solution 222609、center [106.55, 29.56]（重庆）、
 *   私有 MapStyleServer styleJSON（key 内嵌于 URL，见 createMinemapMap）
 *
 * key 由系统统一提供（SYSTEM_MINEMAP_KEY），用户无需手动配置。
 */
import type {} from "@ym/map-tools/minemap";

export const MINEMAP_CDN_MAIN = "https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js";
export const MINEMAP_CSS = "https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css";
const MINEMAP_INIT_TIMEOUT_MS = 15_000;

/**
 * 系统级 minemap key（由部署方统一提供）。
 * TODO: 在此填入真实 key；为空时 createMinemapMap 快速失败，
 * 由调用方展示「系统 key 未配置」提示。
 */
export const SYSTEM_MINEMAP_KEY = "52c2a1dac4e04498bb9d32cb830f29a4";

let loadingPromise: Promise<typeof minemap> | null = null;
let configuredKey: string | null = null;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-minemap-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.dataset.minemapSrc = src;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      script.remove();
      reject(new Error(`minemap 脚本加载失败: ${src}`));
    });
    document.head.appendChild(script);
  });
}

function injectCss(href: string) {
  const existing = document.querySelector<HTMLLinkElement>(`link[data-minemap-css="${href}"]`);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.minemapCss = href;
  document.head.appendChild(link);
}

/**
 * 动态加载 minemap SDK（promise 化）。私有部署单源加载，
 * 失败时 reject，由调用方渲染错误面板，不抛未捕获异常。
 */
export function loadMinemap(): Promise<typeof minemap> {
  if (window.minemap) {
    return Promise.resolve(window.minemap);
  }
  if (!loadingPromise) {
    injectCss(MINEMAP_CSS);
    loadingPromise = injectScript(MINEMAP_CDN_MAIN)
      .then(() => getLoadedMinemap())
      .catch((error: unknown) => {
        loadingPromise = null;
        throw new Error(
          `minemap SDK 加载失败（${MINEMAP_CDN_MAIN}），请检查网络。${
            error instanceof Error ? ` ${error.message}` : ` ${String(error)}`
          }`,
        );
      });
  }
  return loadingPromise;
}

/**
 * 初始化 minemap 全局配置（domainUrl / spriteUrl / serviceUrl / key / solution），
 * 依据私有部署环境与示例中心约定。
 */
export function setupMinemapGlobals(key: string): typeof minemap {
  const m = window.minemap;
  if (!m) throw new Error("minemap SDK 尚未加载");
  if (configuredKey && configuredKey !== key) {
    throw new Error("minemap 全局配置已初始化为其他 key");
  }
  if (configuredKey === key) return m;
  m.domainUrl = "https://gmap.cqphx.cn:4443";
  m.dataDomainUrl = "https://gmap.cqphx.cn:4443";
  m.serverDomainUrl = "https://gmap.cqphx.cn:4443";
  m.spriteUrl = "https://gmap.cqphx.cn:4443/minemapapi/v3.3.0/sprite/sprite";
  m.serviceUrl = "https://gmap.cqphx.cn:4443/service";
  m.key = key;
  m.solution = 222_609;
  configuredKey = key;
  return m;
}

export type MinemapRuntimeErrorCode =
  | "SDK_SCRIPT_LOAD_FAILED"
  | "SDK_GLOBAL_MISSING"
  | "MAP_CONSTRUCTOR_FAILED"
  | "MAP_LOAD_TIMEOUT"
  | "MAP_STYLE_ERROR"
  | "MAP_RUNTIME_ERROR";

export interface MinemapMapHandle {
  map: minemap.Map | null;
  host: HTMLElement;
  ready: Promise<minemap.Map>;
  dispose(): void;
}

export function createMinemapMapHandle(
  container: HTMLElement,
  key: string = SYSTEM_MINEMAP_KEY,
  extra: Record<string, unknown> = {},
  onCreated?: (map: minemap.Map) => void,
): MinemapMapHandle {
  const host = document.createElement("div");
  host.id = `minemap-${Math.random().toString(36).slice(2)}`;
  host.style.cssText = "width:100%;height:100%;position:relative;";
  container.appendChild(host);
  let map: minemap.Map | null = null;
  let settled = false;
  let disposed = false;
  let timeoutId: number | null = null;
  let detach: (() => void) | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    timeoutId = null;
    detach?.();
    try {
      map?.remove();
    } catch {
      /* SDK cleanup is best effort. */
    }
    map = null;
    host.remove();
  };
  const ready = loadMinemap()
    .then(
      (m) =>
        new Promise<minemap.Map>((resolve, reject) => {
          if (disposed) return reject(new Error("地图实例已释放"));
          try {
            setupMinemapGlobals(key);
          } catch (error) {
            reject(error);
            return;
          }
          const fail = (error: unknown) => {
            if (settled) return;
            settled = true;
            detach?.();
            dispose();
            reject(error instanceof Error ? error : new Error(String(error)));
          };
          const onLoad = () => {
            if (settled || disposed) return;
            settled = true;
            if (timeoutId !== null) window.clearTimeout(timeoutId);
            timeoutId = null;
            detach?.();
            resolve(map as minemap.Map);
          };
          const onError = (event: minemap.MapEventMap["error"]) => {
            if (isToleratedStyleError(event)) return;
            fail(new Error(`底图加载失败: ${event.error ? String(event.error) : String(event)}`));
          };
          try {
            map = new m.Map({
              container: host.id,
              preserveDrawingBuffer: true,
              style:
                "https://gmap.cqphx.cn:4443/tianjing-server/mapdata-api/services/MapStyleServer/minemap-style/c8d13ba4fa374f16a60c7951be85fd03/styleJSON?key=d29c4baf318e48cf8d214b03a36b6cf2",
              center: [106.55, 29.56],
              zoom: 10,
              maxZoom: 16,
              minZoom: 9,
              projection: "MERCATOR",
              logoControl: false,
              doubleClickZoom: false,
              ...extra,
            });
            map.on("load", onLoad);
            map.on("error", onError);
            detach = () => {
              map?.off("load", onLoad);
              map?.off("error", onError);
            };
            timeoutId = window.setTimeout(
              () => fail(new Error(`地图加载超时（${MINEMAP_INIT_TIMEOUT_MS}ms）`)),
              MINEMAP_INIT_TIMEOUT_MS,
            );
            onCreated?.(map);
          } catch (error) {
            fail(new Error(`minemap.Map 创建失败: ${getErrorMessage(error)}`));
          }
        }),
    )
    .catch((error) => {
      dispose();
      throw error;
    });
  return {
    get map() {
      return map;
    },
    host,
    ready,
    dispose,
  };
}

/** 创建 minemap 地图实例，等待 load 事件后 resolve；key 缺省使用系统 key */
export function createMinemapMap(
  container: HTMLElement,
  key: string = SYSTEM_MINEMAP_KEY,
  extra: Record<string, unknown> = {},
  onCreated?: (map: minemap.Map) => void,
): Promise<minemap.Map> {
  if (!key) {
    return Promise.reject(
      new Error("系统 key 未配置：请在 loadMinemap.ts 的 SYSTEM_MINEMAP_KEY 中填入 minemap key"),
    );
  }
  const handle = createMinemapMapHandle(container, key, extra, onCreated);
  return handle.ready.then((map) => map);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 逐图层样式错误白名单：styleJSON 引用了矢量服务中不存在的 source-layer 时，
 * minemap 仅跳过该图层、不中断整体渲染（实测 load 仍触发、其余图层正常出图），
 * 故此类错误不计为初始化失败。服务端修复 styleJSON（补齐 / 移除 gis_geo_motorway
 * 引用）后可移除此项。
 */
const TOLERATED_STYLE_ERRORS = [/Source layer "gis_geo_motorway" does not exist/];

function isToleratedStyleError(e: minemap.MapEventMap["error"]): boolean {
  const text = String(e.error ?? e);
  return TOLERATED_STYLE_ERRORS.some((re) => re.test(text));
}

function getLoadedMinemap(): typeof minemap {
  if (!window.minemap) {
    throw new Error("minemap SDK 未暴露 window.minemap");
  }
  return window.minemap;
}
