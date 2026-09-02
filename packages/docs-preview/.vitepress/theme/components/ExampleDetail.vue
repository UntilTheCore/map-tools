<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { registry, exampleOrder, DEFAULT_EXAMPLE } from "../../../examples/src/registry";

/**
 * 示例详情：左侧示例列表 + 右侧详情（变体 Tab / iframe 预览 / 源码面板）。
 * - 每个变体拆三个字段：id（Tab 标识）、entry（iframe 文件名，demos 构建产物）、
 *   srcDir（源码 glob 目录，examples/src/{srcDir}/{id}.{file}）
 * - iframe src 指向 /demos/{entry}.html?ex={id}（demos 由 build:demos 预构建到 public/demos）
 *   HTML 变体的构建产物为 plain.html（entry=plain），源码目录仍为 examples/src/html（srcDir=html）
 * - 源码通过 import.meta.glob(..., { query: "?raw" }) 按需读取
 * - token 仅经 localStorage.MINEMAP_TOKEN 与 iframe 共享（同源），不写入 iframe URL query，
 *   避免 token 进入浏览器历史与服务器日志
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

const examples = exampleOrder.map((id) => ({ id, ...registry[id] }));

const activeId = ref(DEFAULT_EXAMPLE);
const activeVariant = ref<VariantId>("vue3");
const token = ref("");
const source = ref("");
const loadingSource = ref(false);
const iframeKey = ref(0);
const tokenSavedTip = ref("");
let tipTimer: ReturnType<typeof setTimeout> | undefined;

const meta = computed(() => registry[activeId.value] ?? registry[DEFAULT_EXAMPLE]);
const variantFile = computed(() => variants.find((v) => v.id === activeVariant.value)!);

// token 不写入 iframe URL（避免进历史/日志），iframe 内与主页面同源共享 localStorage
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
    showTokenSavedTip("token 已保存，iframe 已刷新");
  } else if (input === "") {
    token.value = "";
    try {
      localStorage.removeItem("MINEMAP_TOKEN");
    } catch {
      /* ignore */
    }
    refreshIframe();
    showTokenSavedTip("token 已清除，iframe 已刷新");
  }
}

function showTokenSavedTip(message: string) {
  tokenSavedTip.value = message;
  if (tipTimer) clearTimeout(tipTimer);
  tipTimer = setTimeout(() => {
    tokenSavedTip.value = "";
  }, 3000);
}

function refreshIframe() {
  iframeKey.value++;
}

function selectExample(id: string) {
  activeId.value = id;
  // 同步更新 URL query，便于分享
  const url = new URL(window.location.href);
  url.searchParams.set("ex", id);
  window.history.replaceState(null, "", url.toString());
}

watch([activeVariant, activeId], () => {
  loadSource();
});

onMounted(() => {
  const fromUrl = new URLSearchParams(window.location.search).get("ex");
  if (fromUrl && registry[fromUrl]) activeId.value = fromUrl;
  readToken();
  loadSource();
});
</script>

<template>
  <div class="example-detail">
    <div class="example-detail__meta">
      <span>
        当前示例：
        <code>{{ activeId }}</code>
      </span>
      <span class="example-detail__token">
        <span>
          token：
          <code v-if="token">{{ token.slice(0, 6) }}…{{ token.slice(-4) }}</code>
          <code v-else>未配置</code>
        </span>
        <button type="button" class="example-detail__btn" @click="setToken">设置 token</button>
        <span v-if="tokenSavedTip" class="example-detail__tip">{{ tokenSavedTip }}</span>
      </span>
    </div>

    <div class="example-detail__tabs">
      <button
        v-for="v in variants"
        :key="v.id"
        type="button"
        class="example-detail__tab"
        :class="{ 'example-detail__tab--active': activeVariant === v.id }"
        @click="activeVariant = v.id"
      >
        {{ v.label }}
      </button>
    </div>

    <iframe
      :key="iframeKey"
      class="example-detail__iframe"
      :src="iframeSrc"
      :title="`${meta.title} · ${variantFile.label} 预览`"
      loading="lazy"
    />

    <div class="example-detail__code-head">
      <span class="example-detail__code-title">
        {{ meta.title }} · {{ variantFile.label }} 源码
        <code>examples/src/{{ variantFile.srcDir }}/{{ activeId }}.{{ variantFile.file }}</code>
      </span>
      <span v-if="loadingSource" class="example-detail__token">加载中…</span>
    </div>
    <pre class="example-detail__code"><code>{{ source }}</code></pre>
  </div>
</template>
