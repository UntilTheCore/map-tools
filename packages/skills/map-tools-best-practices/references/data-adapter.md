# 数据层：类型化 FeatureCollection + 入口适配器

对应页面目录 `map/data/vehicleAdapter.ts`——后端原始行 → 类型化 FeatureCollection 的**唯一脏数据入口**。

杜绝 `properties` 裸奔，从数据进地图的那一刻即固定。GeoJSON 类型泛型用 `geojson` 包，与 `@turf/turf` 同源；运行时对象一律用 turf 的辅助函数创建（`point` / `lineString` / `polygon` / `featureCollection` 等），不要手写 `{ type: "Point", coordinates: [...] }` 这类字面量——辅助函数对类型字段和参数顺序都有约束，写错直接编译报错：

```ts
// map/data/vehicleAdapter.ts
import { featureCollection, point } from "@turf/turf";
import type { Feature, FeatureCollection, Point } from "geojson";

/** 状态等级：阈值判断唯一来源在 layer/common.ts 的 getScoreLevel */
export type VehicleProps = {
  vehicleId: string; // 统一 string，归一在适配器完成
  plateNo: string;
  fleetId: number;
  status: "safe" | "normal" | "warning" | "danger";
  lng: number;
  lat: number;
};
export type VehicleFeature = Feature<Point, VehicleProps>;
export type VehicleFC = FeatureCollection<Point, VehicleProps>;

/** 后端结构（字段混乱）只允许出现在这个函数签名里 */
export interface RawVehicleRow {
  id: number | string;
  plate_no?: string;
  plateNo?: string;
  fleet_id: number;
  status: number; // 数字码
  lng?: string; // 经度字段两道兜底，都在适配器完成
  lon?: string;
  lat: string;
  [k: string]: unknown;
}

export function toVehicleFC(rows: RawVehicleRow[]): VehicleFC {
  return featureCollection(
    rows.map((r) => {
      const lng = Number(r.lng ?? r.lon ?? "");
      const lat = Number(r.lat ?? "");
      return point(
        [lng, lat],
        {
          vehicleId: String(r.id),
          plateNo: r.plateNo ?? r.plate_no ?? "",
          fleetId: r.fleet_id,
          status: codeToLevel(r.status),
          lng,
          lat,
        },
        { id: String(r.id) }, // feature.id 归一
      );
    }),
  );
}
```

这样做的好处：`layer/` 的表达式属性、`scene` 的 filter 字段、事件的 `features[0].properties` 全部编译期对齐；"字段混用"从规范问题变成编译错误。后端原始结构只从 `toVehicleFC` 这一道门进入，其余任何地方只见 `VehicleProps`。

注意兜底必须**用尽声明的字段**——声明了 `lon` 却从不读取，等于给下个读代码的人埋"这是不是没用？"的疑问。
