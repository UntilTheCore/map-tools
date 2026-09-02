import { createRoot } from "react-dom/client";
import type { ReactElement } from "react";
import {
  createPopupDom as createCorePopupDom,
  type PopupDomHandle,
} from "../core/popup/dom";

export function createPopupDom(
  element: ReactElement,
): PopupDomHandle {
  return createCorePopupDom(element, (container, content) => {
    const root = createRoot(container);
    root.render(content as ReactElement);
    return () => root.unmount();
  });
}

export type { PopupDomHandle } from "../core/popup/dom";
