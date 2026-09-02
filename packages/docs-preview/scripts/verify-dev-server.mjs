// 临时验证脚本：检查 dev server 关键 URL 的 HTTP 状态码
// 用法: node scripts/verify-dev-server.mjs [baseUrl]
const base = process.argv[2] || "http://localhost:5173";
const urls = [
  "/",
  "/demos/vue3.html",
  "/demos/vue2.html",
  "/demos/react.html",
  "/demos/plain.html",
];

let failed = 0;
for (const u of urls) {
  const target = base + u;
  try {
    const res = await fetch(target, { redirect: "follow" });
    console.log(`${res.status === 200 ? "OK  " : "FAIL"} ${res.status} ${u}`);
    if (res.status !== 200) failed++;
  } catch (error) {
    console.log(`FAIL ERR ${u} -> ${error.message}`);
    failed++;
  }
}
process.exit(failed === 0 ? 0 : 1);
