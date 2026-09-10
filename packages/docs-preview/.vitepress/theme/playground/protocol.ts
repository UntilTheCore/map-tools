export const RUNNER_PROTOCOL_VERSION = 1;

export type RunnerState = "idle" | "loading" | "running" | "disposing" | "error";

export interface RunnerRunMessage {
  version: number;
  type: "run";
  sessionId: string;
  runId: number;
  code: string;
}

export interface RunnerDisposeMessage {
  version: number;
  type: "dispose";
  sessionId: string;
  runId: number;
}

export type RunnerMessage = RunnerRunMessage | RunnerDisposeMessage;

export type RunnerReply =
  | { version: number; type: "ready"; sessionId: string }
  | { version: number; type: "started"; sessionId: string; runId: number }
  | { version: number; type: "completed"; sessionId: string; runId: number }
  | {
      version: number;
      type: "failed";
      sessionId: string;
      runId: number;
      error: { code: string; message: string; stack?: string };
    }
  | { version: number; type: "disposed"; sessionId: string; runId: number };
