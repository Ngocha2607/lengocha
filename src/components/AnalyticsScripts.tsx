"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import {
  CANONICAL_HOST,
  CF_BEACON_SRC,
  CF_BEACON_TOKEN,
  GA_MEASUREMENT_ID,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
  ensureGtag,
  flushUmamiQueue,
  onCanonicalHost,
} from "@/lib/analytics";

const subscribeNever = () => () => {};

/**
 * The third-party analytics, next to Vercel's `<Analytics />`: Cloudflare Web
 * Analytics, Umami and GA4 (lib/analytics.ts says what each one is for).
 *
 * Each renders nothing — no script, no request — unless its id is configured
 * AND the page is on the canonical host. The host is only known in the
 * browser, so the server renders none of them and they are added after
 * hydration (`afterInteractive`), off the critical path of the pre-loader.
 *
 * Cloudflare runs in SPA mode because opening a window changes the URL with
 * `history.replaceState` and never reloads. Its beacon sees those changes
 * through the Navigation API (Chromium browsers); where that API is missing it
 * hooks only `pushState` and back/forward, so there a window switch is not a
 * pageview. Umami and GA4 both count `replaceState` changes as pageviews.
 *
 * Umami's `data-domains` repeats the host check inside Umami's own tracker, so
 * a copy of the page served from anywhere else records nothing even if the
 * check here were bypassed.
 *
 * The script ids are prefixed on purpose: an element id becomes a `window`
 * property, and with `id="umami"` the tag itself sat at `window.umami`, where
 * Umami's tracker found it and declined to install.
 */
export function AnalyticsScripts() {
  const enabled = useSyncExternalStore(subscribeNever, onCanonicalHost, () => false);

  // Queue gtag's `js` and `config` before gtag.js arrives, so events that fire
  // first still land after them.
  useEffect(() => {
    if (enabled) ensureGtag();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {CF_BEACON_TOKEN ? (
        <Script
          id="analytics-cloudflare"
          src={CF_BEACON_SRC}
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN, spa: true })}
          strategy="afterInteractive"
        />
      ) : null}
      {UMAMI_WEBSITE_ID ? (
        <Script
          id="analytics-umami"
          src={UMAMI_SCRIPT_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains={CANONICAL_HOST}
          strategy="afterInteractive"
          onLoad={flushUmamiQueue}
        />
      ) : null}
      {GA_MEASUREMENT_ID ? (
        <Script
          id="analytics-ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
