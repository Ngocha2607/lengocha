import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

import { SITE } from "./src/consts";

/**
 * The Vercel adapter has no preview entrypoint, so `astro preview` cannot serve
 * the on-demand routes. Set LOCAL_PROD=1 to build against the Node adapter
 * instead and get a real production server locally — the Web Vitals readout in
 * the footer is meaningless on the dev server, so it has to be measured here.
 */
const localProd = process.env.LOCAL_PROD === "1";

export default defineConfig({
  site: SITE.url,

  /**
   * Static by default, so every page ships as prerendered HTML with no
   * framework runtime. `/` and `/writing/[slug]` opt out with
   * `prerender = false` because their content comes from Notion, and ISR then
   * caches the rendered HTML for an hour — the same contract the Next version
   * had with `revalidate = 3600`, so a newly published post still appears
   * without a redeploy.
   */
  output: "static",

  adapter: localProd
    ? node({ mode: "standalone" })
    : vercel({
        isr: { expiration: 3600 },
        /**
         * `/` is on-demand rendered, so without this the project screenshots
         * would be resized by sharp inside the serverless function on every
         * cache miss. Hand it to Vercel's image CDN instead.
         */
        imageService: true,
        /**
         * Vercel only serves widths listed here, and the adapter silently
         * snaps anything else to the nearest one. The default list starts at
         * 640, so `widths={[480, 800]}` was being dropped and every screenshot
         * would have been served at 1920px into a 480px slot. Declare the
         * widths the layout actually asks for.
         */
        imagesConfig: {
          sizes: [480, 800, 1200],
          domains: [],
          remotePatterns: [],
        },
      }),


  fonts: [
    {
      // Data only: the `.label` caption, tabular figures, the pipeline replay
      // and the vitals strip. The re-skin took mono off the headings — Nichol
      // sets everything in one proportional face — but a unit or an acronym
      // over a number still has to read as data rather than as body copy.
      name: "IBM Plex Mono",
      cssVariable: "--font-mono-face",
      provider: fontProviders.google(),
      weights: [400, 700],
      // Vietnamese is not optional here: article titles and the site owner's
      // name both need the diacritics. Verified both families ship the subset.
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    {
      /*
       * Headings and body both. Nichol uses Sora, which cannot be used here:
       * its `latin-ext` covers U+1E00-1E9F and U+1EF2-1EFF and skips
       * U+1EA0-1EF1 entirely, and it ships no `vietnamese` subset at all — so
       * the `Ọ` in LÊ NGỌC HÀ would fall back to another family in the middle
       * of the largest word on the page. Plus Jakarta Sans is the nearest
       * geometric humanist that does ship the subset.
       */
      name: "Plus Jakarta Sans",
      cssVariable: "--font-sans-face",
      provider: fontProviders.google(),
      weights: [400, 700],
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
