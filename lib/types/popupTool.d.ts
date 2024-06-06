import type { Component } from 'vue';
type Props = {
    [name: string]: any;
};
/**
 * 创建并挂载一个弹出窗口组件。
 *
 * 该函数通过传入组件类型和其属性，创建一个Vue组件实例，并将其挂载到一个新创建的DOM元素上。
 * 这个DOM元素作为一个弹出窗口的容器，可以在页面中显示这个弹出窗口组件。
 *
 * @param component 组件的构造函数，用于创建组件实例。
 * @param [props] 组件的props属性，用于向组件传递外部数据。
 * @returns 返回挂载后组件的根DOM元素。
 */
export declare function getPopupDom(component: Component, props?: Props): any;
export {};
