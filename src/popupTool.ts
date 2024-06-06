import type { Component } from 'vue'
import { createApp } from 'vue';

type Props = {
  [name: string]: any;
}

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
export function getPopupDom(component: Component, props?: Props) {
  // 创建一个Vue应用程序，并将组件和其属性传入，以初始化组件实例。
  const _component = createApp(component, props);
  // 创建一个div元素作为组件的挂载目标。
  const divWrap = document.createElement('div');
  // 将组件实例挂载到div元素上，并返回挂载后的组件根元素。
  return _component.mount(divWrap).$el;
}
