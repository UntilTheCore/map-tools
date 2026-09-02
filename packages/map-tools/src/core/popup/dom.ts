import { MapToolsError } from "../errors";

export type PopupContent =
  | { kind: "text"; value: string }
  | { kind: "html"; value: string }
  | { kind: "node"; value: Node };

export type PopupMountFn<C> = (
  container: HTMLElement,
  content: C,
) => void | (() => void);

export interface PopupDomHandle {
  element: HTMLElement;
  dispose(): void;
}

export function createPopupDom(content: PopupContent): PopupDomHandle;
export function createPopupDom<C>(
  content: C,
  mount: PopupMountFn<C>,
): PopupDomHandle;
export function createPopupDom(
  content: unknown,
  mount?: PopupMountFn<unknown>,
): PopupDomHandle {
  if (typeof document === "undefined") {
    throw new MapToolsError("DOM_UNAVAILABLE", "document is not available");
  }

  const element = document.createElement("div");
  let cleanup: (() => void) | undefined;
  if (mount) {
    const mounted = mount(element, content);
    cleanup = typeof mounted === "function" ? mounted : undefined;
  } else if (isPopupContent(content)) {
    if (content.kind === "text") {
      if (typeof content.value !== "string") {
        throw new MapToolsError("INVALID_ARGUMENT", "popup text content must be a string");
      }
      element.textContent = content.value;
    } else if (content.kind === "html") {
      if (typeof content.value !== "string") {
        throw new MapToolsError("INVALID_ARGUMENT", "popup html content must be a string");
      }
      element.innerHTML = content.value;
    } else {
      if (!(typeof Node !== "undefined" && content.value instanceof Node)) {
        throw new MapToolsError("INVALID_ARGUMENT", "popup node content is invalid");
      }
      element.appendChild(content.value);
    }
  } else {
    throw new MapToolsError(
      "INVALID_ARGUMENT",
      "popup content must be text, html, node, or be handled by mount",
    );
  }

  let disposed = false;
  return {
    element,
    dispose() {
      if (disposed) return;
      disposed = true;
      try {
        cleanup?.();
      } finally {
        element.replaceChildren();
      }
    },
  };
}

function isPopupContent(value: unknown): value is PopupContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { kind?: unknown };
  return candidate.kind === "text" || candidate.kind === "html" || candidate.kind === "node";
}
