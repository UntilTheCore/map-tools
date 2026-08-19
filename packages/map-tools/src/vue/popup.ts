import { createApp, h } from "vue-demi";
import type { Component } from "vue-demi";
import {
    getPopupDom as coreGetPopupDom,
    type PopupOptions,
} from "../core/popupTool";

/**
 * 创建并挂载一个弹出窗口组件(vue2 / vue3 通用,经 vue-demi 自动切换)。
 *
 * 组件使用渲染函数定义,禁止引入 .vue SFC 文件:
 * ```ts
 * const Comp = { props: {...}, render() { return h('div', ...) } }
 * const dom = getPopupDom(Comp, { someProp: 1 })
 * ```
 *
 * @param component 组件构造函数(渲染函数组件)
 * @param props 组件的 props 属性,用于向组件传递外部数据
 * @returns 返回挂载后组件的容器 DOM 元素
 */
export function getPopupDom(
    component: Component,
    props?: PopupOptions
): HTMLElement {
    return coreGetPopupDom(component, props, (container, comp, opts) => {
        // 用渲染函数包装,兼容 vue2.7 与 vue3
        createApp({
            render: () => h(comp, opts),
        }).mount(container);
    });
}
