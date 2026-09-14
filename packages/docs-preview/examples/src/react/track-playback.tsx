/**
 * 轨迹回放（React 18 + useTrackPlayer Hook）。
 * 关键点：
 * 1. useTrackPlayer(mapRef, options)——mapRef 是 MutableRefObject<MapLike|null>,
 *    ref 非空时才建 player,SDK 异步加载场景天然支持;
 * 2. 返回值即 React 状态(status/progress)与控制方法,直接渲染;
 * 3. 卸载时 Hook 自动 destroy(player);地图实例经 handle.dispose() 释放;
 * 4. play 的 from 是 fraction(0–1),倍率 setSpeed 不改变时间轴长度。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { useTrackPlayer } from "@ym/map-tools/react";
import type { MapLike } from "@ym/map-tools/react";
import { createMinemapMapHandle } from "../shared/loadMinemap";
import { styleHost, type RenderOptions } from "../shared/demo";
import { TRACK_A, BUS_ICON, START_ICON, END_ICON } from "../shared/trackData";

function Demo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLike | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    const handle = createMinemapMapHandle(hostRef.current!);
    let disposed = false;
    handle.ready
      .then((map) => {
        if (disposed) {
          handle.dispose();
          return;
        }
        mapRef.current = map as unknown as MapLike;
        setMapReady(true);
      })
      .catch((error: unknown) => {
        if (!disposed) setInitError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      disposed = true;
      handle.dispose();
    };
  }, []);

  // mapRef 未就绪时 Hook 不建 player;就绪后下一渲染自动懒建。
  void mapReady;
  void initError;
  const { status, progress, play, pause, stop, seekFraction, setSpeed } = useTrackPlayer(mapRef, {
    points: TRACK_A.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
    icon: BUS_ICON,
    bearingCompensation: 0, // 示例图标朝上
    speed: 60,
    trail: { color: "#1F6BFE", width: 4 },
    startEndMarkers: true,
    startIcon: START_ICON,
    endIcon: END_ICON,
  });

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (mapReady && !started) {
      setStarted(true);
      play(); // 默认自动起播一次
    }
  }, [mapReady, started, play]);

  const btnStyle = {
    padding: "4px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(8,14,12,.86)",
    color: "#e6fff2",
    cursor: "pointer",
  } as const;

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
        <button style={btnStyle} onClick={() => play()}>
          播放
        </button>
        <button style={btnStyle} onClick={pause}>
          暂停
        </button>
        <button style={btnStyle} onClick={stop}>
          停止
        </button>
        <button style={btnStyle} onClick={() => setSpeed(20)}>
          慢
        </button>
        <button style={btnStyle} onClick={() => setSpeed(60)}>
          正常
        </button>
        <button style={btnStyle} onClick={() => setSpeed(150)}>
          快
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round((progress?.fraction ?? 0) * 1000)}
          style={{ width: 180 }}
          onChange={(e) => seekFraction(Number(e.target.value) / 1000)}
        />
      </div>
      <div
        className="demo-status"
        style={{ position: "absolute", left: 12, bottom: 12, zIndex: 30 }}
      >
        {initError
          ? `初始化失败：${initError}`
          : `${status} ｜ ${((progress?.distanceMeters ?? 0) / 1000).toFixed(2)} km ｜ ${((progress?.fraction ?? 0) * 100).toFixed(1)}%`}
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
