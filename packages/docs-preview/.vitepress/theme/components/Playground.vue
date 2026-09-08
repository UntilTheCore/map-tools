<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  exampleCategories,
  getCategorizedExample,
  listCategorizedExamples,
} from "../../../examples/src/categories";

/**
 * 示例实验室（Playground）：左侧分类菜单 + 右侧「iframe 预览 | 源码面板」分栏。
 * - 分类数据来自 examples/src/categories.ts（引用 registry 元信息）
 * - variants 每项：id（Tab 标识）、entry（iframe 文件名，demos 构建产物）、
 *   srcDir（源码 glob 目录 examples/src/{srcDir}/{id}.{file}）
 *   HTML 变体构建产物为 plain.html（entry=plain），源码目录仍为 examples/src/html
 * - iframe src 指向 /demos/{entry}.html?ex={id}；token 不写入 iframe URL，
 *   经同源 localStorage.MINEMAP_TOKEN 共享
 * - 源码通过 import.meta.glob(..., { query: "?raw" }) 按需读取，展示的即 iframe 实际运行代码
 */
const variants = [
  { id: "vue3", label: "Vue 3", entry: "vue3", srcDir: "vue3", file: "ts" },
  { id: "vue2", label: "Vue 2.7", entry: "vue2", srcDir: "vue2", file: "ts" },
  { id: "react", label: "React", entry: "react", srcDir: "react", file: "tsx" },
  { id: "html", label: "原生 HTML · FE_utils", entry: "plain", srcDir: "html", file: "ts" },
] as const;

type VariantId = (typeof variants)[number]["id"];

const rawModules = import.meta.glob("../../../examples/src/*/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
});

const categories = exampleCategories;
const allExamples = listCategorizedExamples();
const activeId = ref(allExamples[0]?.id ?? "map-init");
const activeVariant = ref<VariantId>("vue3");
const token = ref("");
const source = ref("");
const loadingSource = ref(false);
const iframeKey = ref(0);
const copied = ref(false);
const tokenSavedTip = ref("");
let tipTimer: ReturnType<typeof setTimeout> | undefined;
let copyTimer: ReturnType<typeof setTimeout> | undefined;

const current = computed(() => getCategorizedExample(activeId.value));
const variantFile = computed(() => variants.find((v) => v.id === activeVariant.value)!);
const sourcePath = computed(
  () => `examples/src/${variantFile.value.srcDir}/${activeId.value}.${variantFile.value.file}`,
);

const iframeSrc = computed(() => `/demos/${variantFile.value.entry}.html?ex=${activeId.value}`);

function readToken() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("token");
    if (fromUrl) {
      localStorage.setItem("MINEMAP_TOKEN", fromUrl);
      token.value = fromUrl;
      return;
    }
    token.value = localStorage.getItem("MINEMAP_TOKEN") ?? "";
  } catch {
    token.value = "";
  }
}

async function loadSource() {
  loadingSource.value = true;
  try {
    const key = `../../../examples/src/${variantFile.value.srcDir}/${activeId.value}.${variantFile.value.file}`;
    const loader = rawModules[key];
    source.value = loader ? ((await loader()) as string) : `// 未找到源码: ${key}`;
  } finally {
    loadingSource.value = false;
  }
}

function syncUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("ex", activeId.value);
  url.searchParams.set("frame", activeVariant.value);
  window.history.replaceState(null, "", url.toString());
}

function selectExample(id: string) {
  if (activeId.value === id) return;
  activeId.value = id;
  syncUrl();
}

function setToken() {
  const input = window.prompt(
    "请输入 minemap token（写入 localStorage.MINEMAP_TOKEN）：",
    token.value,
  );
  if (input !== null && input.trim()) {
    token.value = input.trim();
    try {
      localStorage.setItem("MINEMAP_TOKEN", input.trim());
    } catch {
      /* ignore */
    }
    refreshIframe();
    showTip("token 已保存，预览已刷新");
  } else if (input === "") {
    token.value = "";
    try {
      localStorage.removeItem("MINEMAP_TOKEN");
    } catch {
      /* ignore */
    }
    refreshIframe();
    showTip("token 已清除，预览已刷新");
  }
}

function showTip(message: string) {
  tokenSavedTip.value = message;
  if (tipTimer) clearTimeout(tipTimer);
  tipTimer = setTimeout(() => {
    tokenSavedTip.value = "";
  }, 3000);
}

function refreshIframe() {
  iframeKey.value++;
}

async function copySource() {
  if (!source.value) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(source.value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = source.value;
      textarea.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    /* 复制失败静默忽略 */
  }
}

watch([activeVariant, activeId], () => {
  loadSource();
});

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("ex");
  if (fromUrl) activeId.value = getCategorizedExample(fromUrl).id;
  const frame = params.get("frame");
  if (frame && variants.some((v) => v.id === frame)) activeVariant.value = frame as VariantId;
  readToken();
  loadSource();
});
</script>

<template>
  <div class="playground">
    <aside class="playground__menu">
      <div v-for="category in categories" :key="category.id" class="playground__category">
        <div class="playground__category-title">{{ category.title }}</div>
        <button
          v-for="id in category.examples"
          :key="id"
          type="button"
          class="playground__item"
          :class="{ 'playground__item--active': activeId === id }"
          @click="selectExample(id)"
        >
          {{ id }}
        </button>
      </div>
    </aside>

    <section class="playground__main">
      <div class="playground__head">
        <div class="playground__info">
          <h3 class="playground__title">{{ current.meta.title }}</h3>
          <p class="playground__desc">{{ current.meta.description }}</p>
          <div class="playground__apis">
            <span v-for="api in current.meta.apis" :key="api" class="playground__api">{{
              api
            }}</span>
          </div>
        </div>
        <div class="playground__toolbar">
          <span class="playground__token">
            <code v-if="token">{{ token.slice(0, 6) }}…{{ token.slice(-4) }}</code>
            <code v-else>未配置 token</code>
          </span>
          <button type="button" class="playground__btn" @click="setToken">设置 token</button>
          <button type="button" class="playground__btn" @click="refreshIframe">刷新预览</button>
          <span v-if="tokenSavedTip" class="playground__tip">{{ tokenSavedTip }}</span>
        </div>
      </div>

      <div class="playground__tabs">
        <button
          v-for="v in variants"
          :key="v.id"
          type="button"
          class="playground__tab"
          :class="{ 'playground__tab--active': activeVariant === v.id }"
          @click="
            activeVariant = v.id;
            syncUrl();
          "
        >
          {{ v.label }}
        </button>
      </div>

      <div class="playground__body">
        <iframe
          :key="`${activeVariant}-${activeId}-${iframeKey}`"
          class="playground__iframe"
          :src="iframeSrc"
          :title="`${current.meta.title} · ${variantFile.label} 预览`"
          loading="lazy"
        />
        <div class="playground__code">
          <div class="playground__code-head">
            <code class="playground__code-path">{{ sourcePath }}</code>
            <button type="button" class="playground__btn" @click="copySource">
              {{ copied ? "已复制 ✓" : "复制源码" }}
            </button>
          </div>
          <pre class="playground__pre"><code>{{ source }}</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/*
 * 双模式布局：
 * - ≥960px：layout: page + .playground-page（custom.css）提供满屏定位上下文，
 *   本组件绝对定位铺满，头部/Tab/菜单定高，body 弹性填充，各区域内部滚动（应用式满屏）。
 * - <960px：降级为文档流自然高度，上下堆叠 + 页面滚动。
 */
.playground {
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin: 20px 0;
  min-height: 640px;
}

@media (min-width: 960px) {
  .playground {
    position: absolute;
    inset: 0;
    /* 左右贴边：不居中、不限宽；12px 内边距仅避免边框贴死屏幕边缘 */
    margin: 0;
    padding: 0 12px;
    min-height: 0;
  }
}

/* 左侧分类菜单 */
.playground__menu {
  width: 200px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  align-self: flex-start;
  position: sticky;
  top: calc(var(--vp-nav-height, 64px) + 16px);
  max-height: calc(100vh - var(--vp-nav-height, 64px) - 32px);
  overflow: auto;
}

@media (min-width: 960px) {
  .playground__menu {
    position: static;
    align-self: stretch;
    max-height: none;
    overflow-y: auto;
    margin-bottom: 2px;
  }
}

.playground__category {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playground__category-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  letter-spacing: 0.06em;
  padding: 0 8px 4px;
}

.playground__item {
  text-align: left;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.playground__item:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.playground__item--active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 右侧内容区 */
.playground__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playground__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.playground__title {
  margin: 0;
  font-size: 17px;
  border-top: none;
  padding-top: 0;
}

.playground__desc {
  margin: 4px 0 6px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.playground__apis {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.playground__api {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
}

.playground__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.playground__tip {
  font-size: 12px;
  color: var(--vp-c-brand-1);
}

/* 框架 Tab */
.playground__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.playground__tab {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.playground__tab:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.playground__tab--active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 预览 + 代码分栏 */
.playground__body {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}

.playground__iframe {
  width: 100%;
  height: 560px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: #0a1210;
}

@media (min-width: 960px) {
  .playground__body {
    flex: 1;
    min-height: 0;
  }

  .playground__iframe {
    height: 100%;
    min-height: 0;
  }
}

.playground__code {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  min-width: 0;
}

.playground__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.playground__code-path {
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playground__pre {
  flex: 1;
  margin: 0;
  overflow: auto;
  max-height: 560px;
  padding: 12px 14px;
  background: var(--vp-code-block-bg, #161618);
  color: var(--vp-code-block-color, #ddd);
  font-size: 12px;
  line-height: 1.6;
  font-family: var(--vp-font-family-mono);
  white-space: pre;
}

@media (min-width: 960px) {
  .playground__pre {
    /* code 容器 overflow:hidden + pre flex:1 已经约束了高度，
       去掉 max-height 让源码面板跟随剩余空间而非被裁掉 */
    max-height: none;
    min-height: 0;
  }

  /* grid 子项默认 min-height:auto，内容较长时会把面板撑破容器 */
  .playground__code,
  .playground__iframe {
    min-height: 0;
  }
}

.playground__btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  flex: none;
  transition: all 0.15s ease;
}

.playground__btn:hover {
  background: var(--vp-c-brand-soft);
}

/* 窄屏：上下堆叠 + 菜单横排（app-shell 定位整体失效，恢复文档流） */
@media (max-width: 959px) {
  .playground {
    flex-direction: column;
  }

  .playground__menu {
    position: static;
    width: 100%;
    max-height: none;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
  }

  .playground__category {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .playground__body {
    grid-template-columns: 1fr;
  }
}
</style>
