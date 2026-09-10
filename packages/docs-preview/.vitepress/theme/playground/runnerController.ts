import { ref, type Ref } from "vue";
import { RUNNER_PROTOCOL_VERSION, type RunnerReply, type RunnerState } from "./protocol";

const makeSessionId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function createRunnerController(iframeRef: Ref<HTMLIFrameElement | null>) {
  const state = ref<RunnerState>("idle");
  const error = ref<{ code: string; message: string; stack?: string } | null>(null);
  let sessionId = "";
  let runId = 0;
  let disposed = false;
  let loadTimer: number | null = null;
  let pendingCode: string | null = null;

  const post = (message: unknown) =>
    iframeRef.value?.contentWindow?.postMessage(message, window.location.origin);

  function reset() {
    if (loadTimer !== null) window.clearTimeout(loadTimer);
    loadTimer = null;
    error.value = null;
    sessionId = makeSessionId();
    state.value = "loading";
    disposed = false;
  }

  function onReady(reply: Extract<RunnerReply, { type: "ready" }>) {
    if (reply.sessionId !== sessionId || disposed) return;
    state.value = "running";
    if (pendingCode !== null) {
      const code = pendingCode;
      pendingCode = null;
      post({ version: RUNNER_PROTOCOL_VERSION, type: "run", sessionId, runId, code });
    }
  }

  function onReply(reply: RunnerReply) {
    if (reply.version !== RUNNER_PROTOCOL_VERSION || reply.sessionId !== sessionId) return;
    if (reply.type === "ready") return onReady(reply);
    if (reply.type === "disposed") {
      state.value = "idle";
      return;
    }
    if (disposed) return;
    if (reply.runId !== runId) return;
    if (reply.type === "started") state.value = "running";
    if (reply.type === "completed") state.value = "idle";
    if (reply.type === "failed") {
      error.value = reply.error;
      state.value = "error";
    }
  }

  function run(_code: string) {
    runId += 1;
    reset();
    const currentRunId = runId;
    iframeRef.value?.setAttribute("data-session-id", sessionId);
    loadTimer = window.setTimeout(() => {
      if (!disposed && currentRunId === runId) {
        error.value = { code: "RUN_TIMEOUT", message: "运行容器启动超时" };
        state.value = "error";
      }
    }, 20_000);
    return { sessionId, runId: currentRunId };
  }

  function sendRun(code: string, currentRunId = runId) {
    if (disposed || currentRunId !== runId) return;
    pendingCode = code;
    post({ version: RUNNER_PROTOCOL_VERSION, type: "init", sessionId });
  }

  function dispose() {
    disposed = true;
    state.value = "disposing";
    post({ version: RUNNER_PROTOCOL_VERSION, type: "dispose", sessionId, runId });
    if (loadTimer !== null) window.clearTimeout(loadTimer);
    loadTimer = null;
  }

  return {
    state,
    error,
    getSessionId: () => sessionId,
    getRunId: () => runId,
    run,
    sendRun,
    dispose,
    onReply,
  };
}
