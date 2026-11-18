/**
 * What readers do, counted without knowing who they are: each event goes to the worker (`/t/e`), which
 * relays it to PostHog in its cookieless mode, nothing kept in the reader's browser. The worker drops
 * what it does not know and everything when no key is set.
 */
export type Event =
  | "$pageview"
  | "sign_in_started"
  | "vote"
  | "grid_viewed"
  | "share_copied"
  | "propose_clicked"
  | "build_own_clicked"
  | "filter_used"
  | "search_used"
  | "view_switched";

export function track(
  event: Event,
  properties: Record<string, string | number | boolean> = {},
): void {
  try {
    const body = JSON.stringify({
      event,
      properties: {
        ...properties,
        $current_url: location.href,
        $pathname: location.pathname,
        $host: location.host,
        $referrer: document.referrer,
        lang: location.pathname.startsWith("/fr/") || location.pathname === "/fr" ? "fr" : "en",
      },
    });
    void fetch("/t/e", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Counting is never worth an error.
  }
}
