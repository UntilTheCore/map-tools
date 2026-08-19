/**
 * 示例：PBF 图层与要素读取（React 变体）
 * 核心 API：setPbfSourceData / checkSourceLoaded / getPbfFeatureListSync /
 *           getPbfFeatureListAsync / setPbfLayerViewport
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import {
  setPbfSourceData,
  checkSourceLoaded,
  getPbfFeatureListSync,
  getPbfFeatureListAsync,
  setPbfLayerViewport,
  setSourceIdName,
  setLayerIdName,
} from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const [status, setStatus] = useState("初始化中…");
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<string[]>([]);

  const log = (msg: string) => {
    logRef.current = [...logRef.current, msg];
    setLogs(logRef.current);
  };

  const sourceId = setSourceIdName("demo", "pbfLanduse");
  const layerId = setLayerIdName("demo", "pbfLanduse");
  const tiles = [
    `https://sd-data.minedata.cn/data/Landuse/{z}/{x}/{y}?token=${token}&solu=11003`,
  ];

  const addPbf = () => {
    const m = mapRef.current;
    if (!m) {
      setStatus("地图尚未初始化完成");
      return;
    }
    log(`setPbfSourceData(map, "${sourceId}", layer, tiles) → 添加 vector 源`);
    setPbfSourceData(m, sourceId, {
      id: layerId,
      type: "fill",
      source: sourceId,
      "source-layer": "Landuse",
      paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.35 },
    } as any, tiles);
    setStatus(`PBF 图层 ${layerId} 已提交（等待数据源加载）`);
  };

  const readSync = () => {
    const m = mapRef.current;
    if (!m) return;
    const features = getPbfFeatureListSync(m, layerId);
    log(
      `getPbfFeatureListSync → ${features.length} 个要素` +
        (features.length
          ? `（首要素: ${JSON.stringify((features[0] as any)?.properties ?? {})}）`
          : "（当前视口无数据，可缩放或等待加载）")
    );
  };

  const readAsync = () => {
    const m = mapRef.current;
    if (!m) return;
    log(`checkSourceLoaded({ sourceId: "${sourceId}" }) 轮询中…`);
    checkSourceLoaded({ map: m, sourceId, limit: 15 })
      .then((loaded) => {
        if (!loaded) {
          log("数据源加载超时（token 可能无 Landuse 数据权限）");
          setStatus("checkSourceLoaded 超时：请确认 token 具备对应数据权限");
          return;
        }
        log("数据源已加载，getPbfFeatureListAsync 读取要素…");
        return getPbfFeatureListAsync(mapRef.current!, layerId, sourceId, {
          limit: 15,
        }).then((features) => {
          log(`getPbfFeatureListAsync → ${features.length} 个要素`);
          setStatus(`PBF 要素读取完成：${features.length} 个`);
        });
      })
      .catch((err) => {
        log("读取失败：" + String(err?.message ?? err));
        setStatus(String(err?.message ?? err));
      });
  };

  const fitViewport = () => {
    const m = mapRef.current;
    if (!m) return;
    log("setPbfLayerViewport → 自动缩放以抓取 PBF 数据");
    setPbfLayerViewport({ map: m, layerId, sourceId, limit: 15, zoom: 11 });
    setStatus("setPbfLayerViewport 已执行（缩放至 zoom 11 后按覆盖物适配视野）");
  };

  useEffect(() => {
    let disposed = false;
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (disposed) {
          m.remove();
          return;
        }
        mapRef.current = m;
        log("地图已初始化");
        addPbf();
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = (fn: () => void) => () => fn();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={hostRef}
        style={{ position: "absolute", inset: 0 }}
        className="demo-map-host"
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 30,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <button type="button" className="demo-btn" onClick={act(addPbf)}>
          添加 PBF 图层
        </button>
        <button type="button" className="demo-btn" onClick={act(readSync)}>
          同步读取要素
        </button>
        <button type="button" className="demo-btn" onClick={act(readAsync)}>
          异步读取要素
        </button>
        <button type="button" className="demo-btn" onClick={act(fitViewport)}>
          PBF 视野适配
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          bottom: 12,
          zIndex: 30,
          width: 280,
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          overflow: "hidden",
          background: "rgba(8,14,12,.9)",
          border: "1px solid rgba(77,224,139,.3)",
          fontFamily: "ui-monospace, Consolas, monospace",
          fontSize: 12,
          color: "#cdeee0",
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid rgba(77,224,139,.25)",
            color: "#4de08b",
            fontWeight: 600,
          }}
        >
          要素读取日志
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 10px", lineHeight: 1.6 }}>
          {logs.map((l, i) => (
            <div key={i}>
              #{i + 1} {l}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          zIndex: 30,
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 12,
          background: "rgba(8,14,12,.86)",
          color: "#b9f6d5",
          border: "1px solid rgba(77,224,139,.35)",
          fontFamily: "ui-monospace, Consolas, monospace",
        }}
      >
        {status}
      </div>
    </div>
  );
}

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "PBF 图层与要素读取");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token!} />);
  return () => {
    root.unmount();
    container.innerHTML = "";
  };
}
