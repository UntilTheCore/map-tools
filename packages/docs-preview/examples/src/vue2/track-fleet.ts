/**
 * 多车同步轨迹回放（Vue 2.7 + createTrackFleet core API）。
 * 关键点：
 * 1. createTrackFleet({ speed: 60 }) 自建共享时钟(60×),成员用 { clock: fleet.clock }
 *    创建并 add;成员不传 speed——injected 成员的 speed 是成员自身倍率,
 *    会与共享时钟倍率相乘(契约 1),导致车辆先跑完而全局进度几乎不动;
 * 2. 起播顺序:成员各自 play() 进入跟随态,fleet.play() 只驱动共享时钟;
 * 3. 「播放」按钮:手动冻结成员保持冻结,其余成员 play() 重新进入跟随态后 fleet.play();
 * 4. 清理链(契约 15-补 4):先 fleet.remove(player) 再 player.destroy(),
 *    最后 fleet.destroy()(自建时钟连删,契约 9)。
 */
import Vue from "vue2";
import { createTrackFleet, createTrackPlayer, type TrackPlayerHandle } from "@ym/map-tools/track";
import { createMinemapMapHandle } from "../shared/loadMinemap";
import { styleHost, type RenderOptions } from "../shared/demo";
import {
  TRACK_A,
  TRACK_B,
  TRACK_C,
  BUS_ICON,
  BUS_ICON_BLUE,
  BUS_ICON_GREEN,
} from "../shared/trackData";

const btnStyle =
  "padding:4px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(8,14,12,.86);color:#e6fff2;cursor:pointer;margin-right:8px;";

const Demo = Vue.extend({
  data() {
    return {
      status: "SDK 加载中，创建 minemap.Map…",
      percent: "0.0",
      fleet: undefined as ReturnType<typeof createTrackFleet> | undefined,
      players: [] as TrackPlayerHandle[],
      manualFrozen: new Set<TrackPlayerHandle>(),
      teardown: undefined as (() => void) | undefined,
    };
  },
  mounted() {
    let disposed = false;
    const handle = createMinemapMapHandle(this.$refs.host as HTMLElement);
    this.teardown = () => {
      disposed = true;
      // 契约 15-补 4:先退队再销毁成员;fleet.destroy 自建时钟连删(契约 9)
      this.players.forEach((player) => this.fleet?.remove(player));
      this.players.forEach((player) => player.destroy());
      this.fleet?.destroy();
      this.players = [];
      this.manualFrozen.clear();
      this.fleet = undefined;
      handle.dispose();
    };
    handle.ready
      .then((map) => {
        if (disposed) return;
        const fleet = createTrackFleet({ speed: 60 }); // 车队倍率 60×,成员不传 speed
        this.fleet = fleet;
        // 三车三图标三色:橙/蓝(真实素材)+ 绿(同风格 SVG),trail 颜色与车身一致
        const BUS_ICONS = [BUS_ICON, BUS_ICON_BLUE, BUS_ICON_GREEN];
        const TRAIL_COLORS = ["#E67E22", "#1F6BFE", "#0E9F6E"];
        this.players = [TRACK_A, TRACK_B, TRACK_C].map((track, index) => {
          const player = createTrackPlayer(map, {
            points: track.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
            icon: BUS_ICONS[index],
            bearingCompensation: 0,
            trail: { color: TRAIL_COLORS[index], width: 3 },
            clock: fleet.clock, // 成员必须挂 fleet 的共享时钟
            id: `bus-${index}`,
          });
          fleet.add(player);
          return player;
        });
        fleet.on("progress", ({ fraction }) => {
          this.percent = (fraction * 100).toFixed(1);
        });
        fleet.on("arrive", () => {
          this.status = "全队完成（时钟自动停）";
          this.percent = "100.0";
        });
        this.status = "三车同步回放中";
        // 起播顺序:成员先各自进入跟随态,fleet.play() 仅驱动时钟。
        this.players.forEach((player) => player.play());
        fleet.play();
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
      // 手动冻结的成员保持冻结(示范条件 B);其余成员重新进入跟随态后起时钟。
      this.players.forEach((player) => {
        if (!this.manualFrozen.has(player)) player.play();
      });
      this.fleet?.play();
    },
    pause() {
      this.fleet?.pause();
    },
    stop() {
      this.manualFrozen.clear();
      this.fleet?.stop();
      this.percent = "0.0";
    },
    freezeFirst() {
      if (this.players[0]) this.manualFrozen.add(this.players[0]);
      this.players[0]?.pause();
    },
    resumeFirst() {
      if (this.players[0]) this.manualFrozen.delete(this.players[0]);
      this.players[0]?.play();
    },
    seek(event: Event) {
      this.fleet?.seekFraction(Number((event.target as HTMLInputElement).value) / 1000);
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
          h("button", { style: btnStyle, on: { click: this.freezeFirst } }, "冻结橙车"),
          h("button", { style: btnStyle, on: { click: this.resumeFirst } }, "恢复橙车"),
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
        `${this.status} ｜ 全局进度 ${this.percent}%`,
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
