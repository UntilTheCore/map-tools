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
  "track-playback": {
    title: "轨迹回放",
    description:
      "createTrackPlayer / useTrackPlayer 单车轨迹回放：GPS 采点按时间戳投影（realtime 模式，speed 为倍率），前缀里程二分 + 段内插值驱动逐帧定位与朝向，trail 已走过轨迹渐显、起终点 marker、进度条 seek 与倍率切换。数据内嵌示例（重庆公交风格轨迹，epoch 毫秒时间戳），无需后端接口。",
    apis: ["createTrackPlayer", "useTrackPlayer", "play", "seekFraction", "setSpeed"],
  },
  "track-fleet": {
    title: "多车同步回放",
    description:
      "createTrackFleet 多车同步：共享时钟 + fleet.clock 成员编排，三条不等长轨迹同一时间轴推进；短轨迹成员先 arrive 仅个体冻结、其余继续，轴走完时钟自动停。演示「成员先 play 进入跟随、fleet.play 驱动时钟」的标准起播顺序与 remove→destroy 清理链。",
    apis: ["createTrackFleet", "fleet.clock", "add", "seekFraction", "arrive"],
  },
};

export const DEFAULT_EXAMPLE = "map-init";

export function getExampleMeta(id: string): ExampleMeta {
  return registry[id] ?? registry[DEFAULT_EXAMPLE];
}
