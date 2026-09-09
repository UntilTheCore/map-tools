/**
 * 示例注册表：id -> 元信息。
 * 四个语言变体的实现在 src/{vue3,vue2,react,html}/{id}.{ts,tsx}，
 * 统一导出 render(container, options) => 清理函数。
 */
export interface ExampleMeta {
  title: string;
  description: string;
  /** 涉及的 API 关键词，用于列表展示 */
  apis: string[];
}

export const registry: Record<string, ExampleMeta> = {
  "map-init": {
    title: "地图初始化",
    description:
      '加载 minemap SDK 并创建地图实例，展示各框架持有地图实例的生命周期写法：Vue 3 以 SFC + useMap（mapLifecycle owned 自动销毁、on("loaded") 统一事件）演示，Vue 2.7 / React / 原生脚本对应各自生命周期。编辑器中的代码可直接修改并手动运行预览。',
    apis: ["createMinemapMap", "useMap", "onMounted", "useEffect"],
  },
};

export const DEFAULT_EXAMPLE = "map-init";

export function getExampleMeta(id: string): ExampleMeta {
  return registry[id] ?? registry[DEFAULT_EXAMPLE];
}
