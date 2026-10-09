interface WakeLockSentinel {
  release(): Promise<void>;
}

interface WakeLockApi {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

/**
 * Asks the browser to keep the screen on while HAB is showing. The browser drops the request when
 * the page is hidden, so it is asked again when the page returns. Not every browser allows it.
 */
export function keepScreenAwake(): void {
  const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
  if (!api) return;
  const request = (): void => {
    api.request("screen").catch(() => undefined);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") request();
  });
  request();
}
