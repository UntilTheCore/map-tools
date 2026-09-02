# Popup

核心 Popup API 返回明确的生命周期句柄：

```ts
const handle = createPopupDom({ kind: "text", value: "安全的文本内容" });

new minemap.Popup()
  .setLngLat([116.4, 39.9])
  .setDOMContent(handle.element)
  .addTo(map);

handle.dispose();
```

内容必须显式说明类型：

- `{ kind: "text", value }` 使用 `textContent`。
- `{ kind: "html", value }` 使用 `innerHTML`，调用方负责可信输入与安全处理。
- `{ kind: "node", value }` 接受已有 DOM Node。

Vue 与 React 子路径也导出同名 `createPopupDom`。它们把组件挂载到 `handle.element`，并在 `dispose()` 时执行 Vue `app.unmount()` 或 React `root.unmount()`。
