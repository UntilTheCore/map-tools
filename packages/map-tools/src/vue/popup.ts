import { createApp, h } from "vue-demi";
import type { Component } from "vue-demi";
import {
  createPopupDom as createCorePopupDom,
  type PopupDomHandle,
} from "../core/popup/dom";

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
