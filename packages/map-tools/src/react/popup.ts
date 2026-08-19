import { createRoot } from "react-dom/client";
import type { ReactElement } from "react";
import {
    getPopupDom as coreGetPopupDom,
    type PopupOptions,
} from "../core/popupTool";

/**
 * 创建并挂载一个弹出窗口 React 元素。
 *
 * @param element React 元素(JSX 或 createElement 产物)
 * @param opts 额外选项(当前未使用,保留扩展位)
 * @returns 返回挂载后元素的容器 DOM 元素
 */
export function getPopupDom(
    element: ReactElement,
    opts?: PopupOptions
): HTMLElement {
    return coreGetPopupDom(element, opts, (container, el) => {
        createRoot(container).render(el);
    });
}
