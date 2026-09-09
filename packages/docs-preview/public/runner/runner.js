/**
 * runner 运行时：接收父页 postMessage 的编译产物（ESM 文本），
 * Blob URL 动态 import，调用模块默认导出 render(host, options)。
 *
 * 消息协议（仅接受同源）：
 * - { type: "run", id: number, code: string }
 * - { type: "dispose", id: number }
 * 回执：{ type: "ok" | "error", id, message? }
 */
(function () {
  "use strict";

  var host = document.getElementById("map-host");
  var errorPane = document.getElementById("runner-error");
  var errorDetail = document.getElementById("runner-error-detail");
  var dispose = null;
  // 已执行的最新消息 id；乱序/过期的消息直接忽略
  var lastRunId = 0;
  // 同一 runner iframe 内复用 vendor Blob；页面卸载时统一释放。
  var vendorBlobs = Object.create(null);
  var vendorBlobPromises = Object.create(null);

  function showError(message) {
    errorDetail.textContent = message;
    errorPane.style.display = "flex";
  }

  function hideError() {
    errorPane.style.display = "none";
    errorDetail.textContent = "";
  }

  function isCurrentRun(id) {
    return id === lastRunId;
  }

  function cleanup() {
    if (dispose) {
      try {
        dispose();
      } catch (error) {
        console.error("[runner] dispose 失败", error);
      }
      dispose = null;
    }
    // 重置容器行内样式：上一轮运行（styleHost / SFC 外壳）可能污染 #map-host
    // （如 position:relative 覆盖 runner.html 的 absolute;inset:0 致高度塌陷），
    // 每次运行前回到基线样式。
    host.innerHTML = "";
    host.style.cssText = "";
  }

  function releaseVendorBlobs() {
    Object.keys(vendorBlobs).forEach(function (name) {
      URL.revokeObjectURL(vendorBlobs[name]);
      delete vendorBlobs[name];
    });
    vendorBlobPromises = Object.create(null);
  }

  function run(message) {
    // 过期消息（父页已更新到更新的运行请求）直接丢弃
    if (message.id < lastRunId) return;
    lastRunId = message.id;
    cleanup();
    hideError();
    // Chromium 的 blob: 模块不应用页面 import map（bare specifier 解析失败），
    // 且 blob: 基准不是层级 URL（相对 specifier 也不可用），因此重写为绝对 URL，
    // 与 runner.html 的 import map 等价。
    var base = location.href.replace(/\/runner\.html.*$/, "");
    var specifierMap = {
      vue: base + "/runner/vendor/vue3.esm.js",
      vue2: base + "/runner/vendor/vue2.esm.js",
      react: base + "/runner/vendor/react.esm.js",
      "react-dom/client": base + "/runner/vendor/react.esm.js",
      "react/jsx-runtime": base + "/runner/vendor/react.esm.js",
      "@ym/map-tools/vue3": base + "/runner/vendor/maptools-vue3.esm.js",
      "@shared/loadMinemap": base + "/runner/vendor/shared.esm.js",
      "@shared/demo": base + "/runner/vendor/shared.esm.js",
    };
    var code = message.code;
    // 第一轮替换跳过 @ym/map-tools/vue3：它映射的 vendor 带 external 裸名 "vue"，
    // 必须先重写成"无裸名"的二级 blob（见下），再以二级 blob URL 替换进示例代码。
    Object.keys(specifierMap).forEach(function (name) {
      if (name === "@ym/map-tools/vue3") return;
      var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var re = new RegExp("(from\\s*|import\\s*\\(\\s*)(['\"])(" + escaped + ")(['\"])", "g");
      code = code.replace(re, "$1$2" + specifierMap[name] + "$4");
    });
    // maptools-vue3.esm.js 预打包时 external "vue"（保持裸名以共享 vue 实例），
    // 而 import map 对 blob: 模块内的静态 import 解析不可靠（实测失败），
    // 因此 fetch vendor 文本 → 裸名改写为 vendor 绝对 URL → 生成无裸名的二级 Blob。
    // 其余 vendor 自包含（react 合并包、vue2、shared 无裸名残留），无需处理。
    var externalAliases = {
      vue: specifierMap.vue,
      vue2: specifierMap.vue2,
      react: specifierMap.react,
      "react-dom/client": specifierMap["react-dom/client"],
      "react/jsx-runtime": specifierMap["react/jsx-runtime"],
    };
    function rewriteVendor(name, url) {
      if (vendorBlobs[name]) return Promise.resolve(vendorBlobs[name]);
      if (vendorBlobPromises[name]) return vendorBlobPromises[name];
      vendorBlobPromises[name] = fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("vendor 加载失败: " + res.status + " " + res.statusText);
          return res.text();
        })
        .then(function (text) {
          Object.keys(externalAliases).forEach(function (alias) {
            var esc = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            var re = new RegExp("(from\\s*|import\\s*\\(\\s*)(['\"])(" + esc + ")(['\"])", "g");
            text = text.replace(re, "$1$2" + externalAliases[alias] + "$4");
          });
          var blobUrl = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
          vendorBlobs[name] = blobUrl;
          return blobUrl;
        })
        .catch(function (error) {
          delete vendorBlobPromises[name];
          throw error;
        });
      return vendorBlobPromises[name];
    }
    rewriteVendor("maptools-vue3", specifierMap["@ym/map-tools/vue3"])
      .catch(function () {
        // fetch 失败时退回原 URL，交给页面 import map 兜底
        return specifierMap["@ym/map-tools/vue3"];
      })
      .then(function (maptoolsUrl) {
        if (!isCurrentRun(message.id)) return;
        var escapedName = "@ym/map-tools/vue3".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        code = code.replace(
          new RegExp("(from\\s*|import\\s*\\(\\s*)(['\"])(" + escapedName + ")(['\"])", "g"),
          "$1$2" + maptoolsUrl + "$4",
        );
        execute(message);
      });

    function execute(message) {
      var moduleUrl = URL.createObjectURL(
        new Blob([code], { type: "text/javascript" }),
      );
      import(moduleUrl)
        .then(function (mod) {
          URL.revokeObjectURL(moduleUrl);
          if (!isCurrentRun(message.id)) return;
          if (typeof mod.default !== "function") {
            throw new Error("模块缺少 default 导出（应为 render(container, options) 函数）");
          }
          var result = mod.default(host, {});
          var nextDispose = typeof result === "function" ? result : null;
          if (!isCurrentRun(message.id)) {
            if (nextDispose) {
              try {
                nextDispose();
              } catch (error) {
                console.error("[runner] 过期运行清理失败", error);
              }
            }
            return;
          }
          dispose = nextDispose;
          window.parent.postMessage({ type: "ok", id: message.id }, window.location.origin);
        })
        .catch(function (error) {
          URL.revokeObjectURL(moduleUrl);
          // 只有仍是最新一次运行时才展示错误，避免旧错误覆盖新运行
          if (message.id === lastRunId) {
            showError(
              error instanceof Error
                ? error.stack || error.message
                : String(error && error.message ? error.message : error),
            );
          }
          window.parent.postMessage(
            { type: "error", id: message.id, message: String(error) },
            window.location.origin,
          );
        });
    }
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    var message = event.data;
    if (!message || typeof message !== "object") return;
    if (message.type === "run" && typeof message.code === "string") {
      run(message);
      return;
    }
    if (message.type === "dispose") {
      lastRunId = message.id || lastRunId;
      cleanup();
    }
  });

  window.addEventListener("beforeunload", function () {
    cleanup();
    releaseVendorBlobs();
  });
})();
