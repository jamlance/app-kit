// Reauth boundary helper — the isomorphic half of the "auth redirect must break
// out of the iframe" problem. When a loader throws the kit's reauth signal
// (401 X-Bv-Reauthenticate), recover by re-bootstrapping via app-bridge and
// revalidating, instead of white-screening. CLIENT-SAFE (react-router hooks only).

import { useEffect, useState } from "react";
import { isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import { reauthenticate } from "./bridge";

/**
 * Call inside a route's `ErrorBoundary`. Returns true while it's handling a
 * reauth (render a "Reconnecting…" state); false for any other error (let the
 * app render its normal error UI). Example:
 *
 *   export function ErrorBoundary() {
 *     if (useReauthHandler()) return <p>Reconnecting…</p>;
 *     return <GenericError />;
 *   }
 */
export function useReauthHandler(bootstrapPath?: string): boolean {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const [givenUp, setGivenUp] = useState(false);
  // Reauth only makes sense when embedded in the dashboard iframe — that's the
  // only place there's a parent to re-mint a session from. On a top-level page
  // (someone opened the app URL directly) there's nothing to reconnect to.
  const embedded = typeof window !== "undefined" && window.top !== window.self;
  const is401 = isRouteErrorResponse(error) && error.status === 401;
  // Try ONCE. Never window.location.reload() in a loop — if reauth can't
  // recover (no parent, expired refresh, mis-detected embed), give up and let
  // the boundary render its fallback ("open from your dashboard") instead of
  // spinning forever.
  const trying = is401 && embedded && !givenUp;

  useEffect(() => {
    if (!trying) return;
    let active = true;
    void (async () => {
      const ok = await reauthenticate(bootstrapPath).catch(() => false);
      if (!active) return;
      if (ok) revalidator.revalidate();
      else setGivenUp(true); // stop → boundary shows its fallback
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trying]);

  return trying;
}
