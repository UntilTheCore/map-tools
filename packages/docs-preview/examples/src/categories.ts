/**
 * 示例分类树（Playground 左侧菜单数据）。
 *
 * 与 registry 的关系：分类只引用 registry 中已有的示例 id，不重复维护元信息；
 * 新示例先在 registry 注册 meta，再挂进对应分类。
 * 注意：旧示例 init（底图初始化与销毁）的职责已拆分为 map-init / map-destroy，
 * 全量改造吸收旧示例后再从 registry 移除。
 */
import { registry, type ExampleMeta } from "./registry";

export interface ExampleCategory {
  id: string;
  title: string;
  /** 该分类下的示例 id（按展示顺序） */
  examples: string[];
}

export const exampleCategories: ExampleCategory[] = [
  {
    id: "map",
    title: "地图",
    examples: ["map-init", "map-destroy", "map-state", "viewport-zoom"],
  },
  {
    id: "layers",
    title: "数据与图层",
    examples: ["layer-visibility", "pbf-layer"],
  },
  {
    id: "overlays",
    title: "覆盖物与弹窗",
    examples: ["marker-clean", "popup"],
  },
  {
    id: "framework",
    title: "框架接入",
    examples: ["use-map-events"],
  },
  {
    id: "geometry",
    title: "几何工具",
    examples: ["geo-tools"],
  },
];

export interface CategorizedExample {
  id: string;
  categoryId: string;
  categoryTitle: string;
  meta: ExampleMeta;
}

/** 展开分类树为平铺列表（保留分类信息），供菜单与路由回退使用 */
export function listCategorizedExamples(): CategorizedExample[] {
  const list: CategorizedExample[] = [];
  for (const category of exampleCategories) {
    for (const id of category.examples) {
      const meta = registry[id];
      if (!meta) continue;
      list.push({ id, categoryId: category.id, categoryTitle: category.title, meta });
    }
  }
  return list;
}

export const DEFAULT_PLAYGROUND_EXAMPLE = "map-init";

/** 按 id 查分类化示例；未知 id 回退到默认示例 */
export function getCategorizedExample(id: string | null): CategorizedExample {
  const list = listCategorizedExamples();
  const found = id ? list.find((item) => item.id === id) : undefined;
  return found ?? list[0];
}
