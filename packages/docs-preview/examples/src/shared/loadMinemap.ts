/**
 * minemap（元图科技 Minedata）SDK 动态加载器。
 *
 * - 无 npm 包，通过 CDN 动态注入 <script> 加载
 * - 主 CDN（已实测 200，v3.0.0）：https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js
 * - 备选 CDN（已实测 200，同内容）：https://minedata.cn/minemapapi/v3.0.0/minemap.js
 * - 任务候选 https://geoserver.minedata.cn/minemapapi/v3.0.0/minemap.js 实测不可达（fetch failed）
 *
 * token 获取顺序：URL ?token= -> localStorage MINEMAP_TOKEN
 */
import type {} from "@ym/map-tools/minemap";

export const MINEMAP_CDN_MAIN =
  "https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js";
export const MINEMAP_CDN_FALLBACK =
  "https://minedata.cn/minemapapi/v3.0.0/minemap.js";
export const MINEMAP_CSS =
  "https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.css";

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
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-minemap-src="${src}"]`
    );
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.dataset.minemapSrc = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`minemap 脚本加载失败: ${src}`));
    };
    document.head.appendChild(script);
  });
}

function injectCss(href: string) {
  const existing = document.querySelector<HTMLLinkElement>(
    `link[data-minemap-css="${href}"]`
  );
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.minemapCss = href;
  document.head.appendChild(link);
}

/**
 * 动态加载 minemap SDK（promise 化）。主 CDN 失败自动尝试备选 CDN，
 * 均失败时 reject，由调用方渲染错误面板，不抛未捕获异常。
 */
export function loadMinemap(): Promise<typeof minemap> {
  if (window.minemap) {
    return Promise.resolve(window.minemap);
  }
  if (!loadingPromise) {
    injectCss(MINEMAP_CSS);
    loadingPromise = injectScript(MINEMAP_CDN_MAIN)
      .then(() => getLoadedMinemap())
      .catch(() => {
        return injectScript(MINEMAP_CDN_FALLBACK).then(() => {
          if (!window.minemap) {
            throw new Error("minemap SDK 未暴露 window.minemap");
          }
          return window.minemap;
        });
      })
      .catch((err: unknown) => {
        loadingPromise = null;
        throw new Error(
          `minemap SDK 加载失败（${MINEMAP_CDN_MAIN} / ${MINEMAP_CDN_FALLBACK}），请检查网络。` +
            (err instanceof Error ? ` ${err.message}` : ` ${String(err)}`)
        );
      });
  }
  return loadingPromise;
}

/**
 * 初始化 minemap 全局配置（domainUrl / spriteUrl / serviceUrl / key / solution），
 * 依据官方 v3 文档与示例中心约定。
 */
export function setupMinemapGlobals(token: string): typeof minemap {
  const m = window.minemap;
  if (!m) throw new Error("minemap SDK 尚未加载");
  m.domainUrl = "https://minemap.minedata.cn";
  m.dataDomainUrl = "https://minemap.minedata.cn";
  m.serverDomainUrl = "https://sd-data.minedata.cn";
  m.spriteUrl = "https://minemap.minedata.cn/minemapapi/v3.0.0/sprite/sprite";
  m.serviceUrl = "https://service.minedata.cn/service";
  m.key = token;
  m.solution = 11003;
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
        const containerId = "minemap-" + Math.random().toString(36).slice(2);
        const host = document.createElement("div");
        host.id = containerId;
        host.style.cssText = "width:100%;height:100%;position:relative;";
        container.appendChild(host);
        let map: minemap.Map | null = null;
        try {
          map = new m.Map({
            container: containerId,
            preserveDrawingBuffer: true,
            style: "https://service.minedata.cn/map/solu/style/11003",
            center: [116.4026, 39.9494],
            zoom: 10,
            pitch: 0,
            maxZoom: 17,
            minZoom: 3,
            projection: "MERCATOR",
            logoControl: false,
            doubleClickZoom: true,
            ...extra,
          });
        } catch (e: unknown) {
          reject(new Error("minemap.Map 创建失败: " + getErrorMessage(e)));
          return;
        }
        try {
          onCreated?.(map);
        } catch (error: unknown) {
          map.remove();
          reject(new Error("minemap.Map 初始化回调失败: " + getErrorMessage(error)));
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
              "底图加载失败（token 无效或无权限）: " +
                (e.error ? String(e.error) : String(e))
            )
          );
        };
        map.on("load", onLoad);
        map.on("error", onError);
      })
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
