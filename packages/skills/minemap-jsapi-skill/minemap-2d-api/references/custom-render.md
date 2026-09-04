# 自定义渲染 — CustomLayerInterface / StyleImageInterface / 工具函数

## CustomLayerInterface 自定义样式图层

自定义图层允许用户用地图摄像机直接渲染到 WebGL 上下文，通过 `map.addLayer({...})` 添加，`type` 必须为 `'custom'`。

接口字段：

| 字段/成员               | 说明                                  |
| ----------------------- | ------------------------------------- |
| `id`                    | 唯一图层 id                           |
| `type`                  | 必须 `'custom'`                       |
| `renderingMode`         | `'2d'` 或 `'3d'`，默认 `'2d'`         |
| `onAdd(map, gl)`        | 图层首次添加时调用，初始化 WebGL 资源 |
| `onRemove(map, gl)`     | 图层移除时调用，清理资源              |
| `render(gl, matrix)`    | 每帧渲染调用                          |
| `prerender(gl, matrix)` | 在渲染前调用（可选）                  |

`gl` 是地图的 `WebGLRenderingContext`；`matrix` 是摄像机矩阵，将球形 mercator 坐标映射为 gl 坐标（`[0,0]` 为 mercator 世界左上角，`[1,1]` 为右下角）。

```js
// 自定义层实现为 ES6 类
class NullIslandLayer {
  constructor() {
    this.id = "null-island";
    this.type = "custom";
    this.renderingMode = "2d";
  }
  onAdd(map, gl) {
    /* 初始化 buffer 等 */
  }
  onRemove(map, gl) {
    /* 清理 */
  }
  render(gl, matrix) {
    /* 每帧绘制 */
  }
}
map.addLayer(new NullIslandLayer().id); // 实际按 layer 对象添加
// 通常：map.addLayer({id, type:'custom', renderingMode, onAdd, onRemove, render})
```

通常以普通对象/类实例的 `onAdd`/`render` 方法直接传给 `map.addLayer` 的 layer 对象。

## StyleImageInterface 动态样式图像

实现该接口的图像可每帧重绘，用于动画图标和 patterns：

| 字段/成员    | 说明                                        |
| ------------ | ------------------------------------------- |
| `width`      | 图像宽度                                    |
| `height`     | 图像高度                                    |
| `data`       | 像素数据 `Uint8Array` / `Uint8ClampedArray` |
| `render()`   | 每帧重绘，返回是否已更新                    |
| `onAdd(map)` | 添加到地图时调用                            |
| `onRemove()` | 移除时调用                                  |

```js
var flashingSquare = {
  width: 64,
  height: 64,
  data: new Uint8Array(64 * 64 * 4),
  onAdd(map) {},
  render() {
    // 更新 data
    return true;
  },
  onRemove() {},
};
map.addImage("flashing-square", flashingSquare);
```

## 文档尾部工具函数

以下为文档附带的底层工具函数，一般仅在深入源码或特殊场景使用：

| 函数                                       | 说明                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `intersectX(a, b, x)`                      | x 坐标 intersect                                                                      |
| `intersectY(a, b, y)`                      | y 坐标 intersect                                                                      |
| `format`                                   | 雪碧图解析逻辑（解析 style 中 sprite 地址、读取 `minemap.spriteUrl`、去重、请求解析） |
| `normalizeStyleSpriteUrl(options)`         | 解析 style 中的 sprite 地址                                                           |
| `normalizeImageSourceUrl(url)`             | 解析 image source 的 url 链接                                                         |
| `splice(arr, starting, deleteCount)`       | 类数组 splice 兼容实现                                                                |
| `convertBytesforNew(bytes, num, charSize)` | 针对新瓦片数据加密方式的解密算法                                                      |

## 注意事项

- 自定义图层/图像用 WebGL 底层渲染，需自行管理缓冲区与资源，务必在 `onRemove` 中释放。
- `renderingMode` 用 `'3d'` 时才参与深度测试，适合立体效果。
- 文档中 `data` 通常为 4 字节/像素（RGBA）的 `Uint8Array`。
