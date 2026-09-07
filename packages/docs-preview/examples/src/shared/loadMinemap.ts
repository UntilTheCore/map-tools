/**
 * minemap SDK 动态加载器。
 *
 * - 无 npm 包，通过 CDN 动态注入 <script> 加载
 * - 私有部署单源（已实测 200）：https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js
 * - 示例默认参数：solution 222609、center [106.55, 29.56]（重庆）、
 *   私有 MapStyleServer styleJSON（key 内嵌于 URL，见 createMinemapMap）
 *
 * token 获取顺序：URL ?token= -> localStorage MINEMAP_TOKEN
 */
import type {} from "@ym/map-tools/minemap";

export const MINEMAP_CDN_MAIN = "https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js";
export const MINEMAP_CSS = "https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css";

export const TOKEN_STORAGE_KEY = "MINEMAP_TOKEN";

/** 读取 token：URL ?token= 优先，其次 localStorage（并回写） */
export function resolveToken(): string | null {
  const fromUrl = new URLSearchParams(window.location.search).get("token");
  if (fromUrl) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, fromUrl);
    } catch {
      /* ignore */
    }
    return fromUrl;
  }
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
}

let loadingPromise: Promise<typeof minemap> | null = null;

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
export function setupMinemapGlobals(token: string): typeof minemap {
  const m = window.minemap;
  if (!m) throw new Error("minemap SDK 尚未加载");
  m.domainUrl = "https://gmap.cqphx.cn:4443";
  m.dataDomainUrl = "https://gmap.cqphx.cn:4443";
  m.serverDomainUrl = "https://gmap.cqphx.cn:4443";
  m.spriteUrl = "https://gmap.cqphx.cn:4443/minemapapi/v3.3.0/sprite/sprite";
  m.serviceUrl = "https://gmap.cqphx.cn:4443/service";
  m.key = token;
  m.solution = 222_609;
  return m;
}

/** 创建 minemap 地图实例，等待 load 事件后 resolve */
export function createMinemapMap(
  container: HTMLElement,
  token: string,
  extra: Record<string, unknown> = {},
  onCreated?: (map: minemap.Map) => void,
): Promise<minemap.Map> {
  return loadMinemap().then(
    (m) =>
      new Promise<minemap.Map>((resolve, reject) => {
        setupMinemapGlobals(token);
        const containerId = `minemap-${Math.random().toString(36).slice(2)}`;
        const host = document.createElement("div");
        host.id = containerId;
        host.style.cssText = "width:100%;height:100%;position:relative;";
        container.appendChild(host);
        let map: minemap.Map | null = null;
        try {
          map = new m.Map({
            container: containerId,
            preserveDrawingBuffer: true, //截图地图底图必须要这样设置
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
        } catch (error: unknown) {
          reject(new Error(`minemap.Map 创建失败: ${getErrorMessage(error)}`));
          return;
        }
        try {
          onCreated?.(map);
        } catch (error: unknown) {
          map.remove();
          reject(new Error(`minemap.Map 初始化回调失败: ${getErrorMessage(error)}`));
          return;
        }
        let settled = false;
        const onLoad = () => {
          if (settled) return;
          settled = true;
          resolve(map as minemap.Map);
        };
        const onError = (e: minemap.MapEventMap["error"]) => {
          if (settled) return;
          settled = true;
          reject(
            new Error(
              `底图加载失败（token 无效或无权限）: ${e.error ? String(e.error) : String(e)}`,
            ),
          );
        };
        map.on("load", onLoad);
        map.on("error", onError);
      }),
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getLoadedMinemap(): typeof minemap {
  if (!window.minemap) {
    throw new Error("minemap SDK 未暴露 window.minemap");
  }
  return window.minemap;
}
