import { track as vercelTrack } from "@vercel/analytics";
import { SITE_URL } from "@/lib/site";

/**
 * Analytics configuration, and contact-intent events sent from ONE place to
 * every provider that takes them. Call `trackEvent`, never a provider directly.
 *
 * The providers:
 *   - Vercel Web Analytics, always (`<Analytics />` in the root layout):
 *     pageviews. It records CUSTOM events only on the Pro and Enterprise plans;
 *     this project is on Hobby, so `trackEvent` still calls it (harmless, and
 *     ready for an upgrade) but nothing is stored. Pro keeps two properties.
 *   - Cloudflare Web Analytics: pageviews and Core Web Vitals, cookieless. It
 *     has no custom events, so `trackEvent` does not call it.
 *   - Umami Cloud: the custom events below (and pageviews), cookieless.
 *   - Google Analytics 4: the custom events, sets cookies. Optional, off until
 *     a measurement id is set.
 *
 * The third-party scripts load only when their id is set, and only on the
 * canonical host, so local runs and Vercel preview deployments never pollute
 * the numbers. Everywhere else the event is still logged to the console in
 * development, which is how to check a change without a dashboard.
 *
 * Contract: never throws, never blocks. Every provider call is wrapped, and
 * nothing here awaits or prevents a navigation.
 *
 * PRIVACY: properties are short enums and slugs. Never pass anything a visitor
 * typed — no names, emails, phone numbers or message text.
 */

/**
 * In-code ids. All three are public by design (they ship in the page), so
 * setting one here is as good as setting the env var in Vercel; the env var
 * wins when both are set. An empty id keeps that provider off entirely — no
 * script, no request.
 */
/** The Umami Cloud website for lengocha.vercel.app (Settings → Websites → Website ID). */
const DEFAULT_UMAMI_WEBSITE_ID = "df0cac59-728b-4bf7-b62f-a34f9c7ca70b";
/** Optional. GA4 → Admin → Data streams → Measurement ID (`G-…`). */
const DEFAULT_GA_MEASUREMENT_ID = "";
/** The Cloudflare Web Analytics site for lengocha.vercel.app (its public beacon token). */
const DEFAULT_CF_BEACON_TOKEN = "83f92d6ddd0f41d68edff0bde44b2173";

/** Umami website ids are UUIDs. Anything else is a paste error, not an id. */
const UMAMI_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** GA4 measurement ids look like `G-XXXXXXXXXX`. */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
/** Cloudflare beacon tokens are 32 hex characters. */
const CF_TOKEN_PATTERN = /^[0-9a-f]{32}$/;

function validId(value: string | undefined, pattern: RegExp): string {
  const id = (value ?? "").trim();
  return pattern.test(id) ? id : "";
}

/** `NEXT_PUBLIC_*` is inlined at build time, so these are constants in the bundle. */
export const UMAMI_WEBSITE_ID = validId(
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || DEFAULT_UMAMI_WEBSITE_ID,
  UMAMI_ID_PATTERN,
);
export const GA_MEASUREMENT_ID = validId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID,
  GA_ID_PATTERN,
);
export const CF_BEACON_TOKEN = validId(
  process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || DEFAULT_CF_BEACON_TOKEN,
  CF_TOKEN_PATTERN,
);

export const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";
export const CF_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

/** The host the numbers belong to: the canonical origin's (lengocha.vercel.app). */
export const CANONICAL_HOST = new URL(SITE_URL).hostname;

/** True only on the production site, never on localhost or a preview URL. */
export function onCanonicalHost(): boolean {
  return typeof window !== "undefined" && window.location.hostname === CANONICAL_HOST;
}

export type AnalyticsLocale = "vi" | "en";

/** The windows `window_open` reports. The Recycle Bin is template leftovers, not content. */
export type TrackedSection =
  | "about"
  | "experience"
  | "projects"
  | "writing"
  | "contact"
  | "resume"
  | "decisions"
  | "gallery";

/** A deep link (`/resume`) booted the window, or a click on the desktop opened it. */
export type OpenVia = "url" | "desktop";

export type OutboundTarget = "linkedin" | "github" | "email" | "project";

/** Which surface the outbound link sits on. */
export type OutboundPlacement = "dock" | "menu" | "contact" | "projects" | "spotlight";

/** Every event and its properties. `locale` is added to all of them by `trackEvent`. */
export interface AnalyticsEvents {
  /** FormSubmit answered with success — never on the button click itself. */
  contact_submit_success: Record<string, never>;
  /**
   * `http`: FormSubmit answered with an error status. `rejected`: it answered
   * 200 but said `success: false` (an unactivated form, say). `network`: no
   * answer at all.
   */
  contact_submit_error: { reason: "http" | "rejected" | "network" };
  cv_open: { via: OpenVia };
  /** Any click on a link to the CV PDF: the download button, or "Open" in a new tab. */
  cv_download: { method: "download" | "new_tab"; from: "resume" | "contact" };
  outbound_click: { target: OutboundTarget; from: OutboundPlacement };
  window_open: { section: TrackedSection; via: OpenVia };
  /** Unchanged from before this module existed. */
  article_view: { slug: string; title: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

type Payload = Record<string, string | number | boolean | null>;

/**
 * The page's language, from `<html lang>`. Every page is Vietnamese today; an
 * English page will say `en` there and its events follow with no other change.
 */
function pageLocale(): AnalyticsLocale {
  return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "vi";
}

/**
 * Logs every event to the console in development. In production, set
 * `localStorage["portos.analytics.debug"] = "1"` to see them too.
 */
const DEBUG_STORAGE_KEY = "portos.analytics.debug";

function debugEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Payload) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Umami's script loads after hydration, and it keeps no queue of its own, so
 * an event fired before it arrives — the `window_open` of a deep-linked
 * window, fired on mount — would be lost. They wait here instead, and the
 * script's onLoad flushes them. Capped, in case the script never arrives
 * (an ad blocker, say).
 */
const UMAMI_QUEUE_MAX = 20;
const umamiQueue: [string, Payload][] = [];

/**
 * Checked as a function, not just for presence: any element with
 * `id="umami"` would also show up as `window.umami` (named access on Window).
 */
function umamiTracker() {
  return typeof window.umami?.track === "function" ? window.umami : null;
}

function sendToUmami(name: string, payload: Payload): void {
  if (!UMAMI_WEBSITE_ID || !onCanonicalHost()) return;
  const umami = umamiTracker();
  if (umami) {
    umami.track(name, payload);
  } else if (umamiQueue.length < UMAMI_QUEUE_MAX) {
    umamiQueue.push([name, payload]);
  }
}

/** Called by the Umami script's onLoad. */
export function flushUmamiQueue(): void {
  const umami = umamiTracker();
  if (!umami) return;
  for (const [name, payload] of umamiQueue.splice(0)) {
    try {
      umami.track(name, payload);
    } catch {
      // One bad event must not stop the rest.
    }
  }
}

/**
 * Sets up `gtag` the way Google's snippet does, from code rather than an
 * inline script: a `dataLayer` queue, the `js` timestamp, then `config`. Done
 * on first need — by the loader component or by an event that beats it — so
 * `config` is always queued before any event and nothing is lost before
 * gtag.js arrives; it replays the queue when it loads.
 *
 * Google signals and ad personalisation are off: this site sells nothing, and
 * those settings are what tie the data to ads.
 */
export function ensureGtag(): ((...args: unknown[]) => void) | null {
  if (!GA_MEASUREMENT_ID || !onCanonicalHost()) return null;
  if (!window.gtag) {
    const dataLayer = (window.dataLayer = window.dataLayer ?? []);
    window.gtag = function gtag() {
      // gtag.js reads the `arguments` object itself, not an array copy.
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }
  return window.gtag;
}

/**
 * Vercel's `track()` hands the event to `window.va`, which only exists once
 * `<Analytics />` has mounted — and that is AFTER the page's own effects, so
 * the `window_open` of a deep-linked window, sent on mount, used to vanish.
 * This installs the same queue `<Analytics />` installs first thing (calls
 * collected in `window.vaq`, replayed when its script loads); when it mounts it
 * finds the queue in place and keeps it.
 */
function ensureVercelQueue(): void {
  if (window.va) return;
  window.va = (...params) => {
    (window.vaq = window.vaq ?? []).push(params);
  };
}

/**
 * Sends one event to every configured provider, with the page's `locale`
 * added. Safe to call anywhere: on the server it does nothing, and no provider
 * failure reaches the caller.
 */
export function trackEvent<N extends AnalyticsEventName>(name: N, props: AnalyticsEvents[N]): void {
  if (typeof window === "undefined") return;

  let payload: Payload;
  try {
    payload = { ...(props as Payload), locale: pageLocale() };
  } catch {
    return;
  }

  const sends: [string, () => void][] = [
    [
      "vercel",
      () => {
        ensureVercelQueue();
        vercelTrack(name, payload);
      },
    ],
    ["umami", () => sendToUmami(name, payload)],
    ["ga4", () => ensureGtag()?.("event", name, payload)],
  ];
  for (const [provider, send] of sends) {
    try {
      send();
    } catch (error) {
      if (debugEnabled()) console.warn(`[analytics] ${provider} failed for ${name}`, error);
    }
  }

  if (debugEnabled()) console.info(`[analytics] ${name}`, payload);
}

/**
 * Props for an `<a>` that leaves the site: tracks a left, ctrl/cmd or middle
 * click. Middle clicks fire `auxclick`, not `click`, so both are wired. The
 * link still navigates on its own — nothing here prevents the default.
 */
export function outboundLinkProps(target: OutboundTarget, from: OutboundPlacement) {
  const report = () => trackEvent("outbound_click", { target, from });
  return {
    onClick: report,
    onAuxClick: (event: { button: number }) => {
      if (event.button === 1) report();
    },
  };
}
