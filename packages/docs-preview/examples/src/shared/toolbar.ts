/**
 * 示例页顶部工具条：展示当前示例名、token 状态、设置入口、回示例中心链接。
 * 纯 DOM 实现，四个入口页共用。
 */
import { resolveToken, saveToken } from "./loadMinemap";
import type { ExampleMeta } from "../registry";

export function createToolbar(
  host: HTMLElement,
  meta: ExampleMeta,
  variantLabel: string
) {
  host.style.cssText = [
    "height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;",
    "background:linear-gradient(180deg,#0d1a15,#0a1210);",
    "border-bottom:1px solid rgba(77,224,139,.25);",
    "color:#cdeee0;font-size:12px;",
    "font-family:ui-monospace,Consolas,monospace;",
  ].join("");

  const title = document.createElement("span");
  title.textContent = meta.title;
  title.style.cssText = "font-weight:700;color:#eafff5;font-size:13px;";

  const variant = document.createElement("span");
  variant.className = "demo-chip";
  variant.textContent = variantLabel;
  variant.style.cssText = [
    "padding:2px 8px;border-radius:999px;border:1px solid rgba(77,224,139,.4);",
    "color:#4de08b;font-size:11px;",
  ].join("");

  const tokenStatus = document.createElement("span");
  tokenStatus.className = "demo-chip";
  tokenStatus.style.cssText = [
    "padding:2px 8px;border-radius:999px;font-size:11px;",
    "border:1px solid rgba(255,255,255,.15);color:#8fb3a2;",
  ].join("");

  const spacer = document.createElement("span");
  spacer.style.cssText = "flex:1;";

  const setBtn = document.createElement("button");
  setBtn.type = "button";
  setBtn.className = "demo-btn demo-btn-sm";
  setBtn.textContent = "设置 token";
  setBtn.addEventListener("click", () => {
    const current = resolveToken();
    const input = window.prompt(
      "请输入 minemap token（写入 localStorage.MINEMAP_TOKEN）：",
      current ?? ""
    );
    if (input !== null && input.trim()) {
      saveToken(input.trim());
      window.location.reload();
    }
  });

  const back = document.createElement("a");
  back.textContent = "‹ 示例中心";
  back.href = "/examples-center/";
  back.style.cssText =
    "color:#4de08b;text-decoration:none;font-size:12px;";

  function updateTokenStatus() {
    const token = resolveToken();
    if (token) {
      tokenStatus.textContent = `token: ${token.slice(0, 6)}…${token.slice(-4)}`;
      tokenStatus.style.color = "#b9f6d5";
      tokenStatus.style.borderColor = "rgba(77,224,139,.4)";
    } else {
      tokenStatus.textContent = "token: 未配置";
      tokenStatus.style.color = "#ffb3a0";
      tokenStatus.style.borderColor = "rgba(255,107,53,.45)";
    }
  }
  updateTokenStatus();

  host.append(title, variant, tokenStatus, spacer, setBtn, back);
}
