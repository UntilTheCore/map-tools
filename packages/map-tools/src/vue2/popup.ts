// Vue 2.7 弹窗挂载：Vue 2.7 无原生 createApp，此处用 new Vue() 适配，
// 对外保持与 src/vue/popup.ts（Vue 3 版）一致的 createPopupDom 签名。
//
// 关键差异：Vue 2 的 vm.$mount(el) 会「替换」el 而非写入其内部，而弹窗句柄
// 约定把渲染内容放进返回的 element 内（消费者调用 Popup.setDOMContent(element)）。
// 因此先无参 $mount() 渲染出 vm.$el，再 appendChild 进容器，销毁时 $destroy + 移除。
import Vue from "vue";
import type { Component } from "vue";
import { createPopupDom as createCorePopupDom, type PopupDomHandle } from "../core/popup/dom";

export function createPopupDom(
  component: Component,
  props?: Record<string, unknown>,
): PopupDomHandle {
  return createCorePopupDom({ component, props }, (container, payload) => {
    const { component: currentComponent, props: currentProps } = payload as {
      component: Component;
      props?: Record<string, unknown>;
    };
    // 开发态 vue 为 Vue 3 类型，运行态由消费者侧解析为 Vue 2.7（其默认导出为构造器）。
    const VueConstructor = Vue as unknown as new (options: unknown) => {
      $el: HTMLElement;
      $mount(): void;
      $destroy(): void;
    };
    const vm = new VueConstructor({
      render: (h: (component: unknown, data: unknown) => unknown) =>
        h(currentComponent, { props: currentProps }),
    });
    vm.$mount();
    container.appendChild(vm.$el);
    return () => {
      vm.$destroy();
      vm.$el.remove();
    };
  });
}

export type { PopupDomHandle } from "../core/popup/dom";
