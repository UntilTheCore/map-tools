(function () {
  "use strict";
  var VERSION = 1;
  var host = document.getElementById("map-host");
  var errorPane = document.getElementById("runner-error");
  var errorDetail = document.getElementById("runner-error-detail");
  var sessionId = null;
  var currentRunId = 0;
  var dispose = null;
  var disposed = false;
  var vendorBlobs = Object.create(null);
  var vendorBlobPromises = Object.create(null);
  function reply(message) { window.parent.postMessage(Object.assign({ version: VERSION, sessionId: sessionId }, message), window.location.origin); }
  function showError(message) { errorDetail.textContent = message; errorPane.style.display = "flex"; }
  function hideError() { errorPane.style.display = "none"; errorDetail.textContent = ""; }
  function callDispose() { if (!dispose) return; var fn = dispose; dispose = null; try { fn(); } catch (error) { console.error("[runner] dispose 失败", error); } }
  function cleanup() { callDispose(); host.innerHTML = ""; host.style.cssText = ""; }
  function releaseBlobs() { Object.keys(vendorBlobs).forEach(function (name) { URL.revokeObjectURL(vendorBlobs[name]); }); vendorBlobs = Object.create(null); vendorBlobPromises = Object.create(null); }
  function rewrite(text, aliases) { Object.keys(aliases).forEach(function (name) { var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); text = text.replace(new RegExp("(from\\s*|import\\s*\\(\\s*)(['\"])(" + escaped + ")(['\"])" , "g"), "$1$2" + aliases[name] + "$4"); }); return text; }
  function vendorUrlMap() { var base = location.href.replace(/\/runner\.html.*$/, ""); return { vue: base + "/runner/vendor/vue3.esm.js", vue2: base + "/runner/vendor/vue2.esm.js", react: base + "/runner/vendor/react.esm.js", "react-dom/client": base + "/runner/vendor/react.esm.js", "react/jsx-runtime": base + "/runner/vendor/react.esm.js", "react/jsx-dev-runtime": base + "/runner/vendor/react.esm.js", "@ym/map-tools/vue3": base + "/runner/vendor/maptools-vue3.esm.js", "@ym/map-tools/track": base + "/runner/vendor/maptools-track.esm.js", "@ym/map-tools/react": base + "/runner/vendor/maptools-react.esm.js", "@shared/loadMinemap": base + "/runner/vendor/shared.esm.js", "@shared/demo": base + "/runner/vendor/shared.esm.js", "@shared/trackData": base + "/runner/vendor/shared.esm.js" }; }
  function rewriteVendor(name, url, aliases) { if (vendorBlobs[name]) return Promise.resolve(vendorBlobs[name]); if (vendorBlobPromises[name]) return vendorBlobPromises[name]; vendorBlobPromises[name] = fetch(url).then(function (res) { if (!res.ok) throw new Error("vendor 加载失败: " + res.status); return res.text(); }).then(function (text) { var blobUrl = URL.createObjectURL(new Blob([rewrite(text, aliases)], { type: "text/javascript" })); vendorBlobs[name] = blobUrl; return blobUrl; }).catch(function (error) { delete vendorBlobPromises[name]; throw error; }); return vendorBlobPromises[name]; }
  function fail(runId, code, error) { if (runId !== currentRunId || disposed) return; var message = error instanceof Error ? error.message : String(error); showError(message); reply({ type: "failed", runId: runId, error: { code: code, message: message, stack: error && error.stack } }); }
  function run(message) {
    if (disposed || message.sessionId !== sessionId || message.runId < currentRunId) return;
    currentRunId = message.runId; cleanup(); hideError(); reply({ type: "started", runId: currentRunId });
    var urls = vendorUrlMap();
    var aliases = { vue: urls.vue, vue2: urls.vue2, react: urls.react, "react-dom/client": urls["react-dom/client"], "react/jsx-runtime": urls["react/jsx-runtime"], "react/jsx-dev-runtime": urls["react/jsx-dev-runtime"] };
    var code = rewrite(message.code, { vue: urls.vue, vue2: urls.vue2, react: urls.react, "react-dom/client": urls["react-dom/client"], "react/jsx-runtime": urls["react/jsx-runtime"], "react/jsx-dev-runtime": urls["react/jsx-dev-runtime"], "@shared/loadMinemap": urls["@shared/loadMinemap"], "@shared/demo": urls["@shared/demo"], "@shared/trackData": urls["@shared/trackData"] });
    Promise.all([
      rewriteVendor("maptools-vue3", urls["@ym/map-tools/vue3"], aliases).catch(function () { return urls["@ym/map-tools/vue3"]; }),
      rewriteVendor("maptools-track", urls["@ym/map-tools/track"], aliases).catch(function () { return urls["@ym/map-tools/track"]; }),
      rewriteVendor("maptools-react", urls["@ym/map-tools/react"], aliases).catch(function () { return urls["@ym/map-tools/react"]; }),
    ]).then(function (maptoolsUrls) {
      if (disposed || message.runId !== currentRunId) return;
      code = rewrite(code, { "@ym/map-tools/vue3": maptoolsUrls[0], "@ym/map-tools/track": maptoolsUrls[1], "@ym/map-tools/react": maptoolsUrls[2] });
      var moduleUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
      import(moduleUrl).then(function (mod) {
        URL.revokeObjectURL(moduleUrl);
        if (disposed || message.runId !== currentRunId) return;
        if (typeof mod.default !== "function") throw new Error("模块缺少 default 导出（应为 render(container, options) 函数）");
        return Promise.resolve(mod.default(host, { sessionId: sessionId, runId: currentRunId })).then(function (value) {
          if (disposed || message.runId !== currentRunId) return;
          dispose = value && typeof value.dispose === "function" ? value.dispose : (typeof value === "function" ? value : null);
          return Promise.resolve(value && value.ready).then(function () { if (!disposed && message.runId === currentRunId) reply({ type: "completed", runId: currentRunId }); });
        });
      }).catch(function (error) { URL.revokeObjectURL(moduleUrl); fail(currentRunId, "RENDER_FAILED", error); });
    }).catch(function (error) { fail(currentRunId, "RENDER_FAILED", error); });
  }
  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    var message = event.data;
    if (!message || message.version !== VERSION) return;
    if (message.type === "init") { sessionId = message.sessionId; currentRunId = 0; disposed = false; reply({ type: "ready" }); }
    else if (message.type === "run" && typeof message.code === "string") run(message);
    else if (message.type === "dispose" && message.sessionId === sessionId) { disposed = true; cleanup(); reply({ type: "disposed", runId: message.runId }); }
  });
  window.addEventListener("beforeunload", function () { disposed = true; cleanup(); releaseBlobs(); });
})();
