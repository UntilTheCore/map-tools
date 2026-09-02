/**
 * 示例共享 UI 工具：无 token 占位面板、示例状态条、控制条、日志面板。
 * 纯 DOM 实现，不依赖任何框架，四个变体通用。
 */
import { resolveToken, saveToken, TOKEN_STORAGE_KEY } from "./loadMinemap";

export interface RenderOptions {
  token?: string;
}

export type ExampleRender = (container: HTMLElement, options: RenderOptions) => () => void;

export function styleHost(container: HTMLElement) {
  container.style.cssText =
    "position:relative;width:100%;height:100%;overflow:hidden;font-family:inherit;";
}

/** 创建一个承载地图的宿主元素 */
export function createMapHost(container: HTMLElement): HTMLElement {
  const host = document.createElement("div");
  host.className = "demo-map-host";
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  return host;
}

/** 在容器顶部渲染一个控制条（按钮组） */
export function createControlBar(container: HTMLElement): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "demo-control-bar";
  bar.style.cssText = [
    "position:absolute;top:12px;left:12px;z-index:30;display:flex;flex-wrap:wrap;gap:8px;",
    "max-width:calc(100% - 24px);",
  ].join("");
  container.appendChild(bar);
  return bar;
}

export function addButton(bar: HTMLElement, label: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "demo-btn";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  bar.appendChild(btn);
  return btn;
}

/** 状态条：展示一行可更新的状态信息 */
export function createStatusBar(container: HTMLElement): {
  el: HTMLElement;
  info: (msg: string) => void;
  error: (msg: string) => void;
} {
  const el = document.createElement("div");
  el.className = "demo-status";
  el.style.cssText = [
    "position:absolute;left:12px;bottom:12px;z-index:30;max-width:calc(100% - 24px);",
    "padding:6px 10px;border-radius:6px;font-size:12px;line-height:1.5;",
    "background:rgba(8,14,12,.86);color:#b9f6d5;border:1px solid rgba(77,224,139,.35);",
    "font-family:ui-monospace,Consolas,monospace;white-space:pre-wrap;word-break:break-all;",
  ].join("");
  container.appendChild(el);
  return {
    el,
    info(msg: string) {
      el.textContent = msg;
      el.style.color = "#b9f6d5";
      el.style.borderColor = "rgba(77,224,139,.35)";
    },
    error(msg: string) {
      el.textContent = msg;
      el.style.color = "#ffb3a0";
      el.style.borderColor = "rgba(255,107,53,.5)";
    },
  };
}

/** 右侧日志面板（用于事件类示例） */
export function createLogPanel(container: HTMLElement, title = "事件日志") {
  const panel = document.createElement("div");
  panel.style.cssText = [
    "position:absolute;right:12px;top:12px;bottom:12px;z-index:30;width:280px;",
    "display:flex;flex-direction:column;border-radius:8px;overflow:hidden;",
    "background:rgba(8,14,12,.9);border:1px solid rgba(77,224,139,.3);",
    "font-family:ui-monospace,Consolas,monospace;font-size:12px;color:#cdeee0;",
  ].join("");
  const head = document.createElement("div");
  head.textContent = title;
  head.style.cssText =
    "padding:8px 10px;border-bottom:1px solid rgba(77,224,139,.25);color:#4de08b;font-weight:600;";
  const body = document.createElement("div");
  body.style.cssText = "flex:1;overflow:auto;padding:8px 10px;line-height:1.6;";
  panel.appendChild(head);
  panel.appendChild(body);
  container.appendChild(panel);
  let count = 0;
  return {
    el: panel,
    log(msg: string) {
      count++;
      const line = document.createElement("div");
      line.textContent = `#${count} ${msg}`;
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    },
    clear() {
      count = 0;
      body.innerHTML = "";
    },
  };
}

/** 无 token 占位面板：不初始化地图，提供设置入口 */
export function renderNoTokenPanel(container: HTMLElement, title: string) {
  styleHost(container);
  const panel = document.createElement("div");
  panel.style.cssText = [
    "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;",
    "background:radial-gradient(1200px 600px at 50% 0%, rgba(77,224,139,.08), transparent), #0a1210;",
    "color:#cdeee0;text-align:center;padding:24px;",
  ].join("");
  const badge = document.createElement("div");
  badge.textContent = title;
  badge.style.cssText =
    "font-size:13px;letter-spacing:.12em;color:#4de08b;text-transform:uppercase;";
  const h = document.createElement("div");
  h.textContent = "未配置 minemap token";
  h.style.cssText = "font-size:20px;font-weight:700;color:#eafff5;";
  const p = document.createElement("div");
  p.textContent =
    "配置 token 后可见真实地图效果。请通过示例 URL 追加 ?token=xxx 或点击下方按钮设置。";
  p.style.cssText = "max-width:520px;font-size:13px;line-height:1.7;color:#9fc7b4;";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "demo-btn";
  btn.textContent = "设置 token";
  btn.addEventListener("click", () => {
    const current = resolveToken();
    const input = window.prompt(
      "请输入 minemap token（将写入 localStorage 的 MINEMAP_TOKEN）：",
      current ?? "",
    );
    if (input !== null && input.trim()) {
      saveToken(input.trim());
      window.location.reload();
    }
  });
  const hint = document.createElement("div");
  hint.textContent = `读取顺序：URL ?token= 参数 → localStorage.${TOKEN_STORAGE_KEY}`;
  hint.style.cssText = "font-size:11px;color:#5e8c77;font-family:ui-monospace,Consolas,monospace;";
  panel.append(badge, h, p, btn, hint);
  container.appendChild(panel);
  return () => {
    panel.remove();
  };
}

/** 渲染错误面板（SDK 加载失败 / 地图初始化失败） */
export function renderErrorPanel(container: HTMLElement, message: string, retry?: () => void) {
  styleHost(container);
  const panel = document.createElement("div");
  panel.style.cssText = [
    "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;",
    "background:#140d0a;color:#ffd9cd;text-align:center;padding:24px;",
  ].join("");
  const h = document.createElement("div");
  h.textContent = "地图初始化失败";
  h.style.cssText = "font-size:18px;font-weight:700;color:#ffb3a0;";
  const p = document.createElement("div");
  p.textContent = message;
  p.style.cssText = "max-width:560px;font-size:12px;line-height:1.7;";
  if (retry) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demo-btn";
    btn.textContent = "重试";
    btn.addEventListener("click", retry);
    panel.append(h, p, btn);
  } else {
    panel.append(h, p);
  }
  container.appendChild(panel);
  return () => panel.remove();
}
