<template>
  <NConfigProvider
    class="playground"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="themeOverrides"
  >
    <NLayout has-sider class="playground__shell">
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="220"
        :collapsed="menuCollapsed"
        show-trigger
        @update:collapsed="menuCollapsed = $event"
      >
        <div class="playground__menu">
          <div
            v-for="category in exampleCategories"
            :key="category.id"
            class="playground__category"
          >
            <div class="playground__category-title">{{ category.title }}</div>
            <button
              v-for="id in category.examples"
              :key="id"
              type="button"
              class="playground__item"
              :class="{ 'playground__item--active': id === activeId }"
              @click="selectExample(id)"
            >
              {{ registry[id]?.title ?? id }}
            </button>
          </div>
        </div>
      </NLayoutSider>

      <NLayout class="playground__main">
        <NSplit
          direction="horizontal"
          :size="splitSize"
          :min="0.22"
          class="playground__split"
          @update:size="onSplitSize"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        >
          <template #1>
            <div class="playground__map">
              <!-- 拖动开始后覆盖一层透明遮罩，避免鼠标进入 iframe 后拖动事件被吞 -->
              <div v-show="dragging" class="playground__map-shield" />
              <iframe
                ref="iframeRef"
                :key="iframeKey"
                src="/runner.html"
                class="playground__iframe"
                title="示例预览"
                @load="onIframeLoad"
              />
            </div>
          </template>
          <template #2>
            <div class="playground__code">
              <!-- 描述区：占用代码容器高度，位于代码编辑器上方 -->
              <div class="playground__desc">
                <h3>{{ meta.title }}</h3>
                <p>{{ meta.description }}</p>
              </div>
              <div class="playground__code-head">
                <span class="playground__code-path">{{ sourcePath }}</span>
                <div class="playground__actions">
                  <NDropdown :options="variantOptions" trigger="click" @select="selectVariant">
                    <NTooltip>
                      <template #trigger>
                        <NButton size="small" quaternary>
                          {{ activeVariantMeta.label }}
                          <template #icon>
                            <NIcon><ChevronDownIcon /></NIcon>
                          </template>
                        </NButton>
                      </template>
                      切换语言
                    </NTooltip>
                  </NDropdown>
                  <NTooltip>
                    <template #trigger>
                      <NButton
                        size="small"
                        type="primary"
                        secondary
                        :circle="false"
                        @click="runCode"
                      >
                        <template #icon>
                          <NIcon><PlayCircleOutline /></NIcon>
                        </template>
                      </NButton>
                    </template>
                    运行当前编辑器中的代码（Ctrl+Enter）
                  </NTooltip>
                  <NTooltip>
                    <template #trigger>
                      <NButton size="small" quaternary @click="copySource">
                        <template #icon>
                          <NIcon><CopyOutline /></NIcon>
                        </template>
                      </NButton>
                    </template>
                    复制全部代码
                  </NTooltip>
                  <NTooltip>
                    <template #trigger>
                      <NButton size="small" quaternary @click="resetSource">
                        <template #icon>
                          <NIcon><ArrowUndoCircleOutline /></NIcon>
                        </template>
                      </NButton>
                    </template>
                    还原为初始代码并运行
                  </NTooltip>
                </div>
              </div>
              <div ref="editorHost" class="playground__editor" />
            </div>
          </template>
        </NSplit>
      </NLayout>
    </NLayout>
  </NConfigProvider>
</template>

<script setup lang="ts">
/**
 * 示例实验室：左侧分类菜单（可收起）+ 右侧「地图预览 | 代码编辑器」。
 * - 代码编辑器：CodeMirror 6，编辑后手动运行（运行按钮 / Ctrl+Enter）
 * - 编译：Sucrase TS/TSX → ESM，相对导入改写为 @shared/*，
 *   在 /runner.html iframe 内经 import map 解析本地 vendor 后运行
 * - 语言：vue3 / vue2 / react / html 四套示例源码
 * - key 由系统提供（SYSTEM_MINEMAP_KEY），示例代码不出现 key
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import {
  NButton,
  NConfigProvider,
  NDropdown,
  NIcon,
  NLayout,
  NLayoutSider,
  NSplit,
  NTooltip,
  createDiscreteApi,
  dateZhCN,
  zhCN,
} from "naive-ui";
import { basicSetup, EditorView } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import ChevronDown from "naive-ui/es/_internal/icons/ChevronDown";
import { ArrowUndoCircleOutline, CopyOutline, PlayCircleOutline } from "@vicons/ionicons5";
import {
  exampleCategories,
  getCategorizedExample,
  DEFAULT_PLAYGROUND_EXAMPLE,
} from "../../../examples/src/categories";
import { registry } from "../../../examples/src/registry";
import { compileExample } from "../playground/compiler";
import { createRunnerController } from "../playground/runnerController";
import { RUNNER_PROTOCOL_VERSION, type RunnerReply } from "../playground/protocol";

interface Variant {
  id: "vue3" | "vue2" | "react" | "html";
  label: string;
  srcDir: string;
  file: string;
  /** 源码是否为 Vue SFC（需先经 vue/compiler-sfc 编译为 ESM 组件模块） */
  sfc?: boolean;
}

const variants: readonly Variant[] = [
  { id: "vue3", label: "Vue 3", srcDir: "vue3", file: "vue", sfc: true },
  { id: "vue2", label: "Vue 2.7", srcDir: "vue2", file: "ts" },
  { id: "react", label: "React", srcDir: "react", file: "tsx" },
  { id: "html", label: "HTML + JS", srcDir: "html", file: "ts" },
] as const;

/** 代码编辑器允许的最小宽度（px）；拖动到此宽度后不再变窄 */
const CODE_MIN_WIDTH = 320;

/** 示例源码（?raw 懒加载文本；loader 返回值可能是字符串或 {default} 命名空间，见 loadSource） */
const rawSources = import.meta.glob("../../../examples/src/*/*.{ts,tsx,vue}", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<unknown>>;

const activeId = ref(DEFAULT_PLAYGROUND_EXAMPLE);
const activeVariant = ref<Variant["id"]>("vue3");
const menuCollapsed = ref(false);
const splitSize = ref<number>(0.5);
const dragging = ref(false);
const copied = ref(false);

// 独立于 NMessageProvider 的离散 API（SSR 安全，仅客户端弹提示）
const { message } = createDiscreteApi(["message"]);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const editorHost = ref<HTMLElement | null>(null);
const editor = shallowRef<EditorView | null>(null);
const initialSource = ref("");
const editorSource = ref("");
const pendingRunSource = ref("");
const iframeKey = ref(0);
const runner = createRunnerController(iframeRef);

const activeVariantMeta = computed(
  () => variants.find((v) => v.id === activeVariant.value) ?? variants[0],
);
const meta = computed(() => registry[activeId.value] ?? registry[DEFAULT_PLAYGROUND_EXAMPLE]);
const sourcePath = computed(
  () =>
    `examples/src/${activeVariantMeta.value.srcDir}/${activeId.value}.${activeVariantMeta.value.file}`,
);
const variantOptions = computed(() =>
  variants.map((v) => ({
    label: v.label,
    key: v.id,
    disabled: v.id === activeVariant.value,
  })),
);

// 品牌主色对齐站点 custom.css
const themeOverrides = {
  common: {
    primaryColor: "#2bb673",
    primaryColorHover: "#3ed98c",
    primaryColorPressed: "#1d8f5a",
    primaryColorSuppl: "#3ed98c",
  },
};

// 图标：@vicons/ionicons5（PlayCircleOutline / CopyOutline / ArrowUndoCircleOutline）
// 语言下拉箭头沿用 naive-ui 内部图标
const ChevronDownIcon = ChevronDown;

let sourceRequestId = 0;

function loadSource(): Promise<string> {
  const key = `../../../examples/src/${activeVariantMeta.value.srcDir}/${activeId.value}.${activeVariantMeta.value.file}`;
  const loader = rawSources[key];
  if (!loader) return Promise.resolve(`// 未找到源码: ${key}`);
  // Vite/VitePress dev 与 build 对 query:'?raw' + import:'default' 的 loader 返回形态
  // 不一致：可能直接 resolve 源码字符串（dev 实测），也可能 resolve 模块命名空间对象
  // （{default: 源码}）。两种形态都兼容。
  return Promise.resolve(loader()).then((mod) =>
    typeof mod === "string" ? mod : ((mod?.default as string | undefined) ?? ""),
  );
}

function selectExample(id: string) {
  const found = getCategorizedExample(id);
  activeId.value = found.id;
  syncUrl();
}

function selectVariant(id: string | number) {
  if (typeof id !== "string" || !variants.some((v) => v.id === id)) return;
  activeVariant.value = id as Variant["id"];
  syncUrl();
}

function syncUrl() {
  history.replaceState(null, "", `/examples-center/playground.html?frame=${activeVariant.value}`);
}

/**
 * 编辑器内容 → 可运行 ESM：
 * 1. SFC（.vue）：vue/compiler-sfc 编译为单模块 ESM 组件（template 内联为 render），
 *    追加 `export default __sfc__`（compileScript 的组件默认导出未带 export 前缀）
 * 2. Sucrase 转译 TS/TSX（jsxRuntime automatic，import 语句原样保留为 ESM）
 * 3. 相对导入 ../shared/* 改写为 @shared/*（runner 已做裸名重写）
 */
let pendingRun: { sessionId: string; runId: number; code: string } | null = null;
let compileRequestId = 0;

function onIframeLoad() {
  const run = pendingRun;
  const iframe = iframeRef.value;
  if (!run || !iframe) return;
  pendingRun = null;
  runner.sendRun(run.code, run.runId);
}
async function runCode() {
  const view = editor.value;
  if (!view) return;
  const requestId = ++compileRequestId;
  const runId = runner.getRunId() + requestId;
  pendingRunSource.value = view.state.doc.toString();
  try {
    const result = await compileExample({
      runId,
      framework: activeVariant.value,
      filename: `example.${activeVariantMeta.value.file === "vue" ? "ts" : activeVariantMeta.value.file}`,
      source: pendingRunSource.value,
      sfc: activeVariantMeta.value.sfc,
    });
    if (requestId !== compileRequestId) return;
    const session = runner.run(result.code);
    pendingRun = { ...session, code: result.code };
    iframeKey.value += 1;
  } catch (error) {
    message.error(`编译失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

async function copySource() {
  const view = editor.value;
  if (!view) return;
  const text = view.state.doc.toString();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    message.error("复制失败，请手动选择代码复制");
  }
}

async function resetSource() {
  const view = editor.value;
  if (!view) return;
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: initialSource.value },
  });
  runCode();
  message.info("已还原为初始代码并重新运行");
}

/** NSplit size 取值：px 字符串或 0~1 比例。把 size 换算为地图 pane 的 px 宽 */
function sizeToMapPx(size: number | string, totalPx: number): number {
  if (typeof size === "string") {
    const px = Number.parseFloat(size);
    return Number.isNaN(px) ? totalPx : totalPx - px - 3;
  }
  return totalPx * (1 - size);
}

/** 把地图 pane 的 px 宽换算回 NSplit size（px 字符串形式，指第一 pane 宽） */
function mapPxToSize(mapPx: number): string {
  return `${Math.max(Math.round(mapPx), 0)}px`;
}

/**
 * 拖动中限制代码编辑器最小宽度：代码区不足 CODE_MIN_WIDTH 时钳制 size。
 * size 语义为第一 pane（地图）宽度，故地图最大 = 总宽 - 代码最小宽。
 */
function onSplitSize(size: number | string) {
  const splitEl = document.querySelector<HTMLElement>(".playground__split");
  if (!splitEl) {
    splitSize.value = size as number;
    return;
  }
  const totalPx = splitEl.getBoundingClientRect().width - 3; // 减去分隔条宽
  const codePx = totalPx - sizeToMapPx(size, totalPx);
  if (codePx < CODE_MIN_WIDTH) {
    splitSize.value = mapPxToSize(totalPx - CODE_MIN_WIDTH);
  } else {
    splitSize.value = size as number;
  }
}

function onDragStart() {
  dragging.value = true;
}

function onDragEnd() {
  dragging.value = false;
}

/**
 * 关键：拖动防抖遮罩必须在 mousedown 按下时就位，而不是等 NSplit 的 drag-start 回调
 * （回调触发时第一帧 mousemove 已可能进入 iframe 被吞）。因此在 document 捕获阶段
 * 监听 mousedown，命中分隔条立即点亮遮罩；mouseup（含拖出窗口松开）时熄灭。
 */
function installDragShield(): () => void {
  const onDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.(".n-split__resize-trigger-wrapper")) {
      dragging.value = true;
    }
  };
  const onUp = () => {
    dragging.value = false;
  };
  document.addEventListener("mousedown", onDown, true);
  document.addEventListener("mouseup", onUp, true);
  return () => {
    document.removeEventListener("mousedown", onDown, true);
    document.removeEventListener("mouseup", onUp, true);
  };
}

// CodeMirror Ctrl+Enter 运行（优先级高于编辑器默认绑定）
const runKeymap = Prec.highest(
  keymap.of([
    {
      key: "Ctrl-Enter",
      preventDefault: true,
      run: () => {
        runCode();
        return true;
      },
    },
  ]),
);

function mountEditor(initial: string) {
  if (!editorHost.value) return;
  editor.value = new EditorView({
    doc: initial,
    extensions: [
      runKeymap,
      basicSetup,
      editorLanguage.value,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) editorSource.value = update.state.doc.toString();
      }),
      EditorView.theme({}, { dark: document.documentElement.classList.contains("dark") }),
    ],
    parent: editorHost.value,
  });
}

/** 编辑器语言扩展：vue3 变体用 html（嵌套 script TS 高亮），其余 JS/TS */
const editorLanguage = computed(() =>
  activeVariantMeta.value.sfc
    ? html({ selfClosingTags: true, matchClosingTags: true })
    : javascript({ typescript: true, jsx: true }),
);

// 语言切换时重建编辑器：CodeMirror 语言扩展不支持运行中替换，需重挂载
watch([activeVariant, activeId], async () => {
  const requestId = ++sourceRequestId;
  runner.dispose();
  const source = await loadSource();
  if (requestId !== sourceRequestId) return;
  initialSource.value = source;
  editorSource.value = source;
  rebuildEditor(source);
  await nextTick();
  if (requestId === sourceRequestId) runCode();
});

function rebuildEditor(source: string) {
  const view = editor.value;
  if (view) {
    view.destroy();
    editor.value = null;
  }
  mountEditor(source);
}

onMounted(async () => {
  // URL ?frame= 回填语言
  const frame = new URLSearchParams(window.location.search).get("frame");
  if (frame && variants.some((v) => v.id === frame)) {
    activeVariant.value = frame as Variant["id"];
  }
  // SFC 变体首次运行需要 compiler-sfc（约 200KB 按需加载），
  // 必须先 ensureSfcCompiler 再编译，否则初始 runCode 直接报"尚未加载"
  const source = await loadSource();
  initialSource.value = source;
  editorSource.value = source;
  mountEditor(source);
  // 初始运行一次
  runCode();
});

let disposeShield: (() => void) | null = null;

onMounted(() => {
  disposeShield = installDragShield();
  window.addEventListener("message", onRunnerMessage);
});

function onRunnerMessage(event: MessageEvent<RunnerReply>) {
  if (event.origin !== window.location.origin) return;
  if (!event.data || event.data.version !== RUNNER_PROTOCOL_VERSION) return;
  runner.onReply(event.data);
}

onBeforeUnmount(() => {
  pendingRun = null;
  runner.dispose();
  window.removeEventListener("message", onRunnerMessage);
  disposeShield?.();
  editor.value?.destroy();
  editor.value = null;
});
</script>

<style scoped>
.playground {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.playground :deep(.n-layout) {
  height: 100%;
  background: transparent;
}

.playground__shell {
  height: 100%;
}

/* 左侧菜单 */
.playground__menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  padding: 12px 8px;
  overflow-y: auto;
}

.playground__category-title {
  padding: 8px 12px 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  user-select: none;
}

.playground__item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.playground__item:hover {
  background: var(--vp-c-bg-soft);
}

.playground__item--active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 右侧主区：整体只承载 split，不出现额外滚动 */
.playground__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 分栏：地图 | 代码，撑满主区剩余高度 */
.playground__split {
  flex: 1;
  min-height: 0;
}

/* 地图 pane */
.playground__map {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
}

/* 拖动遮罩：盖住 iframe，防止鼠标进入 iframe 后 mousemove 被吞导致拖动中断 */
.playground__map-shield {
  position: absolute;
  inset: 0;
  z-index: 40;
  background: transparent;
}

.playground__iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: var(--vp-c-bg);
}

/* 代码 pane：描述区 + 头部 + 编辑器，纵向 flex，总高即 pane 高度 */
.playground__code {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  border-radius: 4px;
}

/* 描述区：位于代码编辑器上方，自然流高度，占用代码容器（编辑器）的高度 */
.playground__desc {
  flex-shrink: 0;
  padding: 10px 14px 6px;
}

.playground__desc h3 {
  margin: 0 0 2px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.playground__desc p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playground__code-head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.playground__code-path {
  overflow: hidden;
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playground__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}

.playground__editor {
  flex: 1;
  min-height: 0;
  overflow: auto;
  font-size: 13px;
}

.playground__editor :deep(.cm-editor) {
  height: 100%;
}

.playground__editor :deep(.cm-scroller) {
  font-family: var(--vp-font-family-mono);
}

/* 窄屏降级：文档流布局 */
@media (max-width: 959px) {
  .playground {
    position: static;
    min-height: 80vh;
  }
}
</style>
