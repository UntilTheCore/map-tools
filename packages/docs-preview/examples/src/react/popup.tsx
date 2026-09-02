import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { createPopupDom } from "@ym/map-tools/react";
import {
  createLayerId,
  createSourceId,
  ensureLayers,
  removeOverlays,
  upsertGeoJSONSource,
} from "@ym/map-tools";
import { markerPoints } from "../shared/data";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";
import { errorMessage } from "../shared/v3";

function PopupContent({ lng, lat }: { lng: number; lat: number }) {
  return <div style={{ padding: "8px 12px", minWidth: 180, background: "#0d1a15", border: "1px solid rgba(77,224,139,.5)", borderRadius: 8, color: "#eafff5", fontSize: 12 }}>
    <strong style={{ color: "#4de08b" }}>React Popup</strong>
    <div style={{ marginTop: 4 }}>经度: {lng.toFixed(4)}</div>
    <div style={{ marginTop: 2 }}>纬度: {lat.toFixed(4)}</div>
  </div>;
}

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const popupsRef = useRef<minemap.Popup[]>([]);
  const handlesRef = useRef<Array<ReturnType<typeof createPopupDom>>>([]);
  const [status, setStatus] = useState("地图初始化中");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let disposed = false;
    const sourceId = createSourceId("demo", "popupPoints");
    const layerId = createLayerId("demo", "popupPoints");
    createMinemapMap(hostRef.current!, token, {}, (map) => {
      map.on("click", (event) => {
        const handle = createPopupDom(<PopupContent lng={event.lngLat.lng} lat={event.lngLat.lat} />);
        const popup = new minemap.Popup({ closeOnClick: false, closeButton: true })
          .setLngLat([event.lngLat.lng, event.lngLat.lat])
          .setDOMContent(handle.element)
          .addTo(map);
        handlesRef.current.push(handle);
        popupsRef.current.push(popup);
        setCount(popupsRef.current.length);
        setStatus(`已创建 ${popupsRef.current.length} 个 Popup`);
      });
    })
      .then((map) => {
        if (disposed) {
          map.remove();
          return;
        }
        mapRef.current = map;
        upsertGeoJSONSource(map, { id: sourceId, data: markerPoints });
        ensureLayers(map, [{ id: layerId, type: "circle", source: sourceId, paint: { "circle-radius": 7, "circle-color": "#4dc3e0" } }]);
        setStatus("点击地图创建 React Popup");
      })
      .catch((error: unknown) => setStatus(errorMessage(error)));
    return () => {
      disposed = true;
      removeOverlays(popupsRef.current);
      handlesRef.current.splice(0).forEach((handle) => handle.dispose());
      mapRef.current?.remove();
    };
  }, [token]);

  const clear = () => {
    const removed = removeOverlays(popupsRef.current);
    popupsRef.current.length = 0;
    handlesRef.current.splice(0).forEach((handle) => handle.dispose());
    setCount(0);
    setStatus(`已清理 ${removed} 个 Popup`);
  };

  return <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <div ref={hostRef} className="demo-map-host" style={{ position: "absolute", inset: 0 }} />
    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 30 }}>
      <button type="button" className="demo-btn" onClick={clear}>清理 Popup ({count})</button>
    </div>
    <div className="demo-status" style={{ position: "absolute", left: 12, bottom: 12, zIndex: 30 }}>{status}</div>
  </div>;
}

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "Popup 弹窗");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token} />);
  return () => root.unmount();
}
