// 提交信息规范：对齐 vuejs/vue 的 COMMIT_CONVENTION
// https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md
// 格式：<type>(<scope>?): <subject>，可选用 revert: 前缀
const types = [
  "feat",
  "fix",
  "polish",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "workflow",
  "ci",
  "chore",
  "types",
];

const config = {
  extends: ["@commitlint/config-conventional"],
  // Vue 规范允许 "revert: <原提交标题>" 前缀而非 revert type，
  // 默认 parser（conventional-changelog-conventionalcommits）把 revert: 视为普通
  // 文本导致 type-enum 误报，这里扩展 headerPattern 显式捕获该前缀。
  parserPreset: {
    name: "conventional-changelog-conventionalcommits",
    parserOpts: {
      headerPattern: /^(revert: )?(\w*)(?:\((.*)\))?!?: (.*)$/,
      headerCorrespondence: ["revert", "type", "scope", "subject"],
    },
  },
  rules: {
    "type-enum": [2, "always", types],
    // Vue 规范：header（type(scope): subject 整行）最长 50
    "header-max-length": [2, "always", 50],
    // subject 祈使句、首字母小写、结尾无句号
    "subject-case": [2, "never", ["sentence-case", "start-case", "upper-case", "pascal-case"]],
    "subject-full-stop": [2, "never", "."],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
  },
};

export default config;
