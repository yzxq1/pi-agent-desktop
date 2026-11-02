import { existsSync, mkdirSync, watch, type FSWatcher } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { invalidateSessionListCache } from "./session-reader";
import { notifyRunningChange } from "./rpc-manager";

let watcher: FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY_MS = 300;

export function handleSessionFileChange(filename?: string | null): void {
  // Only trigger on .jsonl transcript changes or general folder events
  if (filename && !filename.endsWith(".jsonl") && !filename.includes("--")) {
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    try {
      invalidateSessionListCache();
      notifyRunningChange();
    } catch (error) {
      console.error("[ExternalSessionsWatcher] Error refreshing session list:", error);
    }
  }, DEBOUNCE_DELAY_MS);
}

export function startExternalSessionsWatcher(customDir?: string): () => void {
  if (watcher) return () => stopExternalSessionsWatcher();

  const agentDir = customDir ?? getAgentDir();
  const sessionsDir = join(agentDir, "sessions");

  if (!existsSync(sessionsDir)) {
    try {
      mkdirSync(sessionsDir, { recursive: true });
    } catch {
      // If we cannot create the folder yet, do not throw
    }
  }

  try {
    watcher = watch(sessionsDir, { recursive: true }, (_eventType, filename) => {
      handleSessionFileChange(filename);
    });

    watcher.on("error", (err) => {
      console.warn("[ExternalSessionsWatcher] Watcher error:", err);
      stopExternalSessionsWatcher();
    });
  } catch (err) {
    console.warn("[ExternalSessionsWatcher] Could not watch sessions folder:", err);
  }

  return () => stopExternalSessionsWatcher();
}

export function stopExternalSessionsWatcher(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    try {
      watcher.close();
    } catch {
      // ignore
    }
    watcher = null;
  }
}
