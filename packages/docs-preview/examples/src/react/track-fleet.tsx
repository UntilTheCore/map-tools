/**
 * 多车同步轨迹回放（React 18 + createTrackFleet core API）。
 * 关键点：
 * 1. createTrackFleet({ speed: 60 }) 自建共享时钟(60×),成员用 { clock: fleet.clock }
 *    创建并 add;成员不传 speed——injected 成员的 speed 是成员自身倍率,
 *    会与共享时钟倍率相乘(契约 1),导致车辆先跑完而全局进度几乎不动;
 * 2. 起播顺序:成员各自 play() 进入跟随态,fleet.play() 只驱动共享时钟;
 * 3. 「播放」按钮:手动冻结成员保持冻结,其余成员 play() 重新进入跟随态后 fleet.play();
 * 4. 清理链(契约 15-补 4):先 fleet.remove(player) 再 player.destroy(),
 *    最后 fleet.destroy()(自建时钟连删,契约 9)。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { createTrackFleet, createTrackPlayer, type TrackPlayerHandle } from "@ym/map-tools/track";
import type { MapLike } from "@ym/map-tools/react";
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

function Demo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<ReturnType<typeof createTrackFleet> | null>(null);
  const playersRef = useRef<TrackPlayerHandle[]>([]);
  const manualFrozenRef = useRef<Set<TrackPlayerHandle>>(new Set());
  const [percent, setPercent] = useState("0.0");
  const [statusText, setStatusText] = useState("等待地图就绪…");
  const [initError, setInitError] = useState("");

  useEffect(() => {
    const handle = createMinemapMapHandle(hostRef.current!);
    let disposed = false;
    handle.ready
      .then((map) => {
        if (disposed) return;
        const fleet = createTrackFleet({ speed: 60 }); // 车队倍率 60×,成员不传 speed
        fleetRef.current = fleet;
        // 三车三图标三色:橙/蓝(真实素材)+ 绿(同风格 SVG),trail 颜色与车身一致
        const BUS_ICONS = [BUS_ICON, BUS_ICON_BLUE, BUS_ICON_GREEN];
        const TRAIL_COLORS = ["#E67E22", "#1F6BFE", "#0E9F6E"];
        playersRef.current = [TRACK_A, TRACK_B, TRACK_C].map((track, index) => {
          const player = createTrackPlayer(map as unknown as MapLike, {
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
        fleet.on("progress", ({ fraction }) => setPercent((fraction * 100).toFixed(1)));
        fleet.on("arrive", () => {
          setStatusText("全队完成（时钟自动停）");
          setPercent("100.0");
        });
        setStatusText("三车同步回放中");
        // 起播顺序:成员先各自进入跟随态,fleet.play() 仅驱动时钟。
        playersRef.current.forEach((player) => player.play());
        fleet.play();
      })
      .catch((error: unknown) => {
        if (!disposed) setInitError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      disposed = true;
      // 契约 15-补 4:先退队再销毁成员;fleet.destroy 自建时钟连删(契约 9)
      playersRef.current.forEach((player) => fleetRef.current?.remove(player));
      playersRef.current.forEach((player) => player.destroy());
      fleetRef.current?.destroy();
      playersRef.current = [];
      manualFrozenRef.current.clear();
      fleetRef.current = null;
      handle.dispose();
    };
  }, []);

  const btnStyle = {
    padding: "4px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(8,14,12,.86)",
    color: "#e6fff2",
    cursor: "pointer",
  } as const;

  function play() {
    // 手动冻结的成员保持冻结(示范条件 B);其余成员重新进入跟随态后起时钟。
    playersRef.current.forEach((player) => {
      if (!manualFrozenRef.current.has(player)) player.play();
    });
    fleetRef.current?.play();
  }
  function pause() {
    fleetRef.current?.pause();
  }
  function stop() {
    manualFrozenRef.current.clear();
    fleetRef.current?.stop();
    setPercent("0.0");
  }
  function freezeFirst() {
    if (playersRef.current[0]) manualFrozenRef.current.add(playersRef.current[0]);
    playersRef.current[0]?.pause();
  }
  function resumeFirst() {
    if (playersRef.current[0]) manualFrozenRef.current.delete(playersRef.current[0]);
    playersRef.current[0]?.play();
  }
  function seek(value: string) {
    fleetRef.current?.seekFraction(Number(value) / 1000);
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 30,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button style={btnStyle} onClick={play}>
          播放
        </button>
        <button style={btnStyle} onClick={pause}>
          暂停
        </button>
        <button style={btnStyle} onClick={stop}>
          停止
        </button>
        <button style={btnStyle} onClick={freezeFirst}>
          冻结橙车
        </button>
        <button style={btnStyle} onClick={resumeFirst}>
          恢复橙车
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(Number(percent) * 10)}
          style={{ width: 180 }}
          onChange={(e) => seek(e.target.value)}
        />
      </div>
      <div
        className="demo-status"
        style={{ position: "absolute", left: 12, bottom: 12, zIndex: 30 }}
      >
        {initError ? `初始化失败：${initError}` : `${statusText} ｜ 全局进度 ${percent}%`}
      </div>
    </div>
  );
}

export default function render(container: HTMLElement, _options: RenderOptions): () => void {
  styleHost(container);
  const root = createRoot(container);
  root.render(<Demo />);
  return () => root.unmount();
}
