import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { startExternalSessionsWatcher, stopExternalSessionsWatcher } = await jiti.import("./external-sessions-watcher.ts");
const { getSessionListVersion, invalidateSessionListCache } = await jiti.import("./session-reader.ts");

test("external sessions watcher detects new .jsonl files and bumps sessionListVersion", async (t) => {
  const tempDir = mkdtempSync(join(tmpdir(), "pi-watcher-test-"));
  const sessionsDir = join(tempDir, "sessions", "--test-project--");
  mkdirSync(sessionsDir, { recursive: true });

  const initialVersion = getSessionListVersion();
  const stop = startExternalSessionsWatcher(tempDir);

  t.after(() => {
    stop();
    stopExternalSessionsWatcher();
    rmSync(tempDir, { recursive: true, force: true });
  });

  // Write a dummy session file in sessionsDir
  const testFile = join(sessionsDir, "test-session.jsonl");
  writeFileSync(testFile, JSON.stringify({ type: "session", id: "s1" }) + "\n");

  // Wait for debounce (300ms + margin)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newVersion = getSessionListVersion();
  assert.ok(newVersion > initialVersion, `Expected version to increase from ${initialVersion}, got ${newVersion}`);
});
