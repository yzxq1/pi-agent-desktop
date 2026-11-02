import { configureHttpDispatcher } from "@/lib/http-dispatcher";
import { closeAllAgentEventStreams } from "@/lib/agent-event-stream";
import { startScheduler } from "@/lib/scheduled-tasks";
import { startExternalSessionsWatcher, stopExternalSessionsWatcher } from "@/lib/external-sessions-watcher";

export function registerNodeInstrumentation(): void {
  configureHttpDispatcher();

  // Watch external sessions written from terminal CLI so desktop GUI refreshes automatically
  startExternalSessionsWatcher();

  // Scheduled tasks must fire without anyone having opened a page, and the
  // packaged app keeps this server alive while its window is hidden in the tray.
  if (process.env.PI_WEB_DISABLE_SCHEDULER !== "1") startScheduler();

  // In production Next 16 answers SIGINT/SIGTERM with server.close() and waits
  // for every connection to end, without a timeout. SSE streams only end when
  // the client disconnects, so close them here or the process never exits.
  const shutdownStreams = () => {
    stopExternalSessionsWatcher();
    closeAllAgentEventStreams();
  };
  process.on("SIGINT", shutdownStreams);
  process.on("SIGTERM", shutdownStreams);
}
