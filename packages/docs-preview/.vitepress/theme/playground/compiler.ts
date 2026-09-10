import { transform } from "sucrase";

export type CompileFramework = "vue2" | "vue3" | "react" | "html";
export interface CompileRequest {
  runId: number;
  framework: CompileFramework;
  filename: string;
  source: string;
  sfc?: boolean;
}
export interface CompileDiagnostic {
  message: string;
}
export interface CompileResult {
  runId: number;
  code: string;
  diagnostics: CompileDiagnostic[];
  timings: { compileMs: number; rewriteMs: number };
}

let compilerSfcModule: typeof import("vue/compiler-sfc") | null = null;

async function ensureSfcCompiler() {
  if (!compilerSfcModule) compilerSfcModule = await import("vue/compiler-sfc");
}

function rewriteImports(code: string) {
  return code.replace(/(from\s*|import\s*\(\s*)(["'])\.\.\/shared\//g, "$1$2@shared/");
}

function compileSfc(source: string) {
  const compiler = compilerSfcModule;
  if (!compiler) throw new Error("vue/compiler-sfc 尚未加载");
  const parsed = compiler.parse(source, { filename: "map-init.vue" });
  if (parsed.errors.length) {
    throw new Error(parsed.errors.map((error) => String(error)).join("; "));
  }
  const out = compiler.compileScript(parsed.descriptor, { id: "playground", inlineTemplate: true });
  const componentCode = /^\s*export default/m.test(out.content)
    ? out.content.replace(/^\s*export default/m, "const __sfc__ =")
    : out.content;
  return `import { createApp as __createApp } from "vue";\n${componentCode}\nexport default function render(container, options = {}) {\n  const mountEl = document.createElement("div");\n  mountEl.style.cssText = "width:100%;height:100%;";\n  container.appendChild(mountEl);\n  const app = __createApp(__sfc__);\n  app.mount(mountEl);\n  return { ready: Promise.resolve(), dispose() { app.unmount(); mountEl.remove(); } };\n}\n`;
}

export async function compileExample(request: CompileRequest): Promise<CompileResult> {
  const started = performance.now();
  let code = request.source;
  if (request.sfc) {
    await ensureSfcCompiler();
    code = compileSfc(code);
  }
  const result = transform(code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "automatic",
    jsxImportSource: "react",
    // vendor react.esm.js 以 NODE_ENV=production 打包，React 的 production
    // jsx-dev-runtime 里 jsxDEV 恒为 undefined（_jsxDEV is not a function）。
    // production: true 让 Sucrase 改从 react/jsx-runtime 导入 jsx/jsxs。
    production: true,
    filePath: request.filename,
  });
  const compiledAt = performance.now();
  code = rewriteImports(result.code);
  return {
    runId: request.runId,
    code,
    diagnostics: [],
    timings: { compileMs: compiledAt - started, rewriteMs: performance.now() - compiledAt },
  };
}
