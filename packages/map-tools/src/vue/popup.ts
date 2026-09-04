// Vue 3 弹窗挂载：使用原生 createApp。Vue 2.7 由 src/vue2/popup.ts 单独适配。
import { createApp, h } from "vue";
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
    const app = createApp({
      render: () => h(currentComponent, currentProps),
    });
    app.mount(container);
    return () => app.unmount();
  });
}

export type { PopupDomHandle } from "../core/popup/dom";
