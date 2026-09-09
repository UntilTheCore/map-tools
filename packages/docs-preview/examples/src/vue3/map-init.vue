<!--
  地图初始化（Vue 3 SFC + useMap）：真实项目中推荐的组件写法。
  关键点：
  1. useMap({ mapLifecycle: "owned" }) 声明地图实例生命周期归 useMap 管：
     组件卸载（onUnmounted）时自动 map.remove() 并 unbindAll。
  2. 地图创建是异步的（等 SDK 加载 + load 事件），组件可能先于异步结果卸载，
     此时 setMap 不会发生、useMap 无法代为释放，必须手动 map.remove() 防泄漏。
  3. on("loaded") 绑定 useMap 统一事件（返回解绑函数；不手动调用时卸载自动清理）。
     注意事件绑定时序：load 是一次性事件，若等 createMinemapMap 的 Promise
     resolve（即 load 已触发）后再 setMap，on("loaded") 会永远错过。
     因此通过第 4 参 onCreated 在地图创建后、load 触发前交还实例并 setMap。
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMap } from "@ym/map-tools/vue3";
import { createMinemapMap } from "../shared/loadMinemap";

const hostRef = ref<HTMLDivElement | null>(null);
const status = ref("等待挂载（onMounted 中创建地图）");

// mapLifecycle: "owned" —— 组件卸载时由 useMap 自动 remove 地图并解绑事件
const { setMap, on } = useMap({ mapLifecycle: "owned" });

on("loaded", ({ map }) => {
  const center = map.getCenter();
  status.value = `地图已就绪（loaded） zoom=${map.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`;
});

onMounted(async () => {
  status.value = "SDK 加载中，创建 minemap.Map…";
  try {
    const map = await createMinemapMap(
      hostRef.value!,
      undefined,
      {},
      // onCreated：实例刚创建（load 尚未可能触发）即交还，提前 setMap 完成事件绑定，
      // 保证下面的 on("loaded") 能收到一次性 load 事件
      (created) => {
        if (hostRef.value) setMap(created);
      },
    );
    if (!hostRef.value) {
      map.remove(); // 组件已卸载：异步结果晚到，useMap 已不会接管，手动释放
      return;
    }
    setMap(map); // 同实例幂等，仅作兜底
  } catch (error) {
    status.value = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
  }
});
</script>

<template>
  <div style="position: relative; width: 100%; height: 100%">
    <div ref="hostRef" class="demo-map-host" style="position: absolute; inset: 0"></div>
    <div
      style="
        position: absolute;
        left: 12px;
        bottom: 12px;
        z-index: 30;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        background: rgba(8, 14, 12, 0.86);
        color: #b9f6d5;
        font-family: ui-monospace, Consolas, monospace;
      "
    >
      {{ status }}
    </div>
  </div>
</template>
