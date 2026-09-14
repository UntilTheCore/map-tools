/**
 * 轨迹回放（Vue 2.7 + @ym/map-tools/track core API）。
 * 关键点：
 * 1. vue2 子路径的 useTrackPlayer 需要 map Ref 就绪,示例直接用 track core 裸 API,
 *    与框架组合式写法等价,演示「库不挑框架」;
 * 2. 控制走 player.play/pause/stop/seekFraction,进度用 on("progress") 手动落 data;
 * 3. beforeDestroy 必须 player.destroy()(先于地图释放)。
 */
import Vue from "vue2";
import { createTrackPlayer, type TrackPlayerHandle } from "@ym/map-tools/track";
import { createMinemapMapHandle } from "../shared/loadMinemap";
import { styleHost, type RenderOptions } from "../shared/demo";
import { TRACK_A, BUS_ICON, START_ICON, END_ICON } from "../shared/trackData";

const btnStyle =
  "padding:4px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(8,14,12,.86);color:#e6fff2;cursor:pointer;margin-right:8px;";

const Demo = Vue.extend({
  data() {
    return {
      status: "等待挂载（mounted 中创建地图）",
      percent: "0.0",
      km: "0.00",
      player: undefined as TrackPlayerHandle | undefined,
      teardown: undefined as (() => void) | undefined,
    };
  },
  mounted() {
    let disposed = false;
    const handle = createMinemapMapHandle(this.$refs.host as HTMLElement);
    this.teardown = () => {
      disposed = true;
      this.player?.destroy();
      handle.dispose();
    };
    handle.ready
      .then((map) => {
        if (disposed) return;
        this.status = "地图就绪，自动起播";
        const player = createTrackPlayer(map, {
          points: TRACK_A.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
          icon: BUS_ICON,
          bearingCompensation: 0, // 示例图标朝上
          speed: 60,
          trail: { color: "#1F6BFE", width: 4 },
          startEndMarkers: true,
          startIcon: START_ICON,
          endIcon: END_ICON,
        });
        player.on("progress", (progress) => {
          this.percent = (progress.fraction * 100).toFixed(1);
          this.km = (progress.distanceMeters / 1000).toFixed(2);
        });
        player.on("error", (payload) => {
          this.status = `数据告警 [${payload.code}]`;
        });
        this.player = player;
        player.play();
      })
      .catch((error: unknown) => {
        if (!disposed)
          this.status = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
      });
  },
  beforeDestroy() {
    this.teardown?.();
  },
  methods: {
    play() {
      this.player?.play();
    },
    pause() {
      this.player?.pause();
    },
    stop() {
      this.player?.stop();
      this.percent = "0.0";
      this.km = "0.00";
    },
    slow() {
      this.player?.setSpeed(20);
    },
    normal() {
      this.player?.setSpeed(60);
    },
    fast() {
      this.player?.setSpeed(150);
    },
    seek(event: Event) {
      this.player?.seekFraction(Number((event.target as HTMLInputElement).value) / 1000);
    },
  },
  render(h) {
    return h("div", { style: "position:relative;width:100%;height:100%;" }, [
      h("div", { ref: "host", style: "position:absolute;inset:0;" }),
      h(
        "div",
        {
          style:
            "position:absolute;top:12px;left:12px;z-index:30;display:flex;align-items:center;flex-wrap:wrap;",
        },
        [
          h("button", { style: btnStyle, on: { click: this.play } }, "播放"),
          h("button", { style: btnStyle, on: { click: this.pause } }, "暂停"),
          h("button", { style: btnStyle, on: { click: this.stop } }, "停止"),
          h("button", { style: btnStyle, on: { click: this.slow } }, "慢"),
          h("button", { style: btnStyle, on: { click: this.normal } }, "正常"),
          h("button", { style: btnStyle, on: { click: this.fast } }, "快"),
          h("input", {
            style: "width:180px;",
            domProps: {
              type: "range",
              min: 0,
              max: 1000,
              value: Math.round(Number(this.percent) * 10),
            },
            on: { input: this.seek },
          }),
        ],
      ),
      h(
        "div",
        {
          style:
            "position:absolute;left:12px;bottom:12px;z-index:30;padding:6px 10px;border-radius:6px;font-size:12px;background:rgba(8,14,12,.86);color:#b9f6d5;font-family:ui-monospace,Consolas,monospace;",
        },
        `${this.status} ｜ ${this.km} km ｜ ${this.percent}%`,
      ),
    ]);
  },
});

export default function render(container: HTMLElement, _options: RenderOptions): () => void {
  styleHost(container);
  const vm = new Vue({
    render: (h) => h(Demo),
  }).$mount();
  container.appendChild(vm.$el);
  return () => {
    vm.$destroy();
    container.innerHTML = "";
  };
}
