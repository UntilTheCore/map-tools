# popupTool（弹窗）

来源：`packages/map-tools/src/core/popupTool.ts`；框架适配：`src/vue/popup.ts`、`src/react/popup.ts`

## getPopupDom（核心版）

创建弹窗内容容器 DOM（不依赖任何框架）。

```ts
function getPopupDom(
  content: any,
  opts?: PopupOptions,
  mount?: PopupMountFn
): HTMLElement
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| content | `any` | 弹窗内容：纯 DOM 模式下支持 `string` 或 `HTMLElement`；提供 `mount` 时可为任意框架组件/元素 |
| opts | `PopupOptions` | 挂载选项（如组件 props，由适配器解释） |
| mount | `PopupMountFn` | 可选挂载函数，缺省时走纯 DOM 实现 |

- **返回值**：承载内容的容器 `HTMLElement`，可直接交给 `minemap.Popup.setDOMContent`。
- **纯 DOM 模式**：
  - `string` → `container.innerHTML = content`；
  - `HTMLElement` → `container.appendChild(content)`；
  - 其他类型 → 打印警告。

### 相关类型

```ts
type PopupOptions = { [name: string]: any };

type PopupMountFn = (
  container: HTMLElement,
  content: any,
  opts?: PopupOptions
) => void;
```

## getPopupDom（框架版）

### Vue 3 / Vue 2（`@ym/map-tools/vue3` / `@ym/map-tools/vue2`）

```ts
function getPopupDom(
  component: Component,
  opts?: PopupOptions
): HTMLElement
```

- `component`：Vue 渲染函数组件（Vue 3 传 `render()` 组件选项，Vue 2 传 `render(h)` 组件选项）。
- 内部通过适配器将组件挂载到容器（独立 Vue 实例），返回容器 DOM。

```ts
import { getPopupDom } from "@ym/map-tools/vue3";
import { h } from "vue";

const PopupContent = {
  props: { title: String },
  render() {
    return h("div", { style: { padding: "8px 12px" } }, [h("strong", null, this.title)]);
  },
};

const dom = getPopupDom(PopupContent, { title: "弹窗标题" });
```

### React（`@ym/map-tools/react`）

```ts
function getPopupDom(
  element: ReactElement,
  opts?: PopupOptions
): HTMLElement
```

- `element`：React 元素（JSX 或 `createElement` 产物）。
- 内部使用 `createRoot(container).render(element)` 挂载，返回容器 DOM。

```tsx
import { getPopupDom } from "@ym/map-tools/react";

const dom = getPopupDom(<PopupContent title="弹窗标题" lngLat={e.lngLat} />);
```

## 完整示例（结合 minemap.Popup）

```ts
map.on("click", (e: any) => {
  const dom = getPopupDom(content, opts); // 核心 / 框架版均可
  const popup = new minemap.Popup({
    closeOnClick: false,
    closeButton: true,
    offset: [0, -10],
  });
  popup
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setDOMContent(dom)
    .addTo(map);
});
```

## 注意事项

- `getPopupDom` 只负责创建并挂载内容 DOM，Popup 的创建、定位、移除仍由 `minemap.Popup` 完成。
- 批量关闭 Popup 可配合 [removeMarkersOrPopups](/api/mapTool#removemarkersorpopups)。
