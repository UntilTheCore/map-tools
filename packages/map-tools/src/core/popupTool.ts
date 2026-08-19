/**
 * popup 挂载注入模式(不依赖任何框架)。
 *
 * - 未提供 mount:走纯 DOM 实现。字符串内容直接 innerHTML 进容器;HTMLElement 直接 append 进容器。
 * - 提供 mount:由外部适配器(vue/react)负责将组件/元素挂载到容器。
 *
 * @security 纯 DOM 分支中 string 内容按 HTML 解析(innerHTML),存在 XSS 风险:
 * 传入不可信内容(如用户输入、外部接口返回值)前必须自行转义,或改用 HTMLElement 分支。
 * 框架适配器(提供 mount)走组件渲染,不受此影响。
 *
 * 框架适配器参见 src/vue/popup.ts 与 src/react/popup.ts。
 */

export type PopupOptions = {
    [name: string]: any;
};

/**
 * 挂载函数:将 content(框架组件/元素)挂载到 container 上。
 * @param container - 由 getPopupDom 创建的容器元素
 * @param content - 待挂载的内容(组件构造函数、React 元素等,由适配器解释)
 * @param opts - 透传给适配器的选项(如组件 props)
 */
export type PopupMountFn = (
    container: HTMLElement,
    content: any,
    opts?: PopupOptions
) => void;

/**
 * 创建并返回一个弹出窗口容器 DOM 元素。
 *
 * @param content 弹出内容。纯 DOM 模式下支持 string 或 HTMLElement;提供 mount 时可为任意框架组件/元素
 * @param opts 挂载选项(如组件 props)
 * @param mount 可选挂载函数,缺省时走纯 DOM 实现
 * @returns 返回承载内容的容器 DOM 元素
 *
 * @security 未提供 mount 且 content 为 string 时,内容按 HTML 解析(innerHTML),
 * 存在 XSS 风险:传入不可信内容前必须自行转义(或传入 HTMLElement / 使用 mount 适配器)。
 */
export function getPopupDom(
    content: any,
    opts?: PopupOptions,
    mount?: PopupMountFn
): HTMLElement {
    const container = document.createElement("div");

    if (mount) {
        mount(container, content, opts);
    } else if (typeof content === "string") {
        container.innerHTML = content;
    } else if (
        typeof HTMLElement !== "undefined" &&
        content instanceof HTMLElement
    ) {
        container.appendChild(content);
    } else if (content != null) {
        console.warn(
            "[map-tools] getPopupDom: 未提供 mount 时 content 仅支持 string 或 HTMLElement"
        );
    }

    return container;
}
