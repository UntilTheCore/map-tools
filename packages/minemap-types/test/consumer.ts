import type {} from "../index.js";

const map = new minemap.Map({
  container: "map",
  center: [116.38, 39.9],
  zoom: 12,
});

map.on("load", () => {
  map.addSource("pts", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({ id: "pts-circle", type: "circle", source: "pts", paint: { "circle-radius": 6 } });
});

map.on("click", "pts-circle", (e) => {
  const { lng } = e.lngLat;
  void lng;
});

map.fitBounds(
  [
    [73, 15],
    [135, 50],
  ],
  { padding: 20 },
);
map.fitBounds(
  [
    [73, 15],
    [135, 50],
  ],
  { padding: { top: 10, bottom: 25, left: 15, right: 5 } },
);

const popup = new minemap.Popup({ offset: [0, -30] })
  .setLngLat([116.46, 39.92])
  .setHTML("<b>hi</b>")
  .addTo(map);
void popup.isOpen();

const marker = new minemap.Marker({ draggable: true })
  .setLngLat([116.46, 39.92])
  .setTitle("我的标记")
  .setPopup(popup)
  .addTo(map);
void marker.getLngLat().toArray();

const bounds = new minemap.LngLatBounds([116, 39], [117, 40]).extend([118, 41]);
void bounds.getCenter().wrap();

minemap.key = "demo-key";
minemap.solution = 2365;

minemaputil.fitBounds(map, { type: "FeatureCollection", features: [] }, { padding: 100 });
const dist: number = minemaputil.SpaceUtil.distance([0, 0], [1, 1], "kilometers");
void dist;

map.on("load", () => {
  const edit: minemap.edit.Edit = minemap.edit.init(map, { boxSelect: true }, "top-right");
  const ids: string[] = edit.draw.add({ type: "Point", coordinates: [0, 0] });
  edit.onBtnCtrlActive("polygon", { style: { fillColor: "red" } });
  void ids;
});

const poly = minemap.lbsUtil.districtFormat("116.4,39.9;116.5,39.9|116.4,40;116.5,40");
void poly.coordinates.length;

const layer: minemap.MapLayer = { id: "l1", type: "background" };
void layer;

export {};
