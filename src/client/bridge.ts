// Single shared app-bridge instance + a provider-independent reauth path.
// CLIENT-SAFE. The bridge is memoized so the provider and the reauth boundary
// (which renders OUTSIDE the provider) share one instance — no double-bridge.

import { createInkressApp, type InkressApp } from "@inkress/app-bridge";
import { setSessionId } from "./session";

let bridgePromise: Promise<InkressApp> | null = null;

/** Dashboards allowed to host an app. The session JWT's `iss` names the API's dashboard (e.g. dev.inkress.com),
 *  but the app may be opened from a newer one (dashboard.inkress.com, inkress-dash.*.webapps.host), and
 *  postMessage to the wrong origin is silently dropped. */
const HOST_PATTERNS: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*inkress\.com$/,
  /^https:\/\/inkress-dash(\.[a-z0-9-]+)*\.webapps\.host$/,
  /^https:\/\/([a-z0-9-]+\.)*commerce\.webapps\.host$/,
  /^http:\/\/localhost(:\d+)?$/,
];

/** The real parent origin, from the browser (unspoofable), when it is an Inkress dashboard. */
export function detectHostOrigin(): string | undefined {
  if (typeof window === "undefined" || window.parent === window) return undefined;
  const fromAncestors = window.location.ancestorOrigins?.[0];
  let fromReferrer: string | undefined;
  try {
    fromReferrer = document.referrer ? new URL(document.referrer).origin : undefined;
  } catch {
    fromReferrer = undefined;
  }
  const origin = fromAncestors || fromReferrer;
  return origin && HOST_PATTERNS.some((p) => p.test(origin)) ? origin : undefined;
}

export function getBridge(): Promise<InkressApp> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("app-bridge is client-only"));
  }
  if (!bridgePromise) {
    const hostOriginOverride = detectHostOrigin();
    bridgePromise = createInkressApp(hostOriginOverride ? { hostOriginOverride } : undefined);
  }
  return bridgePromise;
}

/** Re-mint a server session from a fresh dashboard JWT and stash its id for the
 *  header carrier. Independent of React context so the reauth ErrorBoundary can
 *  call it even when the provider tree didn't render. Returns success. */
export async function reauthenticate(bootstrapPath = "/bv/bootstrap"): Promise<boolean> {
  try {
    const app = await getBridge();
    const token = app.session.current().token;
    const r = await fetch(bootstrapPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionJwt: token }),
    });
    if (!r.ok) return false;
    const j = (await r.json()) as { sessionId?: string };
    if (j?.sessionId) {
      setSessionId(j.sessionId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
